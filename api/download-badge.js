function getHeader(req, name) {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function getRequestOrigin(req) {
  const host = getHeader(req, 'x-forwarded-host') || getHeader(req, 'host');
  const proto = getHeader(req, 'x-forwarded-proto') || 'https';

  if (host) return `${proto}://${host}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.SITE_URL || 'https://xtoybox.cloud';
}

function formatCompactNumber(value) {
  const number = Number(value || 0);

  if (!Number.isFinite(number) || number <= 0) return '0';

  const units = [
    { value: 1_000_000_000, suffix: 'B' },
    { value: 1_000_000, suffix: 'M' },
    { value: 1_000, suffix: 'k' },
  ];

  const unit = units.find((item) => number >= item.value);
  if (!unit) return String(Math.floor(number));

  const compact = number / unit.value;
  const rounded = compact >= 10 ? Math.round(compact) : Math.round(compact * 10) / 10;

  return `${rounded}${unit.suffix}`;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Request failed: ${response.status}${text ? ` - ${text.slice(0, 160)}` : ''}`);
  }

  return response.json();
}

export default async function handler(req, res) {
  try {
    const origin = getRequestOrigin(req);
    const metadata = await fetchJson(`${origin}/api/apk-metadata?t=${Date.now()}`, { cache: 'no-store' });
    const message = formatCompactNumber(metadata?.downloadsTotal);

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

    return res.status(200).json({
      schemaVersion: 1,
      label: 'downloads',
      message,
      color: '7ED957',
      namedLogo: 'android',
      logoColor: '111111',
      labelColor: '111111',
    });
  } catch (err) {
    console.error('Falha ao gerar badge de downloads:', err?.message || err);

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

    return res.status(200).json({
      schemaVersion: 1,
      label: 'downloads',
      message: 'indisponivel',
      color: '9CA3AF',
      labelColor: '111111',
    });
  }
}
