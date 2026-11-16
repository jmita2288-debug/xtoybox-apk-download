import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type TouchEvent } from "react";

export type ShowcaseScreen = { src: string; label: string; note: string; alt: string };

/** Aparelho Android com as telas do app, troca automática e inclinação suave no desktop. */
export function AndroidShowcase({ screens }: { screens: readonly ShowcaseScreen[] }) {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const touchX = useRef<number | null>(null);
  const count = screens.length;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      query.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setInView(entry.intersectionRatio > 0.35), {
      threshold: [0, 0.35, 0.6],
    });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const go = useCallback((index: number) => setActive(((index % count) + count) % count), [count]);
  const playing = inView && visible && !hovering && !reduced;

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || reduced) return;
    const node = rootRef.current;
    if (!node) return;
    const { clientX, clientY } = event;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = node.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width - 0.5;
      const py = (clientY - rect.top) / rect.height - 0.5;
      const device = deviceRef.current;
      if (!device) return;
      device.style.setProperty("--ry", `${(px * 10).toFixed(2)}deg`);
      device.style.setProperty("--rx", `${(-py * 7).toFixed(2)}deg`);
      device.style.setProperty("--gx", `${((px + 0.5) * 100).toFixed(1)}%`);
    });
  };

  const resetTilt = () => {
    cancelAnimationFrame(frame.current);
    const device = deviceRef.current;
    if (!device) return;
    device.style.setProperty("--ry", "0deg");
    device.style.setProperty("--rx", "0deg");
    device.style.setProperty("--gx", "50%");
  };

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchX.current = event.touches[0]?.clientX ?? null;
    setHovering(true);
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchX.current;
    touchX.current = null;
    const end = event.changedTouches[0]?.clientX;
    if (start !== null && end !== undefined && Math.abs(end - start) > 36) go(active + (end < start ? 1 : -1));
    window.setTimeout(() => setHovering(false), 1200);
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key)) return;
    event.preventDefault();
    const next = active + (event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1);
    go(next);
    requestAnimationFrame(() =>
      rootRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[((next % count) + count) % count]?.focus(),
    );
  };

  return (
    <div
      ref={rootRef}
      className="xt-showcase"
      data-play={playing ? "true" : "false"}
      data-in={inView ? "true" : "false"}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        resetTilt();
        setHovering(false);
      }}
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovering(true)}
    >
      <div className="xt-showcase__stage">
        <div className="xt-android" ref={deviceRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <span className="xt-android__key xt-android__key--power" aria-hidden="true" />
          <span className="xt-android__key xt-android__key--vol" aria-hidden="true" />
          <div className="xt-android__screen">
            {screens.map((screen, index) => {
              const pos = index === active ? "active" : index < active ? "before" : "after";
              return (
                <img
                  className="xt-android__img"
                  data-pos={pos}
                  src={screen.src}
                  width={420}
                  height={746}
                  alt={index === active ? screen.alt : ""}
                  aria-hidden={index === active ? undefined : true}
                  decoding="async"
                  draggable={false}
                  key={screen.label}
                />
              );
            })}
            <span className="xt-android__cam" aria-hidden="true" />
            <span className="xt-android__glare" aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className="xt-tabs" role="tablist" aria-label="Telas do aplicativo" aria-orientation="vertical">
        {screens.map((screen, index) => (
          <button
            type="button"
            role="tab"
            className="xt-tab"
            id={`xt-tab-${index}`}
            aria-selected={index === active}
            tabIndex={index === active ? 0 : -1}
            onClick={() => go(index)}
            onKeyDown={onTabKey}
            key={screen.label}
          >
            <span className="xt-tab__text">
              <b>{screen.label}</b>
              <small>{screen.note}</small>
            </span>
            <span className="xt-tab__bar" aria-hidden="true">
              {index === active ? (
                <i
                  data-static={reduced ? "true" : undefined}
                  onAnimationEnd={() => go(active + 1)}
                  key={`${active}-${reduced}`}
                />
              ) : null}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
