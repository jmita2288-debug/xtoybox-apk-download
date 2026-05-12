import { createFileRoute } from "@tanstack/react-router";
import logo from "@/assets/logo-xtoybox.png";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <img src={logo} alt="XTOYBOX" className="h-9 w-9 rounded-md object-cover" />
          <span className="text-base font-semibold tracking-wide">XTOYBOX</span>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pt-16 pb-20 text-center">
        <img
          src={logo}
          alt="Logo XTOYBOX"
          className="mx-auto h-40 w-40 rounded-2xl object-cover shadow-lg"
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
            href="#download-apk"
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
