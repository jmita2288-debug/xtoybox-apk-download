<p align="center">
  <img src="./docs/readme-banner.svg" alt="XTOYBOX — site oficial do projeto para Android" width="100%" />
</p>

<p align="center">
  <a href="https://xtoybox.cloud"><strong>Site oficial</strong></a>
  ·
  <a href="https://xtoybox.cloud/api/download"><strong>Baixar APK</strong></a>
  ·
  <a href="https://github.com/jmita2288-debug/xtoybox-apk-download/releases"><strong>Releases</strong></a>
  ·
  <a href="https://discord.gg/abh27Dwktt"><strong>Comunidade</strong></a>
</p>

<p align="center">
  <img alt="Total de downloads do XTOYBOX" src="https://img.shields.io/endpoint?style=flat-square&url=https%3A%2F%2Fxtoybox.cloud%2Fapi%2Fdownload-badge" />
</p>

## Sobre este repositório

Este repositório contém o **site oficial do XTOYBOX**. Ele reúne a apresentação do projeto, a versão atual do APK, o fluxo de download, informações de suporte e os dados usados pelo contador de downloads.

O site também funciona como ponto central para:

- apresentar o aplicativo e suas principais formas de uso;
- disponibilizar o APK mais recente;
- exibir versão, tamanho e data de atualização;
- manter o contador acumulado de downloads;
- direcionar usuários para suporte, comunidade e reporte de problemas.

## O que é o XTOYBOX

O XTOYBOX é um projeto independente para Android voltado ao uso remoto do ecossistema Xbox. O aplicativo oferece recursos de **Remote Play do próprio console** e acesso a experiências compatíveis disponibilizadas por serviços oficiais de jogos na nuvem.

O XTOYBOX **não opera servidores próprios de cloud gaming** e não substitui serviços, contas ou assinaturas oficiais. Dependendo do recurso utilizado, uma conta Xbox, um console compatível ou uma assinatura válida podem ser necessários.

O aplicativo foi desenvolvido a partir da base open source do **XStreaming** e recebeu modificações próprias, incluindo:

- reorganização da biblioteca e de outras telas;
- ajustes de navegação para celular, TV Box e controle;
- melhorias visuais e de legibilidade;
- correções de bugs e ajustes de estabilidade;
- otimizações de carregamento, imagens e resposta da interface;
- mudanças em perfil, conquistas, detalhes de jogos e modo TV.

O projeto continua em evolução, com mudanças feitas a partir de testes, problemas encontrados no uso real e feedback da comunidade.

## Principais formas de uso

| Recurso | Descrição |
| --- | --- |
| **Remote Play** | Conexão com o próprio console Xbox para jogar em outro dispositivo compatível. |
| **Jogos compatíveis na nuvem** | Acesso a experiências oferecidas por serviços oficiais, conforme a disponibilidade da conta. |
| **Celular e TV Box** | Interface adaptada para toque, controle físico e telas maiores. |
| **Biblioteca e perfil** | Navegação por jogos, histórico, favoritos, progresso e conquistas. |

## Como o download funciona

<p align="center">
  <img src="./docs/download-flow.svg" alt="Fluxo de download do site XTOYBOX" width="100%" />
</p>

Todos os botões de download Android do site utilizam a rota:

```text
/api/download
```

Essa rota lê a publicação Android feita pelo **XTOYBOX Dashboard** e redireciona o usuário para o APK oficial na Release `xtoybox-latest` do GitHub. O contador público não depende de um commit novo a cada clique: o GitHub mantém o `download_count` de cada APK e a API do site soma esses valores à base acumulada das versões anteriores.

### Publicação pelo XTOYBOX Dashboard

Android e iOS são publicados pelo mesmo Dashboard, mas cada plataforma tem o seu próprio arquivo de metadados e o seu próprio tipo de arquivo na Release:

| Plataforma | Metadados | Arquivo na Release `xtoybox-latest` | Usado por |
| --- | --- | --- | --- |
| **Android** | `public/latest.json` | `XTOYBOX-v<versão>.apk` | `/api/download`, `/api/apk-metadata`, verificação de atualização do app Android |
| **iOS** | `public/latest-ios.json` | `XTOYBOX-v<versão>.ipa` | botão iOS (`StoreButtons.tsx`), app XTOYBOX-IOS |

Regras aplicadas pelo site para não misturar as plataformas:

- o botão Android só aceita dados com `platform: "android"` (ou sem `platform`, formato das versões anteriores) e links terminados em `.apk`;
- versões precisam ser numéricas (`1.1.17`); versões com sufixo, como `1.1.17-test`, são recusadas;
- se `apkUrl` estiver ausente, o site monta o link do asset `XTOYBOX-v<versão>.apk` na Release `xtoybox-latest`;
- arquivos `.ipa` nunca entram no tamanho do APK nem no contador de downloads Android.

O build do APK é feito no repositório do aplicativo (GitHub Actions, artefato `XTOYBOX-v<versão>.apk`) e a publicação é feita somente pelo Dashboard. Este repositório não gera nem envia APKs.

Os principais arquivos e endpoints envolvidos são:

| Arquivo / endpoint | Função |
| --- | --- |
| `public/latest.json` | Versão Android atual publicada pelo Dashboard: URL do APK, notas e data. |
| `public/latest-ios.json` | Versão iOS atual publicada pelo Dashboard (não é lido pelo fluxo Android). |
| `api/_android-release.js` | Regras compartilhadas do Android: leitura do `latest.json`, validação e contador. |
| `api/download.js` | Redireciona para o APK oficial da versão Android atual. |
| `api/apk-metadata.js` | Consulta a Release e calcula o total acumulado usado pelo site. |
| `api/download-badge.js` | Gera dinamicamente o contador exibido neste README. |
| `public/download-stats.json` | Snapshot histórico mantido por compatibilidade; não é a fonte principal do contador atual. |
| `public/download-badge.json` | Snapshot antigo do badge; o README não depende mais desse arquivo. |

### Contador acumulado

A fonte principal do número exibido no site é:

```text
https://xtoybox.cloud/api/apk-metadata
```

O badge deste README consulta:

```text
https://xtoybox.cloud/api/download-badge
```

Assim, o site e o README usam o mesmo total calculado em produção.

O `GITHUB_STATS_TOKEN` pode ser utilizado pelo backend para consultar a API do GitHub com autenticação. Como o repositório e a Release pública são acessíveis sem autenticação, a API possui fallback para leitura pública caso o token esteja ausente, expirado ou seja rejeitado.

Nomes alternativos ainda aceitos pelo backend:

```text
SITE_REPO_TOKEN
GH_TOKEN
```

Esses tokens não são usados para criar um commit a cada download.

## Tecnologias

O site utiliza uma base moderna em React e TypeScript, com os seguintes componentes principais:

| Camada | Tecnologias |
| --- | --- |
| **Interface** | React, TypeScript, Tailwind CSS e Lucide React |
| **Build** | Vite |
| **Navegação** | TanStack Router |
| **Componentes** | Radix UI e componentes próprios |
| **Carrosséis** | Embla Carousel |
| **Validação e formulários** | Zod e React Hook Form |
| **Hospedagem** | Vercel |

## Executando localmente

Com Node.js e npm instalados, clone o repositório e execute:

```bash
npm install
npm run dev
```

Outros comandos disponíveis:

```bash
npm run build      # gera o build de produção
npm run preview    # abre uma prévia do build
npm run lint       # executa as verificações do projeto
npm run format     # formata os arquivos com Prettier
```

## Estrutura do projeto

```text
.
├── api/
│   ├── _android-release.js
│   ├── apk-metadata.js
│   ├── download-badge.js
│   ├── download.js
│   ├── game-likes.js
│   └── xtoytouch.js
├── docs/
│   ├── download-flow.svg
│   └── readme-banner.svg
├── public/
│   ├── download-badge.json
│   ├── download-stats.json
│   ├── latest-ios.json
│   └── latest.json
├── src/
│   ├── assets/
│   ├── components/
│   ├── lib/
│   ├── routes/
│   ├── download-counter.css
│   ├── refined-site.css
│   └── styles.css
├── vercel.json
├── vite.config.vercel.ts
├── package.json
└── README.md
```

## Versão e metadados do APK

A versão Android apresentada no site é controlada por:

```text
public/latest.json
```

Esse arquivo é gravado pelo XTOYBOX Dashboard ao publicar um APK e informa:

- nome do aplicativo e plataforma (`android`);
- versão e código da versão;
- URL do APK na Release `xtoybox-latest`;
- notas de atualização;
- data de publicação.

O link curto `/downloads/XTOYBOX-v<versão>.apk` continua funcionando para qualquer versão e aponta para o asset de mesmo nome na Release `xtoybox-latest`.

## Deploy

A publicação do site é feita pela **Vercel**. As principais opções de produção ficam em `vercel.json`.

Comando de build utilizado:

```bash
npx vite build --config vite.config.vercel.ts
```

Diretório de saída:

```text
dist
```

## Origem e créditos

O aplicativo XTOYBOX utiliza como base o projeto open source **XStreaming**, creditado a Geocld e distribuído sob a licença MIT no projeto original.

A primeira versão visual deste site contou com apoio do **Lovable/MVP** para acelerar a estrutura inicial. Depois disso, o projeto recebeu alterações manuais de interface, conteúdo, APIs, responsividade, download e identidade visual.

O XTOYBOX é mantido como um projeto independente, criado com foco em aprendizado, personalização e melhoria contínua.

## Comunidade e suporte

Problemas, dúvidas e sugestões podem ser enviados pelos canais do projeto:

- [Comunidade no Discord](https://discord.gg/abh27Dwktt)
- [Releases do APK](https://github.com/jmita2288-debug/xtoybox-apk-download/releases)

Relatos com modelo do aparelho, versão do Android, versão do XTOYBOX e etapas para reproduzir o problema ajudam bastante na investigação.

## Aviso

O XTOYBOX é um projeto independente e não possui vínculo, parceria, aprovação ou afiliação com Microsoft, Xbox, Xbox Cloud Gaming ou Game Pass.

Todos os nomes, marcas e serviços citados pertencem aos seus respectivos proprietários.

---

<p align="center">
  <strong>XTOYBOX</strong><br />
  Projeto independente para Android, baseado em software open source.
</p>
