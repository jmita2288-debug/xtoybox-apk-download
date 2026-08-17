import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Film, X } from "lucide-react";

type RewardedStage = "loading" | "ready" | "showing" | "unavailable";

type GptSlot = {
  addService: (service: unknown) => GptSlot;
};

type RewardedReadyEvent = {
  slot: GptSlot;
  makeRewardedVisible: () => void;
};

type GptEvent = {
  slot: GptSlot;
  isEmpty?: boolean;
};

type GptPubAds = {
  addEventListener: (type: string, listener: (event: any) => void) => void;
  removeEventListener?: (type: string, listener: (event: any) => void) => void;
};

type GoogleTag = {
  apiReady?: boolean;
  cmd: { push: (callback: () => void) => unknown };
  enums?: { OutOfPageFormat?: { REWARDED?: string } };
  defineOutOfPageSlot?: (adUnitPath: string, format: string) => GptSlot | null;
  pubads: () => GptPubAds;
  enableServices: () => void;
  display: (slot: GptSlot) => void;
  destroySlots?: (slots: GptSlot[]) => boolean;
};

declare global {
  interface Window {
    googletag?: GoogleTag;
  }
}

const DOWNLOAD_URL = "/api/download";
const GPT_SCRIPT_ID = "xtoybox-google-publisher-tag";
const GPT_SCRIPT_URL = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
const AD_UNIT_PATH = String(import.meta.env.VITE_GAM_REWARDED_AD_UNIT_PATH ?? "").trim();

function loadGooglePublisherTag() {
  if (window.googletag?.apiReady) return Promise.resolve();

  window.googletag = window.googletag ?? ({ cmd: [] } as unknown as GoogleTag);

  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(GPT_SCRIPT_ID) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Falha ao carregar o provedor de anúncios")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = GPT_SCRIPT_ID;
    script.src = GPT_SCRIPT_URL;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Falha ao carregar o provedor de anúncios")), {
      once: true,
    });
    document.head.appendChild(script);
  });
}

function startDownload() {
  window.location.assign(DOWNLOAD_URL);
}

export function DownloadAdGate() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<RewardedStage>("loading");
  const rewardedReadyRef = useRef<RewardedReadyEvent | null>(null);
  const rewardGrantedRef = useRef(false);

  const configured = Boolean(AD_UNIT_PATH);

  useEffect(() => {
    if (!configured) return;

    const handleDownloadClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest<HTMLAnchorElement>(`a[href="${DOWNLOAD_URL}"]`);
      if (!anchor) return;

      event.preventDefault();
      rewardedReadyRef.current = null;
      rewardGrantedRef.current = false;
      setStage("loading");
      setOpen(true);
    };

    document.addEventListener("click", handleDownloadClick);
    return () => document.removeEventListener("click", handleDownloadClick);
  }, [configured]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && stage !== "showing") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, stage]);

  useEffect(() => {
    if (!open || !configured) return;

    let cancelled = false;
    let rewardedSlot: GptSlot | null = null;
    let timeoutId = 0;
    const registeredListeners: Array<[string, (event: any) => void]> = [];

    const register = (pubads: GptPubAds, type: string, listener: (event: any) => void) => {
      pubads.addEventListener(type, listener);
      registeredListeners.push([type, listener]);
    };

    loadGooglePublisherTag()
      .then(() => {
        if (cancelled) return;

        const googletag = window.googletag;
        if (!googletag) {
          setStage("unavailable");
          return;
        }

        googletag.cmd.push(() => {
          if (cancelled) return;

          const rewardedFormat = googletag.enums?.OutOfPageFormat?.REWARDED;
          if (!rewardedFormat || !googletag.defineOutOfPageSlot) {
            setStage("unavailable");
            return;
          }

          rewardedSlot = googletag.defineOutOfPageSlot(AD_UNIT_PATH, rewardedFormat);
          if (!rewardedSlot) {
            setStage("unavailable");
            return;
          }

          const pubads = googletag.pubads();
          rewardedSlot.addService(pubads);

          register(pubads, "rewardedSlotReady", (event: RewardedReadyEvent) => {
            if (event.slot !== rewardedSlot || cancelled) return;
            window.clearTimeout(timeoutId);
            rewardedReadyRef.current = event;
            setStage("ready");
          });

          register(pubads, "rewardedSlotGranted", (event: GptEvent) => {
            if (event.slot !== rewardedSlot || cancelled) return;
            rewardGrantedRef.current = true;
          });

          register(pubads, "rewardedSlotClosed", (event: GptEvent) => {
            if (event.slot !== rewardedSlot || cancelled) return;

            if (rewardGrantedRef.current) {
              setOpen(false);
              window.setTimeout(startDownload, 120);
              return;
            }

            rewardedReadyRef.current = null;
            setStage("unavailable");
          });

          register(pubads, "slotRenderEnded", (event: GptEvent) => {
            if (event.slot !== rewardedSlot || cancelled) return;
            if (event.isEmpty) {
              rewardedReadyRef.current = null;
              setStage("unavailable");
            }
          });

          googletag.enableServices();
          googletag.display(rewardedSlot);

          timeoutId = window.setTimeout(() => {
            if (!rewardedReadyRef.current && !cancelled) setStage("unavailable");
          }, 10_000);
        });
      })
      .catch(() => {
        if (!cancelled) setStage("unavailable");
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      rewardedReadyRef.current = null;
      rewardGrantedRef.current = false;

      const googletag = window.googletag;
      if (!googletag) return;

      googletag.cmd.push(() => {
        const pubads = googletag.pubads();
        if (pubads.removeEventListener) {
          registeredListeners.forEach(([type, listener]) => pubads.removeEventListener?.(type, listener));
        }
        if (rewardedSlot) googletag.destroySlots?.([rewardedSlot]);
      });
    };
  }, [open, configured]);

  if (!configured || !open) return null;

  const watchAd = () => {
    const readyEvent = rewardedReadyRef.current;
    if (!readyEvent || stage !== "ready") return;

    setStage("showing");
    readyEvent.makeRewardedVisible();
  };

  const skipAd = () => {
    setOpen(false);
    window.setTimeout(startDownload, 80);
  };

  return createPortal(
    <div className="download-ad-gate" role="presentation" onMouseDown={() => stage !== "showing" && setOpen(false)}>
      <section
        className="download-ad-gate__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-ad-gate-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="download-ad-gate__close"
          aria-label="Fechar"
          onClick={() => setOpen(false)}
          disabled={stage === "showing"}
        >
          <X />
        </button>

        <span className="download-ad-gate__icon" aria-hidden="true">
          <Film />
        </span>

        <div className="download-ad-gate__copy">
          <span className="download-ad-gate__eyebrow">Anúncio opcional</span>
          <h2 id="download-ad-gate-title">Antes do download</h2>
          <p>
            Você pode assistir a um anúncio curto antes de continuar. Ao concluir, o download do
            XTOYBOX começa automaticamente.
          </p>
          <small>Se preferir, continue diretamente para o download sem assistir ao anúncio.</small>
        </div>

        {stage === "unavailable" && (
          <p className="download-ad-gate__status" role="status">
            Nenhum anúncio está disponível neste momento. O download continua normalmente.
          </p>
        )}

        <div className="download-ad-gate__actions">
          {stage !== "unavailable" && (
            <button
              type="button"
              className="download-ad-gate__primary"
              onClick={watchAd}
              disabled={stage !== "ready"}
            >
              <Film />
              {stage === "loading"
                ? "Preparando anúncio..."
                : stage === "showing"
                  ? "Anúncio em exibição"
                  : "Assistir anúncio"}
            </button>
          )}

          <button type="button" className="download-ad-gate__secondary" onClick={skipAd} disabled={stage === "showing"}>
            <Download />
            Baixar sem anúncio
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
