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
import {
  Download,
  Menu as MenuIcon,
  Package,
  Calendar,
  HardDrive,
  Sparkles,
  Tv,
  Smartphone,
  Cloud,
  Type,
  ShieldAlert,
  Info,
} from "lucide-react";

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
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="XTOYBOX"
              className="h-9 w-9 rounded-lg object-cover ring-1 ring-border/70"
            />
            <span className="text-base font-semibold tracking-wide">XTOYBOX</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                ref={menuTriggerRef}
                type="button"
                aria-label="Abrir menu"
                className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-card/40 px-3 py-1.5 text-sm text-muted-foreground transition-[color,background-color,border-color] duration-200 hover:text-foreground hover:bg-card hover:border-border"
              >
                <MenuIcon className="h-4 w-4" />
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
      <section
        className="relative overflow-hidden"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <div className="mx-auto max-w-3xl px-6 pt-16 pb-16 text-center sm:pt-20 sm:pb-20">
          <div className="animate-fade-up">
            <img
              src={logo}
              alt="Logo XTOYBOX"
              className="mx-auto h-24 w-24 rounded-2xl object-cover ring-1 ring-border/70"
              style={{ boxShadow: "var(--shadow-glow)" }}
            />
            <h1 className="mt-7 text-4xl font-semibold tracking-tight sm:text-5xl">
              XTOYBOX
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              App Android para jogar na nuvem.
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground/80">
              Projeto independente baseado no XStreaming.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="/api/download"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
                style={{ boxShadow: "var(--shadow-glow)" }}
              >
                <Download className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                Baixar APK
              </a>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="rounded-full border border-border/70 bg-card/40 px-3 py-1">
                  v{apkMetadata.versionName}
                </span>
                <span className="rounded-full border border-border/70 bg-card/40 px-3 py-1">
                  {apkMetadata.apkSizeFormatted ?? "Tamanho indisponível"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div
          className="rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-8"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-background/50 text-primary">
              <Info className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-semibold">Sobre o app</h2>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            O XTOYBOX é uma versão modificada do XStreaming, com ajustes na interface,
            navegação e experiência de uso no Android, celular e TV Box.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-border/70 bg-background/40 px-3 py-1 text-muted-foreground">
              Android
            </span>
            <span className="rounded-full border border-border/70 bg-background/40 px-3 py-1 text-muted-foreground">
              TV Box
            </span>
            <span className="rounded-full border border-border/70 bg-background/40 px-3 py-1 text-muted-foreground">
              Open source
            </span>
          </div>
        </div>
      </section>

      {/* Carrossel de telas */}
      <section className="mx-auto max-w-5xl px-6 py-12">
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
          <CarouselContent className="-ml-4 py-2">
            {screens.map((s, i) => (
              <CarouselItem
                key={s.alt}
                className="pl-4 basis-full sm:basis-1/2 md:basis-1/3"
              >
                <div
                  className={`group overflow-hidden rounded-2xl border bg-card transition-all duration-300 ${
                    activeSlide === i
                      ? "border-primary/30"
                      : "border-border/60 sm:opacity-80"
                  }`}
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="aspect-[9/19] w-full overflow-hidden bg-background/40">
                    <img
                      src={s.src}
                      alt={s.alt}
                      loading="lazy"
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-2 h-10 w-10 border-border/70 bg-card/80 text-foreground backdrop-blur hover:bg-card" />
          <CarouselNext className="hidden sm:flex -right-2 h-10 w-10 border-border/70 bg-card/80 text-foreground backdrop-blur hover:bg-card" />
        </Carousel>
        <div className="mt-5 flex justify-center gap-2">
          {screens.map((s, i) => (
            <button
              key={s.alt}
              type="button"
              aria-label={`Ir para slide ${i + 1}`}
              onClick={() => carouselApi?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeSlide === i ? "w-6 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Recursos */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="text-2xl font-semibold">Recursos</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            { title: "Textos ajustados", text: "Menus mais claros e diretos.", Icon: Type },
            { title: "Interface ajustada", text: "Visual mais limpo e organizado.", Icon: Sparkles },
            { title: "Jogos na nuvem", text: "Acesso aos jogos compatíveis.", Icon: Cloud },
            { title: "Android e TV Box", text: "Pensado para telas pequenas e grandes.", Icon: Tv },
          ].map(({ title, text, Icon }) => (
            <div
              key={title}
              className="group rounded-xl border border-border/70 bg-card/60 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-card"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background/50 text-primary transition-colors duration-200 group-hover:border-primary/40">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Aviso */}
      {/* Aviso */}
      <section className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-start gap-4 rounded-xl border border-border/70 bg-card/50 p-5 text-sm leading-relaxed text-muted-foreground">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background/50 text-primary/80">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <p>
            <span className="font-medium text-foreground">Projeto independente.</span>{" "}
            O XTOYBOX é baseado no XStreaming e não possui vínculo, parceria ou afiliação
            com Xbox, Microsoft ou marcas relacionadas.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-8">
        <h2 className="text-2xl font-semibold">Perguntas frequentes</h2>
        <div className="mt-5 divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-card/50">
          {[
            {
              q: "Como instalar o APK?",
              a: "Baixe o arquivo pelo botão acima, abra-o no Android e siga as instruções de instalação.",
            },
            {
              q: "Funciona em quais dispositivos?",
              a: "Android em celulares e TV Box. Não há versão para iOS, PC ou consoles.",
            },
            {
              q: "Por que pede permissão de fontes desconhecidas?",
              a: "O Android exige essa permissão para instalar APKs fora da Play Store. Pode ser desativada depois.",
            },
          ].map((item) => (
            <details key={item.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-foreground transition-colors hover:bg-card">
                <span>{item.q}</span>
                <span className="text-muted-foreground transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Download */}
      <section
        className="mx-auto max-w-3xl px-6 py-12"
        data-apk-version={apkMetadata.versionName}
        data-apk-version-code={apkMetadata.versionCode}
        data-apk-downloads={apkMetadata.downloadsTotal ?? ""}
        data-apk-size={apkMetadata.apkSizeFormatted ?? ""}
        data-apk-updated-at={apkMetadata.lastUpdated ?? ""}
        data-apk-metadata-source={apkMetadata.source}
      >
        <div
          className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={logo}
                alt="XTOYBOX"
                className="h-14 w-14 rounded-xl object-cover ring-1 ring-border/70"
              />
              <div>
                <div className="text-base font-semibold">XTOYBOX APK</div>
                <div className="text-sm text-muted-foreground">
                  Versão v{apkMetadata.versionName}
                </div>
              </div>
            </div>
            <span className="hidden rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:inline-block">
              Android
            </span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Versão",
                value: `v${apkMetadata.versionName}`,
                Icon: Package,
              },
              {
                label: "Downloads",
                value:
                  apkMetadata.downloadsTotal != null
                    ? apkMetadata.downloadsTotal.toLocaleString("pt-BR")
                    : "Indisponível",
                Icon: Download,
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
                Icon: Calendar,
              },
              {
                label: "Tamanho",
                value: apkMetadata.apkSizeFormatted ?? "Indisponível",
                Icon: HardDrive,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border/70 bg-background/60 p-3 transition-colors duration-200 hover:border-border hover:bg-background/80"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <stat.Icon className="h-4 w-4 text-primary/80" />
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
            className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] sm:w-auto"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <Download className="h-5 w-5 transition-transform duration-200 group-hover:translate-y-0.5" />
            Baixar APK
          </a>
          <p className="mt-4 text-xs text-muted-foreground">
            Depois de baixar, talvez seja necessário permitir a instalação de fontes desconhecidas
            no Android.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-6 border-t border-border/60">
        <div className="mx-auto max-w-5xl px-6 py-8 text-center text-sm text-muted-foreground">
          XTOYBOX — projeto independente baseado em software open source.
        </div>
      </footer>
    </div>
  );
}
