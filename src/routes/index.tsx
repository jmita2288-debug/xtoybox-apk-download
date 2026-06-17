import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/logo-xtoybox.png";
import screenHome from "@/assets/screens/home.png";
import screenLibrary from "@/assets/screens/library.png";
import screenGame from "@/assets/screens/game.png";
import screenFriends from "@/assets/screens/friends.png";
import screenProfile from "@/assets/screens/profile.png";
import screenForza1 from "@/assets/screens/gameplay-forza-1.jpeg";
import screenForza2 from "@/assets/screens/gameplay-forza-2.jpeg";
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
  Tv,
  Smartphone,
  Cloud,
  Info,
  Heart,
  Bug,
  FileText,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const XTOYBOX_COMMUNITY_URL = "https://discord.gg/abh27Dwktt";

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

type ScreenOrientation = "portrait" | "landscape";

const screens: { src: string; alt: string; orientation: ScreenOrientation }[] = [
  { src: screenHome, alt: "Tela inicial do XTOYBOX", orientation: "portrait" },
  { src: screenLibrary, alt: "Biblioteca de jogos", orientation: "portrait" },
  { src: screenForza1, alt: "Jogando Forza Horizon na nuvem", orientation: "landscape" },
  { src: screenGame, alt: "Detalhes do jogo", orientation: "portrait" },
  { src: screenForza2, alt: "Controles em tela durante o jogo", orientation: "landscape" },
  { src: screenFriends, alt: "Lista de amigos", orientation: "portrait" },
  { src: screenProfile, alt: "Perfil do usuário", orientation: "portrait" },
];

type InfoSection = "credits" | "terms" | "about";

type IconProps = {
  className?: string;
};

function DiscordIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 127.14 96.36"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
      className={className}
    >
      <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0 105.89 105.89 0 0 0 19.39 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1A105.25 105.25 0 0 0 126.6 80.22C129.24 52.84 122.09 29.11 107.7 8.07ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53 48.84 65.69 42.45 65.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53 91.08 65.69 84.69 65.69Z" />
    </svg>
  );
}

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
    screens.forEach((s) => {
      const img = new Image();
      img.decoding = "async";
      img.src = s.src;
    });
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
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        />
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={logo}
                alt="XTOYBOX"
                className="h-9 w-9 rounded-lg object-cover ring-1 ring-border/70"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-lg bg-primary/15 blur-md"
              />
            </div>
            <span className="text-sm font-semibold tracking-wide sm:text-base">XTOYBOX</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                ref={menuTriggerRef}
                type="button"
                aria-label="Abrir menu"
                className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-card/45 px-3 py-1.5 text-sm text-muted-foreground transition-[color,background-color,border-color] duration-200 hover:border-border hover:bg-card hover:text-foreground"
              >
                <MenuIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Menu</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-3 pt-2 pb-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                  Menu
                </p>
              </div>
              <DropdownMenuItem onSelect={() => setInfoOpen("about")} className="gap-3 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
                  <Info className="h-4 w-4" />
                </span>
                <span className="flex flex-col leading-tight">
                  <span>Sobre o app</span>
                  <span className="text-xs font-normal text-muted-foreground">O que é o XTOYBOX</span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setInfoOpen("credits")} className="gap-3 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
                  <Heart className="h-4 w-4" />
                </span>
                <span className="flex flex-col leading-tight">
                  <span>Créditos</span>
                  <span className="text-xs font-normal text-muted-foreground">Quem torna isso possível</span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="gap-3 py-2.5">
                <Link to="/reportar-bugs">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
                    <Bug className="h-4 w-4" />
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span>Reportar bugs</span>
                    <span className="text-xs font-normal text-muted-foreground">Encontrou um problema?</span>
                  </span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setInfoOpen("terms")} className="gap-3 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                </span>
                <span className="flex flex-col leading-tight">
                  <span>Termos de uso</span>
                  <span className="text-xs font-normal text-muted-foreground">Regras e condições</span>
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {infoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 px-4"
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
                  {infoOpen === "about" && "Sobre o app"}
                  {infoOpen === "credits" && "Créditos"}
                  {infoOpen === "terms" && "Termos de uso"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {infoOpen === "about" && "Conheça a base e o objetivo do projeto."}
                  {infoOpen === "credits" && "Informações sobre a origem do projeto."}
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
            <div className="mt-5 max-h-[65vh] overflow-y-auto rounded-lg border border-border/70 bg-background/40 p-4 text-sm leading-relaxed text-muted-foreground">
              {infoOpen === "about" && (
                <div className="space-y-3">
                  <p>
                    XTOYBOX é um app Android criado a partir de uma base open source, com
                    modificações próprias para jogar na nuvem em celulares e TV Box.
                  </p>
                  <p>
                    O projeto reúne ajustes de navegação, organização da biblioteca, melhorias no
                    streaming e suporte otimizado para uma experiência mais estável.
                  </p>
                  <p>
                    Este é um projeto independente, sem vínculo, parceria ou afiliação com Xbox,
                    Microsoft ou marcas relacionadas.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 text-xs">
                    <span className="rounded-full border border-border/70 bg-background/40 px-3 py-1">Android</span>
                    <span className="rounded-full border border-border/70 bg-background/40 px-3 py-1">TV Box</span>
                    <span className="rounded-full border border-border/70 bg-background/40 px-3 py-1">Open source</span>
                  </div>
                </div>
              )}
              {infoOpen === "credits" && (
                <div className="space-y-3">
                  <p>Base open source: XStreaming.</p>
                  <p>Copyright (c) 2024 Geocld.</p>
                  <p>Licenciado sob a licença MIT.</p>
                  <p>Modificações e otimizações por Alexandreios (XTOYBOX).</p>
                </div>
              )}
              {infoOpen === "terms" && (
                <div className="space-y-3">
                  <p>
                    O aplicativo é distribuído como APK externo, fora de lojas oficiais. Antes de
                    instalar, entenda que esse tipo de instalação exige cuidado.
                  </p>
                  <p>Baixe apenas pelo site oficial do projeto e use sempre a versão mais recente.</p>
                  <p>Nenhum APK externo deve ser tratado como risco zero. Use por sua conta.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <section className="relative overflow-hidden" style={{ backgroundImage: "var(--gradient-hero)" }}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <img
            src={logo}
            alt=""
            className="h-[420px] w-[420px] max-w-none select-none opacity-[0.035] blur-2xl sm:h-[560px] sm:w-[560px]"
          />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />
        <div className="mx-auto max-w-3xl px-6 pt-16 pb-16 text-center sm:pt-20 sm:pb-20">
          <div className="relative animate-fade-up">
            <div className="relative mx-auto h-20 w-20">
              <span aria-hidden="true" className="absolute inset-0 -z-10 rounded-2xl bg-primary/20 blur-2xl" />
              <img
                src={logo}
                alt="Logo XTOYBOX"
                className="h-20 w-20 rounded-2xl object-cover ring-1 ring-border/70"
                style={{ boxShadow: "var(--shadow-glow)" }}
              />
            </div>
            <div className="mt-5 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                Disponível para Android
              </span>
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">XTOYBOX</h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              App Android para jogar na nuvem, com foco em celular e TV Box.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="/api/download"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
                style={{ boxShadow: "var(--shadow-glow)" }}
              >
                <Download className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                Baixar APK
              </a>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="rounded-full border border-border/70 bg-card/45 px-3 py-1">
                  v{apkMetadata.versionName}
                </span>
                <span className="rounded-full border border-border/70 bg-card/45 px-3 py-1">
                  {apkMetadata.apkSizeFormatted ?? "Tamanho indisponível"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">Galeria</span>
            <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">Telas do app</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Uma prévia do uso no Android.</p>
          </div>
        </div>
        <Carousel
          opts={{ loop: true, align: "center", duration: 30, dragFree: false }}
          plugins={[autoplayRef.current]}
          setApi={setCarouselApi}
          className="relative"
        >
          <CarouselContent className="-ml-4 py-4">
            {screens.map((s, i) => (
              <CarouselItem
                key={s.alt}
                className={`pl-4 basis-full ${
                  s.orientation === "landscape" ? "sm:basis-full md:basis-2/3" : "sm:basis-1/2 md:basis-1/3"
                }`}
              >
                <div
                  className={`group relative mx-auto w-full overflow-hidden rounded-2xl border bg-card transition-all duration-500 ease-out sm:max-w-none ${
                    s.orientation === "landscape" ? "max-w-full" : "max-w-[280px]"
                  } ${activeSlide === i ? "scale-100 border-primary/35 opacity-100" : "border-border/60 sm:scale-[0.94] sm:opacity-65"}`}
                  style={{ boxShadow: activeSlide === i ? "var(--shadow-glow), var(--shadow-card)" : "var(--shadow-card)" }}
                >
                  <div
                    className={`flex w-full items-center justify-center overflow-hidden bg-background/40 ${
                      s.orientation === "landscape" ? "aspect-video" : "aspect-[941/1672]"
                    }`}
                  >
                    <img
                      src={s.src}
                      sizes="(min-width: 768px) 320px, (min-width: 640px) 45vw, 280px"
                      alt={s.alt}
                      loading={i === 0 ? "eager" : "lazy"}
                      fetchPriority={i === activeSlide ? "high" : "auto"}
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    />
                  </div>
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-3 h-11 w-11 rounded-full border-border/70 bg-card/85 text-foreground shadow-lg backdrop-blur transition-all hover:scale-105 hover:border-primary/35 hover:bg-card" />
          <CarouselNext className="hidden sm:flex -right-3 h-11 w-11 rounded-full border-border/70 bg-card/85 text-foreground shadow-lg backdrop-blur transition-all hover:scale-105 hover:border-primary/35 hover:bg-card" />
        </Carousel>
        <div className="mt-5 flex justify-center gap-2">
          {screens.map((s, i) => (
            <button
              key={s.alt}
              type="button"
              aria-label={`Ir para slide ${i + 1}`}
              onClick={() => carouselApi?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === i ? "w-6 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/40"}`}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="mb-7">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">Destaques</span>
          <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">Recursos</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">O que torna o XTOYBOX uma boa escolha.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { title: "Base open source", text: "Construído sobre uma base aberta, com modificações próprias.", Icon: Package },
            { title: "Jogos na nuvem", text: "Acesso aos jogos compatíveis direto pelo Android.", Icon: Cloud },
            { title: "Celular e TV Box", text: "Uso pensado para telas pequenas e grandes.", Icon: Tv },
            { title: "Atualizações diretas", text: "Novas versões e correções pelo site oficial.", Icon: Smartphone },
          ].map(({ title, text, Icon }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-xl border border-border/70 bg-card/65 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-card"
            >
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background/60 text-primary transition-all duration-300 group-hover:border-primary/35 group-hover:bg-primary/10">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="comunidade" className="mx-auto max-w-5xl px-6 py-10 sm:py-12">
        <div className="rounded-2xl border border-border/70 bg-card/70 p-6 sm:p-7" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#5865F2]/20 bg-[#5865F2]/10 text-[#8b95ff]">
                <DiscordIcon className="h-5 w-7" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/75">Suporte e comunidade</span>
                <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Discord do XTOYBOX</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Entre para tirar dúvidas, acompanhar avisos, reportar bugs e enviar feedbacks sobre o app.
                </p>
              </div>
            </div>
            <a
              href={XTOYBOX_COMMUNITY_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#5865F2]/25 bg-[#5865F2]/10 px-5 py-3 text-sm font-semibold text-[#c4c9ff] transition-colors duration-200 hover:border-[#5865F2]/40 hover:bg-[#5865F2]/15"
            >
              <DiscordIcon className="h-4 w-6" />
              Entrar no Discord
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-6">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">Dúvidas</span>
          <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">Perguntas frequentes</h2>
        </div>
        <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-card/55">
          {[
            { q: "Como instalar o APK?", a: "Baixe o arquivo pelo botão acima, abra-o no Android e siga as instruções de instalação." },
            { q: "Funciona em quais dispositivos?", a: "Android em celulares e TV Box. Não há versão para iOS, PC ou consoles." },
            { q: "Por que pede permissão de fontes desconhecidas?", a: "O Android exige essa permissão para instalar APKs fora da Play Store. Pode ser desativada depois." },
          ].map((item) => (
            <details key={item.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-foreground transition-colors hover:bg-card">
                <span>{item.q}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180 group-open:text-primary" />
              </summary>
              <div className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      <section
        className="mx-auto max-w-3xl px-6 py-12"
        data-apk-version={apkMetadata.versionName}
        data-apk-version-code={apkMetadata.versionCode}
        data-apk-downloads={apkMetadata.downloadsTotal ?? ""}
        data-apk-size={apkMetadata.apkSizeFormatted ?? ""}
        data-apk-updated-at={apkMetadata.lastUpdated ?? ""}
        data-apk-metadata-source={apkMetadata.source}
      >
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={logo} alt="XTOYBOX" className="h-14 w-14 rounded-xl object-cover ring-1 ring-border/70" />
              <div>
                <div className="text-base font-semibold">XTOYBOX APK</div>
                <div className="text-sm text-muted-foreground">Versão v{apkMetadata.versionName}</div>
              </div>
            </div>
            <span className="hidden rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:inline-block">
              Android
            </span>
          </div>
          <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Versão", value: `v${apkMetadata.versionName}`, Icon: Package },
              {
                label: "Downloads",
                value: apkMetadata.downloadsTotal != null ? apkMetadata.downloadsTotal.toLocaleString("pt-BR") : "Indisponível",
                Icon: Download,
              },
              {
                label: "Atualizado",
                value: apkMetadata.lastUpdated
                  ? new Date(apkMetadata.lastUpdated).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
                  : "Indisponível",
                Icon: Calendar,
              },
              { label: "Tamanho", value: apkMetadata.apkSizeFormatted ?? "Indisponível", Icon: HardDrive },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border/70 bg-background/60 p-3 transition-colors duration-200 hover:border-border hover:bg-background/80">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <stat.Icon className="h-4 w-4 text-primary/80" />
                  <span className="text-[11px] uppercase tracking-wide">{stat.label}</span>
                </div>
                <div className="mt-1.5 truncate text-sm font-medium text-foreground">{stat.value}</div>
              </div>
            ))}
          </div>
          <a
            href="/api/download"
            className="group relative mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-all duration-200 hover:scale-[1.01] hover:brightness-105 active:scale-[0.99] sm:w-auto"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <Download className="h-5 w-5 transition-transform duration-200 group-hover:translate-y-0.5" />
            Baixar APK
          </a>
          <p className="relative mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            Depois de baixar, talvez seja necessário permitir a instalação de fontes desconhecidas no Android.
          </p>
        </div>
      </section>

      <footer className="relative mt-10 border-t border-border/60">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="mx-auto max-w-5xl px-6 py-10 text-center">
          <div className="flex items-center justify-center gap-2">
            <img src={logo} alt="" className="h-6 w-6 rounded-md object-cover opacity-80" />
            <span className="text-sm font-semibold tracking-wide">XTOYBOX</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            App Android baseado em open source, com desenvolvimento independente.
          </p>
        </div>
      </footer>
    </div>
  );
}
