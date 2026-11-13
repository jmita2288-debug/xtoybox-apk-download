import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronRight, Moon, Sun } from "lucide-react";
import logo from "@/assets/logo-xtoybox.png";
import logoArt from "@/assets/logo-art.webp";
import { DownloadButton } from "./DownloadButton";
import { useXtTheme } from "./theme";

export type XtPage =
  | "home"
  | "downloads"
  | "xtoytouch"
  | "seguranca-download"
  | "privacidade"
  | "termos"
  | "reportar-bugs";

export const DISCORD_URL = "https://discord.gg/abh27Dwktt";
export const SUPPORT_EMAIL = "xtoybox@proton.me";

const NAV_LINKS = [
  { href: "/#como-funciona", label: "Como funciona", spy: "como-funciona" },
  { href: "/#interface", label: "Interface", spy: "interface" },
  { href: "/#recursos", label: "Recursos", spy: "recursos" },
  { href: "/#ajuda", label: "Ajuda", spy: "ajuda" },
  { href: "/downloads", label: "Downloads", page: "downloads" },
  { href: "/xtoytouch", label: "XtoyTouch", page: "xtoytouch" },
] as const;

const MENU_GROUPS = [
  {
    label: "Navegar",
    items: [
      { href: "/#como-funciona", label: "Como funciona" },
      { href: "/#interface", label: "Interface" },
      { href: "/#recursos", label: "Recursos" },
      { href: "/#download", label: "Instalação" },
      { href: "/#ajuda", label: "Ajuda" },
    ],
  },
  {
    label: "Downloads",
    items: [
      { href: "/downloads", label: "Todas as versões", page: "downloads" },
      { href: "/xtoytouch", label: "XtoyTouch", page: "xtoytouch" },
      { href: "/seguranca-download", label: "Segurança do download", page: "seguranca-download" },
    ],
  },
  {
    label: "Suporte e informações",
    items: [
      { href: "/reportar-bugs", label: "Reportar problema", page: "reportar-bugs" },
      { href: DISCORD_URL, label: "Discord", external: true },
      { href: "/privacidade", label: "Privacidade", page: "privacidade" },
      { href: "/termos", label: "Termos de Uso", page: "termos" },
    ],
  },
] as const;

type MenuItem = { href: string; label: string; page?: XtPage; external?: boolean };

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SiteShell({ page, children }: { page: XtPage; children: ReactNode }) {
  const { theme, toggle } = useXtTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const appRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLImageElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  /* Menu: inert quando fechado, trava a rolagem, Esc fecha e o foco fica preso dentro. */
  useEffect(() => {
    const menu = menuRef.current;
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (!menuOpen) return;

    const focusTimer = window.setTimeout(() => menu?.querySelector<HTMLElement>("a")?.focus(), 60);
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

  /* Rolagem: vidro do cabeçalho, barra de progresso, paralaxe da arte e destaque da seção atual. */
  useEffect(() => {
    const header = headerRef.current;
    const art = artRef.current;
    const reduce = prefersReducedMotion();
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      header?.classList.toggle("is-scrolled", y > 12);
      header?.style.setProperty("--xt-p", max > 0 ? Math.min(1, y / max).toFixed(4) : "0");
      if (art && !reduce && y < 1000) art.style.transform = `translate3d(0, ${(y * 0.14).toFixed(1)}px, 0)`;
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

  /* Entrada suave das seções e destaque da captura de tela atual nas galerias. */
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
          // Depois da animação, devolve o elemento ao estado normal (hover e transições próprias).
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
        (entries) =>
          entries.forEach((entry) => entry.target.classList.toggle("is-current", entry.intersectionRatio > 0.6)),
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

  /* Transição entre páginas: esmaece a atual antes de navegar. Downloads e arquivos seguem normais. */
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
    // Ao voltar pelo histórico a página pode vir do cache já esmaecida.
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
      <div className="xt-art" aria-hidden="true">
        <img ref={artRef} src={logoArt} width={1500} height={944} alt="" decoding="async" />
      </div>

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
              <svg className="xt-i xt-burger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
                <line className="a" x1="5" y1="9" x2="19" y2="9" />
                <line className="b" x1="5" y1="15" x2="19" y2="15" />
              </svg>
            </button>
          </div>
        </div>
        <i className="xt-progress" aria-hidden="true" />
      </header>

      <div className="xt-scrim" onClick={closeMenu} />
      <nav ref={menuRef} className="xt-menu" id="xt-menu" aria-label="Menu" inert={!menuOpen}>
        {MENU_GROUPS.map((group, groupIndex) => (
          <div key={group.label}>
            <p className="xt-menu__label" style={{ "--k": groupIndex * 4 } as CSSProperties}>
              {group.label}
            </p>
            <ul>
              {(group.items as readonly MenuItem[]).map((item, itemIndex) => (
                <li key={item.label} style={{ "--k": groupIndex * 4 + itemIndex + 1 } as CSSProperties}>
                  <a
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={item.page === page ? "page" : undefined}
                    {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    {item.label}
                    <ChevronRight className="xt-i" />
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

export function SiteFooter() {
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
            <a href="/reportar-bugs">Reportar problema</a>
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

export function PageHead({ title, lede }: { title: string; lede?: string }) {
  return (
    <div className="xt-phead">
      <a className="xt-crumb" href="/">
        <ChevronRight />
        Início
      </a>
      <h1>{title}</h1>
      {lede ? <p className="xt-lede">{lede}</p> : null}
    </div>
  );
}
