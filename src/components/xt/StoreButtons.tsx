import { useEffect, useState, type ReactNode } from "react";
import { DownloadButton } from "./DownloadButton";
import { AndroidIcon, AppleIcon } from "./icons";

const IOS_MANIFEST_URL = "/latest-ios.json";
const IOS_RELEASE_API =
  "https://api.github.com/repos/jmita2288-debug/xtoybox-apk-download/releases/tags/xtoybox-latest";
const IPA_ASSET_RE = /^XTOYBOX-v(\d+(?:\.\d+){1,3})\.ipa$/i;

type IosRelease = { version: string; url: string };

function validGitHubAssetUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "github.com" ? url.toString() : null;
  } catch {
    return null;
  }
}

function normalizeVersion(value: unknown): string | null {
  const version = String(value ?? "").trim().replace(/^v/i, "");
  return /^\d+(?:\.\d+){1,3}$/.test(version) ? version : null;
}

function compareVersions(a: string, b: string) {
  const left = a.split(".").map(Number);
  const right = b.split(".").map(Number);
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    const difference = (left[i] ?? 0) - (right[i] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

async function fetchIosRelease(): Promise<IosRelease | null> {
  try {
    const response = await fetch(`${IOS_MANIFEST_URL}?t=${Date.now()}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (response.ok) {
      const data = (await response.json()) as {
        platform?: string;
        latestVersionName?: string;
        ipaUrl?: string;
      };
      const version = normalizeVersion(data.latestVersionName);
      const url = validGitHubAssetUrl(data.ipaUrl);
      if (version && url && (!data.platform || data.platform === "ios")) {
        return { version, url };
      }
    }
  } catch {
    // O manifesto pode ainda não estar disponível no deploy do site.
  }

  try {
    const response = await fetch(IOS_RELEASE_API, {
      cache: "no-store",
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) return null;
    const release = (await response.json()) as {
      assets?: Array<{ name?: string; browser_download_url?: string }>;
    };
    const candidates = (release.assets ?? [])
      .map((asset) => {
        const match = IPA_ASSET_RE.exec(String(asset.name ?? ""));
        const url = validGitHubAssetUrl(asset.browser_download_url);
        return match && url ? { version: match[1], url } : null;
      })
      .filter((item): item is IosRelease => item !== null)
      .sort((a, b) => compareVersions(b.version, a.version));
    return candidates[0] ?? null;
  } catch {
    return null;
  }
}

function Label({ small, big }: { small: string; big: string }) {
  return (
    <span className="xt-store__label">
      <small>{small}</small>
      <b>{big}</b>
    </span>
  );
}

export function StoreButtons({ className = "", extra }: { className?: string; extra?: ReactNode }) {
  const [iosRelease, setIosRelease] = useState<IosRelease | null>(null);
  const [iosChecked, setIosChecked] = useState(false);

  useEffect(() => {
    let active = true;
    fetchIosRelease().then((release) => {
      if (!active) return;
      setIosRelease(release);
      setIosChecked(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={`xt-stores ${className}`.trim()}>
      <DownloadButton variant="store" className="xt-btn--live" href="/api/download" Icon={AndroidIcon}>
        <Label small="Download para" big="Android" />
      </DownloadButton>
      {iosRelease ? (
        <a
          className="xt-btn xt-btn--store"
          href={iosRelease.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Baixar XTOYBOX para iOS versão ${iosRelease.version}`}
        >
          <span className="xt-btn__icon" aria-hidden="true">
            <AppleIcon />
          </span>
          <Label small={`Versão ${iosRelease.version}`} big="iOS" />
        </a>
      ) : (
        <button
          className="xt-btn xt-btn--store xt-btn--soon"
          type="button"
          disabled
          aria-label="Download para iOS: em breve"
        >
          <span className="xt-btn__icon" aria-hidden="true">
            <AppleIcon />
          </span>
          <Label small={iosChecked ? "Em breve" : "Verificando"} big="iOS" />
        </button>
      )}
      {extra}
    </div>
  );
}
