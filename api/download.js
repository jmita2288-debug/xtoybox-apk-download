import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_OWNER = 'jmita2288-debug';
const REPO_NAME = 'xtoybox-apk-download';
const STATS_PATH = 'public/download-stats.json';
const BADGE_PATH = 'public/download-badge.json';
const BRANCH = 'main';
const PUBLIC_DOWNLOAD_BASE = 'https://xtoybox-apk-download.vercel.app/downloads';

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

function createDownloadBadge(stats) {
  return {
    schemaVersion: 1,
    label: 'downloads',
    message: formatCompactNumber(stats?.totalDownloads),
    color: '7ED957',
    namedLogo: 'android',
    logoColor: '111111',
    labelColor: '111111',
  };
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
    throw new Error(`Resposta nao e JSON (content-type: ${contentType}): ${text.slice(0, 80)}`);
  }
  return response.json();
}

function normalizeLatestMetadata(data) {
  const version = String(data?.latestVersionName || '').trim().replace(/^v/i, '');
  if (!/^\d+(?:\.\d+){1,3}$/.test(version)) {
    throw new Error('latestVersionName invalida');
  }

  return {
    ...data,
    latestVersionName: version,
    latestVersionCode: Number(data?.latestVersionCode || 0),
    apkUrl: `${PUBLIC_DOWNLOAD_BASE}/XTOYBOX-v${version}.apk`,
    releaseChannel: 'public',
    testRelease: false,
  };
}

function readLatestJsonFromFilesystem() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const candidates = [
      resolve(__dirname, '../latest.json'),
      resolve(__dirname, '../dist/latest.json'),
      resolve(process.cwd(), 'latest.json'),
      resolve(process.cwd(), 'dist/latest.json'),
    ];

    for (const filePath of candidates) {
      try {
        const data = JSON.parse(readFileSync(filePath, 'utf8'));
        if (data?.latestVersionName) return normalizeLatestMetadata(data);
      } catch {
        // Tenta o próximo candidato.
      }
    }
  } catch {
    // Fallbacks de rede continuam abaixo.
  }
  return null;
}

async function fetchLatestMetadata(req) {
  // O repositório público é a fonte de verdade. Isso evita que um deploy antigo
  // da Vercel continue apontando para um alias removido como XTOYBOX-latest.apk.
  const token = getStatsToken();
  if (token) {
    try {
      const ghHeaders = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'xtoybox-download-counter',
        'X-GitHub-Api-Version': '2022-11-28',
      };
      const file = await fetchJson(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/public/latest.json?ref=${BRANCH}&t=${Date.now()}`,
        { headers: ghHeaders, cache: 'no-store' },
      );
      const data = JSON.parse(Buffer.from(file.content || '', 'base64').toString('utf8') || '{}');
      if (data?.latestVersionName) return normalizeLatestMetadata(data);
    } catch {
      // Continua para a fonte pública sem autenticação.
    }
  }

  try {
    const raw = await fetchJson(
      `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/public/latest.json?t=${Date.now()}`,
      { cache: 'no-store' },
    );
    if (raw?.latestVersionName) return normalizeLatestMetadata(raw);
  } catch {
    // Continua para o bundle local.
  }

  const fromFs = readLatestJsonFromFilesystem();
  if (fromFs) return fromFs;

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
      if (latest?.latestVersionName) return normalizeLatestMetadata(latest);
      lastError = new Error('latest.json sem versao');
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

async function updateDownloadBadge(stats, headers) {
  try {
    const badgeUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${BADGE_PATH}?ref=${BRANCH}&t=${Date.now()}`;
    const updateUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${BADGE_PATH}`;
    const file = await fetchJson(badgeUrl, { headers, cache: 'no-store' });
    const badge = createDownloadBadge(stats);

    await fetchJson(updateUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `Update compact download badge to ${badge.message}`,
        content: encodeBase64(`${JSON.stringify(badge, null, 2)}\n`),
        sha: file.sha,
        branch: BRANCH,
      }),
    });
  } catch (err) {
    console.warn('Falha ao atualizar badge de downloads:', err?.message || err);
  }
}

async function incrementDownloadStats(latest) {
  const token = getStatsToken();
  if (!token) {
    console.warn('Token de estatisticas ausente.');
    return null;
  }

  const version = String(latest.latestVersionName || 'unknown').trim() || 'unknown';
  const updateUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${STATS_PATH}`;
  const headers = buildGitHubHeaders(token);
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const freshFileUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${STATS_PATH}?ref=${BRANCH}&t=${Date.now()}`;
      const file = await fetchJson(freshFileUrl, { headers, cache: 'no-store' });
      const currentStats = JSON.parse(Buffer.from(file.content || '', 'base64').toString('utf8') || '{}');
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

      await updateDownloadBadge(nextStats, headers);
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
    if (!apkUrl) throw new Error('apkUrl ausente');

    let counted = false;
    if (req.method === 'GET') {
      const stats = await incrementDownloadStats(latest).catch((err) => {
        console.error('[download] Falha ao registrar download:', err?.message || err);
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
