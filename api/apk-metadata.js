const REPO_OWNER = 'jmita2288-debug';
const REPO_NAME = 'xtoybox-apk-download';
const STATS_PATH = 'public/download-stats.json';
const BRANCH = 'main';
const DEFAULT_RELEASE_TAG = 'xtoybox-latest';

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (!value || value <= 0) return null;

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const precision = unitIndex === 0 ? 0 : 1;
  return `${size.toFixed(precision)} ${units[unitIndex]}`;
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

function getStatsToken() {
  return process.env.GITHUB_STATS_TOKEN || process.env.SITE_REPO_TOKEN || process.env.GH_TOKEN || '';
}

function getApkFileName(apkUrl) {
  try {
    const parsed = new URL(apkUrl, 'https://xtoybox.cloud');
    return decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || '');
  } catch {
    return '';
  }
}

function getReleaseTagFromUrl(apkUrl) {
  try {
    const parsed = new URL(apkUrl, 'https://xtoybox.cloud');
    const parts = parsed.pathname.split('/').filter(Boolean);
    const downloadIndex = parts.indexOf('download');
    return downloadIndex >= 0 ? parts[downloadIndex + 1] : null;
  } catch {
    return null;
  }
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
      if (latest?.latestVersionName && latest?.apkUrl) return latest;
      lastError = new Error('latest.json invalido');
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('latest.json indisponivel');
}

async function fetchLiveDownloadStats() {
  const token = getStatsToken();
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    Accept: 'application/vnd.github+json',
    'User-Agent': 'xtoybox-apk-metadata',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const file = await fetchJson(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${STATS_PATH}?ref=${BRANCH}&t=${Date.now()}`,
    { headers, cache: 'no-store' },
  );

  const content = Buffer.from(file.content || '', 'base64').toString('utf8');
  return JSON.parse(content || '{}');
}

async function fetchDeployedDownloadStats(req) {
  const origin = getRequestOrigin(req);
  const candidates = uniqueValues([
    `${origin}/download-stats.json?t=${Date.now()}`,
    process.env.SITE_URL ? `${process.env.SITE_URL}/download-stats.json?t=${Date.now()}` : '',
    'https://xtoybox.cloud/download-stats.json',
  ]);

  for (const url of candidates) {
    const response = await fetch(url, { cache: 'no-store' }).catch(() => null);
    if (response?.ok) return response.json();
  }

  return null;
}

async function fetchDownloadStats(req) {
  return fetchLiveDownloadStats().catch(() => fetchDeployedDownloadStats(req));
}

async function fetchGitHubReleaseAsset(latest) {
  const version = String(latest.latestVersionName || '').replace(/^v/i, '').trim();
  const apkFileName = getApkFileName(latest.apkUrl);
  const releaseTags = uniqueValues([
    getReleaseTagFromUrl(latest.apkUrl),
    DEFAULT_RELEASE_TAG,
    version ? `xtoybox-v${version}-latest` : '',
  ]);

  for (const tag of releaseTags) {
    try {
      const release = await fetchJson(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/tags/${tag}?t=${Date.now()}`,
        {
          cache: 'no-store',
          headers: {
            Accept: 'application/vnd.github+json',
            'User-Agent': 'xtoybox-apk-metadata',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        },
      );

      const apkAssets = Array.isArray(release.assets)
        ? release.assets.filter((asset) => String(asset.name || '').toLowerCase().endsWith('.apk'))
        : [];
      const matchingAsset = apkAssets.find((asset) => asset.name === apkFileName) || apkAssets[0];

      if (matchingAsset) {
        return {
          apkSizeBytes: Number(matchingAsset.size || 0) || null,
          assetDownloadCount: typeof matchingAsset.download_count === 'number' ? matchingAsset.download_count : null,
          publishedAt: release.published_at || null,
        };
      }
    } catch (err) {
      // Tenta a proxima tag candidata.
    }
  }

  return null;
}

export default async function handler(req, res) {
  try {
    const latest = await fetchLatestMetadata(req);
    const [stats, releaseAsset] = await Promise.all([
      fetchDownloadStats(req),
      fetchGitHubReleaseAsset(latest),
    ]);

    const apkSizeBytes = releaseAsset?.apkSizeBytes ?? null;
    const downloadsTotal = typeof stats?.totalDownloads === 'number'
      ? stats.totalDownloads
      : releaseAsset?.assetDownloadCount ?? null;
    const lastUpdated = latest.publishedAt || stats?.updatedAt || releaseAsset?.publishedAt || null;

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

    return res.status(200).json({
      appName: latest.appName || 'XTOYBOX',
      versionName: latest.latestVersionName,
      versionCode: Number(latest.latestVersionCode || 0),
      apkUrl: latest.apkUrl,
      pageUrl: latest.pageUrl,
      releaseNotes: Array.isArray(latest.releaseNotes) ? latest.releaseNotes : [],
      publishedAt: latest.publishedAt || releaseAsset?.publishedAt || null,
      lastUpdated,
      downloadsTotal,
      apkSizeBytes,
      apkSizeFormatted: formatBytes(apkSizeBytes),
      source: 'server-api',
      latest,
    });
  } catch (e) {
    console.error('Falha ao buscar metadados do APK:', e?.message || e);
    return res.status(500).json({ error: 'Falha ao buscar metadados do APK' });
  }
}
