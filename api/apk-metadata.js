function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return null;
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(1)} MB`;
}

export default async function handler(req, res) {
  try {
    const baseUrl = process.env.SITE_URL || 'https://xtoybox.cloud';
    const latestResponse = await fetch(`${baseUrl}/latest.json`);
    const latest = await latestResponse.json();

    const statsResponse = await fetch(`${baseUrl}/download-stats.json?t=${Date.now()}`).catch(() => null);
    const stats = statsResponse && statsResponse.ok ? await statsResponse.json() : null;

    let apkSizeBytes = null;
    try {
      const apkResponse = await fetch(latest.apkUrl, { method: 'HEAD' });
      const sizeHeader = apkResponse.headers.get('content-length');
      apkSizeBytes = sizeHeader ? Number(sizeHeader) : null;
    } catch (e) {
      apkSizeBytes = null;
    }

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
