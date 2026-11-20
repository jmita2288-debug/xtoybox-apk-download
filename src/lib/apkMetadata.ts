export type LatestMetadata = {
  appName?: string;
  latestVersionName: string;
  latestVersionCode: number;
  apkUrl: string;
  pageUrl?: string;
  releaseNotes?: string[];
  publishedAt?: string;
};

type DownloadStats = {
  totalDownloads?: number;
  versions?: Record<string, number>;
  updatedAt?: string | null;
  lastVersion?: string;
};

export type ApkMetadata = {
  appName: string;
  versionName: string;
  versionCode: number;
  apkUrl: string;
  pageUrl?: string;
  releaseNotes: string[];
  publishedAt: string | null;
  lastUpdated: string | null;
  downloadsTotal: number | null;
  apkSizeBytes: number | null;
  apkSizeFormatted: string | null;
  source: "server-api" | "latest-json" | "latest-json-github" | "latest-json-stats" | "fallback";
  latest: LatestMetadata;
};

/**
 * Android publicado pelo XTOYBOX Dashboard: public/latest.json + APK na Release
 * `xtoybox-latest`. O iOS usa outro arquivo (latest-ios.json + .ipa, ver StoreButtons.tsx);
 * aqui só entram dados com platform "android" (ou sem platform) e links .apk.
 * Mesmas regras de api/_android-release.js (usado pelo servidor).
 */
const GITHUB_RELEASE_REPO = "jmita2288-debug/xtoybox-apk-download";
const GITHUB_RELEASE_TAG = "xtoybox-latest";
const HISTORICAL_DOWNLOAD_BASE = 25_852;
const COUNT_FROM_VERSION = "1.1.16";
const ASSET_DOWNLOAD_BASELINES: Record<string, number> = {
  "1.1.16": 0,
};
const ARCHIVED_APK_DOWNLOADS = 0;
const VERSION_RE = /^\d+(?:\.\d+){1,3}$/;
const APK_ASSET_RE = /^XTOYBOX-v(\d+(?:\.\d+){1,3})\.apk$/i;

function releaseAssetUrl(name: string) {
  return `https://github.com/${GITHUB_RELEASE_REPO}/releases/download/${GITHUB_RELEASE_TAG}/${name}`;
}

function isApkUrl(value: unknown) {
  try {
    const url = new URL(String(value ?? ""));
    return url.protocol === "https:" && url.pathname.toLowerCase().endsWith(".apk");
  } catch {
    return false;
  }
}

function compareVersions(a: string, b: string) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function assetVersion(name: string) {
  return name.match(APK_ASSET_RE)?.[1] ?? null;
}

export const fallbackLatestMetadata: LatestMetadata = {
  appName: "XTOYBOX",
  latestVersionName: "1.1.16",
  latestVersionCode: 116,
  apkUrl:
    "https://github.com/jmita2288-debug/xtoybox-apk-download/releases/download/xtoybox-latest/XTOYBOX-v1.1.16.apk",
  pageUrl: "https://xtoybox.cloud/",
  releaseNotes: [
    "Esta atualização traz novas correções de estabilidade e desempenho para deixar o aplicativo mais rápido e consistente durante o uso.",
    "A Biblioteca recebeu melhorias no carregamento e agora consegue disponibilizar o catálogo corretamente desde a primeira abertura, mantendo a virtualização para preservar a fluidez. A pesquisa também foi otimizada para reduzir travamentos enquanto o usuário digita e o trabalho pesado de cache passou a acontecer fora das interações principais da interface.",
    "O sistema de fila do xCloud foi ajustado para evitar aumentos artificiais no tempo estimado, impedir que a estimativa desapareça durante mudanças temporárias de estado e tornar a consulta de tempo de espera independente da conexão principal do streaming.",
    "A área de Conquistas recebeu melhorias no carregamento das capas dos jogos, tratamento para imagens indisponíveis e atualização visual para combinar melhor com a nova interface do XTOYBOX. A tela principal, os detalhes e os cards internos agora seguem o mesmo padrão de cores, tipografia e ícones.",
    "O modo de teclado e mouse continua disponível em fase de testes. A compatibilidade pode variar conforme o aparelho, o adaptador utilizado e o suporte oferecido pelo próprio jogo e pelo xCloud.",
    "Também foram mantidas as melhorias de streaming, controles virtuais, resposta ao toque e estabilidade geral presentes na versão 1.1.16.",
  ],
  publishedAt: "2026-09-07",
};

export function formatBytes(bytes: number | null) {
  if (!bytes || bytes <= 0) return null;

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const precision = unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(precision)} ${units[unitIndex]}`;
}

function normalizeVersion(value: string) {
  return String(value || "").trim().replace(/^v/i, "");
}

function buildMetadata(
  latest: LatestMetadata,
  downloadsTotal: number | null,
  apkSizeBytes: number | null,
  source: ApkMetadata["source"],
): ApkMetadata {
  return {
    appName: latest.appName ?? "XTOYBOX",
    versionName: latest.latestVersionName,
    versionCode: latest.latestVersionCode,
    apkUrl: latest.apkUrl,
    pageUrl: latest.pageUrl,
    releaseNotes: latest.releaseNotes ?? [],
    publishedAt: latest.publishedAt ?? null,
    lastUpdated: latest.publishedAt ?? null,
    downloadsTotal,
    apkSizeBytes,
    apkSizeFormatted: formatBytes(apkSizeBytes),
    source,
    latest,
  };
}

async function fetchServerApkMetadata() {
  const response = await fetch(`/api/apk-metadata?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) return null;
  return (await response.json()) as ApkMetadata;
}

export async function fetchLatestMetadata(): Promise<LatestMetadata> {
  const response = await fetch("/latest.json", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("latest.json indisponível");
  }

  const data = (await response.json()) as Partial<LatestMetadata> & { platform?: string };
  const version = normalizeVersion(data.latestVersionName ?? "");

  if (String(data.platform ?? "android").toLowerCase() !== "android" || !VERSION_RE.test(version)) {
    throw new Error("latest.json inválido");
  }

  return {
    appName: data.appName ?? "XTOYBOX",
    latestVersionName: version,
    latestVersionCode: Number(data.latestVersionCode ?? 0),
    apkUrl: isApkUrl(data.apkUrl) ? String(data.apkUrl) : releaseAssetUrl(`XTOYBOX-v${version}.apk`),
    pageUrl: data.pageUrl,
    releaseNotes: Array.isArray(data.releaseNotes) ? data.releaseNotes : [],
    publishedAt: data.publishedAt,
  };
}

async function fetchDownloadStats() {
  const response = await fetch(`/download-stats.json?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) return null;
  return (await response.json()) as DownloadStats;
}

type ReleaseAsset = {
  name: string;
  size?: number;
  download_count?: number;
  browser_download_url?: string;
};

// Base histórica + downloads de cada APK (.apk) da Release a partir da 1.1.16.
function calculatePersistedTotal(assets: ReleaseAsset[]) {
  let total = HISTORICAL_DOWNLOAD_BASE + ARCHIVED_APK_DOWNLOADS;
  for (const asset of assets) {
    const version = assetVersion(asset.name);
    if (!version || compareVersions(version, COUNT_FROM_VERSION) < 0) continue;
    total += Math.max(0, Number(asset.download_count ?? 0) - Number(ASSET_DOWNLOAD_BASELINES[version] ?? 0));
  }
  return total;
}

async function fetchGitHubReleaseData(latest: LatestMetadata) {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_RELEASE_REPO}/releases/tags/${GITHUB_RELEASE_TAG}?t=${Date.now()}`,
    { cache: "no-store" },
  );

  if (!response.ok) return null;

  const release = (await response.json()) as { published_at?: string; assets?: ReleaseAsset[] };

  const version = normalizeVersion(latest.latestVersionName);
  const apkAssets = (release.assets ?? []).filter((asset) => assetVersion(asset.name));
  const urlName = decodeURIComponent(new URL(latest.apkUrl).pathname.split("/").pop() ?? "");
  const matchingAsset = apkAssets.find((asset) => asset.name === urlName)
    ?? apkAssets.find((asset) => assetVersion(asset.name) === version)
    ?? null;

  return {
    downloadsTotal: calculatePersistedTotal(apkAssets),
    apkSizeBytes: matchingAsset?.size ?? null,
    publishedAt: release.published_at,
  };
}

export async function fetchApkMetadata(): Promise<ApkMetadata> {
  const serverMetadata = await fetchServerApkMetadata().catch(() => null);
  const serverPlatform = String((serverMetadata as { platform?: string } | null)?.platform ?? "android");
  if (serverMetadata?.versionName && isApkUrl(serverMetadata.apkUrl) && serverPlatform === "android") {
    return serverMetadata;
  }

  let latest = fallbackLatestMetadata;
  let latestOk = false;

  try {
    latest = await fetchLatestMetadata();
    latestOk = true;
  } catch {
    latestOk = false;
  }

  const [github, stats] = await Promise.all([
    fetchGitHubReleaseData(latest).catch(() => null),
    fetchDownloadStats().catch(() => null),
  ]);

  const statsDownloads = typeof stats?.totalDownloads === "number" ? stats.totalDownloads : null;
  const latestWithGitHubAsset: LatestMetadata = {
    ...latest,
    publishedAt: latest.publishedAt ?? github?.publishedAt,
  };

  return buildMetadata(
    latestWithGitHubAsset,
    github?.downloadsTotal ?? statsDownloads ?? null,
    github?.apkSizeBytes ?? null,
    github
      ? "latest-json-github"
      : statsDownloads != null
        ? "latest-json-stats"
        : latestOk
          ? "latest-json"
          : "fallback",
  );
}
