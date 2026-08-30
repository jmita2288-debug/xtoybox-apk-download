import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Gamepad2, Moon, Sun } from "lucide-react";

type HomeTheme = "light" | "dark";

const THEME_STORAGE_KEY = "xtoybox-home-theme";

function getInitialTheme(): HomeTheme {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Continua usando a preferência do sistema.
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function ThemeSwitch({
  theme,
  onToggle,
  className = "",
}: {
  theme: HomeTheme;
  onToggle: () => void;
  className?: string;
}) {
  const dark = theme === "dark";

  return (
    <button
      type="button"
      className={`home-theme-toggle ${className}`.trim()}
      onClick={onToggle}
      aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
      aria-pressed={dark}
      title={dark ? "Modo escuro" : "Modo claro"}
    >
      <Sun className="home-theme-toggle__sun" aria-hidden="true" />
      <span className="home-theme-toggle__track" aria-hidden="true">
        <span className="home-theme-toggle__thumb" />
      </span>
      <Moon className="home-theme-toggle__moon" aria-hidden="true" />
    </button>
  );
}

export function HomeUiEnhancer() {
  const [theme, setTheme] = useState<HomeTheme>(() => getInitialTheme());
  const [headerActions, setHeaderActions] = useState<HTMLElement | null>(null);
  const [mobileNav, setMobileNav] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let animationFrame = 0;

    const syncMounts = () => {
      setHeaderActions(document.querySelector<HTMLElement>(".refined-header__actions"));
      setMobileNav(document.querySelector<HTMLElement>(".refined-mobile-nav .refined-container"));
    };

    const scheduleSync = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(syncMounts);
    };

    syncMounts();
    const observer = new MutationObserver(scheduleSync);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    const site = document.querySelector<HTMLElement>(".refined-site");
    if (!site) return;

    site.classList.toggle("refined-site--dark", theme === "dark");
    site.dataset.theme = theme;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // A preferência continua ativa nesta visita mesmo sem localStorage.
    }

    return () => {
      site.classList.remove("refined-site--dark");
      delete site.dataset.theme;
    };
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === "dark" ? "light" : "dark"));

  return (
    <>
      {headerActions &&
        createPortal(
          <ThemeSwitch theme={theme} onToggle={toggleTheme} className="home-theme-toggle--header" />,
          headerActions,
        )}

      {mobileNav &&
        createPortal(
          <>
            <a className="home-menu-xtoytouch" href="/xtoytouch">
              <span className="home-menu-xtoytouch__icon" aria-hidden="true">
                <Gamepad2 />
              </span>
              <span>
                <strong>XtoyTouch</strong>
                <small>HUD e controles para xCloud</small>
              </span>
            </a>
            <div className="home-menu-theme">
              <span>
                <strong>Aparência</strong>
                <small>{theme === "dark" ? "Modo escuro" : "Modo claro"}</small>
              </span>
              <ThemeSwitch theme={theme} onToggle={toggleTheme} className="home-theme-toggle--menu" />
            </div>
          </>,
          mobileNav,
        )}
    </>
  );
}
