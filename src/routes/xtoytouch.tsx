import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Download,
  Gamepad2,
  PencilRuler,
  RefreshCw,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import logo from "../assets/logo-xtoybox.png";
import hudImage from "../assets/screens/HUD.img.PNG";
import editorImage from "../assets/screens/EDITOR HUD.img.PNG";
import panelImage from "../assets/screens/Painel script.img.jpg";

const FALLBACK_VERSION = "4.1.2";

const previews = [
  {
    src: hudImage,
    label: "HUD",
    title: "Controles durante o jogo",
    description: "Use os controles virtuais sobre a transmissão e mantenha a jogabilidade acessível pelo toque.",
    alt: "HUD do XtoyTouch durante uma sessão do Xbox Cloud Gaming",
  },
  {
    src: editorImage,
    label: "Editor de HUD",
    title: "Organize o layout do seu jeito",
    description: "Reposicione os controles e ajuste o HUD diretamente na tela antes de salvar o layout.",
    alt: "Editor de HUD do XtoyTouch",
  },
  {
    src: panelImage,
    label: "Painel",
    title: "Ajustes em um só lugar",
    description: "Acesse as opções do XtoyTouch sem sair da experiência de jogo.",
    alt: "Painel principal do XtoyTouch",
  },
] as const;

export function XtoyTouchPage() {
  const [version, setVersion] = useState(FALLBACK_VERSION);

  useEffect(() => {
    const previousTitle = document.title;
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const previousCanonical = canonical?.href;

    document.title = "XtoyTouch — Controles virtuais para Xbox Cloud Gaming";
    if (canonical) canonical.href = "https://xtoybox.cloud/xtoytouch";

    fetch("/xtoytouch/XtoyTouch.meta.js", { cache: "no-store" })
      .then((response) => (response.ok ? response.text() : Promise.reject(new Error("metadata"))))
      .then((metadata) => {
        const match = metadata.match(/@version\s+([^\s]+)/);
        if (match?.[1]) setVersion(match[1]);
      })
      .catch(() => {
        // A versão de fallback mantém a página funcional caso o metadata ainda não esteja disponível.
      });

    return () => {
      document.title = previousTitle;
      if (canonical && previousCanonical) canonical.href = previousCanonical;
    };
  }, []);

  return (
    <div className="xtt-page">
      <header className="xtt-header">
        <div className="xtt-shell xtt-header__inner">
          <a className="xtt-brand" href="/" aria-label="Voltar ao XTOYBOX">
            <img src={logo} alt="" />
            <span>
              <strong>XTOYBOX</strong>
              <small>XtoyTouch</small>
            </span>
          </a>
          <a className="xtt-back" href="/">
            <ArrowLeft />
            Voltar ao site
          </a>
        </div>
      </header>

      <main>
        <section className="xtt-hero">
          <div className="xtt-shell xtt-hero__grid">
            <div className="xtt-hero__copy">
              <span className="xtt-kicker">Userscript para xCloud</span>
              <h1>XtoyTouch</h1>
              <p className="xtt-lead">
                Controles virtuais para Xbox Cloud Gaming no navegador, com HUDs por jogo,
                editor visual e um painel de ajustes pensado para uso durante a sessão.
              </p>

              <div className="xtt-version">
                <span className="xtt-version__dot" />
                Versão {version}
                <span>·</span>
                MIT
              </div>

              <div className="xtt-actions">
                <a className="xtt-button xtt-button--primary" href="/xtoytouch/XtoyTouch.user.js">
                  <Download />
                  Instalar XtoyTouch
                </a>
                <a className="xtt-button xtt-button--secondary" href="#como-instalar">
                  Como instalar
                </a>
              </div>

              <p className="xtt-helper">
                Requer um gerenciador de userscripts compatível. As atualizações automáticas
                dependem do suporte e das configurações do gerenciador instalado.
              </p>
            </div>

            <div className="xtt-hero__preview">
              <img src={hudImage} alt="Prévia do HUD do XtoyTouch" />
              <div className="xtt-hero__preview-badge">
                <Gamepad2 />
                <span>
                  <strong>HUD por jogo</strong>
                  <small>Layout salvo para sua sessão</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="xtt-section">
          <div className="xtt-shell">
            <div className="xtt-heading">
              <span className="xtt-kicker">O que você encontra</span>
              <h2>Feito para jogar pelo toque.</h2>
              <p>O essencial do XtoyTouch, sem ocupar a tela com informações desnecessárias.</p>
            </div>

            <div className="xtt-feature-grid">
              <article>
                <span><Gamepad2 /></span>
                <h3>HUD virtual</h3>
                <p>Controles de toque sobre o streaming com perfis de HUD para diferentes jogos.</p>
              </article>
              <article>
                <span><PencilRuler /></span>
                <h3>Editor de HUD</h3>
                <p>Mova, redimensione e organize os controles diretamente na área de jogo.</p>
              </article>
              <article>
                <span><Settings2 /></span>
                <h3>Painel de ajustes</h3>
                <p>Configurações do script reunidas em uma interface própria e acessível durante o uso.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="xtt-section xtt-section--soft">
          <div className="xtt-shell">
            <div className="xtt-heading">
              <span className="xtt-kicker">Interface</span>
              <h2>Veja como funciona.</h2>
            </div>

            <div className="xtt-gallery">
              {previews.map((preview) => (
                <article className="xtt-shot" key={preview.label}>
                  <div className="xtt-shot__image">
                    <img src={preview.src} alt={preview.alt} loading="lazy" />
                  </div>
                  <div className="xtt-shot__copy">
                    <span>{preview.label}</span>
                    <h3>{preview.title}</h3>
                    <p>{preview.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="como-instalar" className="xtt-section">
          <div className="xtt-shell xtt-install-grid">
            <div>
              <div className="xtt-heading xtt-heading--left">
                <span className="xtt-kicker">Instalação</span>
                <h2>Três passos.</h2>
              </div>

              <ol className="xtt-steps">
                <li>
                  <span>1</span>
                  <div>
                    <strong>Instale um gerenciador</strong>
                    <p>Use um gerenciador compatível, como Tampermonkey, Violentmonkey ou Userscripts.</p>
                  </div>
                </li>
                <li>
                  <span>2</span>
                  <div>
                    <strong>Abra o instalador</strong>
                    <p>Toque em “Instalar XtoyTouch” e confirme a instalação no seu gerenciador.</p>
                  </div>
                </li>
                <li>
                  <span>3</span>
                  <div>
                    <strong>Abra o Xbox Cloud Gaming</strong>
                    <p>Com o script ativado, acesse o xCloud pelo navegador compatível.</p>
                  </div>
                </li>
              </ol>
            </div>

            <aside className="xtt-update-card">
              <span className="xtt-update-card__icon"><RefreshCw /></span>
              <span className="xtt-kicker">Atualizações</span>
              <h2>Novas versões sem reinstalar tudo.</h2>
              <p>
                O XtoyTouch informa ao gerenciador onde consultar a versão atual e onde baixar
                o arquivo completo. Quando uma versão mais nova for publicada, gerenciadores
                compatíveis podem detectar a mudança e oferecer ou aplicar a atualização.
              </p>
              <ul>
                <li><Check /> Arquivo de atualização separado e leve</li>
                <li><Check /> Endereço oficial e estável em xtoybox.cloud</li>
                <li><Check /> Mesmo nome e namespace para preservar a instalação</li>
              </ul>
              <a className="xtt-button xtt-button--primary xtt-button--full" href="/xtoytouch/XtoyTouch.user.js">
                <Download />
                Instalar versão {version}
              </a>
            </aside>
          </div>
        </section>

        <section className="xtt-safety">
          <div className="xtt-shell xtt-safety__inner">
            <ShieldCheck />
            <div>
              <strong>Projeto independente</strong>
              <p>
                O XtoyTouch é um userscript independente para uso no navegador e não é afiliado,
                endossado ou patrocinado pela Microsoft ou Xbox.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="xtt-footer">
        <div className="xtt-shell">
          <span>© 2026 XTOYBOX</span>
          <div>
            <a href="/privacidade">Privacidade</a>
            <a href="/termos">Termos</a>
            <a href="/reportar-bugs">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
