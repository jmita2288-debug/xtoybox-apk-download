import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fetchApkMetadata } from "@/lib/apkMetadata";

const DOWNLOAD_URL = "/api/download";
const RAW_STATS_URL =
  "https://raw.githubusercontent.com/jmita2288-debug/xtoybox-apk-download/main/public/download-stats.json";
const PENDING_DOWNLOAD_KEY = "xtoybox_pending_download_count_v1";
const PENDING_MAX_AGE_MS = 30 * 60 * 1000;
const AD_GATE_CONFIGURED = Boolean(
  String(import.meta.env.VITE_GAM_REWARDED_AD_UNIT_PATH ?? "").trim(),
);

type PendingDownloadCount = {
  base: number;
  clicks: number;
  createdAt: number;
};

function formatDownloads(value: number) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);
}

function readPendingDownloadCount(): PendingDownloadCount | null {
  try {
    const raw = window.sessionStorage.getItem(PENDING_DOWNLOAD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingDownloadCount>;
    const base = Number(parsed.base ?? 0);
    const clicks = Number(parsed.clicks ?? 0);
    const createdAt = Number(parsed.createdAt ?? 0);

    if (!Number.isFinite(base) || base < 0 || !Number.isFinite(clicks) || clicks <= 0) {
      window.sessionStorage.removeItem(PENDING_DOWNLOAD_KEY);
      return null;
    }

    if (!createdAt || Date.now() - createdAt > PENDING_MAX_AGE_MS) {
      window.sessionStorage.removeItem(PENDING_DOWNLOAD_KEY);
      return null;
    }

    return { base, clicks: Math.floor(clicks), createdAt };
  } catch {
    return null;
  }
}

function writePendingDownloadCount(value: PendingDownloadCount | null) {
  try {
    if (!value) {
      window.sessionStorage.removeItem(PENDING_DOWNLOAD_KEY);
      return;
    }
    window.sessionStorage.setItem(PENDING_DOWNLOAD_KEY, JSON.stringify(value));
  } catch {
    // O contador continua funcionando mesmo se o storage estiver indisponível.
  }
}

async function fetchPersistedDownloadTotal() {
  const metadata = await fetchApkMetadata().catch(() => null);

  if (typeof metadata?.downloadsTotal === "number" && metadata.downloadsTotal > 0) {
    return metadata.downloadsTotal;
  }

  const response = await fetch(`${RAW_STATS_URL}?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Contagem de downloads indisponível");

  const stats = (await response.json()) as { totalDownloads?: number };
  const total = Number(stats.totalDownloads ?? 0);

  if (!Number.isFinite(total) || total <= 0) {
    throw new Error("Contagem de downloads inválida");
  }

  return total;
}

export function DownloadCounter() {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [targetValue, setTargetValue] = useState(0);
  const [displayValue, setDisplayValue] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [seen, setSeen] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const displayValueRef = useRef(0);
  const targetValueRef = useRef(0);
  const canonicalValueRef = useRef(0);
  const refreshRef = useRef<() => void>(() => undefined);

  const updateTargetValue = (nextValue: number) => {
    targetValueRef.current = nextValue;
    setTargetValue(nextValue);
  };

  useEffect(() => {
    const findMountNode = () => {
      const node = document.querySelector<HTMLElement>(".xt-counter-mount");
      if (node) setMountNode(node);
      return Boolean(node);
    };

    if (findMountNode()) return;

    const observer = new MutationObserver(() => {
      if (findMountNode()) observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // A contagem só anima quando o bloco entra na tela.
  useEffect(() => {
    const node = asideRef.current;
    if (!node || seen) return;
    if (!("IntersectionObserver" in window)) {
      setSeen(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [mountNode, hasLoaded, targetValue, seen]);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        const total = await fetchPersistedDownloadTotal();
        if (cancelled) return;

        canonicalValueRef.current = total;
        const pending = readPendingDownloadCount();
        let visibleTotal = total;

        if (pending) {
          const expectedAfterClicks = pending.base + pending.clicks;
          if (total >= expectedAfterClicks) {
            writePendingDownloadCount(null);
          } else {
            // O GitHub pode levar alguns instantes para atualizar download_count.
            // Mantemos o clique já aceito visível nesta sessão até o total oficial alcançar.
            visibleTotal = Math.max(total, expectedAfterClicks);
          }
        }

        updateTargetValue(visibleTotal);
        setHasLoaded(true);
      } catch {
        if (!cancelled) setHasLoaded(true);
      }
    };

    refreshRef.current = () => void refresh();
    void refresh();

    const intervalId = window.setInterval(refresh, 120_000);
    const handleFocus = () => void refresh();
    const handlePageShow = () => void refresh();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void refresh();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      refreshRef.current = () => undefined;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (AD_GATE_CONFIGURED) return;

    const registerValidDownloadClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest<HTMLAnchorElement>(`a[href="${DOWNLOAD_URL}"]`);
      if (!anchor) return;

      const currentPending = readPendingDownloadCount();
      const currentBase = Math.max(
        canonicalValueRef.current,
        targetValueRef.current,
        displayValueRef.current,
      );
      const pending: PendingDownloadCount = currentPending
        ? {
            ...currentPending,
            clicks: currentPending.clicks + 1,
          }
        : {
            base: currentBase,
            clicks: 1,
            createdAt: Date.now(),
          };

      writePendingDownloadCount(pending);
      const optimisticTotal = Math.max(targetValueRef.current + 1, pending.base + pending.clicks);
      updateTargetValue(optimisticTotal);
      setHasLoaded(true);

      // Se o navegador mantiver a página viva durante o download, tenta reconciliar
      // rapidamente com o total oficial. Se houver navegação, focus/pageshow fará isso ao voltar.
      window.setTimeout(() => refreshRef.current(), 4_000);
      window.setTimeout(() => refreshRef.current(), 12_000);
    };

    document.addEventListener("click", registerValidDownloadClick);
    return () => document.removeEventListener("click", registerValidDownloadClick);
  }, []);

  useEffect(() => {
    if (targetValue <= 0) return;
    if (!seen && displayValueRef.current === 0) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = displayValueRef.current;
    const difference = targetValue - from;

    if (reduceMotion || difference === 0) {
      displayValueRef.current = targetValue;
      setDisplayValue(targetValue);
      return;
    }

    const duration = from === 0 ? 2_000 : 700;
    const startedAt = performance.now();
    let animationFrame = 0;

    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const easedProgress = progress >= 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const nextValue = Math.round(from + difference * easedProgress);

      displayValueRef.current = nextValue;
      setDisplayValue(nextValue);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    animationFrame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [targetValue, seen]);

  if (!mountNode) return null;
  if (hasLoaded && targetValue <= 0) return null;

  const loading = !hasLoaded || targetValue <= 0;

  return createPortal(
    <aside
      ref={asideRef}
      className="xt-count"
      data-in={seen ? "true" : "false"}
      data-loading={loading ? "true" : undefined}
      aria-label="Total de downloads realizados"
    >
      <i className="xt-count__rule" aria-hidden="true" />
      <div className="xt-count__grid">
        <p className="xt-count__label">Downloads realizados</p>
        <p className="xt-count__value" aria-hidden="true">
          {loading
            ? "0"
            : formatDownloads(displayValue)
                .split("")
                .map((char, index) =>
                  /\d/.test(char) ? (
                    char
                  ) : (
                    <span className="xt-count__sep" key={index}>
                      {char}
                    </span>
                  ),
                )}
        </p>
        <span className="xt-sr" role="status">
          {loading ? "" : `${formatDownloads(targetValue)} downloads realizados`}
        </span>
        <p className="xt-count__note">
          {loading ? "Carregando a contagem atual..." : "Total registrado pelo site e pelas releases oficiais."}
        </p>
      </div>
    </aside>,
    mountNode,
  );
}
