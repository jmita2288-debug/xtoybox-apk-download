import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/logo-xtoybox.png";
import screenHome from "@/assets/screens/home.png";
import screenLibrary from "@/assets/screens/library.png";
import screenGame from "@/assets/screens/game.png";
import screenFriends from "@/assets/screens/friends.png";
import screenProfile from "@/assets/screens/profile.png";
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

export const Route = createFileRoute("/")({
  component: Index,
});

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

const DISCORD_URL = "https://discord.gg/SEU-LINK-AQUI";

const screens = [
  { src: screenHome, alt: "Tela inicial do XTOYBOX" },
  { src: screenLibrary, alt: "Biblioteca de jogos" },
  { src: screenGame, alt: "Detalhes do jogo" },
  { src: screenFriends, alt: "Lista de amigos" },
  { src: screenProfile, alt: "Perfil do usuário" },
];

type InfoSection = "credits" | "discord" | "terms";

export function Index() {
  const [infoOpen, setInfoOpen] = useState<InfoSection | null>(null);
  const [apkMetadata, setApkMetadata] = useState<ApkMetadata>(() => createFallbackApkMetadata());
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const autoplayRef = useRef(
    Autoplay({ delay: 4500, stopOnInteraction: true, stopOnMouseEnter: true }),
  );

  useEffect(() => {
    let active = true;

    fetchApkMetadata()
      .then((metadata) => {
        if (!active) return;
        setApkMetadata(metadata);
      })
      .catch(() => {
        // Mantém o fallback para não quebrar o botão caso latest.json ou GitHub falhem.
      });

    return () => {
      active = false;
    };
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInfoOpen(null);
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="XTOYBOX" className="h-9 w-9 rounded-md object-cover" />
            <span className="text-base font-semibold tracking-wide">XTOYBOX</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                ref={menuTriggerRef}
                type="button"
                aria-label="Abrir menu"
                className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-card/40 px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground hover:bg-card"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
                  <path d="M4 7h16M4 12h16M4 17h16" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <span className="hidden sm:inline">Menu</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={() => setInfoOpen("credits")}>
                Créditos
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setInfoOpen("discord")}>
                Discord / Suporte
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setInfoOpen("terms")}>
                Termos de uso
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {infoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4"
          onClick={() => setInfoOpen(null)}
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {infoOpen === "credits" && "Créditos"}
                  {infoOpen === "discord" && "Suporte e bugs"}
                  {infoOpen === "terms" && "Termos de uso"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {infoOpen === "credits" && "Informações sobre o projeto."}
                  {infoOpen === "discord" && "Tire dúvidas ou reporte bugs."}
                  {infoOpen === "terms" && "Leia antes de instalar."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInfoOpen(null)}
                aria-label="Fechar"
                className="rounded-md p-1 text-muted-foreground transition hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
                  <path d="M6 6l12 12M18 6L6 18" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="mt-5 max-h-[65vh] overflow-y-auto rounded-lg border border-border/70 bg-background/40 p-4 text-sm text-muted-foreground leading-relaxed">
              {infoOpen === "credits" && (
                <div className="space-y-3">
                  <p>XTOYBOX é baseado no projeto open source XStreaming.</p>
                  <p>Copyright (c) 2024 Geocld.</p>
                  <p>Licenciado sob a licença MIT.</p>
                  <p>Modificações, melhorias e otimizações por Alexandreios (XTOYBOX).</p>
                  <p>Projeto não oficial, sem vínculo com Xbox ou Microsoft.</p>
                </div>
              )}
              {infoOpen === "discord" && (
                <div className="space-y-4">
                  <p>
                    Use o Discord para tirar dúvidas, reportar bugs ou acompanhar avisos do
                    projeto.
                  </p>
                  <a
                    href={DISCORD_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:opacity-90"
                  >
                    Entrar no Discord
                  </a>
                </div>
              )}
              {infoOpen === "terms" && (
                <div className="space-y-3">
                  <p>
                    O XTOYBOX é um projeto independente baseado em software open source. Ele não
                    possui vínculo, parceria ou afiliação com Xbox, Microsoft ou qualquer marca
                    relacionada.
                  </p>
                  <p>
                    O aplicativo é distribuído como APK externo, fora de lojas oficiais. Antes de
                    instalar ou inserir sua conta no aplicativo, o usuário deve entender que esse
                    tipo de instalação exige cuidado.
                  </p>
                  <p>
                    Não é possível prometer 100% de segurança em um APK externo. Use apenas
                    versões baixadas pelo site oficial do projeto e verifique se está usando a
                    versão mais recente.
                  </p>
                  <p>
                    Ao usar o XTOYBOX, o usuário entende esses pontos e assume a responsabilidade
                    pelo uso do aplicativo.
                  </p>
                </div>
              )}
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

      {/* Carrossel de telas */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Telas do app</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Uma prévia da interface no Android.
            </p>
          </div>
        </div>
        <Carousel
          opts={{ loop: true, align: "center" }}
          plugins={[autoplayRef.current]}
          setApi={setCarouselApi}
          className="relative"
        >
          <CarouselContent className="-ml-4">
            {screens.map((s) => (
              <CarouselItem
                key={s.alt}
                className="pl-4 basis-4/5 sm:basis-1/2 md:basis-1/3"
              >
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-primary/5">
                  <img
                    src={s.src}
                    alt={s.alt}
                    loading="lazy"
                    className="h-[420px] w-full object-cover object-top sm:h-[460px]"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-4" />
          <CarouselNext className="hidden sm:flex -right-4" />
        </Carousel>
        <div className="mt-5 flex justify-center gap-2">
          {screens.map((s, i) => (
            <button
              key={s.alt}
              type="button"
              aria-label={`Ir para slide ${i + 1}`}
              onClick={() => carouselApi?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                activeSlide === i ? "w-6 bg-primary" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Recursos */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="text-2xl font-semibold">Recursos</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            { title: "Textos ajustados", text: "Menus mais claros e diretos." },
            { title: "Interface ajustada", text: "Visual mais limpo e organizado." },
            { title: "Jogos na nuvem", text: "Acesso aos jogos compatíveis." },
            { title: "Android e TV Box", text: "Pensado para telas pequenas e grandes." },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-medium">{c.title}</h3>
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
      <section
        className="mx-auto max-w-3xl px-6 py-10"
        data-apk-version={apkMetadata.versionName}
        data-apk-version-code={apkMetadata.versionCode}
        data-apk-downloads={apkMetadata.downloadsTotal ?? ""}
        data-apk-size={apkMetadata.apkSizeFormatted ?? ""}
        data-apk-updated-at={apkMetadata.lastUpdated ?? ""}
        data-apk-metadata-source={apkMetadata.source}
      >
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="XTOYBOX"
              className="h-14 w-14 rounded-lg object-cover"
            />
            <div>
              <div className="font-medium">XTOYBOX APK</div>
              <div className="text-sm text-muted-foreground">
                Versão v{apkMetadata.versionName}
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Versão",
                value: `v${apkMetadata.versionName}`,
                icon: (
                  <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" strokeWidth="1.6" strokeLinejoin="round" />
                ),
              },
              {
                label: "Downloads",
                value:
                  apkMetadata.downloadsTotal != null
                    ? apkMetadata.downloadsTotal.toLocaleString("pt-BR")
                    : "Indisponível",
                icon: (
                  <>
                    <path d="M12 3v12m0 0l-4-4m4 4l4-4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeWidth="1.8" strokeLinecap="round" />
                  </>
                ),
              },
              {
                label: "Atualizado",
                value: apkMetadata.lastUpdated
                  ? new Date(apkMetadata.lastUpdated).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Indisponível",
                icon: (
                  <>
                    <rect x="3" y="5" width="18" height="16" rx="2" strokeWidth="1.6" />
                    <path d="M3 9h18M8 3v4M16 3v4" strokeWidth="1.6" strokeLinecap="round" />
                  </>
                ),
              },
              {
                label: "Tamanho",
                value: apkMetadata.apkSizeFormatted ?? "Indisponível",
                icon: (
                  <>
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M7 10l5 5 5-5M12 15V3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </>
                ),
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border/70 bg-background/40 p-3"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
                    {stat.icon}
                  </svg>
                  <span className="text-[11px] uppercase tracking-wide">{stat.label}</span>
                </div>
                <div className="mt-1.5 truncate text-sm font-medium text-foreground">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
          <a
            href="/api/download"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:opacity-90 sm:w-auto"
          >
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
