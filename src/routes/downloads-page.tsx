import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { fetchApkMetadata, fallbackLatestMetadata, type ApkMetadata } from "@/lib/apkMetadata";
import { usePageMetadata } from "@/lib/page-metadata";
import { DownloadButton } from "@/components/xt/DownloadButton";
import { PageHead, SiteShell } from "@/components/xt/SiteChrome";
import { formatReleaseDate } from "./index-refined";

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
        <PageHead title="Downloads" lede="Baixe sempre pelo site oficial, de preferência a versão mais recente." />
        <div className="xt-dgrid">
          <div>
            <div className="xt-cur xt-card" data-reveal>
              <div>
                <h3 className="xt-h3" translate="no">
                  XTOYBOX v{apkMetadata.versionName}
                </h3>
                <p>
                  Versão atual.
                  {releaseDate ? ` Atualizada em ${releaseDate}.` : ""}
                  {apkMetadata.apkSizeFormatted ? ` ${apkMetadata.apkSizeFormatted}.` : ""}
                </p>
              </div>
              <DownloadButton href="/api/download">Baixar APK</DownloadButton>
            </div>

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
