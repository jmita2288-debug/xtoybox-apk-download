import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/logo-xtoybox.png";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [creditsOpen, setCreditsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!creditsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCreditsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [creditsOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="XTOYBOX" className="h-9 w-9 rounded-md object-cover" />
            <span className="text-base font-semibold tracking-wide">XTOYBOX</span>
          </div>
          <button
            type="button"
            onClick={() => setCreditsOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-card/40 px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground hover:bg-card"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
              <circle cx="12" cy="8" r="3.2" strokeWidth="1.8" />
              <path d="M5 20c1.2-3.4 4-5 7-5s5.8 1.6 7 5" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Créditos
          </button>
        </div>
      </header>

      {creditsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4"
          onClick={() => setCreditsOpen(false)}
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Informações</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Créditos do projeto e contato para reportar bugs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreditsOpen(false)}
                aria-label="Fechar"
                className="rounded-md p-1 text-muted-foreground transition hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
                  <path d="M6 6l12 12M18 6L6 18" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="mt-5 space-y-4">
              <section className="rounded-lg border border-border/70 bg-background/40 p-4">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground/90">
                  Créditos
                </h4>
                <div className="mt-3 space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <p>XTOYBOX é baseado no projeto open source XStreaming.</p>
                  <p>
                    Copyright (c) 2024 Geocld.
                    <br />
                    Licenciado sob a licença MIT.
                  </p>
                  <p>
                    Modificações, melhorias de interface, ajustes de sistema e otimizações por
                    Alexandreios.
                  </p>
                  <p>
                    Este é um projeto não oficial, sem vínculo com Xbox, Microsoft ou qualquer
                    serviço oficial relacionado.
                  </p>
                </div>
              </section>
              <section className="rounded-lg border border-border/70 bg-background/40 p-4">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground/90">
                  Reportar bugs
                </h4>
                <p className="mt-3 text-sm text-muted-foreground">
                  Para reportar bugs ou tirar dúvidas, entre em contato pelo Discord:
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-primary">
                    <path d="M19.5 5.3A17 17 0 0015.4 4l-.2.4a15.6 15.6 0 00-6.4 0L8.6 4a17 17 0 00-4.1 1.3A17.7 17.7 0 002 17.5a17.1 17.1 0 005.2 2.6l.4-.6a12 12 0 01-1.9-.9l.4-.3a12.2 12.2 0 0011.8 0l.4.3c-.6.4-1.2.7-1.9.9l.4.6a17.1 17.1 0 005.2-2.6 17.6 17.6 0 00-2.5-12.2zM9.3 15.1c-1 0-1.9-.9-1.9-2.1 0-1.1.8-2.1 1.9-2.1s1.9 1 1.9 2.1c0 1.2-.8 2.1-1.9 2.1zm5.4 0c-1 0-1.9-.9-1.9-2.1 0-1.1.8-2.1 1.9-2.1s1.9 1 1.9 2.1c0 1.2-.8 2.1-1.9 2.1z" />
                  </svg>
                  <span className="font-mono text-foreground">@alex690920</span>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pt-16 pb-20 text-center">
        <img
          src={logo}
          alt="Logo XTOYBOX"
          className="mx-auto h-28 w-28 rounded-2xl object-cover shadow-lg"
        />
        <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">XTOYBOX</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          App Android para jogar na nuvem.
        </p>
        <p className="mt-2 text-sm text-muted-foreground/80">
          Projeto independente baseado no XStreaming.
        </p>
      </section>

      {/* Sobre */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        <h2 className="text-2xl font-semibold">Sobre o app</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          O XTOYBOX é uma versão modificada do XStreaming, com ajustes na interface, navegação e
          experiência de uso no Android, celular e TV Box.
        </p>
      </section>

      {/* Recursos */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="text-2xl font-semibold">Recursos</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Textos ajustados",
              text: "Menus mais claros e diretos.",
              icon: (
                <path d="M4 5h16M4 12h16M4 19h10" strokeWidth="2" strokeLinecap="round" />
              ),
            },
            {
              title: "Interface ajustada",
              text: "Visual mais limpo e organizado.",
              icon: (
                <path d="M4 6h16v4H4zM4 14h10v4H4z" strokeWidth="2" strokeLinejoin="round" />
              ),
            },
            {
              title: "Jogos na nuvem",
              text: "Acesso aos jogos compatíveis.",
              icon: (
                <path
                  d="M7 18a4 4 0 010-8 5 5 0 019.6-1.5A4 4 0 0117 18H7z"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              ),
            },
            {
              title: "Android e TV Box",
              text: "Pensado para telas pequenas e grandes.",
              icon: (
                <path
                  d="M3 7h14v8H3zM17 9h4v4h-4zM7 19v-4M13 19v-4"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ),
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-xl border border-border bg-card p-5"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-6 w-6 text-primary"
              >
                {c.icon}
              </svg>
              <h3 className="mt-4 font-medium">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Aviso */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-lg border border-border/80 bg-card/60 p-5 text-sm text-muted-foreground">
          XTOYBOX é um projeto independente baseado no XStreaming. Não possui vínculo, parceria ou
          afiliação com Xbox, Microsoft ou marcas relacionadas.
        </div>
      </section>

      {/* Download */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="XTOYBOX"
              className="h-14 w-14 rounded-lg object-cover"
            />
            <div>
              <div className="font-medium">XTOYBOX APK</div>
              <div className="text-sm text-muted-foreground">Versão v1.0.5</div>
            </div>
          </div>
          <a
            href="https://github.com/jmita2288-debug/XTOYBOX/releases/download/xtoybox-v1.0.5-latest/XTOYBOX-v1.0.5.apk"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:opacity-90 sm:w-auto"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M7.5 10.5a1 1 0 00-1 1v5a1 1 0 102 0v-5a1 1 0 00-1-1zm9 0a1 1 0 00-1 1v5a1 1 0 102 0v-5a1 1 0 00-1-1zM8 18.5a1.5 1.5 0 003 0V19h2v-.5a1.5 1.5 0 003 0V11H8v7.5zM5.5 7.7l-.9-1.6a.4.4 0 01.7-.4l.9 1.7A6.5 6.5 0 0112 6c1.4 0 2.7.3 3.8.9l.9-1.7a.4.4 0 01.7.4l-.9 1.6A5.7 5.7 0 0119 12H5a5.7 5.7 0 01.5-4.3zM9 9.5a.6.6 0 100-1.2.6.6 0 000 1.2zm6 0a.6.6 0 100-1.2.6.6 0 000 1.2z" />
            </svg>
            Baixar APK
          </a>
          <p className="mt-4 text-xs text-muted-foreground">
            Depois de baixar, talvez seja necessário permitir a instalação de fontes desconhecidas
            no Android.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-border/60">
        <div className="mx-auto max-w-5xl px-6 py-8 text-center text-sm text-muted-foreground">
          XTOYBOX — projeto independente baseado em software open source.
        </div>
      </footer>
    </div>
  );
}
