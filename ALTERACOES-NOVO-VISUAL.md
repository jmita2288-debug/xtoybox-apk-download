# Novo visual do XTOYBOX: o que mudou

Todas as páginas servidas pelo build da Vercel (`src/vercel-entry.tsx`) agora usam o mesmo visual: home, Downloads (nova), XtoyTouch, Segurança do download, Privacidade, Termos e Reportar bugs.

## Dados de download: nada é fixo
- O total (ex.: 32.408) continua vindo ao vivo de `/api/apk-metadata` e é calculado em `src/lib/apkMetadata.ts` (base histórica + downloads da Release no GitHub). Esse arquivo NÃO foi alterado.
- `DownloadCounter.tsx` não foi alterado. Ele ainda monta o contador em `.refined-hero__visual` (elemento mantido na home), faz a contagem otimista ao clicar e atualiza a cada 2 min.
- Versão, data, tamanho e notas da versão vêm dos metadados, nunca de texto fixo.
- Atenção: `public/download-stats.json` ainda mostra 25852 e é só o plano B do contador se a API falhar. Se quiser, atualize esse arquivo.

## Contratos preservados
- Todo download é `<a href="/api/download">` (o `DownloadAdGate` e o contador escutam esse seletor). O novo botão `DownloadButton` só adiciona feedback visual e nunca bloqueia a navegação.
- Instalação do XtoyTouch: `/xtoytouch/XtoyTouch.user.js`; versão lida de `/xtoytouch/XtoyTouch.meta.js`.
- Formulário de bug: mesmos campos, mesmos campos obrigatórios, mesmo `POST /api/report-bug`.
- Segurança do download: mesma busca em `/api/apk-metadata` e mesmos valores de reserva.
- Metadados de SEO (título, descrição, canonical) mantidos nas páginas legais; a página Downloads também tem os seus.
- Chaves de tema `xtoybox-home-theme` e `xtoybox-theme` mantidas; padrão continua escuro.
- Textos de Privacidade e Termos mantidos, exceto a menção ao Instagram na seção 9 dos Termos.

## Arquivos novos
- `src/xt-ui.css`: sistema visual único (tokens claro/escuro, componentes, páginas, gate de anúncio, contador).
- `src/components/xt/SiteChrome.tsx`: cabeçalho de vidro, menu, rodapé, animações de rolagem, transição entre páginas.
- `src/components/xt/DownloadButton.tsx`, `icons.tsx` (Discord oficial e linhas de velocidade), `theme.ts`.
- `src/routes/downloads-page.tsx`: rota `/downloads` (versão atual, notas, versões anteriores só com versão e botão).
- `src/lib/page-metadata.ts`: hook de metadados (movido de legal-pages).
- Imagens otimizadas em `src/assets` (WebP): hero, arte da logo, telas do app e do XtoyTouch.

## Arquivos alterados
`vercel-entry.tsx` (nova rota, novo CSS), `index-refined.tsx`, `legal-pages.tsx`, `xtoytouch.tsx`, `reportar-bugs.tsx`, `index.html` (fonte Archivo, tema antes da pintura, theme-color), `public/sitemap.xml` (+ /downloads), `__root.tsx` e `index.tsx` (remoção das menções ao XStreaming), `home-ui-enhancements.css` (regra do Instagram).

## Arquivos removidos (sem uso depois da troca)
`SocialContactEnhancer.tsx`, `TrustEnhancer.tsx`, `social-contact.css`, `trust-legal.css`, `pixel-home.css`, `download-counter.css`, `download-ad-gate.css`, `xtoytouch.css`.
As imagens PNG antigas em `src/assets/screens` continuam no repositório; podem ser apagadas depois (pesam vários MB e já não são usadas pela Vercel).

## Instagram e XStreaming
- Instagram: removido do código e dos estilos. O Discord usa o SVG oficial.
- XStreaming/Geocld/MIT: removidos da interface (créditos em `index.tsx`, meta description em `__root.tsx`). O `README.md` ainda cita o XStreaming por ser documentação técnica. A licença MIT costuma exigir manter o aviso de copyright junto ao software (app e repositório); confirme isso com quem entende de licenças.

## Como testar antes de publicar
1. `npm install` e `npm run dev` (ou o comando de dev do projeto).
2. Abra `/`, `/downloads`, `/xtoytouch`, `/seguranca-download`, `/privacidade`, `/termos`, `/reportar-bugs` no iPhone e no desktop, nos dois temas.
3. Faça um deploy de PREVIEW na Vercel (branch separado), nunca direto na produção.
4. Cuidado com o nome do commit: o `ignore-vercel-build.js` pula o build se a mensagem começar com "Increment download count" ou "Update compact download badge".

## O que foi e o que não foi testado
- Testado: os componentes reais empacotados e executados em navegador (celular 390 px e desktop 1280 px, tema claro e escuro) com as APIs simuladas: 7 rotas, menu, tema, download, contador, transição de página, gate de anúncio, sumário, copiar SHA-256, formulário e movimento reduzido.
- Não testado: `npm run build` real da Vercel (sem internet no meu ambiente), chamadas reais às APIs, anúncio real do Google e iPhone físico.
