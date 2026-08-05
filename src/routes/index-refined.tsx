import { useEffect, useState } from "react";
import logo from "@/assets/logo-xtoybox.png";
import screenBiblioteca from "@/assets/screens/biblioteca.png";
import screenPerfil from "@/assets/screens/perfil.png";
import screenConquistas from "@/assets/screens/conquistas.png";
import { fetchApkMetadata, fallbackLatestMetadata, type ApkMetadata } from "@/lib/apkMetadata";
import {
  ArrowRight,
  Bug,
  Check,
  ChevronDown,
  Cloud,
  Download,
  Gamepad2,
  Menu,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
  Tv,
  X,
} from "lucide-react";

const XTOYBOX_COMMUNITY_URL = "https://discord.gg/abh27Dwktt";

type InfoSection = "about" | "credits" | "terms";

function createFallbackApkMetadata(): ApkMetadata {
  return {
    appName: fallbackLatestMetadata.appName ?? "XTOYBOX",
    versionName: fallbackLatestMetadata.latestVersionName,
    versionCode: fallbackLatestMetadata.latestVersionCode,
    apkUrl: fallbackLatestMetadata.apkUrl,
    pageUrl: fallbackLatestMetadata.pageUrl,
    releaseNotes: fallbackLatestMetadata.releaseNotes ?? [],
    publishedAt: fallbackLatestMetadata.publishedAt ?? null,
    lastUpdated: fallbackLatestMetadata.publishedAt ?? null,
    downloadsTotal: null,
    apkSizeBytes: null,
    apkSizeFormatted: null,
    source: "fallback",
    latest: fallbackLatestMetadata,
  };
}

const interfaceScreens = [
  {
    src: screenBiblioteca,
    label: "Biblioteca",
    title: "Jogos organizados em um só lugar",
    description: "Encontre títulos compatíveis e acesse suas opções de jogo com menos etapas.",
    alt: "Tela da biblioteca do XTOYBOX",
  },
  {
    src: screenPerfil,
    label: "Perfil",
    title: "Conta e atividade com leitura simples",
    description: "Informações importantes aparecem com hierarquia clara e sem excesso de elementos.",
    alt: "Tela de perfil do XTOYBOX",
  },
  {
    src: screenConquistas,
    label: "Conquistas",
    title: "Progresso fácil de acompanhar",
    description: "Consulte conquistas e dados do jogo em uma interface consistente com o restante do app.",
    alt: "Tela de conquistas do XTOYBOX",
  },
] as const;

const featureItems = [
  {
    icon: Gamepad2,
    title: "Remote Play do console",
    description: "Conecte-se ao seu próprio Xbox para jogar em outro dispositivo compatível.",
  },
  {
    icon: Cloud,
    title: "Jogos compatíveis na nuvem",
    description: "Acesse experiências disponibilizadas pelo Xbox Cloud Gaming, quando elegíveis para sua conta.",
  },
  {
    icon: Smartphone,
    title: "Toque ou controle físico",
    description: "Use controles na tela ou um gamepad compatível, conforme sua preferência e dispositivo.",
  },
  {
    icon: MonitorSmartphone,
    title: "Celular e TV Box",
    description: "Uma interface adaptada para telas menores e para navegação em ambientes de TV.",
  },
] as const;

const faqItems = [
  {
    question: "O XTOYBOX é um serviço próprio de cloud gaming?",
    answer:
      "Não. O XTOYBOX não possui servidores próprios de jogos na nuvem. Ele oferece uma interface para Remote Play do seu console e acesso a experiências compatíveis disponibilizadas pelo Xbox Cloud Gaming.",
  },
  {
    question: "Preciso ter um console Xbox?",
    answer:
      "Para usar o Remote Play, sim. Para jogos disponíveis pelo Xbox Cloud Gaming, a necessidade de console depende do serviço oficial, da sua região, da sua conta e do plano compatível.",
  },
  {
    question: "Em quais dispositivos o aplicativo funciona?",
    answer:
      "O XTOYBOX é distribuído para Android e foi pensado para uso em celulares e TV Box compatíveis.",
  },
  {
    question: "Como instalar o APK?",
    answer:
      "Baixe o arquivo pelo botão oficial do site, abra o APK no Android e siga as instruções do sistema. Talvez seja necessário permitir a instalação por fontes externas.",
  },
] as const;

function Brand() {
  return (
    <a className="refined-brand" href="/" aria-label="Página inicial do XTOYBOX">
      <span className="refined-brand__mark">
        <img src={logo} alt="" />
      </span>
      <span className="refined-brand__text">
        <strong>XTOYBOX</strong>
        <small>Remote Play para Android</small>
      </span>
    </a>
  );
}

function InfoModal({ section, onClose }: { section: InfoSection; onClose: () => void }) {
  const content = {
    about: {
      title: "Sobre o XTOYBOX",
      paragraphs: [
        "O XTOYBOX é um aplicativo independente para Android, baseado em um projeto open source e adaptado para uso em celulares e TV Box.",
        "A proposta é facilitar o Remote Play do seu console Xbox e o acesso a experiências compatíveis com o Xbox Cloud Gaming em uma interface organizada.",
        "O projeto não opera servidores próprios de cloud gaming e não possui vínculo oficial com Microsoft ou Xbox.",
      ],
    },
    credits: {
      title: "Créditos",
      paragraphs: [
        "Base open source: XStreaming.",
        "Copyright (c) 2024 Geocld. Licenciado sob a licença MIT.",
        "Modificações, interface e otimizações do XTOYBOX por Alexandreios.",
      ],
    },
    terms: {
      title: "Termos de uso",
      paragraphs: [
        "O aplicativo é distribuído como APK externo. Baixe somente pelo site oficial do projeto e mantenha o arquivo atualizado.",
        "O funcionamento de Remote Play e Xbox Cloud Gaming depende dos serviços, da conta, da rede, da região e dos requisitos definidos pela Microsoft.",
        "O XTOYBOX é um projeto independente e não garante disponibilidade permanente de serviços de terceiros.",
      ],
    },
  }[section];

  return (
    <div className="refined-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="refined-modal__panel" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="refined-modal__close" onClick={onClose} aria-label="Fechar">
          <X />
        </button>
        <span className="refined-eyebrow">Informações</span>
        <h2>{content.title}</h2>
        <div className="refined-modal__copy">
          {content.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RefinedIndex() {
  const [apkMetadata, setApkMetadata] = useState<ApkMetadata>(() => createFallbackApkMetadata());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState<InfoSection | null>(null);

  useEffect(() => {
    let active = true;

    fetchApkMetadata()
      .then((metadata) => {
        if (active) setApkMetadata(metadata);
      })
      .catch(() => {
        // O fallback mantém o botão de download disponível.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!infoOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setInfoOpen(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [infoOpen]);

  return (
    <div className="refined-site">
      <header className="refined-header">
        <div className="refined-container refined-header__inner">
          <Brand />

          <nav className="refined-nav" aria-label="Navegação principal">
            <a href="#como-funciona">Como funciona</a>
            <a href="#interface">Interface</a>
            <a href="#recursos">Recursos</a>
            <a href="#ajuda">Ajuda</a>
          </nav>

          <div className="refined-header__actions">
            <a className="refined-button refined-button--small refined-button--primary" href="/api/download">
              <Download />
              Baixar APK
            </a>
            <button
              type="button"
              className="refined-menu-button"
              aria-expanded={mobileMenuOpen}
              aria-label="Abrir menu"
              onClick={() => setMobileMenuOpen((current) => !current)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="refined-mobile-nav">
            <div className="refined-container">
              <a href="#como-funciona" onClick={() => setMobileMenuOpen(false)}>
                Como funciona
              </a>
              <a href="#interface" onClick={() => setMobileMenuOpen(false)}>
                Interface
              </a>
              <a href="#recursos" onClick={() => setMobileMenuOpen(false)}>
                Recursos
              </a>
              <a href="#ajuda" onClick={() => setMobileMenuOpen(false)}>
                Ajuda
              </a>
              <a href="/reportar-bugs" onClick={() => setMobileMenuOpen(false)}>
                Reportar problema
              </a>
            </div>
          </div>
        )}
      </header>

      {infoOpen && <InfoModal section={infoOpen} onClose={() => setInfoOpen(null)} />}

      <main>
        <section className="refined-hero">
          <div className="refined-container refined-hero__grid">
            <div className="refined-hero__copy">
              <span className="refined-pill">Remote Play e jogos compatíveis na nuvem</span>
              <h1>Seu Xbox em mais telas.</h1>
              <p>
                Use o XTOYBOX para jogar remotamente pelo seu console Xbox e acessar experiências
                compatíveis com o Xbox Cloud Gaming em dispositivos Android.
              </p>
              <div className="refined-hero__actions">
                <a className="refined-button refined-button--primary" href="/api/download">
                  <Download />
                  Baixar versão {apkMetadata.versionName}
                </a>
                <a className="refined-button refined-button--secondary" href="#como-funciona">
                  Entender como funciona
                  <ArrowRight />
                </a>
              </div>
              <div className="refined-hero__note">
                <ShieldCheck />
                <span>
                  Projeto independente. Conta, assinatura e serviços oficiais podem ser necessários.
                </span>
              </div>
            </div>

            <div className="refined-hero__visual" aria-label="Prévia da interface do XTOYBOX">
              <div className="refined-visual-card refined-visual-card--main">
                <div className="refined-visual-card__bar">
                  <span>Biblioteca</span>
                  <span>Android</span>
                </div>
                <img src={screenBiblioteca} alt="Biblioteca do XTOYBOX" />
              </div>
              <div className="refined-visual-card refined-visual-card--profile">
                <img src={screenPerfil} alt="Perfil do XTOYBOX" />
              </div>
              <div className="refined-visual-card refined-visual-card--achievements">
                <img src={screenConquistas} alt="Conquistas no XTOYBOX" />
              </div>
              <div className="refined-visual-badge">
                <Check />
                <span>
                  <strong>Interface adaptável</strong>
                  <small>Celular e TV Box</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="refined-trust-strip" aria-label="Principais formas de uso">
          <div className="refined-container refined-trust-strip__grid">
            <div>
              <Gamepad2 />
              <span>
                <strong>Remote Play</strong>
                <small>Do seu próprio console</small>
              </span>
            </div>
            <div>
              <Cloud />
              <span>
                <strong>Xbox Cloud Gaming</strong>
                <small>Quando disponível para sua conta</small>
              </span>
            </div>
            <div>
              <Smartphone />
              <span>
                <strong>Android</strong>
                <small>Celular e TV Box</small>
              </span>
            </div>
            <div>
              <Tv />
              <span>
                <strong>Toque ou controle</strong>
                <small>Escolha como jogar</small>
              </span>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="refined-section refined-section--soft">
          <div className="refined-container">
            <div className="refined-section-heading refined-section-heading--center">
              <span className="refined-eyebrow">Como funciona</span>
              <h2>Duas formas de acessar seus jogos.</h2>
              <p>
                O XTOYBOX organiza o acesso ao Remote Play e às experiências compatíveis de jogos na
                nuvem sem se apresentar como um serviço próprio de streaming.
              </p>
            </div>

            <div className="refined-access-grid">
              <article className="refined-access-card">
                <span className="refined-access-card__icon">
                  <Gamepad2 />
                </span>
                <div>
                  <span className="refined-eyebrow">01 · Console</span>
                  <h3>Remote Play do seu Xbox</h3>
                  <p>
                    Conecte-se ao console que você já possui para jogar em outro dispositivo Android
                    compatível, dentro das condições da sua rede e da sua conta.
                  </p>
                  <ul>
                    <li>
                      <Check /> Requer console Xbox compatível
                    </li>
                    <li>
                      <Check /> Usa sua biblioteca e sessão do console
                    </li>
                    <li>
                      <Check /> A qualidade depende da conexão
                    </li>
                  </ul>
                </div>
              </article>

              <article className="refined-access-card">
                <span className="refined-access-card__icon refined-access-card__icon--cloud">
                  <Cloud />
                </span>
                <div>
                  <span className="refined-eyebrow">02 · Nuvem</span>
                  <h3>Experiências compatíveis com Xbox Cloud Gaming</h3>
                  <p>
                    Acesse títulos oferecidos pelo serviço oficial da Microsoft, quando disponíveis
                    para sua região, conta e assinatura. O XTOYBOX não hospeda esses jogos.
                  </p>
                  <ul>
                    <li>
                      <Check /> Catálogo e disponibilidade são definidos pela Microsoft
                    </li>
                    <li>
                      <Check /> Uma assinatura compatível pode ser necessária
                    </li>
                    <li>
                      <Check /> Não utiliza servidores próprios do XTOYBOX
                    </li>
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="interface" className="refined-section">
          <div className="refined-container">
            <div className="refined-section-heading">
              <span className="refined-eyebrow">Interface</span>
              <h2>Organizada para você chegar ao jogo mais rápido.</h2>
              <p>
                Mantivemos as telas que melhor representam o aplicativo e removemos imagens de fundo
                que competiam com o conteúdo.
              </p>
            </div>

            <div className="refined-screens-grid">
              {interfaceScreens.map((screen) => (
                <article className="refined-screen-card" key={screen.title}>
                  <div className="refined-screen-card__image">
                    <img src={screen.src} alt={screen.alt} loading="lazy" decoding="async" />
                  </div>
                  <div className="refined-screen-card__copy">
                    <span>{screen.label}</span>
                    <h3>{screen.title}</h3>
                    <p>{screen.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="recursos" className="refined-section refined-section--soft">
          <div className="refined-container">
            <div className="refined-section-heading refined-section-heading--center">
              <span className="refined-eyebrow">Recursos</span>
              <h2>O essencial, apresentado com clareza.</h2>
              <p>
                Sem promessas exageradas: apenas os principais recursos disponíveis no aplicativo.
              </p>
            </div>

            <div className="refined-feature-grid">
              {featureItems.map(({ icon: Icon, title, description }) => (
                <article className="refined-feature-card" key={title}>
                  <span>
                    <Icon />
                  </span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="refined-community-section">
          <div className="refined-container refined-community-card">
            <div>
              <span className="refined-eyebrow">Comunidade</span>
              <h2>Acompanhe atualizações e envie seu feedback.</h2>
              <p>
                Entre no Discord para receber avisos de novas versões, tirar dúvidas e reportar
                problemas encontrados no aplicativo.
              </p>
            </div>
            <div className="refined-community-card__actions">
              <a
                className="refined-button refined-button--primary"
                href={XTOYBOX_COMMUNITY_URL}
                target="_blank"
                rel="noreferrer"
              >
                Entrar no Discord
                <ArrowRight />
              </a>
              <a className="refined-button refined-button--secondary" href="/reportar-bugs">
                <Bug />
                Reportar problema
              </a>
            </div>
          </div>
        </section>

        <section id="ajuda" className="refined-section">
          <div className="refined-container refined-faq-layout">
            <div className="refined-section-heading">
              <span className="refined-eyebrow">Ajuda</span>
              <h2>Informações importantes antes de instalar.</h2>
              <p>
                Respostas diretas sobre funcionamento, requisitos e limites do projeto.
              </p>
            </div>

            <div className="refined-faq-list">
              {faqItems.map((item) => (
                <details key={item.question}>
                  <summary>
                    <strong>{item.question}</strong>
                    <ChevronDown />
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="refined-download-section">
          <div className="refined-container refined-download-card">
            <div>
              <span className="refined-eyebrow">Versão atual</span>
              <h2>Baixe o XTOYBOX para Android.</h2>
              <p>
                Versão {apkMetadata.versionName}
                {apkMetadata.apkSizeFormatted ? ` · ${apkMetadata.apkSizeFormatted}` : ""}
                {apkMetadata.lastUpdated
                  ? ` · Atualizada em ${new Date(apkMetadata.lastUpdated).toLocaleDateString("pt-BR")}`
                  : ""}
              </p>
            </div>
            <div>
              <a className="refined-button refined-button--download" href="/api/download">
                <Download />
                Baixar APK
              </a>
              <small>
                Talvez seja necessário permitir a instalação de aplicativos por fontes externas.
              </small>
            </div>
          </div>
        </section>
      </main>

      <footer className="refined-footer">
        <div className="refined-container refined-footer__top">
          <Brand />
          <nav aria-label="Links do rodapé">
            <button type="button" onClick={() => setInfoOpen("about")}>
              Sobre
            </button>
            <button type="button" onClick={() => setInfoOpen("credits")}>
              Créditos
            </button>
            <button type="button" onClick={() => setInfoOpen("terms")}>
              Termos
            </button>
            <a href="/reportar-bugs">Suporte</a>
          </nav>
        </div>
        <div className="refined-container refined-footer__bottom">
          <p>Projeto independente, sem vínculo ou afiliação com Microsoft ou Xbox.</p>
          <p>Xbox e marcas relacionadas pertencem aos seus respectivos proprietários.</p>
        </div>
      </footer>
    </div>
  );
}
