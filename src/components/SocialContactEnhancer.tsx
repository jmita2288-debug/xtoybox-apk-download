import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Bug, Instagram, MessageCircle } from "lucide-react";

const INSTAGRAM_URL = "https://www.instagram.com/alexandre6902_/";
const DISCORD_URL = "https://discord.gg/abh27Dwktt";

function DiscordIcon() {
  return (
    <svg viewBox="0 0 127.14 96.36" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0 105.89 105.89 0 0 0 19.39 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1A105.25 105.25 0 0 0 126.6 80.22C129.24 52.84 122.09 29.11 107.7 8.07ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53 48.84 65.69 42.45 65.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53 91.08 65.69 84.69 65.69Z" />
    </svg>
  );
}

function QuickLinks() {
  return (
    <div className="xt-contact-quicklinks" aria-label="Contato e comunidade">
      <span className="xt-contact-quicklinks__label">
        <MessageCircle />
        Fale com o projeto
      </span>
      <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
        <Instagram /> Instagram
      </a>
      <a href={DISCORD_URL} target="_blank" rel="noreferrer">
        <DiscordIcon /> Discord
      </a>
    </div>
  );
}

function ContactPanel() {
  return (
    <div className="xt-contact-panel">
      <div className="xt-contact-panel__heading">
        <div>
          <span>CONTATO E COMUNIDADE</span>
          <h3>Escolha o canal que for melhor para você.</h3>
        </div>
        <p>
          Tire dúvidas, converse sobre o XTOYBOX ou envie detalhes de um problema sem precisar procurar
          os links pelo site.
        </p>
      </div>

      <div className="xt-contact-grid">
        <a className="xt-contact-card xt-contact-card--instagram" href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
          <span className="xt-contact-card__icon">
            <Instagram />
          </span>
          <span className="xt-contact-card__copy">
            <small>Contato direto</small>
            <strong>Instagram</strong>
            <span>Envie uma DM para dúvidas rápidas ou para falar diretamente comigo.</span>
          </span>
          <ArrowUpRight className="xt-contact-card__arrow" />
        </a>

        <a className="xt-contact-card xt-contact-card--discord" href={DISCORD_URL} target="_blank" rel="noreferrer">
          <span className="xt-contact-card__icon">
            <DiscordIcon />
          </span>
          <span className="xt-contact-card__copy">
            <small>Comunidade</small>
            <strong>Discord</strong>
            <span>Participe das conversas, acompanhe avisos e tire dúvidas com a comunidade.</span>
          </span>
          <ArrowUpRight className="xt-contact-card__arrow" />
        </a>

        <a className="xt-contact-card xt-contact-card--bug" href="/reportar-bugs">
          <span className="xt-contact-card__icon">
            <Bug />
          </span>
          <span className="xt-contact-card__copy">
            <small>Suporte técnico</small>
            <strong>Reportar um bug</strong>
            <span>Envie modelo do aparelho, versão do app e os passos para reproduzir o problema.</span>
          </span>
          <ArrowUpRight className="xt-contact-card__arrow" />
        </a>
      </div>
    </div>
  );
}

function SupportSocialLinks() {
  return (
    <div className="xt-support-social">
      <span>Outros canais</span>
      <p>Se preferir conversar antes de enviar o relatório, fale comigo pelo Instagram ou entre na comunidade.</p>
      <div>
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
          <Instagram /> Instagram
        </a>
        <a href={DISCORD_URL} target="_blank" rel="noreferrer">
          <DiscordIcon /> Discord
        </a>
      </div>
    </div>
  );
}

function FooterSocialLinks() {
  return (
    <div className="xt-footer-social" aria-label="Redes do XTOYBOX">
      <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram do XTOYBOX">
        <Instagram />
        <span>Instagram</span>
      </a>
      <a href={DISCORD_URL} target="_blank" rel="noreferrer" aria-label="Comunidade do XTOYBOX no Discord">
        <DiscordIcon />
        <span>Discord</span>
      </a>
    </div>
  );
}

type MountNodes = {
  hero: HTMLElement | null;
  community: HTMLElement | null;
  support: HTMLElement | null;
  footer: HTMLElement | null;
};

const emptyMounts: MountNodes = { hero: null, community: null, support: null, footer: null };

export function SocialContactEnhancer() {
  const [mounts, setMounts] = useState<MountNodes>(emptyMounts);

  useEffect(() => {
    const syncMounts = () => {
      const hero = document.querySelector<HTMLElement>(".refined-hero__copy");
      const community = document.querySelector<HTMLElement>(".refined-community-card");
      const communitySection = document.querySelector<HTMLElement>(".refined-community-section");
      const support = document.querySelector<HTMLElement>(".support-intro");
      const footer = document.querySelector<HTMLElement>(".refined-footer__top");

      community?.classList.add("xt-contact-enhanced");
      communitySection?.setAttribute("id", "contato");
      support?.classList.add("xt-support-enhanced");

      setMounts((current) => {
        if (
          current.hero === hero &&
          current.community === community &&
          current.support === support &&
          current.footer === footer
        ) {
          return current;
        }

        return { hero, community, support, footer };
      });
    };

    syncMounts();
    const observer = new MutationObserver(syncMounts);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {mounts.hero && createPortal(<QuickLinks />, mounts.hero)}
      {mounts.community && createPortal(<ContactPanel />, mounts.community)}
      {mounts.support && createPortal(<SupportSocialLinks />, mounts.support)}
      {mounts.footer && createPortal(<FooterSocialLinks />, mounts.footer)}
    </>
  );
}
