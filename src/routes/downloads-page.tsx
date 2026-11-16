import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import logo from "@/assets/logo-x.webp";
import { fetchApkMetadata, fallbackLatestMetadata, type ApkMetadata } from "@/lib/apkMetadata";
import { usePageMetadata } from "@/lib/page-metadata";
import { DownloadButton } from "@/components/xt/DownloadButton";
import { SiteShell } from "@/components/xt/SiteChrome";
import { formatReleaseDate, galleryScreens } from "./index-refined";

// Versões que têm redirecionamento /downloads/XTOYBOX-v{versão}.apk configurado no vercel.json.
const REDIRECTED_VERSIONS = ["1.1.16", "1.1.15", "1.1.14", "1.1.13"] as const;

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

export function DownloadsPage() {
  const [apkMetadata, setApkMetadata] = useState<ApkMetadata>(() => createFallbackApkMetadata());

  usePageMetadata(
    "Downloads — XTOYBOX",
    "Baixe a versão mais recente do XTOYBOX para Android, leia as notas da versão e acesse versões anteriores.",
    "/downloads",
  );

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
  const previousVersions = REDIRECTED_VERSIONS.filter((version) => version !== apkMetadata.versionName);

  return (
    <SiteShell page="downloads">
      <div className="xt-wrap xt-page">
        <a className="xt-crumb" href="/">
          <ChevronRight className="xt-i" />
          Início
        </a>

        <div className="xt-apphead">
          <img className="xt-apphead__icon xt-appr__icon--logo" src={logo} width={104} height={104} alt="" />
          <div>
            <h1 translate="no">XTOYBOX</h1>
            <p>Remote Play e jogos compatíveis na nuvem.</p>
          </div>
          <DownloadButton href="/api/download">Baixar APK</DownloadButton>
        </div>

        <dl className="xt-specs">
          <div>
            <dt>Versão atual</dt>
            <dd translate="no">{apkMetadata.versionName}</dd>
          </div>
          <div>
            <dt>Tamanho</dt>
            <dd>{apkMetadata.apkSizeFormatted ?? "Indisponível"}</dd>
          </div>
          <div>
            <dt>Compatível com</dt>
            <dd>Android e TV Box</dd>
          </div>
          <div>
            <dt>Atualizado em</dt>
            <dd>{releaseDate ?? "Indisponível"}</dd>
          </div>
        </dl>

        <h2 className="xt-h2 xt-h2--sm" style={{ marginTop: 0 }}>
          Capturas de tela
        </h2>
        <div className="xt-rail xt-shots-page" tabIndex={0} role="group" aria-label="Capturas de tela do aplicativo">
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

        <div className="xt-dgrid">
          <div>
            {apkMetadata.releaseNotes.length > 0 ? (
              <>
                <h2 className="xt-h2 xt-h2--sm">Notas da versão</h2>
                <details className="xt-notes">
                  <summary>
                    O que mudou na {apkMetadata.versionName}
                    <ChevronRight className="xt-i" />
                  </summary>
                  <div>
                    {apkMetadata.releaseNotes.map((note) => (
                      <p key={note}>{note}</p>
                    ))}
                  </div>
                </details>
              </>
            ) : null}
            <p>
              <a className="xt-link" href="/seguranca-download">
                Conferir origem e SHA-256 do APK
              </a>
            </p>
          </div>
          <div>
            <h2 className="xt-h2 xt-h2--sm" style={{ marginTop: 0 }}>
              Versões anteriores
            </h2>
            {previousVersions.length > 0 ? (
              <ul className="xt-old" data-reveal>
                {previousVersions.map((version) => (
                  <li key={version}>
                    <b translate="no">v{version}</b>
                    <DownloadButton variant="secondary" href={`/downloads/XTOYBOX-v${version}.apk`}>
                      Baixar
                    </DownloadButton>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="xt-empty">Nenhuma versão anterior disponível.</p>
            )}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
