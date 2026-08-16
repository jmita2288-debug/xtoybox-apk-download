import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_OWNER = 'jmita2288-debug';
const REPO_NAME = 'xtoybox-apk-download';
const BRANCH = 'main';
const PUBLIC_DOWNLOAD_BASE = 'https://xtoybox-apk-download.vercel.app/downloads';
const FALLBACK_VERSION = '1.1.15';

function normalizeLatestMetadata(data) {
  const version = String(data?.latestVersionName || '').trim().replace(/^v/i, '');
  if (!/^\d+(?:\.\d+){1,3}$/.test(version)) {
    throw new Error('latestVersionName invalida');
  }

  return {
    ...data,
    latestVersionName: version,
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
    // Usa o arquivo empacotado ou o fallback abaixo.
  }

  const local = readLatestJsonFromFilesystem();
  if (local) return local;

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

    // Não grave estatísticas no repositório durante um download.
    // Cada gravação na branch main dispara a integração Git/Vercel e pode criar
    // um ciclo de deployments. A contagem pública pode ser obtida pelas releases
    // oficiais do GitHub sem alterar arquivos do projeto.
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('X-Download-Counted', '0');
    return res.redirect(302, latest.apkUrl);
  } catch (err) {
    console.error('Falha no download:', err?.message || err);
    return res.status(500).json({ error: 'Falha no download' });
  }
}
