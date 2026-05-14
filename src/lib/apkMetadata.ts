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
  source: "latest-json" | "latest-json-github" | "latest-json-stats" | "fallback";
  latest: LatestMetadata;
};

export const fallbackLatestMetadata: LatestMetadata = {
  appName: "XTOYBOX",
  latestVersionName: "1.0.5",
  latestVersionCode: 5,
  apkUrl:
    "https://github.com/jmita2288-debug/XTOYBOX/releases/download/xtoybox-v1.0.5-latest/XTOYBOX-v1.0.5.apk",
};

const GITHUB_RELEASE_REPO = "jmita2288-debug/XTOYBOX";

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

function normalizeVersion(version: string) {
  return version.trim().replace(/^v/i, "");
}

function getApkFileName(apkUrl: string) {
  try {
    const parsed = new URL(apkUrl, window.location.origin);
    return decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() ?? "");
  } catch {
    return "";
  }
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
    latestVersionName: data.latestVersionName,
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

async function fetchGitHubReleaseData(latest: LatestMetadata) {
  const version = normalizeVersion(latest.latestVersionName);
  const tag = `xtoybox-v${version}-latest`;
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_RELEASE_REPO}/releases/tags/${tag}`,
    { cache: "no-store" },
  );

  if (!response.ok) return null;

  const release = (await response.json()) as {
    published_at?: string;
    assets?: Array<{ name: string; size?: number; download_count?: number }>;
  };
  const apkFileName = getApkFileName(latest.apkUrl);
  const apkAssets = release.assets?.filter((asset) => asset.name.toLowerCase().endsWith(".apk")) ?? [];
  const matchingAsset = apkAssets.find((asset) => asset.name === apkFileName) ?? apkAssets[0];

  return {
    downloadsTotal: matchingAsset?.download_count ?? null,
    apkSizeBytes: matchingAsset?.size ?? null,
    publishedAt: release.published_at,
  };
}

export async function fetchApkMetadata(): Promise<ApkMetadata> {
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
  const latestWithDate = github?.publishedAt && !latest.publishedAt
    ? { ...latest, publishedAt: github.publishedAt }
    : latest;

  return buildMetadata(
    latestWithDate,
    statsDownloads ?? github?.downloadsTotal ?? null,
    github?.apkSizeBytes ?? null,
    statsDownloads != null ? "latest-json-stats" : github ? "latest-json-github" : latestOk ? "latest-json" : "fallback",
  );
}
