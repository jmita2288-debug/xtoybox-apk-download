import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Mail, ShieldCheck } from "lucide-react";

const SUPPORT_EMAIL = "xtoybox@proton.me";

type Mounts = {
  hero: HTMLElement | null;
  footer: HTMLElement | null;
};

const emptyMounts: Mounts = { hero: null, footer: null };

function DownloadTrustLink() {
  return (
    <a className="xt-download-trust" href="/seguranca-download">
      <span className="xt-download-trust__icon"><ShieldCheck /></span>
      <span>
        <strong>Download oficial e verificável</strong>
        <small>Release pública no GitHub · SHA-256 disponível</small>
      </span>
      <ArrowUpRight className="xt-download-trust__arrow" />
    </a>
  );
}

function FooterTrustLinks() {
  return (
    <div className="xt-trust-footer-links" aria-label="Confiança e informações legais">
      <a href="/seguranca-download">Segurança do download</a>
      <a href="/privacidade">Privacidade</a>
      <a href="/termos">Termos completos</a>
      <a href={`mailto:${SUPPORT_EMAIL}`}><Mail /> {SUPPORT_EMAIL}</a>
    </div>
  );
}

export function TrustEnhancer() {
  const [mounts, setMounts] = useState<Mounts>(emptyMounts);

  useEffect(() => {
    const syncMounts = () => {
      const hero = document.querySelector<HTMLElement>(".refined-hero__copy");
      const footer = document.querySelector<HTMLElement>(".refined-footer__bottom");
      setMounts((current) => (current.hero === hero && current.footer === footer ? current : { hero, footer }));
    };

    syncMounts();
    const observer = new MutationObserver(syncMounts);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {mounts.hero && createPortal(<DownloadTrustLink />, mounts.hero)}
      {mounts.footer && createPortal(<FooterTrustLinks />, mounts.footer)}
    </>
  );
}
