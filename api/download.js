import { loadAndroidLatest } from './_android-release.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD');
      return res.status(405).json({ error: 'Metodo nao permitido' });
    }

    // APK publicado pelo Dashboard (public/latest.json). Nunca usa dados do iOS.
    const latest = await loadAndroidLatest();
    if (!latest?.apkUrl) throw new Error('apkUrl ausente');

    // O GitHub registra o download no asset da Release, sem commits no repositório.
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('X-XTOYBOX-Platform', 'android');
    res.setHeader('X-XTOYBOX-Version', latest.latestVersionName);
    return res.redirect(302, latest.apkUrl);
  } catch (err) {
    console.error('Falha no download:', err?.message || err);
    return res.status(500).json({ error: 'Falha no download' });
  }
}
