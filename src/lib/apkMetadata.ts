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

const GITHUB_RELEASE_REPO = "jmita2288-debug/xtoybox-apk-download";
const GITHUB_RELEASE_TAG = "xtoybox-latest";
const HISTORICAL_DOWNLOAD_BASE = 22_787;
const RELEASE_DOWNLOAD_BASELINES: Record<string, number> = {
  "1.1.15": 1_089,
};

export const fallbackLatestMetadata: LatestMetadata = {
  appName: "XTOYBOX",
  latestVersionName: "1.1.15",
  latestVersionCode: 115,
  apkUrl:
    "https://github.com/jmita2288-debug/xtoybox-apk-download/releases/download/xtoybox-latest/XTOYBOX-v1.1.15.apk",
  pageUrl: "https://xtoybox.cloud/",
  releaseNotes: [
    "Melhorias no streaming, controles virtuais e otimização geral do aplicativo.",
  ],
  publishedAt: "2026-08-08",
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

  const data = (await response.json()) as Partial<LatestMetadata>;

  if (!data.latestVersionName || !data.apkUrl) {
    throw new Error("latest.json inválido");
  }

  return {
    appName: data.appName ?? "XTOYBOX",
    latestVersionName: normalizeVersion(data.latestVersionName),
    latestVersionCode: Number(data.latestVersionCode ?? 0),
    apkUrl: data.apkUrl,
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

function calculatePersistedTotal(version: string, releaseDownloadCount: number) {
  const baseline = Number(RELEASE_DOWNLOAD_BASELINES[version] ?? 0);
  return HISTORICAL_DOWNLOAD_BASE + Math.max(0, releaseDownloadCount - baseline);
}

async function fetchGitHubReleaseData(latest: LatestMetadata) {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_RELEASE_REPO}/releases/tags/${GITHUB_RELEASE_TAG}?t=${Date.now()}`,
    { cache: "no-store" },
  );

  if (!response.ok) return null;

  const release = (await response.json()) as {
    published_at?: string;
    assets?: Array<{
      name: string;
      size?: number;
      download_count?: number;
      browser_download_url?: string;
    }>;
  };

  const version = normalizeVersion(latest.latestVersionName);
  const expectedName = `XTOYBOX-v${version}.apk`;
  const apkAssets = release.assets?.filter((asset) => asset.name.toLowerCase().endsWith(".apk")) ?? [];
  const matchingAsset = apkAssets.find((asset) => asset.name === expectedName)
    ?? apkAssets.find((asset) => asset.name.includes(version))
    ?? null;

  if (!matchingAsset) return null;

  const releaseDownloadCount = Number(matchingAsset.download_count ?? 0);
  const downloadsTotal = calculatePersistedTotal(version, releaseDownloadCount);

  return {
    downloadsTotal,
    apkSizeBytes: matchingAsset.size ?? null,
    publishedAt: release.published_at,
    browserDownloadUrl: matchingAsset.browser_download_url,
  };
}

export async function fetchApkMetadata(): Promise<ApkMetadata> {
  const serverMetadata = await fetchServerApkMetadata().catch(() => null);
  if (serverMetadata?.apkUrl && serverMetadata.versionName) {
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
    apkUrl: github?.browserDownloadUrl ?? latest.apkUrl,
    publishedAt: github?.publishedAt ?? latest.publishedAt,
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
