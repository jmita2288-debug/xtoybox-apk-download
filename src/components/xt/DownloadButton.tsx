import { useEffect, useRef, useState, type AnchorHTMLAttributes, type ComponentType, type MouseEvent, type ReactNode } from "react";
import { Check, Download } from "lucide-react";
import { SpeedLinesIcon } from "./icons";

type DownloadButtonProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & {
  href: string;
  variant?: "primary" | "secondary";
  full?: boolean;
  className?: string;
  Icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
};

type ButtonState = "idle" | "loading" | "done";

/**
 * Link de download com feedback visual. Continua sendo um <a href="...">: o DownloadAdGate e o
 * DownloadCounter escutam cliques em a[href="/api/download"], e a navegação nunca é bloqueada aqui.
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
  const [state, setState] = useState<ButtonState>("idle");
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
          <SpeedLinesIcon className="xt-i-load" />
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
