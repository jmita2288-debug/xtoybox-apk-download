const REPO_OWNER = 'jmita2288-debug';
const REPO_NAME = 'xtoybox-apk-download';
const STATS_PATH = 'public/download-stats.json';
const BRANCH = 'main';

function getStatsToken() {
  return process.env.GITHUB_STATS_TOKEN || process.env.SITE_REPO_TOKEN || process.env.GH_TOKEN || '';
}

function formatCompactNumber(value) {
  const number = Number(value || 0);

  if (!Number.isFinite(number) || number <= 0) {
    return '0';
  }

  const units = [
    { value: 1_000_000_000, suffix: 'B' },
    { value: 1_000_000, suffix: 'M' },
    { value: 1_000, suffix: 'k' },
  ];

  const unit = units.find((item) => number >= item.value);

  if (!unit) {
    return String(Math.floor(number));
  }

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

async function fetchLiveDownloadStats() {
  const token = getStatsToken();
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    Accept: 'application/vnd.github+json',
    'User-Agent': 'xtoybox-download-badge',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const file = await fetchJson(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${STATS_PATH}?ref=${BRANCH}&t=${Date.now()}`,
    { headers, cache: 'no-store' },
  );

  const content = Buffer.from(file.content || '', 'base64').toString('utf8');
  return JSON.parse(content || '{}');
}

async function fetchRawDownloadStats() {
  return fetchJson(
    `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${STATS_PATH}?t=${Date.now()}`,
    { cache: 'no-store' },
  );
}

async function fetchDownloadStats() {
  return fetchLiveDownloadStats().catch(() => fetchRawDownloadStats());
}

export default async function handler(req, res) {
  try {
    const stats = await fetchDownloadStats();
    const totalDownloads = Number(stats?.totalDownloads || 0);
    const message = formatCompactNumber(totalDownloads);

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
      message: 'indisponível',
      color: '9CA3AF',
      labelColor: '111111',
    });
  }
}
