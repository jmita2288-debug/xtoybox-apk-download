import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/logo-xtoybox.png";
import screenBiblioteca from "@/assets/screens/biblioteca.png";
import screenPerfil from "@/assets/screens/perfil.png";
import screenConquistas from "@/assets/screens/conquistas.png";
import gameplayForza from "@/assets/screens/gameplay-forza-2.jpeg";
import { fetchApkMetadata, fallbackLatestMetadata, type ApkMetadata } from "@/lib/apkMetadata";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Autoplay from "embla-carousel-autoplay";
import {
  ArrowDown,
  ArrowRight,
  Bug,
  Calendar,
  ChevronDown,
  Cloud,
  Download,
  FileText,
  Gamepad2,
  HardDrive,
  Heart,
  Info,
  Menu as MenuIcon,
  MonitorSmartphone,
  Package,
  Radio,
  ShieldCheck,
  Smartphone,
  Tv,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const XTOYBOX_COMMUNITY_URL = "https://discord.gg/abh27Dwktt";

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

const screens = [
  {
    src: screenBiblioteca,
    index: "01",
    tag: "Biblioteca",
    title: "Seus jogos no centro",
    description: "Capas, categorias e acesso rápido organizados para leitura imediata.",
    alt: "Biblioteca de jogos do XTOYBOX",
  },
  {
    src: screenPerfil,
    index: "02",
    tag: "Perfil",
    title: "Progresso com contexto",
    description: "Conta, conquistas e histórico reunidos em uma interface direta.",
    alt: "Perfil do jogador no XTOYBOX",
  },
  {
    src: screenConquistas,
    index: "03",
    tag: "Conquistas",
    title: "Cada conquista visível",
    description: "Acompanhe pontuação e progresso sem sair da experiência do app.",
    alt: "Tela de conquistas do XTOYBOX",
  },
];

const capabilities = [
  {
    number: "01",
    title: "Jogos na nuvem",
    description: "Acesse sua biblioteca compatível diretamente pelo Android.",
    Icon: Cloud,
  },
  {
    number: "02",
    title: "Remote Play",
    description: "Conecte-se ao seu console usando a mesma experiência visual.",
    Icon: Gamepad2,
  },
  {
    number: "03",
    title: "Celular e TV Box",
    description: "Uma interface preparada para toque, controle e telas maiores.",
    Icon: MonitorSmartphone,
  },
  {
    number: "04",
    title: "Atualizações diretas",
    description: "Novas versões e correções distribuídas pelo site oficial.",
    Icon: Download,
  },
];

const faqItems = [
  {
    question: "Como instalar o APK?",
    answer:
      "Baixe o arquivo pelo botão do site, abra-o no Android e siga as instruções de instalação.",
  },
  {
    question: "Em quais dispositivos funciona?",
    answer:
      "O XTOYBOX foi desenvolvido para Android em celulares e TV Box. Não há versão para iOS, PC ou consoles.",
  },
  {
    question: "Por que o Android pede permissão de instalação?",
    answer:
      "O sistema exige essa permissão para instalar APKs fora da Play Store. Ela pode ser desativada após a instalação.",
  },
];

type InfoSection = "credits" | "terms" | "about";

type IconProps = {
  className?: string;
};

function DiscordIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 127.14 96.36"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
      className={className}
    >
      <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0 105.89 105.89 0 0 0 19.39 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1A105.25 105.25 0 0 0 126.6 80.22C129.24 52.84 122.09 29.11 107.7 8.07ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53 48.84 65.69 42.45 65.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53 91.08 65.69 84.69 65.69Z" />
    </svg>
  );
}

function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  tone = "dark",
}: {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
  tone?: "dark" | "light";
}) {
  return (
    <div className={`editorial-heading ${tone === "light" ? "editorial-heading--light" : ""}`}>
      <span className="editorial-heading__index">{index}</span>
      <div>
        <p className="editorial-heading__eyebrow">{eyebrow}</p>
        <h2 className="editorial-heading__title">{title}</h2>
        {description && <p className="editorial-heading__description">{description}</p>}
      </div>
    </div>
  );
}

export function Index() {
  return <IndexPage />;
}

function IndexPage() {
  const [infoOpen, setInfoOpen] = useState<InfoSection | null>(null);
  const [apkMetadata, setApkMetadata] = useState<ApkMetadata>(() => createFallbackApkMetadata());
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const autoplayRef = useRef(
    Autoplay({ delay: 5200, stopOnInteraction: true, stopOnMouseEnter: true }),
  );

  useEffect(() => {
    let active = true;

    fetchApkMetadata()
      .then((metadata) => {
        if (active) setApkMetadata(metadata);
      })
      .catch(() => {
        // Mantém o fallback para que o download continue disponível.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    [...screens.map((screen) => screen.src), gameplayForza].forEach((src) => {
      const image = new Image();
      image.decoding = "async";
      image.src = src;
    });
  }, []);

  useEffect(() => {
    if (!infoOpen) {
      if (wasOpenRef.current) {
        menuTriggerRef.current?.focus();
        wasOpenRef.current = false;
      }
      return;
    }

    wasOpenRef.current = true;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setInfoOpen(null);
    };

    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [infoOpen]);

  useEffect(() => {
    if (!carouselApi) return;
    const update = () => setActiveSlide(carouselApi.selectedScrollSnap());
    update();
    carouselApi.on("select", update);
    carouselApi.on("reInit", update);
    return () => {
      carouselApi.off("select", update);
      carouselApi.off("reInit", update);
    };
  }, [carouselApi]);

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-container site-header__inner">
          <a href="/" className="brand-lockup" aria-label="Página inicial do XTOYBOX">
            <span className="brand-lockup__mark">
              <img src={logo} alt="" />
            </span>
            <span className="brand-lockup__copy">
              <strong>XTOYBOX</strong>
              <small>Jogue sem limites</small>
            </span>
          </a>

          <div className="site-header__actions">
            <nav className="site-header__nav" aria-label="Navegação principal">
              <a href="#interface">Interface</a>
              <a href="#recursos">Recursos</a>
              <a href="#comunidade">Comunidade</a>
            </nav>
            <a href="/api/download" className="header-download">
              <Download className="h-4 w-4" />
              <span>Baixar APK</span>
            </a>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  ref={menuTriggerRef}
                  type="button"
                  aria-label="Abrir menu"
                  className="menu-trigger"
                >
                  <MenuIcon className="h-[18px] w-[18px]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="site-menu-content">
                <div className="site-menu-content__header">
                  <span>Menu XTOYBOX</span>
                  <small>Informações e suporte</small>
                </div>
                <DropdownMenuItem onSelect={() => setInfoOpen("about")} className="site-menu-item">
                  <span className="site-menu-item__icon">
                    <Info className="h-4 w-4" />
                  </span>
                  <span>
                    <strong>Sobre o app</strong>
                    <small>Conheça o projeto</small>
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setInfoOpen("credits")}
                  className="site-menu-item"
                >
                  <span className="site-menu-item__icon">
                    <Heart className="h-4 w-4" />
                  </span>
                  <span>
                    <strong>Créditos</strong>
                    <small>Origem e desenvolvimento</small>
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="site-menu-item">
                  <a href="/reportar-bugs">
                    <span className="site-menu-item__icon">
                      <Bug className="h-4 w-4" />
                    </span>
                    <span>
                      <strong>Reportar bugs</strong>
                      <small>Envie os detalhes</small>
                    </span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setInfoOpen("terms")} className="site-menu-item">
                  <span className="site-menu-item__icon">
                    <FileText className="h-4 w-4" />
                  </span>
                  <span>
                    <strong>Termos de uso</strong>
                    <small>Leia antes de instalar</small>
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {infoOpen && (
        <div
          className="dialog-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setInfoOpen(null)}
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            className="dialog-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dialog-panel__header">
              <div>
                <span className="dialog-panel__label">XTOYBOX / INFORMAÇÕES</span>
                <h3>
                  {infoOpen === "about" && "Sobre o app"}
                  {infoOpen === "credits" && "Créditos"}
                  {infoOpen === "terms" && "Termos de uso"}
                </h3>
              </div>
              <button type="button" onClick={() => setInfoOpen(null)} aria-label="Fechar">
                ×
              </button>
            </div>
            <div className="dialog-panel__body">
              {infoOpen === "about" && (
                <div className="space-y-3">
                  <p>
                    O XTOYBOX é um app Android criado a partir de uma base open source, com
                    modificações próprias para jogar na nuvem em celulares e TV Box.
                  </p>
                  <p>
                    O projeto reúne ajustes de navegação, organização da biblioteca, melhorias no
                    streaming e suporte otimizado para uma experiência mais estável.
                  </p>
                  <p>
                    Este é um projeto independente, sem vínculo, parceria ou afiliação com Xbox,
                    Microsoft ou marcas relacionadas.
                  </p>
                  <div className="dialog-tags">
                    <span>Android</span>
                    <span>TV Box</span>
                    <span>Open source</span>
                  </div>
                </div>
              )}
              {infoOpen === "credits" && (
                <div className="space-y-3">
                  <p>Base open source: XStreaming.</p>
                  <p>Copyright (c) 2024 Geocld.</p>
                  <p>Licenciado sob a licença MIT.</p>
                  <p>Modificações e otimizações por Alexandreios (XTOYBOX).</p>
                </div>
              )}
              {infoOpen === "terms" && (
                <div className="space-y-3">
                  <p>
                    O aplicativo é distribuído como APK externo, fora de lojas oficiais. Antes de
                    instalar, entenda que esse tipo de instalação exige cuidado.
                  </p>
                  <p>
                    Baixe apenas pelo site oficial do projeto e use sempre a versão mais recente.
                  </p>
                  <p>Nenhum APK externo deve ser tratado como risco zero. Use por sua conta.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main>
        <section className="hero-section">
          <div className="site-container hero-grid">
            <div className="hero-copy">
              <div className="hero-kicker">
                <span /> XTOYBOX / ANDROID + TV BOX
              </div>
              <h1 className="hero-title">
                Jogue
                <br />
                <em>sem limites.</em>
              </h1>
              <p className="hero-description">
                Cloud gaming e Remote Play em uma experiência feita para o seu jeito de jogar — no
                celular ou na tela grande.
              </p>
              <div className="hero-actions">
                <a href="/api/download" className="action-primary">
                  <Download className="h-[18px] w-[18px]" />
                  Baixar APK
                </a>
                <a href="#interface" className="action-secondary">
                  Ver a interface
                  <ArrowDown className="h-4 w-4" />
                </a>
              </div>
              <dl className="hero-facts">
                <div>
                  <dt>Plataforma</dt>
                  <dd>Android</dd>
                </div>
                <div>
                  <dt>Formato</dt>
                  <dd>APK direto</dd>
                </div>
                <div>
                  <dt>Projeto</dt>
                  <dd>Independente</dd>
                </div>
              </dl>
            </div>

            <div className="hero-visual" aria-label="Prévia do XTOYBOX em uso">
              <div className="hero-visual__topline">
                <span>EXPERIÊNCIA REAL</span>
                <span>01 / 03</span>
              </div>
              <div className="gameplay-frame">
                <img src={gameplayForza} alt="Gameplay no XTOYBOX com controles de toque" />
                <div className="gameplay-frame__caption">
                  <span>Streaming em movimento</span>
                  <small>Controles na tela e sessão em tempo real</small>
                </div>
              </div>
              <div className="app-preview-card">
                <div className="app-preview-card__header">
                  <span>Biblioteca</span>
                  <span>02</span>
                </div>
                <img src={screenBiblioteca} alt="Biblioteca do aplicativo XTOYBOX" />
              </div>
              <div className="connection-badge">
                <Radio className="h-4 w-4" />
                <span>
                  <strong>Sessão ativa</strong>
                  <small>Interface + streaming</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="platform-rail" aria-label="Principais formas de uso">
          <div className="site-container platform-rail__grid">
            <div>
              <Cloud />
              <span>
                <strong>Nuvem</strong>
                <small>Biblioteca compatível</small>
              </span>
            </div>
            <div>
              <Gamepad2 />
              <span>
                <strong>Remote Play</strong>
                <small>Seu console conectado</small>
              </span>
            </div>
            <div>
              <Smartphone />
              <span>
                <strong>Celular</strong>
                <small>Toque e controle físico</small>
              </span>
            </div>
            <div>
              <Tv />
              <span>
                <strong>TV Box</strong>
                <small>Experiência em tela grande</small>
              </span>
            </div>
          </div>
        </section>

        <section id="interface" className="content-section">
          <div className="site-container">
            <SectionHeading
              index="01"
              eyebrow="Interface do app"
              title="Feita para jogar, não para distrair."
              description="A informação aparece no momento certo, com hierarquia clara e foco no conteúdo que importa."
            />

            <Carousel
              opts={{ loop: true, align: "start", duration: 32, dragFree: false }}
              plugins={[autoplayRef.current]}
              setApi={setCarouselApi}
              className="showcase-carousel"
            >
              <div className="showcase-controls">
                <span>
                  {String(activeSlide + 1).padStart(2, "0")} /{" "}
                  {String(screens.length).padStart(2, "0")}
                </span>
                <div>
                  <CarouselPrevious />
                  <CarouselNext />
                </div>
              </div>
              <CarouselContent className="showcase-track">
                {screens.map((screen, index) => (
                  <CarouselItem key={screen.title} className="showcase-item">
                    <article
                      className={`showcase-card ${activeSlide === index ? "is-active" : ""}`}
                    >
                      <div className="showcase-card__image">
                        <img
                          src={screen.src}
                          alt={screen.alt}
                          loading={index === 0 ? "eager" : "lazy"}
                          decoding="async"
                        />
                      </div>
                      <div className="showcase-card__copy">
                        <div>
                          <span>{screen.index}</span>
                          <small>{screen.tag}</small>
                        </div>
                        <h3>{screen.title}</h3>
                        <p>{screen.description}</p>
                      </div>
                    </article>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="showcase-dots">
                {screens.map((screen, index) => (
                  <button
                    key={screen.title}
                    type="button"
                    aria-label={`Abrir ${screen.title}`}
                    onClick={() => carouselApi?.scrollTo(index)}
                    className={activeSlide === index ? "is-active" : ""}
                  />
                ))}
              </div>
            </Carousel>
          </div>
        </section>

        <section id="recursos" className="capabilities-section">
          <div className="site-container">
            <SectionHeading
              index="02"
              eyebrow="Recursos"
              title="Uma base sólida para diferentes formas de jogar."
              description="O XTOYBOX reúne os caminhos principais em uma experiência única e consistente."
              tone="light"
            />
            <div className="capability-grid">
              {capabilities.map(({ number, title, description, Icon }) => (
                <article key={title} className="capability-item">
                  <div className="capability-item__top">
                    <span>{number}</span>
                    <Icon />
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="gameplay-story">
          <img src={gameplayForza} alt="" aria-hidden="true" />
          <div className="gameplay-story__shade" />
          <div className="site-container gameplay-story__content">
            <div>
              <span className="story-index">03 / EM JOGO</span>
              <h2>
                Do toque ao controle.
                <br />
                Do celular à TV.
              </h2>
            </div>
            <div className="gameplay-story__aside">
              <p>Uma interface pensada para acompanhar a partida sem competir com ela.</p>
              <div>
                <span>HUD ajustável</span>
                <span>Controle físico</span>
                <span>Modo TV</span>
              </div>
            </div>
          </div>
        </section>

        <section id="comunidade" className="community-section">
          <div className="site-container community-card">
            <div className="community-card__symbol">
              <DiscordIcon />
            </div>
            <div className="community-card__copy">
              <span>COMUNIDADE XTOYBOX</span>
              <h2>O projeto continua evoluindo com quem joga.</h2>
              <p>Dúvidas, avisos de novas versões e um canal direto para reportar problemas.</p>
            </div>
            <a href={XTOYBOX_COMMUNITY_URL} target="_blank" rel="noreferrer">
              Entrar no Discord
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="faq-section">
          <div className="site-container faq-layout">
            <SectionHeading index="04" eyebrow="Ajuda" title="Antes de instalar." />
            <div className="faq-list">
              {faqItems.map((item, index) => (
                <details key={item.question}>
                  <summary>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{item.question}</strong>
                    <ChevronDown />
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section
          id="download"
          className="download-section"
          data-apk-version={apkMetadata.versionName}
          data-apk-version-code={apkMetadata.versionCode}
          data-apk-downloads={apkMetadata.downloadsTotal ?? ""}
          data-apk-size={apkMetadata.apkSizeFormatted ?? ""}
          data-apk-updated-at={apkMetadata.lastUpdated ?? ""}
          data-apk-metadata-source={apkMetadata.source}
        >
          <div className="site-container download-panel">
            <div className="download-panel__intro">
              <span>VERSÃO ATUAL</span>
              <h2>Pronto para jogar?</h2>
              <p>Baixe o APK oficial do XTOYBOX diretamente pelo site.</p>
            </div>
            <dl className="download-stats">
              <div>
                <dt>
                  <Package /> Versão
                </dt>
                <dd>v{apkMetadata.versionName}</dd>
              </div>
              <div>
                <dt>
                  <HardDrive /> Tamanho
                </dt>
                <dd>{apkMetadata.apkSizeFormatted ?? "Indisponível"}</dd>
              </div>
              <div>
                <dt>
                  <Calendar /> Atualizado
                </dt>
                <dd>
                  {apkMetadata.lastUpdated
                    ? new Date(apkMetadata.lastUpdated).toLocaleDateString("pt-BR")
                    : "Recente"}
                </dd>
              </div>
            </dl>
            <div className="download-panel__action">
              <a href="/api/download">
                <Download /> Baixar APK
              </a>
              <p>
                <ShieldCheck /> Talvez seja necessário permitir fontes desconhecidas no Android.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-container site-footer__inner">
          <div className="brand-lockup">
            <span className="brand-lockup__mark">
              <img src={logo} alt="" />
            </span>
            <span className="brand-lockup__copy">
              <strong>XTOYBOX</strong>
              <small>Projeto independente</small>
            </span>
          </div>
          <nav aria-label="Links do rodapé">
            <button type="button" onClick={() => setInfoOpen("about")}>
              Sobre
            </button>
            <button type="button" onClick={() => setInfoOpen("credits")}>
              Créditos
            </button>
            <a href="/reportar-bugs">Reportar bugs</a>
            <button type="button" onClick={() => setInfoOpen("terms")}>
              Termos
            </button>
          </nav>
          <p>Não afiliado à Microsoft ou Xbox.</p>
        </div>
      </footer>
    </div>
  );
}
