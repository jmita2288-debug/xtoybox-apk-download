import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const APK_URL = 'https://github.com/jmita2288-debug/XTOYBOX/releases/download/xtoybox-v1.0.5-latest/XTOYBOX-v1.0.5.apk';
const outDir = path.resolve('dist');
const assetsDir = path.join(outDir, 'assets');

await mkdir(assetsDir, { recursive: true });

const sourceLogo = path.resolve('src/assets/logo-xtoybox.png');
const logoOut = path.join(assetsDir, 'logo-xtoybox.png');
if (existsSync(sourceLogo)) {
  await copyFile(sourceLogo, logoOut);
}

const latest = {
  appName: 'XTOYBOX',
  latestVersionName: '1.0.5',
  latestVersionCode: 105,
  apkUrl: APK_URL,
  pageUrl: 'https://xtoybox-apk-download.vercel.app/',
  releaseNotes: ['Melhorias visuais', 'Ajustes na biblioteca', 'Correções gerais'],
  publishedAt: '2026-05-12',
};

await writeFile(path.join(outDir, 'latest.json'), JSON.stringify(latest, null, 2));

const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Download do APK do XTOYBOX para Android." />
  <meta name="theme-color" content="#080d0b" />
  <title>XTOYBOX — Download APK</title>
  <link rel="icon" href="/assets/logo-xtoybox.png" />
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    :root{--bg:#080d0b;--card:#111815;--card2:#0d1411;--line:#1f2c26;--text:#eef4ef;--muted:#9aa79f;--green:#7bdc39;--green2:#5fc82f;--red:#ef5d5d}
    body{min-height:100vh;background:radial-gradient(circle at 50% -10%,rgba(123,220,57,.10),transparent 32%),linear-gradient(180deg,#0b1210 0%,#080d0b 46%,#050807 100%);color:var(--text);font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
    a{color:inherit;text-decoration:none}.wrap{width:min(1080px,100%);margin:0 auto;padding:0 24px}
    header{position:sticky;top:0;z-index:10;background:rgba(8,13,11,.9);backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,.06)}
    header .wrap{height:68px;display:flex;align-items:center;justify-content:space-between;gap:16px}.brand{display:flex;align-items:center;gap:12px;font-weight:800;letter-spacing:.08em}.brand img{width:38px;height:38px;border-radius:10px;object-fit:cover;border:1px solid var(--line)}.tag-top{color:var(--muted);font-size:.9rem;font-weight:600}
    .hero{padding:74px 0 64px}.hero-grid{display:grid;grid-template-columns:1.08fr .92fr;gap:48px;align-items:center}.pill{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(123,220,57,.22);background:rgba(123,220,57,.08);color:var(--green);border-radius:999px;padding:7px 11px;font-size:.76rem;font-weight:850;letter-spacing:.12em;text-transform:uppercase;margin-bottom:22px}.pill:before{content:"";width:7px;height:7px;border-radius:50%;background:var(--green)}
    h1{font-size:clamp(2.6rem,8vw,5rem);line-height:.96;letter-spacing:.05em;margin-bottom:18px}.lead{font-size:1.14rem;color:#cbd6cd;max-width:520px}.sub{margin-top:8px;color:#748077;font-size:.94rem}.logo-card{padding:16px;border:1px solid var(--line);border-radius:28px;background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.008)),var(--card);box-shadow:0 30px 90px rgba(0,0,0,.33)}.logo-card img{width:100%;aspect-ratio:1/1;border-radius:21px;object-fit:cover;background:#050705;border:1px solid rgba(255,255,255,.06)}.logo-meta{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:14px;color:var(--muted);font-size:.9rem}.version{color:var(--green);border:1px solid rgba(123,220,57,.22);background:rgba(123,220,57,.08);border-radius:999px;padding:5px 9px;font-size:.78rem;font-weight:850}
    section{padding:50px 0;border-top:1px solid rgba(255,255,255,.055)}.label{color:var(--green);font-size:.76rem;font-weight:850;letter-spacing:.13em;text-transform:uppercase;margin-bottom:8px}h2{font-size:clamp(1.4rem,3vw,2rem);line-height:1.15;margin-bottom:18px}.about{display:grid;grid-template-columns:1fr auto;gap:22px;align-items:center;border:1px solid var(--line);border-radius:24px;background:linear-gradient(135deg,rgba(123,220,57,.075),transparent 42%),var(--card);padding:25px}.about p{color:var(--muted);max-width:720px}.mini{display:grid;gap:8px;min-width:168px}.mini span{border:1px solid var(--line);background:rgba(255,255,255,.025);border-radius:999px;padding:7px 11px;font-size:.86rem;font-weight:700;color:#c6d1c8}
    .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.card{min-height:138px;border:1px solid var(--line);border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.026),rgba(255,255,255,.006)),var(--card);padding:18px}.icon{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:rgba(123,220,57,.09);color:var(--green);margin-bottom:18px}.card strong{display:block;margin-bottom:6px}.card span{display:block;color:var(--muted);font-size:.9rem;line-height:1.5}.notice{border:1px solid var(--line);border-left:3px solid var(--green);border-radius:20px;background:rgba(255,255,255,.018);padding:22px;color:var(--muted);max-width:880px}.download{padding-bottom:78px}.download-card{display:grid;grid-template-columns:1fr auto;align-items:center;gap:24px;border:1px solid var(--line);border-radius:26px;background:radial-gradient(circle at 90% 0%,rgba(123,220,57,.12),transparent 34%),linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.006)),var(--card);padding:24px}.download-info{display:flex;align-items:center;gap:18px}.download-info img{width:74px;height:74px;border-radius:18px;object-fit:cover;border:1px solid var(--line)}.download-info strong{display:block;font-size:1.25rem}.download-info span{color:var(--green);font-size:.92rem;font-weight:850}.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:50px;padding:0 24px;border-radius:15px;background:linear-gradient(180deg,var(--green),var(--green2));color:#071006;font-weight:900;box-shadow:0 12px 34px rgba(123,220,57,.14)}.btn svg{width:20px;height:20px}.note{margin-top:14px;color:#707b73;font-size:.9rem;max-width:720px}footer{border-top:1px solid rgba(255,255,255,.055);color:#707b73;text-align:center;padding:24px;font-size:.86rem}
    @media(max-width:850px){.hero{padding:52px 0 46px}.hero-grid{grid-template-columns:1fr;gap:28px}.hero-copy{text-align:center}.lead{margin:0 auto}.logo-card{max-width:430px;margin:0 auto}.cards{grid-template-columns:repeat(2,1fr)}.about{grid-template-columns:1fr}}
    @media(max-width:560px){.wrap{padding:0 20px}header .wrap{height:62px}.tag-top{display:none}.hero{padding:40px 0 40px}.lead{font-size:1.02rem}.logo-card{border-radius:24px;padding:13px}.logo-card img{border-radius:18px}section{padding:42px 0}.cards{grid-template-columns:1fr}.card{min-height:auto}.about{padding:21px}.download-card{grid-template-columns:1fr;padding:20px}.download-info img{width:62px;height:62px;border-radius:15px}.btn{width:100%}}
  </style>
</head>
<body>
  <header><div class="wrap"><a class="brand" href="/"><img src="/assets/logo-xtoybox.png" alt=""><span>XTOYBOX</span></a><span class="tag-top">APK Android</span></div></header>
  <main>
    <div class="hero"><div class="wrap hero-grid"><div class="hero-copy"><div class="pill">Android</div><h1>XTOYBOX</h1><p class="lead">App Android para jogar na nuvem.</p><p class="sub">Projeto independente baseado no XStreaming.</p></div><div class="logo-card"><img src="/assets/logo-xtoybox.png" alt="Logo do XTOYBOX"><div class="logo-meta"><strong>XTOYBOX APK</strong><span class="version">v1.0.5</span></div></div></div></div>
    <section><div class="wrap"><div class="label">Sobre</div><h2>Feito para usar no Android.</h2><div class="about"><p>O XTOYBOX é uma versão modificada do XStreaming, com ajustes na interface, navegação e experiência de uso no Android, celular e TV Box.</p><div class="mini"><span>Android</span><span>Celular</span><span>TV Box</span></div></div></div></section>
    <section><div class="wrap"><div class="label">Recursos</div><h2>O que tem no app</h2><div class="cards"><div class="card"><div class="icon">☰</div><strong>Textos ajustados</strong><span>Menus mais claros e diretos.</span></div><div class="card"><div class="icon">▣</div><strong>Interface ajustada</strong><span>Visual mais limpo e organizado.</span></div><div class="card"><div class="icon">☁</div><strong>Jogos na nuvem</strong><span>Acesso aos jogos compatíveis.</span></div><div class="card"><div class="icon">▭</div><strong>Celular e TV Box</strong><span>Layout pensado para telas diferentes.</span></div></div></div></section>
    <section><div class="wrap"><div class="label">Aviso</div><h2>Projeto não oficial</h2><div class="notice">XTOYBOX é um projeto independente baseado no XStreaming. Não possui vínculo, parceria ou afiliação com Xbox, Microsoft ou marcas relacionadas.</div></div></section>
    <section class="download"><div class="wrap"><div class="label">Download</div><h2>Baixar APK</h2><div class="download-card"><div class="download-info"><img src="/assets/logo-xtoybox.png" alt=""><div><strong>XTOYBOX APK</strong><span>Versão v1.0.5</span></div></div><a class="btn" href="${APK_URL}"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7.2 9.2h9.6v7.1c0 .9-.7 1.6-1.6 1.6h-.5v2.1c0 .5-.4.9-.9.9s-.9-.4-.9-.9v-2.1h-1.8v2.1c0 .5-.4.9-.9.9s-.9-.4-.9-.9v-2.1h-.5c-.9 0-1.6-.7-1.6-1.6V9.2Zm-2.4.2c.5 0 .9.4.9.9v4.3c0 .5-.4.9-.9.9s-.9-.4-.9-.9v-4.3c0-.5.4-.9.9-.9Zm14.4 0c.5 0 .9.4.9.9v4.3c0 .5-.4.9-.9.9s-.9-.4-.9-.9v-4.3c0-.5.4-.9.9-.9ZM8.5 5.1 7.3 3.9c-.2-.2-.2-.5 0-.7.2-.2.5-.2.7 0l1.4 1.4c.8-.4 1.7-.6 2.6-.6s1.8.2 2.6.6L16 3.2c.2-.2.5-.2.7 0 .2.2.2.5 0 .7l-1.2 1.2c1.1.8 1.8 1.9 2 3.2h-11c.2-1.3.9-2.4 2-3.2Z"/></svg>Baixar APK</a></div><p class="note">Depois de baixar, talvez seja necessário permitir a instalação de fontes desconhecidas no Android.</p></div></section>
  </main>
  <footer>XTOYBOX — projeto independente baseado em software open source.</footer>
</body>
</html>`;

await writeFile(path.join(outDir, 'index.html'), html);
console.log('Static site generated in dist/');
