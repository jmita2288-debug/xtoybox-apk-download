const REPO_OWNER = 'jmita2288-debug';
const REPO_NAME = 'xtoybox-apk-download';
const STATS_PATH = 'public/download-stats.json';
const BRANCH = 'main';

function encodeBase64(value) {
  return Buffer.from(value, 'utf8').toString('base64');
}

function getStatsToken() {
  return process.env.GITHUB_STATS_TOKEN || process.env.SITE_REPO_TOKEN || process.env.GH_TOKEN || '';
}

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

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Request failed: ${response.status}${text ? ` - ${text.slice(0, 160)}` : ''}`);
  }

  return response.json();
}

async function fetchLatestMetadata(req) {
  const origin = getRequestOrigin(req);
  const candidates = uniqueValues([
    `${origin}/latest.json?t=${Date.now()}`,
    process.env.SITE_URL ? `${process.env.SITE_URL}/latest.json?t=${Date.now()}` : '',
    'https://xtoybox.cloud/latest.json',
  ]);

  let lastError = null;

  for (const url of candidates) {
    try {
      const latest = await fetchJson(url, { cache: 'no-store' });
      if (latest?.apkUrl) return latest;
      lastError = new Error('latest.json sem apkUrl');
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('latest.json indisponivel');
}

function buildGitHubHeaders(token) {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'xtoybox-download-counter',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function incrementDownloadStats(latest) {
  const token = getStatsToken();
  if (!token) {
    console.warn('Token de estatisticas ausente. Configure GITHUB_STATS_TOKEN, SITE_REPO_TOKEN ou GH_TOKEN na Vercel.');
    return null;
  }

  const version = String(latest.latestVersionName || 'unknown').trim() || 'unknown';
  const fileUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${STATS_PATH}?ref=${BRANCH}`;
  const updateUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${STATS_PATH}`;
  const headers = buildGitHubHeaders(token);
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const file = await fetchJson(fileUrl, { headers, cache: 'no-store' });
      const currentContent = Buffer.from(file.content || '', 'base64').toString('utf8');
      const currentStats = JSON.parse(currentContent || '{}');
      const currentVersions = currentStats.versions && typeof currentStats.versions === 'object'
        ? currentStats.versions
        : {};

      const nextStats = {
        totalDownloads: Number(currentStats.totalDownloads || 0) + 1,
        versions: {
          ...currentVersions,
          [version]: Number(currentVersions[version] || 0) + 1,
        },
        updatedAt: new Date().toISOString(),
        lastVersion: version,
      };

      await fetchJson(updateUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: `Increment download count for v${version}`,
          content: encodeBase64(`${JSON.stringify(nextStats, null, 2)}\n`),
          sha: file.sha,
          branch: BRANCH,
        }),
      });

      return nextStats;
    } catch (err) {
      lastError = err;
      const message = String(err?.message || err || '');
      const canRetry = message.includes('409') || message.toLowerCase().includes('sha');

      if (!canRetry || attempt === 3) break;
      await wait(150 * attempt);
    }
  }

  throw lastError || new Error('Falha ao atualizar estatisticas');
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD');
      return res.status(405).json({ error: 'Metodo nao permitido' });
    }

    const latest = await fetchLatestMetadata(req);
    const apkUrl = latest.apkUrl;

    if (!apkUrl) {
      throw new Error('apkUrl ausente no latest.json');
    }

    let counted = false;

    if (req.method === 'GET') {
      const stats = await incrementDownloadStats(latest).catch((err) => {
        console.warn('Falha ao registrar download:', err?.message || err);
        return null;
      });
      counted = Boolean(stats);
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('X-Download-Counted', counted ? '1' : '0');
    return res.redirect(302, apkUrl);
  } catch (err) {
    console.error('Falha no download:', err?.message || err);
    return res.status(500).json({ error: 'Falha no download' });
  }
}
