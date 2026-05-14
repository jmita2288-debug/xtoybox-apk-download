function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return null;
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(1)} MB`;
}

function parseContentRange(value) {
  if (!value) return null;
  const match = value.match(/\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

async function getApkSizeBytes(apkUrl) {
  try {
    const headResponse = await fetch(apkUrl, { method: 'HEAD', redirect: 'follow' });
    const headLength = headResponse.headers.get('content-length');
    if (headLength) return Number(headLength);
  } catch (e) {}

  try {
    const rangeResponse = await fetch(apkUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: { Range: 'bytes=0-0' },
    });
    const rangeSize = parseContentRange(rangeResponse.headers.get('content-range'));
    if (rangeSize) return rangeSize;
  } catch (e) {}

  try {
    const fileResponse = await fetch(apkUrl, { method: 'GET', redirect: 'follow' });
    const buffer = await fileResponse.arrayBuffer();
    return buffer.byteLength || null;
  } catch (e) {
    return null;
  }
}

export default async function handler(req, res) {
  try {
    const baseUrl = process.env.SITE_URL || 'https://xtoybox.cloud';
    const latestResponse = await fetch(`${baseUrl}/latest.json`, { cache: 'no-store' });
    const latest = await latestResponse.json();

    const statsResponse = await fetch(`${baseUrl}/download-stats.json?t=${Date.now()}`).catch(() => null);
    const stats = statsResponse && statsResponse.ok ? await statsResponse.json() : null;
    const apkSizeBytes = await getApkSizeBytes(latest.apkUrl);

    return res.status(200).json({
      appName: latest.appName || 'XTOYBOX',
      versionName: latest.latestVersionName,
      versionCode: Number(latest.latestVersionCode || 0),
      apkUrl: latest.apkUrl,
      pageUrl: latest.pageUrl,
      releaseNotes: Array.isArray(latest.releaseNotes) ? latest.releaseNotes : [],
      publishedAt: latest.publishedAt || null,
      lastUpdated: latest.publishedAt || null,
      downloadsTotal: typeof stats?.totalDownloads === 'number' ? stats.totalDownloads : null,
      apkSizeBytes,
      apkSizeFormatted: formatBytes(apkSizeBytes),
      source: 'server-api',
      latest,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Falha ao buscar metadados do APK' });
  }
}
