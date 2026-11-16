import type { ReactNode } from "react";
import { DownloadButton } from "./DownloadButton";
import { AndroidIcon, AppleIcon } from "./icons";

/** Quando houver link de instalação para iOS, preencha aqui para ativar o botão. */
const IOS_INSTALL_URL = "";

function Label({ small, big }: { small: string; big: string }) {
  return (
    <span className="xt-store__label">
      <small>{small}</small>
      <b>{big}</b>
    </span>
  );
}

export function StoreButtons({ className = "", extra }: { className?: string; extra?: ReactNode }) {
  return (
    <div className={`xt-stores ${className}`.trim()}>
      <DownloadButton variant="store" className="xt-btn--live" href="/api/download" Icon={AndroidIcon}>
        <Label small="Download para" big="Android" />
      </DownloadButton>
      {IOS_INSTALL_URL ? (
        <a className="xt-btn xt-btn--store" href={IOS_INSTALL_URL} target="_blank" rel="noreferrer">
          <span className="xt-btn__icon" aria-hidden="true">
            <AppleIcon />
          </span>
          <Label small="Download para" big="iOS" />
        </a>
      ) : (
        <button className="xt-btn xt-btn--store xt-btn--soon" type="button" disabled aria-label="Download para iOS: em breve">
          <span className="xt-btn__icon" aria-hidden="true">
            <AppleIcon />
          </span>
          <Label small="Em breve" big="iOS" />
        </button>
      )}
      {extra}
    </div>
  );
}
