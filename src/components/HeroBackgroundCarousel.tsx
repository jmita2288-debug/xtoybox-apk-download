import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import screenBiblioteca from "@/assets/screens/biblioteca.png";
import screenPerfil from "@/assets/screens/perfil.png";
import gameplayForza from "@/assets/screens/gameplay-forza-2.jpeg";

const slides = [
  { src: gameplayForza, className: "hero-background-slide--gameplay" },
  { src: screenBiblioteca, className: "hero-background-slide--library" },
  { src: screenPerfil, className: "hero-background-slide--profile" },
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

    return () => {
      element.classList.remove("hero-section--carousel");
    };
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
          <img
            src={slide.src}
            alt=""
            decoding="async"
            fetchPriority={index === 0 ? "high" : "auto"}
          />
        </div>
      ))}
      <div className="hero-background-carousel__shade" />
    </div>,
    hero,
  );
}
