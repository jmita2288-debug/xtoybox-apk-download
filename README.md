<p align="center">
  <img src="src/assets/logo-xtoybox.png" alt="XTOYBOX" width="96" height="96" />
</p>

<h1 align="center">XTOYBOX Site</h1>

<p align="center">
  Site oficial de download, apresentação e suporte do XTOYBOX.
</p>

<p align="center">
  <a href="https://xtoybox.cloud"><strong>Acessar site</strong></a>
  ·
  <a href="https://discord.gg/abh27Dwktt"><strong>Comunidade</strong></a>
  ·
  <a href="https://github.com/jmita2288-debug/xtoybox-apk-download/releases"><strong>Releases</strong></a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=fff" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=fff" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=fff" />
  <img alt="Vercel" src="https://img.shields.io/badge/Deploy-Vercel-000?style=for-the-badge&logo=vercel&logoColor=fff" />
</p>

---

## Sobre o projeto

O **XTOYBOX Site** é a página oficial do XTOYBOX, criada para apresentar o app, distribuir o APK mais recente e centralizar informações importantes para os usuários.

O objetivo do site é simples: deixar claro o que é o XTOYBOX, mostrar as telas do app, oferecer um botão confiável de download e manter os dados da versão atual organizados em um só lugar.

O XTOYBOX é um app Android voltado para jogar na nuvem e usar Remote Play, com foco em celulares, TV Box e navegação por controle. Este repositório contém apenas o site de apresentação e download do APK.

> Projeto independente. O XTOYBOX não possui vínculo, parceria ou afiliação com Xbox, Microsoft ou marcas relacionadas.

---

## O que o site entrega

| Área | Descrição |
| --- | --- |
| **Home** | Apresentação direta do XTOYBOX, com chamada principal para download. |
| **Galeria** | Carrossel com telas do app para mostrar a experiência visual ao usuário. |
| **Recursos** | Resumo dos principais pontos do app, como nuvem, TV Box e atualizações diretas. |
| **Comunidade** | Entrada para o Discord oficial, suporte, avisos e feedbacks. |
| **Download** | Card com versão, tamanho, data de atualização e total de downloads. |
| **FAQ** | Respostas rápidas sobre instalação e compatibilidade. |

---

## Recursos principais

- **Download direto do APK** usando uma rota dedicada em `/api/download`.
- **Metadados dinâmicos** com versão, tamanho, data e notas de atualização.
- **Contador de downloads** integrado ao arquivo de estatísticas do projeto.
- **Página responsiva**, pensada para mobile e desktop.
- **Visual escuro moderno**, com identidade verde do XTOYBOX.
- **Seção de comunidade** com link para o Discord oficial.
- **FAQ simples**, sem excesso de informação ou poluição visual.

---

## Stack utilizada

Este site foi construído com uma base moderna em React:

- **React 19**
- **TypeScript**
- **Vite**
- **TanStack Router**
- **Tailwind CSS**
- **Embla Carousel**
- **Lucide React**
- **Vercel** para deploy

---

## Estrutura do projeto

```txt
.
├── api/
│   ├── apk-metadata.js       # API de metadados do APK
│   └── download.js           # Rota de download e contador
│
├── public/
│   ├── latest.json           # Informações da versão mais recente
│   └── download-stats.json   # Estatísticas de download
│
├── src/
│   ├── assets/               # Logo e imagens usadas no site
│   ├── components/           # Componentes de interface
│   ├── lib/                  # Funções auxiliares
│   ├── routes/               # Páginas e rotas do site
│   └── styles.css            # Tema visual e estilos globais
│
├── vercel.json               # Configuração de deploy e redirects
├── package.json              # Scripts e dependências
└── README.md
```

---

## Metadados do APK

A versão mais recente do app é controlada por:

```txt
public/latest.json
```

Esse arquivo informa:

- nome do app;
- versão mais recente;
- código da versão;
- URL do APK;
- canal de release;
- notas da atualização;
- data de publicação.

A API `/api/apk-metadata` usa esses dados para montar o card de download exibido no site.

---

## Download e contador

O botão **Baixar APK** aponta para:

```txt
/api/download
```

Essa rota busca o APK atual, tenta registrar o download e depois redireciona o usuário para o arquivo correto.

Para o contador funcionar em produção, o ambiente da Vercel precisa ter uma variável com permissão para atualizar o arquivo de estatísticas no GitHub:

```txt
GITHUB_STATS_TOKEN
```

Também há suporte para estes nomes alternativos:

```txt
SITE_REPO_TOKEN
GH_TOKEN
```

Sem token, o download continua funcionando, mas o contador não consegue gravar novos acessos.

---

## Rodando localmente

Instale as dependências:

```bash
npm install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

Gerar build de produção:

```bash
npm run build
```

Rodar preview local:

```bash
npm run preview
```

---

## Deploy

O deploy é feito pela Vercel.

A configuração principal fica em:

```txt
vercel.json
```

O build usado em produção é:

```bash
npx vite build --config vite.config.vercel.ts
```

O diretório final de saída é:

```txt
dist
```

---

## Padrão visual

O site segue uma identidade escura, limpa e direta:

- fundo em cinza escuro/black equilibrado;
- verde como cor principal de ação;
- cards com bordas suaves;
- tipografia simples e legível;
- poucos efeitos visuais;
- foco em clareza e download seguro.

Mudanças visuais devem ser feitas com cuidado. O objetivo é melhorar o acabamento sem transformar a página em outro layout.

---

## Observação para manutenção

Ao alterar o site, evite mudanças amplas sem necessidade.

Antes de editar, preserve estas áreas:

- botão de download;
- API de metadados;
- contador de downloads;
- `latest.json`;
- redirects do APK;
- identidade visual escura com verde;
- responsividade mobile.

A prioridade do projeto é manter uma página estável, clara e confiável para o usuário baixar o XTOYBOX.

---

<p align="center">
  Desenvolvido para o ecossistema XTOYBOX.
</p>
