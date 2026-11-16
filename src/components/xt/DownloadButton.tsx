import { useEffect, useRef, useState, type AnchorHTMLAttributes, type ComponentType, type MouseEvent } from "react";
import { Check, Download, LoaderCircle } from "lucide-react";

type Variant = "primary" | "secondary" | "store";

type DownloadButtonProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
  variant?: Variant;
  full?: boolean;
  Icon?: ComponentType<{ className?: string }>;
  children: React.ReactNode;
};

/**
 * Link de download com retorno visual. Continua sendo um <a href>, então o contador
 * e o gate de anúncio (que escutam `a[href="/api/download"]`) seguem funcionando.
 */
export function DownloadButton({
  variant = "primary",
  full = false,
  className = "",
  Icon = Download,
  onClick,
  children,
  ...rest
}: DownloadButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (state !== "idle") return;
    setState("loading");
    timers.current.push(
      window.setTimeout(() => setState("done"), 1500),
      window.setTimeout(() => setState("idle"), 4200),
    );
  };

  const classes = ["xt-btn", `xt-btn--${variant}`, full ? "xt-btn--full" : "", className].filter(Boolean).join(" ");

  return (
    <>
      <a
        {...rest}
        className={classes}
        data-state={state === "idle" ? undefined : state}
        aria-busy={state === "loading" ? true : undefined}
        onClick={handleClick}
      >
        <span className="xt-btn__icon" aria-hidden="true">
          <Icon className="xt-i-idle" />
          <LoaderCircle className="xt-i-load" />
          <Check className="xt-i-done" />
        </span>
        <span>{children}</span>
        <i className="xt-btn__bar" aria-hidden="true" />
      </a>
      <span className="xt-sr" role="status">
        {state === "done" ? "Download iniciado." : ""}
      </span>
    </>
  );
}
