const REPO_OWNER = 'jmita2288-debug';
const REPO_NAME = 'xtoybox-apk-download';
const STATS_PATH = 'public/download-stats.json';
const BRANCH = 'main';

function encodeBase64(value) {
  return Buffer.from(value, 'utf8').toString('base64');
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function incrementDownloadStats(latest) {
  const token = process.env.GITHUB_STATS_TOKEN;
  if (!token) {
    console.warn('GITHUB_STATS_TOKEN ausente. Download segue sem contador persistente.');
    return null;
  }

  const fileUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${STATS_PATH}?ref=${BRANCH}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const file = await fetchJson(fileUrl, { headers });
  const currentContent = Buffer.from(file.content || '', 'base64').toString('utf8');
  const currentStats = JSON.parse(currentContent || '{}');
  const version = latest.latestVersionName || 'unknown';
  const now = new Date().toISOString();

  const nextStats = {
    totalDownloads: Number(currentStats.totalDownloads || 0) + 1,
    versions: {
      ...(currentStats.versions || {}),
      [version]: Number(currentStats.versions?.[version] || 0) + 1,
    },
    updatedAt: now,
    lastVersion: version,
  };

  await fetchJson(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${STATS_PATH}`, {
    method: 'PUT',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Increment download count for v${version}`,
      content: encodeBase64(`${JSON.stringify(nextStats, null, 2)}\n`),
      sha: file.sha,
      branch: BRANCH,
    }),
  });

  return nextStats;
}

export default async function handler(req, res) {
  try {
    const baseUrl = process.env.SITE_URL || 'https://xtoybox.cloud';
    const latestRes = await fetch(`${baseUrl}/latest.json`, { cache: 'no-store' });

    if (!latestRes.ok) {
      throw new Error('latest.json indisponivel');
    }

    const latest = await latestRes.json();
    const apkUrl = latest.apkUrl;

    if (!apkUrl) {
      throw new Error('apkUrl ausente no latest.json');
    }

    await incrementDownloadStats(latest).catch((err) => {
      console.warn('Falha ao registrar download:', err?.message || err);
    });

    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, apkUrl);
  } catch (err) {
    console.error('Falha no download:', err);
    return res.status(500).json({ error: 'Falha no download' });
  }
}
