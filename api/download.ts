import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const latestRes = await fetch(`${process.env.SITE_URL}/latest.json`);
    const latest = await latestRes.json();

    const apkUrl = latest.apkUrl;

    // Aqui poderia atualizar contador via GitHub API (opcional com token)
    // Sem token, apenas redireciona

    return res.redirect(apkUrl);
  } catch (err) {
    return res.status(500).json({ error: 'Falha no download' });
  }
}
