import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import {
  ChevronRight,
  Download,
  FileText,
  Gamepad2,
  Info,
  LayoutGrid,
  LifeBuoy,
  ListChecks,
  Lock,
  Menu,
  Moon,
  Package,
  ShieldCheck,
  Sun,
  X,
} from "lucide-react";
import logo from "@/assets/logo-x.webp";
import { DownloadButton } from "./DownloadButton";
import { DiscordIcon } from "./icons";
import { useXtTheme } from "./theme";

export type XtPage = "home" | "downloads" | "xtoytouch" | "seguranca-download" | "privacidade" | "termos";

export const DISCORD_URL = "https://discord.gg/abh27Dwktt";
export const SUPPORT_EMAIL = "Alexadre069@proton.me";

type IconType = ComponentType<{ className?: string }>;
type MenuItem = { href: string; label: string; page?: XtPage; external?: boolean; Icon: IconType };

const NAV_LINKS = [
  { href: "/#como-funciona", label: "Como funciona", spy: "como-funciona" },
  { href: "/#interface", label: "Interface", spy: "interface" },
  { href: "/#recursos", label: "Recursos", spy: "recursos" },
  { href: "/#ajuda", label: "Ajuda", spy: "ajuda" },
  { href: "/downloads", label: "Downloads", page: "downloads" },
  { href: "/xtoytouch", label: "XtoyTouch", page: "xtoytouch" },
] as const;

const MENU_GROUPS: ReadonlyArray<{ label: string; items: readonly MenuItem[] }> = [
  {
    label: "Navegar",
    items: [
      { href: "/#como-funciona", label: "Como funciona", Icon: Info },
      { href: "/#interface", label: "Interface", Icon: LayoutGrid },
      { href: "/#recursos", label: "Recursos", Icon: ListChecks },
      { href: "/#download", label: "Instalação", Icon: Download },
      { href: "/#ajuda", label: "Ajuda", Icon: LifeBuoy },
    ],
  },
  {
    label: "Downloads",
    items: [
      { href: "/downloads", label: "Todas as versões", page: "downloads", Icon: Package },
      { href: "/xtoytouch", label: "XtoyTouch", page: "xtoytouch", Icon: Gamepad2 },
      { href: "/seguranca-download", label: "Segurança do download", page: "seguranca-download", Icon: ShieldCheck },
    ],
  },
  {
    label: "Suporte e informações",
    items: [
      { href: DISCORD_URL, label: "Discord", external: true, Icon: DiscordIcon },
      { href: "/privacidade", label: "Privacidade", page: "privacidade", Icon: Lock },
      { href: "/termos", label: "Termos de Uso", page: "termos", Icon: FileText },
    ],
  },
];

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SiteShell({ page, children }: { page: XtPage; children: ReactNode }) {
  const { theme, toggle } = useXtTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const appRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Menu: trava a rolagem, fecha com Esc, mantém o foco dentro e fecha ao ir para o desktop.
  useEffect(() => {
    const menu = menuRef.current;
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (!menuOpen) return;
    // O foco vai para o próprio painel (sem contorno); o Tab segue para os links.
    const focusTimer = window.setTimeout(() => menu?.focus({ preventScroll: true }), 60);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !menu) return;
      const focusable = [...menu.querySelectorAll<HTMLElement>("a"), menuButtonRef.current].filter(
        (node): node is HTMLElement => Boolean(node),
      );
      const index = focusable.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && index <= 0) {
        event.preventDefault();
        focusable[focusable.length - 1]?.focus();
      } else if (!event.shiftKey && index === focusable.length - 1) {
        event.preventDefault();
        focusable[0]?.focus();
      }
    };
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    const query = window.matchMedia("(min-width: 820px)");
    document.addEventListener("keydown", onKey);
    query.addEventListener("change", closeOnDesktop);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      query.removeEventListener("change", closeOnDesktop);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Cabeçalho: sombra ao rolar, barra de progresso e destaque da seção visível.
  useEffect(() => {
    const header = headerRef.current;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      header?.classList.toggle("is-scrolled", y > 12);
      header?.style.setProperty("--xt-p", max > 0 ? Math.min(1, y / max).toFixed(4) : "0");
      if (y < 240) header?.querySelectorAll(".xt-nav a[data-spy]").forEach((a) => a.removeAttribute("aria-current"));
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    let spy: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            header?.querySelectorAll<HTMLElement>(".xt-nav a[data-spy]").forEach((a) => {
              if (a.dataset.spy === entry.target.id) a.setAttribute("aria-current", "location");
              else a.removeAttribute("aria-current");
            });
          });
        },
        { rootMargin: "-45% 0px -50% 0px" },
      );
      document.querySelectorAll("[data-spy-section]").forEach((section) => spy?.observe(section));
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      spy?.disconnect();
    };
  }, []);

  // Entrada suave dos blocos marcados com data-reveal e do carrossel de capturas.
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const timers: number[] = [];
    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          reveal.unobserve(el);
          el.classList.add("is-in");
          timers.push(
            window.setTimeout(() => {
              el.classList.remove("xt-rv", "is-in");
              el.style.removeProperty("--d");
            }, 1300),
          );
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el, index) => {
      el.classList.add("xt-rv");
      el.style.setProperty("--d", `${(index % 4) * 70}ms`);
      reveal.observe(el);
    });

    const trackers: IntersectionObserver[] = [];
    document.querySelectorAll<HTMLElement>(".xt-rail").forEach((rail) => {
      rail.classList.add("is-tracked");
      const tracker = new IntersectionObserver(
        (entries) => entries.forEach((entry) => entry.target.classList.toggle("is-current", entry.intersectionRatio > 0.6)),
        { root: rail, threshold: [0.6] },
      );
      rail.querySelectorAll("figure").forEach((figure) => tracker.observe(figure));
      trackers.push(tracker);
    });

    return () => {
      reveal.disconnect();
      trackers.forEach((tracker) => tracker.disconnect());
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  // Transição curta ao trocar de página e rolagem suave para o topo na página atual.
  useEffect(() => {
    const app = appRef.current;
    const reduce = prefersReducedMotion();
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (/^\/(api\/|downloads\/|xtoytouch\/)/.test(url.pathname)) return;
      if (url.pathname.replace(/\/$/, "") === window.location.pathname.replace(/\/$/, "")) {
        if (!url.hash) {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        }
        return;
      }
      if (reduce) return;
      event.preventDefault();
      app?.classList.add("xt-leaving");
      window.setTimeout(() => window.location.assign(url.href), 140);
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) app?.classList.remove("xt-leaving");
    };
    document.addEventListener("click", onClick);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div ref={appRef} className={`xt-app${menuOpen ? " is-menu-open" : ""}`} data-page={page}>
      <a className="xt-skip" href="#conteudo">
        Ir para o conteúdo
      </a>
      <header ref={headerRef} className="xt-header">
        <div className="xt-header__inner">
          <a className="xt-brand" href="/" aria-label="Página inicial do XTOYBOX">
            <img src={logo} width={30} height={30} alt="" />
            <b translate="no">XTOYBOX</b>
          </a>
          <nav className="xt-nav" aria-label="Navegação principal">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                data-spy={"spy" in link ? link.spy : undefined}
                aria-current={"page" in link && link.page === page ? "page" : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="xt-actions">
            <DownloadButton className="xt-header-cta" href="/api/download">
              Baixar
            </DownloadButton>
            <button
              className="xt-icon-btn"
              type="button"
              aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
              onClick={toggle}
            >
              {theme === "dark" ? <Sun className="xt-i" /> : <Moon className="xt-i" />}
            </button>
            <button
              ref={menuButtonRef}
              className="xt-icon-btn xt-menu-btn"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="xt-menu"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Menu className="xt-i xt-menu-btn__open" />
              <X className="xt-i xt-menu-btn__close" />
            </button>
          </div>
        </div>
      </header>
      <div className="xt-scrim" onClick={closeMenu} />
      <nav ref={menuRef} className="xt-menu" id="xt-menu" aria-label="Menu" tabIndex={-1} inert={!menuOpen}>
        {MENU_GROUPS.map((group, groupIndex) => (
          <div key={group.label}>
            <p className="xt-menu__label" style={{ "--k": groupIndex * 4 } as React.CSSProperties}>
              {group.label}
            </p>
            <ul>
              {group.items.map((item, itemIndex) => (
                <li key={item.label} style={{ "--k": groupIndex * 4 + itemIndex + 1 } as React.CSSProperties}>
                  <a
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={item.page === page ? "page" : undefined}
                    {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    <item.Icon className="xt-i xt-menu__ico" />
                    <span>{item.label}</span>
                    <ChevronRight className="xt-i xt-menu__go" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <main id="conteudo" className="xt-main">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

/** Cabeçalho das páginas internas: caminho, ícone, título e resumo. */
export function PageHead({
  title,
  lede,
  Icon,
  meta,
}: {
  title: string;
  lede?: string;
  Icon?: IconType;
  meta?: ReactNode;
}) {
  return (
    <div className="xt-phead">
      <a className="xt-crumb" href="/">
        <ChevronRight className="xt-i" />
        Início
      </a>
      <div className="xt-phead__row">
        {Icon ? (
          <span className="xt-phead__ico" aria-hidden="true">
            <Icon className="xt-i" />
          </span>
        ) : null}
        <h1>{title}</h1>
      </div>
      {lede ? <p className="xt-lede">{lede}</p> : null}
      {meta ? <div className="xt-phead__meta">{meta}</div> : null}
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="xt-footer">
      <div className="xt-wrap">
        <div className="xt-fgrid">
          <div>
            <a className="xt-brand" href="/">
              <img src={logo} width={30} height={30} alt="" />
              <b translate="no">XTOYBOX</b>
            </a>
            <p className="xt-fsm">Projeto independente, sem vínculo com Microsoft ou Xbox.</p>
          </div>
          <nav aria-label="Produto">
            <p className="xt-fh">Produto</p>
            <a href="/downloads">Downloads</a>
            <a href="/xtoytouch">XtoyTouch</a>
            <a href="/seguranca-download">Segurança do download</a>
          </nav>
          <nav aria-label="Suporte">
            <p className="xt-fh">Suporte</p>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer">
              Discord
            </a>
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </nav>
          <nav aria-label="Legal">
            <p className="xt-fh">Legal</p>
            <a href="/privacidade">Privacidade</a>
            <a href="/termos">Termos de Uso</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

