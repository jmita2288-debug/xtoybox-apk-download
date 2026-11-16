import { useEffect, useState } from "react";
import { Check, Gamepad2, Info, Move, Play, Puzzle, Scale, SlidersHorizontal, Tag, Download } from "lucide-react";
import hudImage from "../assets/screens/xtoytouch-hud.webp";
import editorImage from "../assets/screens/xtoytouch-editor.webp";
import panelImage from "../assets/screens/xtoytouch-painel.webp";
import { DownloadButton } from "@/components/xt/DownloadButton";
import { PageHead, SiteShell } from "@/components/xt/SiteChrome";

const FALLBACK_VERSION = "4.1.2";
const INSTALL_URL = "/xtoytouch/XtoyTouch.user.js";

const previews = [
  {
    src: hudImage,
    width: 1100,
    height: 618,
    title: "Controles durante o jogo",
    description: "Use os controles virtuais sobre a transmissão e mantenha a jogabilidade acessível pelo toque.",
    alt: "HUD do XtoyTouch durante uma sessão do Xbox Cloud Gaming",
  },
  {
    src: editorImage,
    width: 1100,
    height: 618,
    title: "Organize o layout do seu jeito",
    description: "Reposicione os controles e ajuste o HUD diretamente na tela antes de salvar o layout.",
    alt: "Editor de HUD do XtoyTouch",
  },
  {
    src: panelImage,
    width: 300,
    height: 402,
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
    <SiteShell page="xtoytouch">
      <div className="xt-wrap xt-page">
        <div className="xtt-hero">
          <div>
            <PageHead
              Icon={Gamepad2}
              title="XtoyTouch"
              lede="Controles virtuais para Xbox Cloud Gaming no navegador, com HUDs por jogo, editor visual e um painel de ajustes pensado para uso durante a sessão."
            />
            <div className="xtt-version">
              <span>
                <Tag className="xt-i" aria-hidden="true" />
                Versão <b>{version}</b>
              </span>
              <span>
                <Scale className="xt-i" aria-hidden="true" />
                Licença MIT
              </span>
            </div>
            <div className="xt-cta">
              <DownloadButton href={INSTALL_URL}>Instalar XtoyTouch</DownloadButton>
              <a className="xt-link" href="#como-instalar">
                Como instalar
              </a>
            </div>
            <p className="xt-fine">
              Requer um gerenciador de userscripts compatível. As atualizações automáticas dependem do suporte e das
              configurações do gerenciador instalado.
            </p>
          </div>
          <div className="xt-device">
            <img src={hudImage} width={1100} height={618} alt="Prévia do HUD do XtoyTouch durante uma sessão do Xbox Cloud Gaming" />
          </div>
        </div>

        <section className="xtt-sec">
          <h2 className="xt-h2" data-reveal>
            Feito para jogar pelo toque.
          </h2>
          <p className="xtt-lede2">O essencial do XtoyTouch, sem ocupar a tela com informações desnecessárias.</p>
          <div className="xtt-feat">
            <div data-reveal>
              <span className="xtt-ico" aria-hidden="true">
                <Gamepad2 className="xt-i" />
              </span>
              <h3 className="xt-h3">HUD virtual</h3>
              <p>Controles de toque sobre o streaming com perfis de HUD para diferentes jogos.</p>
            </div>
            <div data-reveal>
              <span className="xtt-ico" aria-hidden="true">
                <Move className="xt-i" />
              </span>
              <h3 className="xt-h3">Editor de HUD</h3>
              <p>Mova, redimensione e organize os controles diretamente na área de jogo.</p>
            </div>
            <div data-reveal>
              <span className="xtt-ico" aria-hidden="true">
                <SlidersHorizontal className="xt-i" />
              </span>
              <h3 className="xt-h3">Painel de ajustes</h3>
              <p>Configurações do script reunidas em uma interface própria e acessível durante o uso.</p>
            </div>
          </div>
        </section>

        <section className="xtt-sec">
          <h2 className="xt-h2" data-reveal>
            Veja como funciona.
          </h2>
          <div className="xtt-shots" tabIndex={0} role="group" aria-label="Capturas de tela do XtoyTouch">
            {previews.map((preview) => (
              <figure key={preview.title}>
                <img
                  src={preview.src}
                  width={preview.width}
                  height={preview.height}
                  alt={preview.alt}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>
                  <b>{preview.title}</b>
                  {preview.description}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="como-instalar" className="xtt-sec">
          <div className="xtt-inst">
            <div data-reveal>
              <h2 className="xt-h2">Três passos.</h2>
              <ol className="xt-steps">
                <li>
                  <Puzzle className="xt-i xt-steps__ico" aria-hidden="true" />
                  <span>
                    Instale um gerenciador
                    <small>Use um gerenciador compatível, como Tampermonkey, Violentmonkey ou Userscripts.</small>
                  </span>
                </li>
                <li>
                  <Download className="xt-i xt-steps__ico" aria-hidden="true" />
                  <span>
                    Abra o instalador
                    <small>Toque em “Instalar XtoyTouch” e confirme a instalação no seu gerenciador.</small>
                  </span>
                </li>
                <li>
                  <Play className="xt-i xt-steps__ico" aria-hidden="true" />
                  <span>
                    Abra o Xbox Cloud Gaming
                    <small>Com o script ativado, acesse o xCloud pelo navegador compatível.</small>
                  </span>
                </li>
              </ol>
            </div>
            <aside className="xtt-upd xt-card" data-reveal>
              <h3 className="xt-h3">Novas versões sem reinstalar tudo.</h3>
              <p>
                O XtoyTouch informa ao gerenciador onde consultar a versão atual e onde baixar o arquivo completo.
                Quando uma versão mais nova for publicada, gerenciadores compatíveis podem detectar a mudança e oferecer
                ou aplicar a atualização.
              </p>
              <ul className="xtt-checks">
                <li>
                  <Check /> Arquivo de atualização separado e leve
                </li>
                <li>
                  <Check /> Endereço oficial e estável em xtoybox.cloud
                </li>
                <li>
                  <Check /> Mesmo nome e namespace para preservar a instalação
                </li>
              </ul>
              <DownloadButton full href={INSTALL_URL}>
                Instalar versão {version}
              </DownloadButton>
            </aside>
          </div>
          <p className="xt-note xtt-note" data-reveal>
            <Info className="xt-i" aria-hidden="true" />
            <span>
              <b>Projeto independente.</b> O XtoyTouch é um userscript independente para uso no navegador e não é
              afiliado, endossado ou patrocinado pela Microsoft ou Xbox.
            </span>
          </p>
        </section>
      </div>
    </SiteShell>
  );
}
