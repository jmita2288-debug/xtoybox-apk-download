import { useEffect, useState } from "react";

export type XtTheme = "light" | "dark";

// Mantém as chaves já usadas pelo site para não perder a escolha dos visitantes.
const THEME_KEYS = ["xtoybox-home-theme", "xtoybox-theme"] as const;

function readTheme(): XtTheme {
  try {
    for (const key of THEME_KEYS) {
      const saved = window.localStorage.getItem(key);
      if (saved === "light" || saved === "dark") return saved;
    }
  } catch {
    // Storage indisponível: usa o tema padrão.
  }
  return "dark";
}

export function useXtTheme() {
  const [theme, setTheme] = useState<XtTheme>(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "light" ? "#f4f7f0" : "#070b09");
    try {
      for (const key of THEME_KEYS) window.localStorage.setItem(key, theme);
    } catch {
      // A escolha continua valendo na sessão atual.
    }
  }, [theme]);

  const toggle = () => {
    const root = document.documentElement;
    root.classList.add("xt-tx");
    window.setTimeout(() => root.classList.remove("xt-tx"), 450);
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return { theme, toggle };
}
