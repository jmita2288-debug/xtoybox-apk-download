import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const slides = [
  { src: "/hero-carousel/cyberpunk-streaming.webp", className: "hero-background-slide--cyberpunk" },
  { src: "/hero-carousel/library-cloud.webp", className: "hero-background-slide--library" },
  { src: "/hero-carousel/touch-to-tv.webp", className: "hero-background-slide--touch" },
] as const;

export function HeroBackgroundCarousel() {
  const [hero, setHero] = useState<HTMLElement | null>(null);
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const element = document.querySelector<HTMLElement>(".hero-section");
    if (!element) return;
    element.classList.add("hero-section--carousel");
    setHero(element);
    return () => element.classList.remove("hero-section--carousel");
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6200);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  if (!hero) return null;

  return createPortal(
    <div className="hero-background-carousel" aria-hidden="true">
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className={`hero-background-slide ${slide.className} ${active === index ? "is-active" : ""}`}
        >
          <div
            className="hero-background-slide__fill"
            style={{ backgroundImage: `url(${slide.src})` }}
          />
          <img src={slide.src} alt="" decoding="async" fetchPriority={index === 0 ? "high" : "auto"} />
        </div>
      ))}
      <div className="hero-background-carousel__shade" />
    </div>,
    hero,
  );
}
