const TO = process.env.BUG_REPORT_TO || 'xtoybox@proton.me';
const FROM = process.env.BUG_REPORT_FROM || 'XTOYBOX Bugs <onboarding@resend.dev>';
const MAX_BYTES = 16 * 1024 * 1024;

function esc(v = '') {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getBoundary(type = '') {
  const match = type.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return match ? match[1] || match[2] : null;
}

async function readBuffer(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BYTES) {
      const error = new Error('Arquivo muito grande. Limite: 16 MB.');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function parseMultipart(buffer, boundary) {
  const marker = Buffer.from(`--${boundary}`);
  const data = { fields: {}, files: [] };
  let start = buffer.indexOf(marker);

  while (start >= 0) {
    start += marker.length;
    if (buffer[start] === 45 && buffer[start + 1] === 45) break;
    if (buffer[start] === 13 && buffer[start + 1] === 10) start += 2;

    const next = buffer.indexOf(marker, start);
    if (next < 0) break;

    let part = buffer.slice(start, next);
    if (part.slice(-2).toString() === '\r\n') part = part.slice(0, -2);

    const split = part.indexOf(Buffer.from('\r\n\r\n'));
    if (split < 0) {
      start = next;
      continue;
    }

    const headers = part.slice(0, split).toString('utf8');
    const body = part.slice(split + 4);
    const name = headers.match(/name="([^"]+)"/i)?.[1];
    const filename = headers.match(/filename="([^"]*)"/i)?.[1];
    const contentType = headers.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim() || 'application/octet-stream';

    if (name) {
      if (filename) data.files.push({ name, filename, contentType, body });
      else data.fields[name] = body.toString('utf8').trim();
    }

    start = next;
  }

  return data;
}

function requireField(fields, key) {
  const value = String(fields[key] || '').trim();
  if (!value) {
    const error = new Error(`Campo obrigatorio ausente: ${key}`);
    error.statusCode = 400;
    throw error;
  }
  return value.slice(0, key === 'description' ? 5000 : 200);
}

async function sendEmail(fields, file) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    const error = new Error('Envio ainda nao configurado. RESEND_API_KEY ausente.');
    error.statusCode = 503;
    throw error;
  }

  const name = requireField(fields, 'name');
  const appVersion = requireField(fields, 'appVersion');
  const deviceModel = requireField(fields, 'deviceModel');
  const deviceType = requireField(fields, 'deviceType');
  const description = requireField(fields, 'description');

  const attachments = [];
  if (file) {
    const ok = file.contentType.startsWith('image/') || file.contentType.startsWith('video/');
    if (!ok) {
      const error = new Error('Tipo de arquivo nao permitido. Use imagem ou video.');
      error.statusCode = 400;
      throw error;
    }
    attachments.push({
      filename: file.filename,
      content: file.body.toString('base64'),
      content_type: file.contentType,
    });
  }

  const html = `
    <h2>Novo bug reportado no XTOYBOX</h2>
    <p><b>Nome/apelido:</b> ${esc(name)}</p>
    <p><b>Versao:</b> ${esc(appVersion)}</p>
    <p><b>Aparelho:</b> ${esc(deviceModel)}</p>
    <p><b>Tipo:</b> ${esc(deviceType)}</p>
    <hr />
    <p style="white-space:pre-wrap"><b>Descricao:</b><br />${esc(description)}</p>
    ${file ? `<p><b>Anexo:</b> ${esc(file.filename)} (${esc(file.contentType)})</p>` : ''}
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      subject: `[XTOYBOX] Bug - ${appVersion} - ${deviceType}`,
      html,
      attachments,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const error = new Error(`Falha no envio: ${response.status} ${text}`);
    error.statusCode = 502;
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Metodo nao permitido' });
  }

  try {
    const boundary = getBoundary(req.headers['content-type'] || '');
    if (!boundary) return res.status(400).json({ error: 'Formulario invalido' });

    const buffer = await readBuffer(req);
    const parsed = parseMultipart(buffer, boundary);
    const file = parsed.files.find((f) => f.name === 'attachment') || null;

    await sendEmail(parsed.fields, file);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Erro no report-bug:', error);
    return res.status(error.statusCode || 500).json({ error: error.message || 'Falha ao enviar relatorio' });
  }
}
