export default async function handler(req, res) {
  try {
    const baseUrl = process.env.SITE_URL || 'https://xtoybox.cloud';
    const latestRes = await fetch(`${baseUrl}/latest.json`);
    const latest = await latestRes.json();

    const apkUrl = latest.apkUrl;

    // contador simples via log (pode evoluir depois)
    console.log('Download registrado:', new Date().toISOString());

    return res.redirect(apkUrl);
  } catch (err) {
    return res.status(500).json({ error: 'Falha no download' });
  }
}
