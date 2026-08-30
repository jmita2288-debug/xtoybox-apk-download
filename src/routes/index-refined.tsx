import { useEffect, useState } from "react";
import logo from "@/assets/logo-xtoybox.png";
import screenBiblioteca from "@/assets/screens/biblioteca.png";
import screenPerfil from "@/assets/screens/perfil.png";
import screenConquistas from "@/assets/screens/conquistas.png";
import { fetchApkMetadata, fallbackLatestMetadata, type ApkMetadata } from "@/lib/apkMetadata";
import {
  Bug,
  ChevronRight,
  Cloud,
  Download,
  Gamepad2,
  Instagram,
  Menu,
  MessageCircle,
  MonitorSmartphone,
  Moon,
  ShieldCheck,
  Smartphone,
  Sun,
  Tv,
  X,
} from "lucide-react";

const INSTAGRAM_URL = "https://www.instagram.com/alexandre6902_/";
const DISCORD_URL = "https://discord.gg/abh27Dwktt";
const THEME_KEY = "xtoybox-home-theme";

type HomeTheme = "light" | "dark";

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

function getInitialTheme(): HomeTheme {
  try {
    const saved = window.localStorage.getItem(THEME_KEY) ?? window.localStorage.getItem("xtoybox-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Mantém o tema padrão quando o storage não está disponível.
  }
  return "dark";
}

function formatReleaseDate(value: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

const galleryScreens = [
  { src: screenBiblioteca, label: "Biblioteca", alt: "Tela da biblioteca do XTOYBOX" },
  { src: screenPerfil, label: "Perfil", alt: "Tela de perfil do XTOYBOX" },
  { src: screenConquistas, label: "Conquistas", alt: "Tela de conquistas do XTOYBOX" },
] as const;

const menuItems = [
  { href: "/xtoytouch", label: "XtoyTouch", icon: Gamepad2 },
  { href: "#como-funciona", label: "Como funciona", icon: Cloud },
  { href: "#interface", label: "Interface", icon: MonitorSmartphone },
  { href: "#recursos", label: "Recursos", icon: Smartphone },
  { href: "#ajuda", label: "Ajuda", icon: ShieldCheck },
  { href: "/reportar-bugs", label: "Reportar problema", icon: Bug },
] as const;

export function RefinedIndex() {
  const [apkMetadata, setApkMetadata] = useState<ApkMetadata>(() => createFallbackApkMetadata());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<HomeTheme>(() => getInitialTheme());
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    let active = true;
    fetchApkMetadata()
      .then((metadata) => {
        if (active) setApkMetadata(metadata);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_KEY, theme);
      window.localStorage.setItem("xtoybox-theme", theme);
    } catch {
      // A escolha continua ativa na sessão atual.
    }
  }, [theme]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const releaseDate = formatReleaseDate(apkMetadata.lastUpdated ?? apkMetadata.publishedAt);
  const releaseMeta = [
    apkMetadata.versionName,
    apkMetadata.apkSizeFormatted,
    releaseDate,
  ].filter(Boolean);

  return (
    <div className="pixel-site" data-theme={theme}>
      <a className="pixel-skip" href="#hero">Ir para o conteúdo</a>

      <header className="pixel-header" id="top">
        <div className="pixel-shell pixel-header__inner">
          <a className="pixel-brand" href="/" aria-label="Página inicial do XTOYBOX">
            <img src={logo} alt="" />
            <span>XTOYBOX</span>
          </a>

          <nav className="pixel-nav" aria-label="Navegação principal">
            <a href="#como-funciona">Como funciona</a>
            <a href="#interface">Interface</a>
            <a href="#recursos">Recursos</a>
            <a href="#ajuda">Ajuda</a>
          </nav>

          <div className="pixel-header__actions">
            <button
              className="pixel-icon-btn pixel-theme-btn"
              type="button"
              aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? <Moon /> : <Sun />}
            </button>
            <a className="pixel-btn pixel-btn--primary pixel-btn--sm" href="/api/download">Baixar</a>
            <button
              className="pixel-icon-btn pixel-menu-btn"
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-controls="pixel-mobile-menu"
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setMobileMenuOpen((current) => !current)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="pixel-menu" id="pixel-mobile-menu">
          <div className="pixel-shell pixel-menu__inner">
            <ul className="pixel-menu__list">
              {menuItems.map(({ href, label, icon: Icon }) => (
                <li key={label}>
                  <a href={href} onClick={() => setMobileMenuOpen(false)}>
                    <Icon />
                    <span>{label}</span>
                    <ChevronRight className="pixel-menu__arrow" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <main>
        <section className="pixel-hero" id="hero">
          <div className="pixel-hero__media" aria-hidden="true">
            <img className="pixel-hero__mark" src={logo} alt="" />
            <img className="pixel-hero__shot" src={screenBiblioteca} alt="" />
            <span className="pixel-hero__glow" />
            <span className="pixel-hero__scrim" />
          </div>

          <div className="pixel-shell pixel-hero__content">
            <h1>Seu Xbox em mais telas.</h1>
            <p className="pixel-lede">Remote Play do seu console e jogos compatíveis na nuvem, no Android.</p>
            <div className="pixel-hero__actions">
              <a className="pixel-btn pixel-btn--primary" href="/api/download">
                <Download />
                Baixar v{apkMetadata.versionName}
              </a>
              <a className="pixel-link-arrow" href="#como-funciona">
                Como funciona <ChevronRight />
              </a>
            </div>
            <div className="pixel-counter-mount refined-hero__visual" />
          </div>
        </section>

        <section className="pixel-section" id="como-funciona">
          <div className="pixel-shell">
            <div className="pixel-modes">
              <article>
                <Gamepad2 />
                <h2>Remote Play</h2>
                <p>Do console que você já tem.</p>
              </article>
              <article>
                <Cloud />
                <h2>Cloud Gaming</h2>
                <p>Títulos compatíveis da Microsoft.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="pixel-gallery-section" id="interface">
          <div className="pixel-shell pixel-gallery__head">
            <h2>Interface</h2>
          </div>
          <div
            className="pixel-gallery"
            onScroll={(event) => {
              const node = event.currentTarget;
              const maxScroll = Math.max(1, node.scrollWidth - node.clientWidth);
              const progress = node.scrollLeft / maxScroll;
              setGalleryIndex(Math.min(2, Math.max(0, Math.round(progress * 2))));
            }}
          >
            {galleryScreens.map((screen) => (
              <figure key={screen.label}>
                <img src={screen.src} alt={screen.alt} loading="lazy" />
                <figcaption>{screen.label}</figcaption>
              </figure>
            ))}
          </div>
          <div className="pixel-shell pixel-dots" aria-hidden="true">
            {galleryScreens.map((screen, index) => (
              <span key={screen.label} className={galleryIndex === index ? "is-active" : ""} />
            ))}
          </div>
        </section>

        <section className="pixel-section pixel-section--tight" id="recursos">
          <div className="pixel-shell">
            <ul className="pixel-specs">
              <li><Smartphone /><span>Celular e TV Box</span></li>
              <li><Gamepad2 /><span>Toque ou controle</span></li>
              <li><Tv /><span>Sua biblioteca do console</span></li>
              <li><ShieldCheck /><span>Release pública com SHA-256</span></li>
            </ul>
          </div>
        </section>

        <section className="pixel-section--rule">
          <a className="pixel-shell pixel-inline-cta" href="/xtoytouch">
            <Gamepad2 />
            <span><strong>XtoyTouch</strong> — userscript complementar</span>
            <ChevronRight />
          </a>
        </section>

        <section className="pixel-section pixel-section--tight" id="ajuda">
          <div className="pixel-shell pixel-faq-grid">
            <h2>Ajuda</h2>
            <div className="pixel-faq">
              <details>
                <summary>É um serviço próprio de cloud gaming?</summary>
                <p>Não. O XTOYBOX organiza o acesso ao Remote Play e a experiências compatíveis disponibilizadas pela Microsoft.</p>
              </details>
              <details>
                <summary>Preciso de um console Xbox?</summary>
                <p>Para Remote Play, sim. Na nuvem, depende da sua conta, região e do serviço oficial.</p>
              </details>
              <details>
                <summary>Quais dispositivos?</summary>
                <p>Dispositivos Android compatíveis, incluindo celulares e TV Box.</p>
              </details>
              <details>
                <summary>Como instalar o APK?</summary>
                <p>Baixe pelo site oficial e, se necessário, permita a instalação por fontes externas no Android.</p>
              </details>
            </div>
          </div>
        </section>

        <section className="pixel-section--rule" id="contato">
          <ul className="pixel-shell pixel-channels">
            <li>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                <Instagram /><span>Instagram</span><ChevronRight />
              </a>
            </li>
            <li>
              <a href={DISCORD_URL} target="_blank" rel="noreferrer">
                <MessageCircle /><span>Discord</span><ChevronRight />
              </a>
            </li>
            <li>
              <a href="/reportar-bugs">
                <Bug /><span>Reportar um problema</span><ChevronRight />
              </a>
            </li>
          </ul>
        </section>

        <section className="pixel-download" id="download">
          <div className="pixel-shell pixel-download__inner">
            <div>
              <h2>Baixe para Android.</h2>
              <p className="pixel-meta">{releaseMeta.join(" · ")}</p>
            </div>
            <a className="pixel-btn pixel-btn--primary" href="/api/download">
              <Download />
              Baixar APK
            </a>
          </div>
        </section>
      </main>

      <footer className="pixel-footer">
        <div className="pixel-shell pixel-footer__inner">
          <span className="pixel-footer__brand">XTOYBOX</span>
          <nav className="pixel-footer__nav" aria-label="Rodapé">
            <a href="/xtoytouch">XtoyTouch</a>
            <a href="/seguranca-download">Segurança</a>
            <a href="/privacidade">Privacidade</a>
            <a href="/termos">Termos</a>
            <a href="mailto:xtoybox@proton.me">Suporte</a>
          </nav>
          <p>Projeto independente, sem vínculo com Microsoft ou Xbox.</p>
        </div>
      </footer>
    </div>
  );
}
