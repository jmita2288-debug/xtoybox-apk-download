import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('json') && !contentType.includes('text/plain')) {
    const text = await response.text().catch(() => '');
    const preview = text.slice(0, 80);
    throw new Error(`Resposta nao e JSON (content-type: ${contentType}): ${preview}`);
  }

  return response.json();
}

// Lê latest.json do sistema de arquivos local do runtime da Vercel.
// Isso é muito mais confiável do que um self-fetch HTTP, pois evita o
// roteamento da Vercel CDN (incluindo o rewrite /(.*) -> /index.html)
// e não depende de propagação de cache ou domínio.
function readLatestJsonFromFilesystem() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    // Em Vercel Functions, o working directory é /var/task
    // e os arquivos do outputDirectory são copiados para lá.
    // O caminho relativo de api/ para dist/latest.json é ../latest.json
    const candidates = [
      resolve(__dirname, '../latest.json'),
      resolve(__dirname, '../dist/latest.json'),
      resolve(process.cwd(), 'latest.json'),
      resolve(process.cwd(), 'dist/latest.json'),
    ];

    for (const path of candidates) {
      try {
        const content = readFileSync(path, 'utf8');
        const data = JSON.parse(content);
        if (data?.latestVersionName && data?.apkUrl) return data;
      } catch {
        // Tenta o próximo candidato
      }
    }
  } catch {
    // Filesystem não disponível (edge runtime, etc.)
  }
  return null;
}

async function fetchLatestMetadata(req) {
  // 1. Tenta ler do filesystem local (Vercel Functions têm acesso ao outputDir)
  const fromFs = readLatestJsonFromFilesystem();
  if (fromFs) return fromFs;

  // 2. Tenta buscar via GitHub Contents API (garante a versão mais atualizada do repo)
  const token = getStatsToken();
  if (token) {
    try {
      const ghHeaders = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'xtoybox-apk-metadata',
        'X-GitHub-Api-Version': '2022-11-28',
      };
      const file = await fetchJson(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/public/latest.json?ref=${BRANCH}&t=${Date.now()}`,
        { headers: ghHeaders, cache: 'no-store' },
      );
      const content = Buffer.from(file.content || '', 'base64').toString('utf8');
      const data = JSON.parse(content || '{}');
      if (data?.latestVersionName && data?.apkUrl) return data;
    } catch {
      // Fallback para raw.githubusercontent.com
    }
  }

  // 3. Tenta via raw.githubusercontent.com (URL pública, sem autenticação necessária)
  try {
    const raw = await fetchJson(
      `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/public/latest.json?t=${Date.now()}`,
      { cache: 'no-store' },
    );
    if (raw?.latestVersionName && raw?.apkUrl) return raw;
  } catch {
    // Fallback para self-fetch
  }

  // 4. Fallback: self-fetch via HTTP (menos confiável, mantido para compatibilidade)
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
  // Primeiro tenta via raw.githubusercontent.com (mais confiável que self-fetch)
  try {
    const raw = await fetchJson(
      `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${STATS_PATH}?t=${Date.now()}`,
      { cache: 'no-store' },
    );
    if (typeof raw?.totalDownloads === 'number') return raw;
  } catch {
    // Fallback para self-fetch
  }

  const origin = getRequestOrigin(req);
  const candidates = uniqueValues([
    `${origin}/download-stats.json?t=${Date.now()}`,
    process.env.SITE_URL ? `${process.env.SITE_URL}/download-stats.json?t=${Date.now()}` : '',
    'https://xtoybox.cloud/download-stats.json',
  ]);

  for (const url of candidates) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) continue;
      const contentType = response.headers.get('content-type') || '';
      // Rejeita respostas HTML (causadas pelo rewrite /(.*) -> /index.html)
      if (contentType.includes('text/html')) continue;
      const data = await response.json();
      if (typeof data?.totalDownloads === 'number') return data;
    } catch {
      // Ignora e tenta o proximo
    }
  }

  return null;
}

async function fetchDownloadStats(req) {
  return fetchLiveDownloadStats().catch(() => fetchDeployedDownloadStats(req));
}

async function fetchGitHubReleaseAsset(latest) {
  const token = getStatsToken();
  const version = String(latest.latestVersionName || '').replace(/^v/i, '').trim();
  const apkFileName = getApkFileName(latest.apkUrl);
  const releaseTags = uniqueValues([
    getReleaseTagFromUrl(latest.apkUrl),
    DEFAULT_RELEASE_TAG,
    version ? `xtoybox-v${version}-latest` : '',
  ]);

  // Inclui token nas chamadas para evitar rate limit da GitHub API
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    Accept: 'application/vnd.github+json',
    'User-Agent': 'xtoybox-apk-metadata',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  for (const tag of releaseTags) {
    try {
      const release = await fetchJson(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/tags/${tag}?t=${Date.now()}`,
        {
          cache: 'no-store',
          headers,
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
    const historicalDownloads = typeof stats?.totalDownloads === 'number' ? stats.totalDownloads : 0;
    const releaseDownloads = typeof releaseAsset?.assetDownloadCount === 'number' ? releaseAsset.assetDownloadCount : 0;
    const downloadsTotal = Math.max(historicalDownloads, releaseDownloads) || null;
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
