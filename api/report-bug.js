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

function buildEmailHtml({ name, appVersion, deviceModel, deviceType, description }, file) {
  const attachmentLabel = file
    ? `<div style="margin-top:14px;padding:14px 16px;background:#0b0f0d;border:1px solid #202820;border-radius:14px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#7d887f;margin-bottom:6px;">Anexo</div>
        <div style="font-size:15px;color:#ffffff;font-weight:700;">${esc(file.filename)} <span style="font-size:12px;color:#7d887f;font-weight:400;">(${esc(file.contentType)})</span></div>
      </div>`
    : '';

  return `
<div style="margin:0;padding:0;background:#080b0a;font-family:Arial,Helvetica,sans-serif;color:#f3f5f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080b0a;padding:32px 12px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#101411;border:1px solid #23301f;border-radius:22px;overflow:hidden;box-shadow:0 18px 60px rgba(0,0,0,.35);">
          <tr>
            <td style="padding:34px 28px 26px;background:linear-gradient(180deg,#14210f 0%,#101411 100%);text-align:center;border-bottom:1px solid #22301e;">
              <img src="https://xtoybox.cloud/favicon.png?v=6" alt="XTOYBOX" width="92" height="92" style="display:block;margin:0 auto 18px;border-radius:18px;border:1px solid rgba(132,255,0,.25);box-shadow:0 0 28px rgba(132,255,0,.22);" />
              <div style="font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#88ef24;font-weight:700;margin-bottom:8px;">XTOYBOX</div>
              <h1 style="margin:0;font-size:28px;line-height:1.2;color:#ffffff;">Novo bug reportado</h1>
              <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#a8b0aa;">Um usuário enviou um relatório pelo formulário do site.</p>
            </td>
          </tr>

          <tr>
            <td style="padding:26px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:14px 16px;background:#0b0f0d;border:1px solid #202820;border-radius:14px;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#7d887f;margin-bottom:6px;">Nome ou apelido</div>
                    <div style="font-size:16px;color:#ffffff;font-weight:700;">${esc(name)}</div>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
                <tr>
                  <td width="50%" style="padding-right:7px;">
                    <div style="padding:14px 16px;background:#0b0f0d;border:1px solid #202820;border-radius:14px;">
                      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#7d887f;margin-bottom:6px;">Versão</div>
                      <div style="font-size:15px;color:#ffffff;font-weight:700;">${esc(appVersion)}</div>
                    </div>
                  </td>
                  <td width="50%" style="padding-left:7px;">
                    <div style="padding:14px 16px;background:#0b0f0d;border:1px solid #202820;border-radius:14px;">
                      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#7d887f;margin-bottom:6px;">Tipo</div>
                      <div style="font-size:15px;color:#ffffff;font-weight:700;">${esc(deviceType)}</div>
                    </div>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
                <tr>
                  <td style="padding:14px 16px;background:#0b0f0d;border:1px solid #202820;border-radius:14px;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#7d887f;margin-bottom:6px;">Modelo do aparelho</div>
                    <div style="font-size:15px;color:#ffffff;font-weight:700;">${esc(deviceModel)}</div>
                  </td>
                </tr>
              </table>

              ${attachmentLabel}

              <div style="margin-top:22px;padding:18px;background:#0b0f0d;border:1px solid #263522;border-radius:16px;">
                <div style="font-size:13px;text-transform:uppercase;letter-spacing:.13em;color:#88ef24;font-weight:700;margin-bottom:10px;">Descrição do bug</div>
                <p style="margin:0;font-size:15px;line-height:1.7;color:#d7ddd8;white-space:pre-wrap;">${esc(description)}</p>
              </div>

              <div style="margin-top:22px;padding:14px 16px;border-radius:14px;background:rgba(132,255,0,.08);border:1px solid rgba(132,255,0,.18);">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#b9c4bb;">Verifique a versão informada, o tipo de aparelho e tente reproduzir o problema antes de preparar uma correção.</p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 28px;border-top:1px solid #202820;background:#0b0f0d;">
              <p style="margin:0;text-align:center;font-size:12px;line-height:1.6;color:#747d76;">Relatório enviado pelo formulário oficial do XTOYBOX.<br />Projeto independente, sem vínculo com Xbox ou Microsoft.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>`;
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

  const html = buildEmailHtml({ name, appVersion, deviceModel, deviceType, description }, file);

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
