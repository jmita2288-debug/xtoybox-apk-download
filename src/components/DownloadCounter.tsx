import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download } from "lucide-react";
import { fetchApkMetadata } from "@/lib/apkMetadata";

const RAW_STATS_URL =
  "https://raw.githubusercontent.com/jmita2288-debug/xtoybox-apk-download/main/public/download-stats.json";

function formatDownloads(value: number) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);
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
  const displayValueRef = useRef(0);

  useEffect(() => {
    const findMountNode = () => {
      const node = document.querySelector<HTMLElement>(".refined-hero__visual");
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

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        const total = await fetchPersistedDownloadTotal();
        if (!cancelled) {
          setTargetValue(total);
          setHasLoaded(true);
        }
      } catch {
        if (!cancelled) setHasLoaded(true);
      }
    };

    void refresh();

    const intervalId = window.setInterval(refresh, 120_000);
    const handleFocus = () => void refresh();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void refresh();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (targetValue <= 0) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = displayValueRef.current;
    const difference = targetValue - from;

    if (reduceMotion || difference === 0) {
      displayValueRef.current = targetValue;
      setDisplayValue(targetValue);
      return;
    }

    const duration = from === 0 ? 1_500 : 700;
    const startedAt = performance.now();
    let animationFrame = 0;

    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(from + difference * easedProgress);

      displayValueRef.current = nextValue;
      setDisplayValue(nextValue);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    animationFrame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [targetValue]);

  if (!mountNode) return null;

  return createPortal(
    <aside className="refined-download-counter" aria-label="Total de downloads realizados">
      <div className="refined-download-counter__heading">
        <span className="refined-download-counter__icon" aria-hidden="true">
          <Download />
        </span>
        <span>Downloads realizados</span>
      </div>
      <strong className="refined-download-counter__value" aria-live="polite">
        {formatDownloads(displayValue)}
      </strong>
      <p>
        {hasLoaded && targetValue > 0
          ? "Total registrado pelo site e pelas releases oficiais."
          : "Carregando a contagem atual..."}
      </p>
    </aside>,
    mountNode,
  );
}
