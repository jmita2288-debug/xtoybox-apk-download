import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileCheck2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import logo from "@/assets/logo-xtoybox.png";

const SUPPORT_EMAIL = "xtoybox@proton.me";
const RELEASE_PAGE = "https://github.com/jmita2288-debug/xtoybox-apk-download/releases/tag/xtoybox-latest";
const FALLBACK_SHA256 = "1e75f0dcab47773c3a146717ebdade7e49b6859a769aabb9bdafed15c04edf5e";

type SecurityMetadata = {
  versionName?: string;
  apkUrl?: string;
  apkSizeFormatted?: string | null;
  apkSha256?: string | null;
  publishedAt?: string | null;
};

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function usePageMetadata(title: string, description: string, path: string) {
  useEffect(() => {
    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", `https://xtoybox.cloud${path}`);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `https://xtoybox.cloud${path}`;
  }, [description, path, title]);
}

function LegalHeader() {
  return (
    <header className="legal-header">
      <div className="legal-container legal-header__inner">
        <a className="legal-brand" href="/" aria-label="Página inicial do XTOYBOX">
          <img src={logo} alt="" />
          <span>
            <strong>XTOYBOX</strong>
            <small>Informações oficiais</small>
          </span>
        </a>
        <nav className="legal-header__nav" aria-label="Informações do projeto">
          <a href="/seguranca-download">Segurança</a>
          <a href="/privacidade">Privacidade</a>
          <a href="/termos">Termos</a>
        </nav>
        <a className="legal-back" href="/">
          <ArrowLeft /> Voltar ao site
        </a>
      </div>
    </header>
  );
}

function LegalFooter() {
  return (
    <footer className="legal-footer">
      <div className="legal-container legal-footer__inner">
        <div>
          <strong>XTOYBOX</strong>
          <p>Projeto independente, sem vínculo ou afiliação com Microsoft ou Xbox.</p>
        </div>
        <div className="legal-footer__links">
          <a href="/privacidade">Privacidade</a>
          <a href="/termos">Termos</a>
          <a href="/seguranca-download">Segurança do download</a>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </div>
      </div>
    </footer>
  );
}

function LegalShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="legal-page">
      <LegalHeader />
      <main className="legal-container legal-main">
        <section className="legal-hero">
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
        </section>
        <div className="legal-content">{children}</div>
      </main>
      <LegalFooter />
    </div>
  );
}

export function PrivacyPage() {
  usePageMetadata(
    "Política de Privacidade — XTOYBOX",
    "Saiba como o site oficial do XTOYBOX trata dados de navegação, relatórios de bugs, cookies e publicidade.",
    "/privacidade",
  );

  return (
    <LegalShell
      eyebrow="PRIVACIDADE"
      title="Política de Privacidade"
      intro="Uma explicação direta sobre os dados usados pelo site, sem esconder informações importantes em textos difíceis."
    >
      <section className="legal-card legal-card--highlight">
        <ShieldCheck />
        <div>
          <h2>Resumo rápido</h2>
          <p>
            Você não precisa criar uma conta nem informar e-mail para navegar ou baixar o XTOYBOX pelo site.
            Dados só são enviados diretamente ao projeto quando você decide entrar em contato ou preencher um relatório de bug.
          </p>
        </div>
      </section>

      <section className="legal-card">
        <h2>1. Dados técnicos de navegação</h2>
        <p>
          Como acontece em praticamente qualquer site, a infraestrutura de hospedagem e segurança pode processar informações
          técnicas necessárias para entregar as páginas, como endereço IP, tipo de navegador, dispositivo, horário da requisição
          e registros de acesso. O site é hospedado pela Vercel e utiliza o Vercel Speed Insights para métricas de desempenho.
        </p>
      </section>

      <section className="legal-card">
        <h2>2. Relatórios de bugs e suporte</h2>
        <p>
          Se você usar a página de suporte, o formulário pode solicitar nome ou apelido, versão do aplicativo, modelo e tipo do
          aparelho, descrição do problema e, opcionalmente, uma imagem ou vídeo. Essas informações são usadas para investigar o
          problema relatado.
        </p>
        <p>
          O envio do formulário utiliza o serviço Resend para encaminhar a mensagem ao e-mail oficial do projeto. Os relatórios
          podem permanecer no histórico de suporte pelo tempo necessário para acompanhamento, correção e prevenção de problemas
          semelhantes. Você pode solicitar exclusão pelo e-mail abaixo.
        </p>
      </section>

      <section className="legal-card">
        <h2>3. Cookies e publicidade</h2>
        <p>
          O site utiliza produtos de publicidade do Google. O Google e outros fornecedores autorizados podem usar cookies,
          identificadores, beacons da Web e endereço IP para veicular, medir e proteger anúncios. Dependendo da sua região,
          configurações e consentimento, a publicidade pode ser personalizada ou não personalizada.
        </p>
        <div className="legal-inline-links">
          <a href="https://policies.google.com/technologies/partner-sites?hl=pt-BR" target="_blank" rel="noreferrer">
            Como o Google usa dados <ExternalLink />
          </a>
          <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer">
            Configurações de anúncios <ExternalLink />
          </a>
        </div>
      </section>

      <section className="legal-card">
        <h2>4. Links e serviços externos</h2>
        <p>
          O site contém links para GitHub, Discord, Instagram e outros serviços de terceiros. Ao abrir esses serviços, as políticas
          de privacidade e os termos deles passam a se aplicar. O XTOYBOX não controla a coleta de dados realizada por plataformas
          externas.
        </p>
      </section>

      <section className="legal-card">
        <h2>5. Uso e compartilhamento</h2>
        <p>
          O projeto não vende os dados pessoais enviados ao suporte. Informações podem ser processadas por provedores técnicos
          usados para operar o site, entregar e-mails, hospedar arquivos, medir desempenho ou exibir publicidade, sempre conforme
          a finalidade do serviço utilizado.
        </p>
      </section>

      <section className="legal-card">
        <h2>6. Seus pedidos e contato</h2>
        <p>
          Para dúvidas sobre privacidade, correção ou exclusão de informações enviadas ao suporte, entre em contato pelo e-mail
          oficial do projeto.
        </p>
        <a className="legal-contact" href={`mailto:${SUPPORT_EMAIL}`}>
          <Mail /> {SUPPORT_EMAIL}
        </a>
        <small>Última atualização: 17 de agosto de 2026.</small>
      </section>
    </LegalShell>
  );
}

export function TermsPage() {
  usePageMetadata(
    "Termos de Uso — XTOYBOX",
    "Termos de uso do site e do APK XTOYBOX, incluindo instalação, serviços de terceiros, disponibilidade e independência do projeto.",
    "/termos",
  );

  return (
    <LegalShell
      eyebrow="TERMOS"
      title="Termos de Uso"
      intro="As condições principais para usar o site e baixar o aplicativo, apresentadas de forma simples."
    >
      <section className="legal-card">
        <h2>1. Sobre o projeto</h2>
        <p>
          O XTOYBOX é um projeto independente para Android, desenvolvido a partir de uma base open source e adaptado para Remote
          Play e acesso a experiências compatíveis com Xbox Cloud Gaming. O projeto não é afiliado, patrocinado ou endossado pela
          Microsoft ou Xbox.
        </p>
      </section>

      <section className="legal-card">
        <h2>2. Serviços de terceiros</h2>
        <p>
          Remote Play, autenticação, catálogo, Xbox Cloud Gaming e outros recursos dependem de serviços, contas, regiões,
          assinaturas e requisitos definidos por terceiros. O XTOYBOX não controla a disponibilidade permanente desses serviços.
        </p>
      </section>

      <section className="legal-card">
        <h2>3. Instalação do APK</h2>
        <p>
          O aplicativo é distribuído como APK externo para Android. Baixe somente pelo site oficial ou pela Release oficial do
          projeto no GitHub. O Android pode solicitar autorização para instalar aplicativos de fontes externas; revise as
          permissões exibidas pelo sistema antes de continuar.
        </p>
        <a className="legal-text-link" href="/seguranca-download">
          <FileCheck2 /> Ver como confirmar o arquivo oficial
        </a>
      </section>

      <section className="legal-card">
        <h2>4. Atualizações e disponibilidade</h2>
        <p>
          O projeto pode receber correções, melhorias, mudanças de compatibilidade ou alterações de interface. Não há garantia de
          funcionamento permanente em todos os aparelhos, redes ou versões de serviços externos.
        </p>
      </section>

      <section className="legal-card">
        <h2>5. Código e créditos</h2>
        <p>
          A base open source utilizada pelo projeto mantém os créditos e licenças aplicáveis. XTOYBOX inclui modificações,
          interface e otimizações próprias, preservando os avisos de licença correspondentes ao código de origem.
        </p>
      </section>

      <section className="legal-card">
        <h2>6. Contato</h2>
        <p>Se precisar esclarecer estes termos ou relatar um problema, use o canal oficial:</p>
        <a className="legal-contact" href={`mailto:${SUPPORT_EMAIL}`}>
          <Mail /> {SUPPORT_EMAIL}
        </a>
        <small>Última atualização: 17 de agosto de 2026.</small>
      </section>
    </LegalShell>
  );
}

export function DownloadSecurityPage() {
  const [metadata, setMetadata] = useState<SecurityMetadata | null>(null);
  const [copied, setCopied] = useState(false);

  usePageMetadata(
    "Segurança do Download — XTOYBOX",
    "Confira a origem oficial, versão e SHA-256 do APK XTOYBOX antes de instalar.",
    "/seguranca-download",
  );

  useEffect(() => {
    let active = true;
    fetch(`/api/apk-metadata?t=${Date.now()}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && data) setMetadata(data as SecurityMetadata);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const version = metadata?.versionName || "1.1.15";
  const sha256 = metadata?.apkSha256 || FALLBACK_SHA256;
  const fileName = `XTOYBOX-v${version}.apk`;

  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(sha256);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <LegalShell
      eyebrow="DOWNLOAD OFICIAL"
      title="Segurança do download"
      intro="Informações para você confirmar a origem e a integridade do APK antes de instalar."
    >
      <section className="legal-card legal-card--highlight legal-security-intro">
        <ShieldCheck />
        <div>
          <h2>Arquivo publicado na Release oficial</h2>
          <p>
            O botão de download do site redireciona para o asset público da Release do projeto no GitHub. O site não reconstrói
            nem altera o APK durante esse redirecionamento.
          </p>
        </div>
      </section>

      <section className="legal-card">
        <div className="security-status">
          <span className="security-status__icon"><CheckCircle2 /></span>
          <div>
            <small>VERSÃO PÚBLICA ATUAL</small>
            <h2>{fileName}</h2>
          </div>
        </div>

        <div className="security-grid">
          <div>
            <small>Versão</small>
            <strong>{version}</strong>
          </div>
          <div>
            <small>Tamanho</small>
            <strong>{metadata?.apkSizeFormatted || "107,2 MB"}</strong>
          </div>
          <div>
            <small>Origem</small>
            <strong>GitHub Release</strong>
          </div>
        </div>

        <div className="hash-box">
          <div>
            <small>SHA-256</small>
            <code>{sha256}</code>
          </div>
          <button type="button" onClick={copyHash}>
            <Copy /> {copied ? "Copiado" : "Copiar"}
          </button>
        </div>

        <p className="hash-help">
          O SHA-256 funciona como uma impressão digital do arquivo. Se o valor calculado no APK que você recebeu for diferente do
          valor acima, não instale esse arquivo e faça o download novamente pela fonte oficial.
        </p>

        <div className="legal-actions">
          <a className="legal-primary-button" href="/api/download">
            <Download /> Baixar APK oficial
          </a>
          <a className="legal-secondary-button" href={RELEASE_PAGE} target="_blank" rel="noreferrer">
            Ver Release no GitHub <ExternalLink />
          </a>
        </div>
      </section>

      <section className="legal-card">
        <h2>Como verificar</h2>
        <p>
          Usuários que desejarem uma conferência técnica podem calcular o SHA-256 do APK com um gerenciador de arquivos ou uma
          ferramenta de checksum compatível com o aparelho e comparar o resultado, caractere por caractere, com o valor publicado
          acima.
        </p>
      </section>

      <section className="legal-card">
        <h2>Encontrou algo diferente?</h2>
        <p>Não instale o arquivo e entre em contato com o projeto para que possamos verificar.</p>
        <a className="legal-contact" href={`mailto:${SUPPORT_EMAIL}`}>
          <Mail /> {SUPPORT_EMAIL}
        </a>
      </section>
    </LegalShell>
  );
}
