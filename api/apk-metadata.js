import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_OWNER = 'jmita2288-debug';
const REPO_NAME = 'xtoybox-apk-download';
const BRANCH = 'main';
const RELEASE_TAG = 'xtoybox-latest';

// Snapshot do contador antigo no momento em que a gravação por commits foi desativada.
// A partir desta base, novos downloads são obtidos do contador real do asset no GitHub.
const HISTORICAL_DOWNLOAD_BASE = 22_787;
const RELEASE_DOWNLOAD_BASELINES = {
  '1.1.15': 1_089,
};

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

function normalizeVersion(value) {
  const version = String(value || '').trim().replace(/^v/i, '');
  if (!/^\d+(?:\.\d+){1,3}$/.test(version)) {
    throw new Error('latestVersionName invalida');
  }
  return version;
}

function normalizeSha256(value) {
  const digest = String(value || '').trim();
  if (!digest) return null;
  const hash = digest.replace(/^sha256:/i, '').toLowerCase();
  return /^[a-f0-9]{64}$/.test(hash) ? hash : null;
}

function getStatsToken() {
  return process.env.GITHUB_STATS_TOKEN || process.env.SITE_REPO_TOKEN || process.env.GH_TOKEN || '';
}

function buildGitHubHeaders(token = '') {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    Accept: 'application/vnd.github+json',
    'User-Agent': 'xtoybox-apk-metadata',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function readJsonFromFilesystem(fileName) {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const candidates = [
      resolve(__dirname, `../public/${fileName}`),
      resolve(__dirname, `../${fileName}`),
      resolve(__dirname, `../dist/${fileName}`),
      resolve(process.cwd(), `public/${fileName}`),
      resolve(process.cwd(), fileName),
      resolve(process.cwd(), `dist/${fileName}`),
    ];

    for (const filePath of candidates) {
      try {
        return JSON.parse(readFileSync(filePath, 'utf8'));
      } catch {
        // Tenta o próximo candidato.
      }
    }
  } catch {
    // Continua para a fonte remota.
  }

  return null;
}

async function fetchLatestMetadata() {
  const local = readJsonFromFilesystem('latest.json');
  if (local?.latestVersionName) return local;

  const response = await fetch(
    `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/public/latest.json?t=${Date.now()}`,
    { cache: 'no-store' },
  );

  if (!response.ok) throw new Error(`latest.json indisponivel: ${response.status}`);
  const latest = await response.json();
  if (!latest?.latestVersionName) throw new Error('latest.json invalido');
  return latest;
}

async function requestGitHubRelease(token = '') {
  return fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/tags/${RELEASE_TAG}?t=${Date.now()}`,
    {
      cache: 'no-store',
      headers: buildGitHubHeaders(token),
    },
  );
}

async function fetchGitHubReleaseAsset(version) {
  const token = getStatsToken();
  let authMode = token ? 'token' : 'public';
  let response = await requestGitHubRelease(token);

  // O repositório é público. Se um token expirar ou perder permissão, não devemos
  // congelar o contador em 22.787: repetimos a leitura sem autenticação.
  if (!response.ok && token && (response.status === 401 || response.status === 403)) {
    console.warn(`[apk-metadata] Token rejeitado (${response.status}); tentando leitura pública da Release.`);
    response = await requestGitHubRelease('');
    authMode = 'public-fallback';
  }

  if (!response.ok) {
    throw new Error(`Release do GitHub indisponivel: ${response.status}`);
  }

  const release = await response.json();
  const expectedName = `XTOYBOX-v${version}.apk`;
  const apkAssets = Array.isArray(release.assets)
    ? release.assets.filter((asset) => String(asset?.name || '').toLowerCase().endsWith('.apk'))
    : [];
  const asset = apkAssets.find((item) => item.name === expectedName)
    || apkAssets.find((item) => String(item.name || '').includes(version))
    || null;

  if (!asset) return null;

  return {
    name: asset.name,
    browserDownloadUrl: asset.browser_download_url || null,
    size: Number(asset.size || 0) || null,
    downloadCount: Number(asset.download_count || 0),
    sha256: normalizeSha256(asset.digest),
    publishedAt: release.published_at || null,
    authMode,
  };
}

function calculatePersistedTotal(version, releaseDownloadCount) {
  if (!Number.isFinite(releaseDownloadCount) || releaseDownloadCount < 0) {
    return HISTORICAL_DOWNLOAD_BASE;
  }

  const releaseBaseline = Number(RELEASE_DOWNLOAD_BASELINES[version] || 0);
  const newDownloads = Math.max(0, releaseDownloadCount - releaseBaseline);
  return HISTORICAL_DOWNLOAD_BASE + newDownloads;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD');
      return res.status(405).json({ error: 'Metodo nao permitido' });
    }

    const latest = await fetchLatestMetadata();
    const version = normalizeVersion(latest.latestVersionName);
    const releaseAsset = await fetchGitHubReleaseAsset(version).catch((error) => {
      console.warn('[apk-metadata] Falha ao consultar Release:', error?.message || error);
      return null;
    });

    const releaseDownloads = releaseAsset?.downloadCount;
    const downloadsTotal = calculatePersistedTotal(version, releaseDownloads);
    const apkUrl = releaseAsset?.browserDownloadUrl || latest.apkUrl;
    const apkSizeBytes = releaseAsset?.size ?? null;
    const publishedAt = latest.publishedAt || releaseAsset?.publishedAt || null;

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

    return res.status(200).json({
      appName: latest.appName || 'XTOYBOX',
      versionName: version,
      versionCode: Number(latest.latestVersionCode || 0),
      apkUrl,
      apkSha256: releaseAsset?.sha256 ?? null,
      pageUrl: latest.pageUrl || 'https://xtoybox.cloud/',
      releaseNotes: Array.isArray(latest.releaseNotes) ? latest.releaseNotes : [],
      publishedAt,
      lastUpdated: publishedAt,
      downloadsTotal,
      apkSizeBytes,
      apkSizeFormatted: formatBytes(apkSizeBytes),
      source: 'server-api',
      counterSource: releaseAsset ? 'github-release-delta' : 'historical-fallback',
      githubStatsAuth: releaseAsset?.authMode ?? null,
      releaseDownloadCount: releaseAsset?.downloadCount ?? null,
      releaseDownloadBaseline: Number(RELEASE_DOWNLOAD_BASELINES[version] || 0),
      historicalDownloadBase: HISTORICAL_DOWNLOAD_BASE,
      latest,
    });
  } catch (error) {
    console.error('Falha ao buscar metadados do APK:', error?.message || error);
    return res.status(500).json({ error: 'Falha ao buscar metadados do APK' });
  }
}
