import { useEffect, useState } from "react";

export type XtTheme = "light" | "dark";

// Mantém as chaves já usadas pelo site para não perder a escolha dos visitantes.
const THEME_KEYS = ["xtoybox-home-theme", "xtoybox-theme"] as const;

/** Cor da barra do navegador em cada tema (igual ao fundo da página). */
export const THEME_COLOR: Record<XtTheme, string> = { dark: "#09090a", light: "#f6f6f4" };

function readTheme(): XtTheme {
  try {
    for (const key of THEME_KEYS) {
      const saved = window.localStorage.getItem(key);
      if (saved === "light" || saved === "dark") return saved;
    }
  } catch {
    // Sem acesso ao armazenamento: segue o padrão escuro.
  }
  return "dark";
}

export function useXtTheme() {
  const [theme, setTheme] = useState<XtTheme>(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
    try {
      for (const key of THEME_KEYS) window.localStorage.setItem(key, theme);
    } catch {
      // Sem acesso ao armazenamento: o tema vale apenas nesta visita.
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
