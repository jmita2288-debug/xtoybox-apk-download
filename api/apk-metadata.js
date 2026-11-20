import {
  REPO_OWNER,
  REPO_NAME,
  RELEASE_TAG,
  HISTORICAL_DOWNLOAD_BASE,
  ASSET_DOWNLOAD_BASELINES,
  loadAndroidLatest,
  totalDownloads,
  currentApkAsset,
} from './_android-release.js';

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

function normalizeSha256(value) {
  const digest = String(value || '').trim();
  if (!digest) return null;
  const hash = digest.replace(/^sha256:/i, '').toLowerCase();
  return /^[a-f0-9]{64}$/.test(hash) ? hash : null;
}

// Token só de leitura para a API do GitHub (o repositório é público; sem token há fallback).
function getStatsToken() {
  return process.env.GITHUB_STATS_TOKEN || process.env.GH_TOKEN || process.env.SITE_REPO_TOKEN || '';
}

function buildGitHubHeaders(token = '') {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    Accept: 'application/vnd.github+json',
    'User-Agent': 'xtoybox-apk-metadata',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function requestGitHubRelease(token = '') {
  return fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/tags/${RELEASE_TAG}?t=${Date.now()}`,
    { cache: 'no-store', headers: buildGitHubHeaders(token) },
  );
}

async function fetchRelease() {
  const token = getStatsToken();
  let authMode = token ? 'token' : 'public';
  let response = await requestGitHubRelease(token);

  // Se um token expirar ou perder permissão, repete a leitura sem autenticação
  // para não congelar o contador acumulado.
  if (!response.ok && token && (response.status === 401 || response.status === 403)) {
    console.warn(`[apk-metadata] Token rejeitado (${response.status}); tentando leitura pública da Release.`);
    response = await requestGitHubRelease('');
    authMode = 'public-fallback';
  }

  if (!response.ok) {
    throw new Error(`Release do GitHub indisponivel: ${response.status}`);
  }

  return { release: await response.json(), authMode };
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD');
      return res.status(405).json({ error: 'Metodo nao permitido' });
    }

    // Dados Android publicados pelo Dashboard (public/latest.json); o iOS fica fora.
    const latest = await loadAndroidLatest();
    const version = latest.latestVersionName;
    const fetched = await fetchRelease().catch((error) => {
      console.warn('[apk-metadata] Falha ao consultar Release:', error?.message || error);
      return null;
    });
    const asset = fetched ? currentApkAsset(fetched.release, latest) : null;

    const downloadsTotal = fetched ? totalDownloads(fetched.release) : HISTORICAL_DOWNLOAD_BASE;
    const apkSizeBytes = asset ? Number(asset.size || 0) || null : null;
    const publishedAt = latest.publishedAt || fetched?.release?.published_at || null;

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

    return res.status(200).json({
      appName: latest.appName || 'XTOYBOX',
      platform: 'android',
      versionName: version,
      versionCode: Number(latest.latestVersionCode || 0),
      apkUrl: latest.apkUrl,
      apkSha256: asset ? normalizeSha256(asset.digest) : null,
      pageUrl: latest.pageUrl || 'https://xtoybox.cloud/',
      releaseNotes: Array.isArray(latest.releaseNotes) ? latest.releaseNotes : [],
      publishedAt,
      lastUpdated: publishedAt,
      downloadsTotal,
      apkSizeBytes,
      apkSizeFormatted: formatBytes(apkSizeBytes),
      source: 'server-api',
      counterSource: fetched ? 'github-release-apk-assets' : 'historical-base-fallback',
      githubStatsAuth: fetched?.authMode ?? null,
      releaseDownloadCount: asset ? Number(asset.download_count || 0) : null,
      releaseDownloadBaseline: Number(ASSET_DOWNLOAD_BASELINES[version] || 0),
      historicalDownloadBase: HISTORICAL_DOWNLOAD_BASE,
      latest,
    });
  } catch (error) {
    console.error('Falha ao buscar metadados do APK:', error?.message || error);
    return res.status(500).json({ error: 'Falha ao buscar metadados do APK' });
  }
}
