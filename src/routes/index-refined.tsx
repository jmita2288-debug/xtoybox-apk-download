import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-xtoybox.webp";
import screenBiblioteca from "@/assets/screens/biblioteca.webp";
import screenPerfil from "@/assets/screens/perfil.webp";
import screenConquistas from "@/assets/screens/conquistas.webp";
import { fetchApkMetadata, fallbackLatestMetadata, type ApkMetadata } from "@/lib/apkMetadata";
import { DownloadButton } from "@/components/xt/DownloadButton";
import { DiscordIcon } from "@/components/xt/icons";
import { DISCORD_URL, SiteShell } from "@/components/xt/SiteChrome";

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

export function formatReleaseDate(value: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

const galleryScreens = [
  { src: screenBiblioteca, label: "Biblioteca", note: "Capas, categorias e acesso rápido.", alt: "Tela da biblioteca do XTOYBOX" },
  { src: screenPerfil, label: "Perfil", note: "Conta, conquistas e histórico.", alt: "Tela de perfil do XTOYBOX" },
  { src: screenConquistas, label: "Conquistas", note: "Pontuação e progresso por jogo.", alt: "Tela de conquistas do XTOYBOX" },
] as const;

export function RefinedIndex() {
  const [apkMetadata, setApkMetadata] = useState<ApkMetadata>(() => createFallbackApkMetadata());

  useEffect(() => {
    let active = true;
    fetchApkMetadata()
      .then((metadata) => {
        if (active) setApkMetadata(metadata);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const releaseDate = formatReleaseDate(apkMetadata.lastUpdated ?? apkMetadata.publishedAt);

  return (
    <SiteShell page="home">
      <section className="xt-hero" id="hero">
        <div className="xt-wrap xt-hero__grid">
          <div className="xt-hero__copy">
            <h1 className="xt-h1">Seu Xbox em mais telas.</h1>
            <p className="xt-lede">Remote Play do seu console e jogos compatíveis na nuvem, no Android.</p>
            <div className="xt-cta">
              <DownloadButton href="/api/download">Baixar v{apkMetadata.versionName}</DownloadButton>
              <a className="xt-link" href="#como-funciona">
                Como funciona
              </a>
            </div>
            <p className="xt-fine">
              Para celular e TV Box com Android.
              {releaseDate ? ` Atualizado em ${releaseDate}.` : ""}
            </p>
            {/* O DownloadCounter monta o total de downloads ao vivo neste elemento. */}
            <div className="xt-counter-mount refined-hero__visual" />
          </div>
          <div className="xt-device">
            <img
              src={heroImage}
              width={1200}
              height={540}
              alt="Tela de jogo no XTOYBOX com painel de desempenho e controles virtuais"
            />
          </div>
        </div>
      </section>

      <section className="xt-section" id="como-funciona" data-spy-section>
        <div className="xt-wrap">
          <h2 className="xt-h2" data-reveal>
            Duas formas de jogar
          </h2>
          <div className="xt-two">
            <article className="xt-card" data-reveal>
              <h3 className="xt-h3">Remote Play</h3>
              <p>
                Transmita o jogo do seu próprio console Xbox para o celular ou a TV Box. É preciso ter um console
                compatível.
              </p>
            </article>
            <article className="xt-card" data-reveal>
              <h3 className="xt-h3">Jogos na nuvem</h3>
              <p>
                Acesse títulos compatíveis oferecidos pelo serviço oficial da Microsoft. A disponibilidade depende da
                sua conta e da sua região.
              </p>
            </article>
          </div>
          <p className="xt-note" data-reveal>
            O XTOYBOX não opera servidores próprios de cloud gaming.
          </p>
        </div>
      </section>

      <section className="xt-section xt-section--tight" id="recursos" data-spy-section>
        <div className="xt-wrap">
          <dl className="xt-kv" style={{ marginTop: 0 }}>
            <div data-reveal>
              <dt>Plataforma</dt>
              <dd>Celular e TV Box</dd>
            </div>
            <div data-reveal>
              <dt>Controle</dt>
              <dd>Toque ou controle</dd>
            </div>
            <div data-reveal>
              <dt>Biblioteca</dt>
              <dd>Sua biblioteca do console</dd>
            </div>
            <div data-reveal>
              <dt>Verificação</dt>
              <dd>
                <a href="/seguranca-download">Release pública com SHA-256</a>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="xt-section" id="interface" data-spy-section style={{ paddingInline: 0 }}>
        <div className="xt-wrap">
          <h2 className="xt-h2" data-reveal>
            Interface
          </h2>
        </div>
        <div className="xt-rail" tabIndex={0} role="group" aria-label="Capturas de tela do aplicativo">
          {galleryScreens.map((screen) => (
            <figure key={screen.label}>
              <img src={screen.src} width={420} height={746} alt={screen.alt} loading="lazy" decoding="async" />
              <figcaption>
                <b>{screen.label}</b>
                {screen.note}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="xt-section" id="download">
        <div className="xt-wrap">
          <div className="xt-dlbox xt-card" data-reveal>
            <div>
              <h2 className="xt-h2" style={{ marginBottom: 14 }}>
                XTOYBOX
              </h2>
              <p className="xt-ver" translate="no">
                v{apkMetadata.versionName}
              </p>
              <dl className="xt-meta">
                {releaseDate ? (
                  <div>
                    <dt>Atualizado</dt>
                    <dd>{releaseDate}</dd>
                  </div>
                ) : null}
                {apkMetadata.apkSizeFormatted ? (
                  <div>
                    <dt>Tamanho</dt>
                    <dd>{apkMetadata.apkSizeFormatted}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Formato</dt>
                  <dd>APK para Android</dd>
                </div>
              </dl>
              <DownloadButton href="/api/download">Baixar APK</DownloadButton>
              <p>
                <a className="xt-link" href="/downloads">
                  Versões anteriores e notas
                </a>
              </p>
            </div>
            <ol className="xt-steps" aria-label="Como instalar">
              <li>
                <span>
                  Baixe o APK
                  <small>Use apenas o botão deste site.</small>
                </span>
              </li>
              <li>
                <span>
                  Permita fontes externas
                  <small>O Android pede isso para instalar fora da Play Store. Dá para desativar depois.</small>
                </span>
              </li>
              <li>
                <span>
                  Abra o arquivo e instale
                  <small>Depois entre com a sua conta Xbox no app.</small>
                </span>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="xt-section" id="ajuda" data-spy-section>
        <div className="xt-wrap">
          <h2 className="xt-h2" data-reveal>
            Ajuda
          </h2>
          <div className="xt-faq">
            <details data-reveal>
              <summary>
                É um serviço próprio de cloud gaming?
                <ChevronRight className="xt-i" />
              </summary>
              <p>
                Não. O XTOYBOX organiza o acesso ao Remote Play e a experiências compatíveis disponibilizadas pela
                Microsoft.
              </p>
            </details>
            <details data-reveal>
              <summary>
                Preciso de um console Xbox?
                <ChevronRight className="xt-i" />
              </summary>
              <p>Para Remote Play, sim. Na nuvem, depende da sua conta, região e do serviço oficial.</p>
            </details>
            <details data-reveal>
              <summary>
                Quais dispositivos?
                <ChevronRight className="xt-i" />
              </summary>
              <p>Dispositivos Android compatíveis, incluindo celulares e TV Box.</p>
            </details>
            <details data-reveal>
              <summary>
                Como instalar o APK?
                <ChevronRight className="xt-i" />
              </summary>
              <p>Baixe pelo site oficial e, se necessário, permita a instalação por fontes externas no Android.</p>
            </details>
          </div>
        </div>
      </section>

      <section className="xt-section" id="contato">
        <div className="xt-wrap">
          <a className="xt-disc xt-card" href={DISCORD_URL} target="_blank" rel="noreferrer" data-reveal>
            <DiscordIcon className="xt-disc__logo" />
            <span>
              Entrar no Discord
              <small>Avisos de versões e dúvidas</small>
            </span>
            <ChevronRight className="xt-i" />
          </a>
          <ul className="xt-rows">
            <li data-reveal>
              <a href="/xtoytouch">
                <span>
                  XtoyTouch
                  <small>Userscript complementar para o xCloud no navegador</small>
                </span>
                <ChevronRight className="xt-i" />
              </a>
            </li>
            <li data-reveal>
              <a href="/seguranca-download">
                <span>
                  Segurança do download
                  <small>Origem e SHA-256 do APK</small>
                </span>
                <ChevronRight className="xt-i" />
              </a>
            </li>
            <li data-reveal>
              <a href="/reportar-bugs">
                <span>
                  Reportar um problema
                  <small>Conte o que aconteceu</small>
                </span>
                <ChevronRight className="xt-i" />
              </a>
            </li>
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}
