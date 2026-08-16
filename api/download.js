import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_OWNER = 'jmita2288-debug';
const REPO_NAME = 'xtoybox-apk-download';
const BRANCH = 'main';
const RELEASE_TAG = 'xtoybox-latest';
const FALLBACK_VERSION = '1.1.15';

function buildReleaseApkUrl(version) {
  return `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${RELEASE_TAG}/XTOYBOX-v${version}.apk`;
}

function normalizeLatestMetadata(data) {
  const version = String(data?.latestVersionName || '').trim().replace(/^v/i, '');
  if (!/^\d+(?:\.\d+){1,3}$/.test(version)) {
    throw new Error('latestVersionName invalida');
  }

  return {
    ...data,
    latestVersionName: version,
    apkUrl: buildReleaseApkUrl(version),
    releaseChannel: 'public',
    testRelease: false,
  };
}

function readLatestJsonFromFilesystem() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const candidates = [
      resolve(__dirname, '../public/latest.json'),
      resolve(__dirname, '../latest.json'),
      resolve(__dirname, '../dist/latest.json'),
      resolve(process.cwd(), 'public/latest.json'),
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
    // Continua para a fonte remota.
  }

  return null;
}

async function fetchLatestMetadata() {
  const local = readLatestJsonFromFilesystem();
  if (local) return local;

  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/public/latest.json?t=${Date.now()}`,
      { cache: 'no-store' },
    );

    if (response.ok) {
      const data = await response.json();
      if (data?.latestVersionName) return normalizeLatestMetadata(data);
    }
  } catch {
    // Usa o fallback abaixo.
  }

  return normalizeLatestMetadata({
    appName: 'XTOYBOX',
    latestVersionName: FALLBACK_VERSION,
  });
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD');
      return res.status(405).json({ error: 'Metodo nao permitido' });
    }

    const latest = await fetchLatestMetadata();
    if (!latest.apkUrl) throw new Error('apkUrl ausente');

    // O download é entregue pelo asset público da Release do GitHub.
    // O GitHub registra o download de forma persistente sem alterar a branch main,
    // evitando o antigo ciclo de commits e deployments da Vercel.
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('X-Download-Counted', 'github-release');
    return res.redirect(302, latest.apkUrl);
  } catch (err) {
    console.error('Falha no download:', err?.message || err);
    return res.status(500).json({ error: 'Falha no download' });
  }
}
