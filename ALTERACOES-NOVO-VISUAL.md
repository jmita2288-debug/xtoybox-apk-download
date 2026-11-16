# Atualização: nova identidade em todas as rotas

## O que mudou
- Home, Downloads, XtoyTouch, Segurança do download, Privacidade e Termos usam o mesmo visual (tema escuro/claro neutro, fonte Archivo, cabeçalho plano, botões claros sem blocos verdes).
- Ícones Lucide em todas as páginas (marcas Discord, Android e Apple continuam como logos próprios).
- Animações curtas: entrada do cabeçalho da página, aparição ao rolar, troca de ícone do menu. Respeitam "reduzir movimento".
- Contorno de foco discreto (sem quadro verde) e só para navegação por teclado.
- Layout revisado para celular e desktop (sumário lateral nos documentos legais, grade de 2 colunas em Segurança, hero em 2 colunas no XtoyTouch).

## Rota de reportar bugs removida
- Apagados `src/routes/reportar-bugs.tsx` e `api/report-bug.js`; removidos do menu, rodapé, home, `routeTree.gen.ts`, sitemap e README.
- `vercel.json`: `/reportar-bugs` redireciona para `/`.
- Privacidade (seção 8) agora fala de relatório por e-mail ou Discord, já que o formulário não existe mais.

## E-mail de contato
`Alexadre069@proton.me` (constante `SUPPORT_EMAIL` em `SiteChrome.tsx`). Não sobrou nenhuma ocorrência do endereço antigo.

## Arquivos principais
Novos: `xt-home.css`, `xt-pages.css`, `AndroidShowcase.tsx`, `StoreButtons.tsx`, imagens `hero-phone*.webp` e `logo-x.webp`.
Alterados: `xt-ui.css`, `vercel-entry.tsx`, `SiteChrome.tsx`, `DownloadButton.tsx`, `DownloadCounter.tsx` (só visual), `index-refined.tsx`, `downloads-page.tsx`, `legal-pages.tsx`, `xtoytouch.tsx`, `index.html`.
Não alterados: `apkMetadata.ts`, APIs de download, contador (lógica), gate de anúncio.

## Antes de publicar
Faça deploy de preview na Vercel e confira as rotas no celular e no desktop. O build real (`npm run build`) não pôde ser rodado aqui (sem internet); as páginas foram compiladas e testadas em navegador com as APIs simuladas.
