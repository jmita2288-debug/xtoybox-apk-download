import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Versão Android publicada pelo XTOYBOX Dashboard (xtoybox-admin).
 *
 * Ao publicar um APK, o Dashboard envia o arquivo para a Release `xtoybox-latest`
 * deste repositório e grava `public/latest.json` (o mesmo arquivo que o app
 * Android consulta para avisar sobre atualizações). O iOS é independente:
 * `public/latest-ios.json` + arquivo `.ipa` (ver src/components/xt/StoreButtons.tsx).
 *
 * Regras que impedem misturar as plataformas:
 *  - `platform`, quando existir, precisa ser "android";
 *  - o link do download precisa terminar em `.apk` (nunca `.ipa`);
 *  - o contador só soma assets `.apk` da Release.
 *
 * Arquivos com "_" no início não viram rota na Vercel.
 */
export const REPO_OWNER = 'jmita2288-debug';
export const REPO_NAME = 'xtoybox-apk-download';
export const BRANCH = 'main';
export const RELEASE_TAG = 'xtoybox-latest';
export const FALLBACK_VERSION = '1.1.16';

const VERSION_RE = /^\d+(?:\.\d+){1,3}$/;
const APK_ASSET_RE = /^XTOYBOX-v(\d+(?:\.\d+){1,3})\.apk$/i;

export function normalizeVersion(value) {
  const version = String(value || '').trim().replace(/^v/i, '');
  return VERSION_RE.test(version) ? version : null;
}

export function compareVersions(a, b) {
  const pa = String(a).split('.').map(Number);
  const pb = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function releaseAssetUrl(assetName) {
  return `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${RELEASE_TAG}/${assetName}`;
}

export function versionFromAssetName(name) {
  const match = String(name || '').match(APK_ASSET_RE);
  return match ? match[1] : null;
}

/** https e caminho terminando em .apk. Qualquer outro arquivo (ex.: .ipa) é recusado. */
export function isApkUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' && url.pathname.toLowerCase().endsWith('.apk');
  } catch {
    return false;
  }
}

/** Metadados Android válidos ou null (iOS, versão inválida, objeto vazio). */
export function parseAndroidLatest(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const platform = String(data.platform ?? 'android').trim().toLowerCase();
  if (platform !== 'android') return null;
  const version = normalizeVersion(data.latestVersionName);
  if (!version) return null;

  const defaultAsset = `XTOYBOX-v${version}.apk`;
  const apkUrl = isApkUrl(data.apkUrl) ? String(data.apkUrl).trim() : releaseAssetUrl(defaultAsset);
  const urlName = decodeURIComponent(new URL(apkUrl).pathname.split('/').pop() || '');
  const assetName = APK_ASSET_RE.test(urlName) ? urlName : defaultAsset;

  return {
    ...data,
    platform: 'android',
    latestVersionName: version,
    latestVersionCode: Number(data.latestVersionCode || 0) || 0,
    apkUrl,
    assetName,
  };
}

function readLocalJson(fileName) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(__dirname, `../public/${fileName}`),
    resolve(__dirname, `../dist/${fileName}`),
    resolve(process.cwd(), `public/${fileName}`),
    resolve(process.cwd(), `dist/${fileName}`),
  ];
  for (const filePath of candidates) {
    try {
      return JSON.parse(readFileSync(filePath, 'utf8'));
    } catch {
      // próximo candidato
    }
  }
  return null;
}

/** Lê public/latest.json (local, depois o arquivo publicado no GitHub). */
export async function loadAndroidLatest() {
  const local = parseAndroidLatest(readLocalJson('latest.json'));
  if (local) return local;

  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/public/latest.json?t=${Date.now()}`,
      { cache: 'no-store' },
    );
    if (response.ok) {
      const remote = parseAndroidLatest(await response.json());
      if (remote) return remote;
    }
  } catch {
    // usa o fallback
  }

  return parseAndroidLatest({ appName: 'XTOYBOX', latestVersionName: FALLBACK_VERSION });
}

// ---- Contador acumulado de downloads -------------------------------------
// O GitHub conta downloads por asset. O total público = base histórica (tudo
// que foi baixado antes do APK 1.1.16 começar a contar na Release) + downloads
// de cada APK da Release a partir da 1.1.16. Assim, publicar a 1.1.17 pelo
// Dashboard não zera o contador: o APK 1.1.16 continua somando.
// Se um APK antigo for apagado da Release, some a contagem final dele em
// ARCHIVED_APK_DOWNLOADS para o total não diminuir.
export const HISTORICAL_DOWNLOAD_BASE = 25_852;
export const COUNT_FROM_VERSION = '1.1.16';
export const ASSET_DOWNLOAD_BASELINES = { '1.1.16': 0 };
export const ARCHIVED_APK_DOWNLOADS = 0;

export function apkAssetsOf(release) {
  return (Array.isArray(release?.assets) ? release.assets : []).filter((asset) =>
    versionFromAssetName(asset?.name),
  );
}

export function totalDownloads(release) {
  let total = HISTORICAL_DOWNLOAD_BASE + ARCHIVED_APK_DOWNLOADS;
  for (const asset of apkAssetsOf(release)) {
    const version = versionFromAssetName(asset.name);
    if (compareVersions(version, COUNT_FROM_VERSION) < 0) continue; // já incluído na base
    const baseline = Number(ASSET_DOWNLOAD_BASELINES[version] || 0);
    total += Math.max(0, Number(asset.download_count || 0) - baseline);
  }
  return total;
}

export function currentApkAsset(release, latest) {
  const assets = apkAssetsOf(release);
  return (
    assets.find((asset) => asset.name === latest.assetName) ||
    assets.find((asset) => versionFromAssetName(asset.name) === latest.latestVersionName) ||
    null
  );
}
