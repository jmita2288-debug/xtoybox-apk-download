import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import heroPhone from "@/assets/hero-phone.webp";
import heroPhoneSm from "@/assets/hero-phone-sm.webp";
import screenBiblioteca from "@/assets/screens/biblioteca.webp";
import screenPerfil from "@/assets/screens/perfil.webp";
import screenConquistas from "@/assets/screens/conquistas.webp";
import { fetchApkMetadata, fallbackLatestMetadata, type ApkMetadata } from "@/lib/apkMetadata";
import { AndroidShowcase } from "@/components/xt/AndroidShowcase";
import { DiscordIcon } from "@/components/xt/icons";
import { DISCORD_URL, SiteShell } from "@/components/xt/SiteChrome";
import { StoreButtons } from "@/components/xt/StoreButtons";

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

export const galleryScreens = [
  { src: screenBiblioteca, label: "Biblioteca", note: "Sua biblioteca do console.", alt: "Tela da biblioteca do XTOYBOX" },
  { src: screenPerfil, label: "Perfil", note: "Conta e histórico.", alt: "Tela de perfil do XTOYBOX" },
  { src: screenConquistas, label: "Conquistas", note: "Progresso por jogo.", alt: "Tela de conquistas do XTOYBOX" },
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
      <section className="xt-hero" id="download">
        <div className="xt-hero__stage" aria-hidden="true">
          <img
            src={heroPhone}
            srcSet={`${heroPhoneSm} 560w, ${heroPhone} 1000w`}
            sizes="(min-width: 900px) 46vw, 88vw"
            width={1000}
            height={1469}
            alt=""
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <div className="xt-wrap xt-hero__inner">
          <div className="xt-hero__copy">
            <h1 className="xt-h1">Seu Xbox em mais telas.</h1>
            <p className="xt-lede">Remote Play do seu console e jogos compatíveis na nuvem, no Android.</p>
            <StoreButtons />
            <p className="xt-fine">
              <span translate="no">v{apkMetadata.versionName}</span>
              {releaseDate ? `, atualizado em ${releaseDate}` : ""}
              {apkMetadata.apkSizeFormatted ? `, ${apkMetadata.apkSizeFormatted}` : ""}
            </p>
          </div>
        </div>
      </section>

      <section className="xt-section" id="como-funciona" data-spy-section>
        <div className="xt-wrap">
          <h2 className="xt-h2" data-reveal>
            Duas formas de jogar
          </h2>
          <div className="xt-two">
            <article data-reveal>
              <h3 className="xt-h3">Remote Play</h3>
              <p>
                Transmita o jogo do seu próprio console Xbox para o celular ou a TV Box. É preciso ter um console
                compatível.
              </p>
            </article>
            <article data-reveal>
              <h3 className="xt-h3">Jogos na nuvem</h3>
              <p>
                Acesse títulos compatíveis oferecidos pelo serviço oficial da Microsoft. A disponibilidade depende da sua
                conta e da sua região.
              </p>
            </article>
          </div>
          <p className="xt-note" data-reveal>
            O XTOYBOX não opera servidores próprios de cloud gaming.
          </p>
        </div>
      </section>

      <section className="xt-section" id="interface" data-spy-section>
        <div className="xt-wrap">
          <h2 className="xt-h2" data-reveal>
            Interface
          </h2>
          <AndroidShowcase screens={galleryScreens} />
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
        </div>
      </section>

      <div className="xt-wrap">
        <div className="xt-counter-mount" />
      </div>
    </SiteShell>
  );
}
