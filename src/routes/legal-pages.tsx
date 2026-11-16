import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import {
  ChevronRight,
  CircleCheck,
  Copy,
  Database,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Fingerprint,
  Gamepad2,
  Globe,
  HardDrive,
  Info,
  KeyRound,
  Link2,
  Lock,
  Mail,
  Megaphone,
  Package,
  RefreshCw,
  Scale,
  ScanSearch,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Tag,
  TriangleAlert,
  UserRound,
  Users,
} from "lucide-react";
import { usePageMetadata } from "@/lib/page-metadata";
import { DownloadButton } from "@/components/xt/DownloadButton";
import { PageHead, SUPPORT_EMAIL, SiteShell, type XtPage } from "@/components/xt/SiteChrome";

const RELEASE_PAGE = "https://github.com/jmita2288-debug/xtoybox-apk-download/releases/tag/xtoybox-latest";
const FALLBACK_SHA256 = "1e75f0dcab47773c3a146717ebdade7e49b6859a769aabb9bdafed15c04edf5e";
const LEGAL_UPDATED = "30 de agosto de 2026";

type SecurityMetadata = {
  versionName?: string;
  apkUrl?: string;
  apkSizeFormatted?: string | null;
  apkSha256?: string | null;
  publishedAt?: string | null;
};

type IconType = ComponentType<{ className?: string }>;

/** Seção de documento: ícone, título e texto. O sumário da página é montado a partir destes blocos. */
function LegalCard({
  Icon,
  title,
  highlight = false,
  children,
}: {
  Icon: IconType;
  title: string;
  highlight?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`legal-card${highlight ? " legal-card--highlight" : ""}`}>
      <header className="legal-card__head">
        <span className="legal-card__ico" aria-hidden="true">
          <Icon className="xt-i" />
        </span>
        <h2>{title}</h2>
      </header>
      <div className="legal-card__body">{children}</div>
    </section>
  );
}

function LegalShell({
  page,
  title,
  intro,
  Icon,
  children,
}: {
  page: XtPage;
  title: string;
  intro: string;
  Icon: IconType;
  children: ReactNode;
}) {
  const [tocItems, setTocItems] = useState<Array<{ id: string; title: string }>>([]);

  // O sumário é montado a partir das seções renderizadas, sem duplicar nenhum texto.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".xt-doc__body > .legal-card"));
    const items = sections.map((section, index) => {
      section.id = section.id || `secao-${index + 1}`;
      section.setAttribute("data-reveal", "");
      return { id: section.id, title: section.querySelector("h2")?.textContent?.trim() ?? `Seção ${index + 1}` };
    });
    setTocItems(items);

    if (!("IntersectionObserver" in window)) return;
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          document.querySelectorAll<HTMLElement>(".xt-toc a").forEach((link) => {
            if (link.dataset.target === entry.target.id) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    sections.forEach((section) => spy.observe(section));
    return () => spy.disconnect();
  }, []);

  const goTo = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const details = event.currentTarget.closest("details");
    // Fecha o painel antes de rolar, para o destino não "fugir" quando a altura mudar.
    details?.removeAttribute("open");
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    });
  };

  const tocList = (
    <ol>
      {tocItems.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`} data-target={item.id} onClick={(event) => goTo(event, item.id)}>
            {item.title}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <SiteShell page={page}>
      <div className="xt-wrap xt-page">
        <PageHead
          title={title}
          lede={intro}
          Icon={Icon}
          meta={
            <span>
              <RefreshCw className="xt-i" aria-hidden="true" />
              Atualizado em {LEGAL_UPDATED}
            </span>
          }
        />
        <div className="xt-doc">
          <details className="xt-tocm">
            <summary>
              Nesta página
              <ChevronRight className="xt-i" />
            </summary>
            {tocList}
          </details>
          <nav className="xt-toc" aria-label="Nesta página">
            {tocList}
          </nav>
          <div className="xt-doc__body">{children}</div>
        </div>
      </div>
    </SiteShell>
  );
}

export function PrivacyPage() {
  usePageMetadata(
    "Política de Privacidade — XTOYBOX",
    "Como o aplicativo e o site XTOYBOX tratam autenticação Microsoft/Xbox, dados da conta, armazenamento local, permissões e suporte.",
    "/privacidade",
  );

  return (
    <LegalShell
      page="privacidade"
      Icon={Lock}
      title="Política de Privacidade"
      intro="O que o aplicativo realmente acessa, o que fica no seu aparelho e como o site trata as informações que você envia."
    >
      <LegalCard highlight Icon={ShieldCheck} title="Conta e senha: o ponto mais importante">
          <p>
            O código atual do XTOYBOX não implementa um sistema próprio para receber ou armazenar a senha da sua conta Microsoft.
            A autenticação é realizada por fluxos de autorização da Microsoft e do Xbox. Depois que a autorização é concluída,
            o aplicativo recebe e utiliza tokens de autenticação e de sessão para acessar os recursos permitidos pela sua conta.
          </p>
          <p>
            Esses tokens são diferentes da sua senha, mas continuam sendo informações sensíveis. Eles podem permanecer armazenados
            localmente no aparelho para manter a sessão ativa e permitir renovação de acesso sem exigir um novo login a cada uso.
          </p>
      </LegalCard>

      <LegalCard Icon={Users} title="1. A quem esta política se aplica">
        <p>
          Esta política cobre o aplicativo XTOYBOX para Android e o site oficial xtoybox.cloud. O aplicativo é um cliente
          independente para Remote Play do seu próprio console Xbox e para experiências compatíveis disponibilizadas pelos serviços
          oficiais do Xbox. O XTOYBOX não opera um serviço próprio de cloud gaming nem substitui os serviços da Microsoft.
        </p>
      </LegalCard>

      <LegalCard Icon={KeyRound} title="2. Como funciona a autenticação">
        <p>
          O aplicativo possui fluxos de autenticação que se comunicam com os sistemas de login e autorização da Microsoft/Xbox.
          No fluxo por código de dispositivo, o XTOYBOX solicita um código à Microsoft e aguarda a autorização feita pelo usuário.
          Em um fluxo compatível anterior, a página de autorização da Microsoft pode ser exibida dentro do aplicativo e o XTOYBOX
          recebe o redirecionamento de conclusão para trocar o código autorizado por tokens de sessão.
        </p>
        <p>
          Na implementação revisada, não existe código destinado a copiar campos de senha, salvar a senha digitada ou enviá-la para
          um servidor pertencente ao projeto XTOYBOX. O que o aplicativo processa após a autorização são códigos e tokens emitidos
          pelos serviços Microsoft/Xbox, como tokens de acesso, renovação, Xbox/XSTS e streaming.
        </p>
      </LegalCard>

      <LegalCard Icon={UserRound} title="3. Informações da conta Xbox acessadas">
        <p>
          Dependendo da tela ou função utilizada, o aplicativo consulta dados fornecidos pelas APIs Xbox necessários para apresentar
          e operar os recursos do app. Isso pode incluir Gamertag, nome de exibição, imagem de perfil, Gamerscore e identificadores
          da conta Xbox usados pelas próprias APIs.
        </p>
        <p>
          Recursos específicos também podem consultar a lista e o estado dos seus consoles para Remote Play, amigos e presença,
          histórico e detalhes de conquistas, títulos/jogos, catálogo compatível, favoritos e informações necessárias para iniciar
          ou manter uma sessão de streaming. Nem todos esses dados são consultados o tempo inteiro; o acesso depende do recurso que
          você utiliza.
        </p>
      </LegalCard>

      <LegalCard Icon={Database} title="4. O que fica armazenado localmente no aplicativo">
        <p>
          Para manter o funcionamento entre uma abertura e outra, o XTOYBOX usa armazenamento local no aparelho. O código atual
          salva tokens de autenticação e sessão, incluindo tokens usados para renovação, acesso Xbox, Remote Play e streaming.
          Também podem ser mantidas preferências do aplicativo, configurações de vídeo, áudio, controles e idioma.
        </p>
        <p>
          O app também mantém caches locais para reduzir chamadas repetidas: informações de consoles podem permanecer em cache por
          até 30 dias e dados do catálogo/xCloud por até 15 dias. Favoritos e outras preferências locais podem ser preservados quando
          o cache é renovado. Esses dados ficam no armazenamento do aplicativo no dispositivo; eles não são a senha da sua conta.
        </p>
        <p>
          A implementação revisada utiliza armazenamento local MMKV e não configura, nessa camada do código, uma chave adicional de
          criptografia própria do XTOYBOX. Por isso, esta política não promete uma proteção criptográfica adicional que o código não
          demonstra. Proteger o aparelho com bloqueio de tela e manter o sistema atualizado continua sendo importante.
        </p>
      </LegalCard>

      <LegalCard Icon={Smartphone} title="5. Permissões do Android">
        <p>
          O manifesto do aplicativo declara permissões relacionadas a internet e estado da rede/Wi-Fi, necessárias para autenticação
          e streaming; áudio e microfone, quando recursos de voz são utilizados; Bluetooth e conexão com controles; vibração;
          sensores; manutenção da atividade durante a sessão e ajustes de áudio. O suporte a microfone é opcional no aplicativo e
          não significa gravação permanente de áudio.
        </p>
        <p>
          O manifesto também contém permissões de compatibilidade herdadas, incluindo armazenamento externo e estado do telefone em
          determinadas versões do Android. A presença de uma permissão no manifesto não significa que o XTOYBOX esteja coletando
          continuamente todos os dados associados a ela. O projeto pode revisar e remover permissões antigas quando deixarem de ser
          necessárias para compatibilidade.
        </p>
      </LegalCard>

      <LegalCard Icon={Globe} title="6. Comunicação com serviços externos no aplicativo">
        <p>
          Os fluxos revisados se comunicam diretamente com domínios e APIs da Microsoft/Xbox para autenticação, autorização Xbox,
          perfil, consoles, presença, conquistas e sessões de streaming. A disponibilidade, retenção e tratamento de dados dentro
          desses serviços também estão sujeitos às regras e políticas da Microsoft.
        </p>
        <p>
          O aplicativo também inicializa um SDK da Umeng presente na base Android do projeto. Como esse componente é de terceiros,
          ele pode processar informações técnicas relacionadas ao aplicativo ou ao dispositivo conforme o funcionamento do próprio
          SDK e sua configuração. Não foi identificado no código revisado um envio da senha Microsoft para esse SDK.
        </p>
        <p>
          Algumas configurações avançadas permitem definir parâmetros próprios de rede/servidor. Quando você fornece manualmente
          endereço, usuário ou credencial para um servidor configurável, esses valores são tratados como configuração local do app e
          usados somente quando a função correspondente é ativada.
        </p>
      </LegalCard>

      <LegalCard Icon={Download} title="7. Site oficial e download">
        <p>
          Você não precisa criar uma conta no site nem informar sua conta Microsoft para navegar ou baixar o APK. O botão oficial de
          download leva ao arquivo publicado pelo projeto. O site pode processar dados técnicos básicos necessários para entregar as
          páginas, proteger as requisições e manter o funcionamento do serviço, sem transformar esses dados em um perfil de conta do
          XTOYBOX.
        </p>
        <a className="legal-text-link" href="/seguranca-download">
          <FileCheck2 className="xt-i" /> Conferir o APK oficial e o SHA-256
        </a>
      </LegalCard>

      <LegalCard Icon={Mail} title="8. Relatórios de problemas e contato">
        <p>
          Se você decidir enviar um relatório de problema por e-mail ou Discord, podem ser enviados nome ou apelido, versão do aplicativo, modelo e tipo do
          aparelho, descrição do problema e, opcionalmente, uma imagem ou vídeo anexado. Essas informações são usadas para entender
          e corrigir o problema relatado.
        </p>
        <p>
          Nunca envie senha, código de verificação, token de autenticação ou outra credencial de conta em relatórios de bug, e-mail,
          Discord ou mensagem de suporte. O suporte do XTOYBOX não precisa da sua senha para investigar problemas no aplicativo.
        </p>
      </LegalCard>

      <LegalCard Icon={Megaphone} title="9. Publicidade no site">
        <p>
          A publicidade do site é separada do aplicativo. O site oficial atualmente carrega o Google AdSense; o APK XTOYBOX não usa
          o código do AdSense instalado na página. Quando anúncios são exibidos no site, o Google e fornecedores autorizados podem
          processar cookies, armazenamento local, identificadores e dados técnicos conforme suas regras e as escolhas de consentimento
          aplicáveis ao visitante.
        </p>
        <div className="legal-inline-links">
          <a href="https://policies.google.com/technologies/partner-sites?hl=pt-BR" target="_blank" rel="noreferrer">
            Como o Google usa dados <ExternalLink className="xt-i" />
          </a>
          <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer">
            Preferências de anúncios <ExternalLink className="xt-i" />
          </a>
        </div>
      </LegalCard>

      <LegalCard Icon={SlidersHorizontal} title="10. Compartilhamento, retenção e controle">
        <p>
          O projeto não vende informações pessoais enviadas ao suporte. Dados locais do aplicativo permanecem no dispositivo até
          serem substituídos, limpos pelo próprio fluxo do app, removidos ao limpar os dados do aplicativo ou eliminados com a
          desinstalação conforme o comportamento do Android. Dados processados diretamente pela Microsoft/Xbox ou por outros serviços
          externos seguem também as políticas desses respectivos serviços.
        </p>
        <p>
          Se você suspeitar de acesso indevido à conta Microsoft, altere as credenciais e revise as sessões e opções de segurança
          diretamente na sua conta Microsoft. Para dúvidas sobre informações enviadas ao suporte XTOYBOX, use o contato oficial abaixo.
        </p>
        <a className="legal-contact" href={`mailto:${SUPPORT_EMAIL}`}>
          <Mail className="xt-i" /> {SUPPORT_EMAIL}
        </a>
        <small>Última atualização: 30 de agosto de 2026.</small>
      </LegalCard>
    </LegalShell>
  );
}


export function TermsPage() {
  usePageMetadata(
    "Termos de Uso — XTOYBOX",
    "Condições de uso do aplicativo e do site XTOYBOX, incluindo conta Xbox, Remote Play, Cloud Gaming, permissões, APK e atualizações.",
    "/termos",
  );

  return (
    <LegalShell
      page="termos"
      Icon={FileText}
      title="Termos de Uso"
      intro="Regras simples para usar o aplicativo e o site XTOYBOX com segurança e sem promessas que dependem de serviços externos."
    >
      <LegalCard highlight Icon={ShieldCheck} title="Em resumo">
          <p>
            O XTOYBOX é um cliente independente para Android. Use o aplicativo com sua própria conta e seus próprios dispositivos,
            baixe o APK pela fonte oficial e lembre que Remote Play, autenticação e Xbox Cloud Gaming dependem dos serviços da Microsoft.
          </p>
      </LegalCard>

      <LegalCard Icon={Info} title="1. Sobre o XTOYBOX">
        <p>
          O XTOYBOX é um projeto independente para Android, desenvolvido a partir de uma base open source e modificado para oferecer
          uma interface própria de Remote Play e acesso a experiências compatíveis com Xbox Cloud Gaming. O projeto não é afiliado,
          patrocinado ou endossado pela Microsoft ou Xbox, e não opera servidores próprios de jogos na nuvem.
        </p>
      </LegalCard>

      <LegalCard Icon={KeyRound} title="2. Conta Microsoft/Xbox e autenticação">
        <p>
          Para utilizar funções ligadas ao Xbox, você precisa usar uma conta Microsoft/Xbox válida e autorizá-la pelos fluxos
          compatíveis oferecidos pelo aplicativo. O XTOYBOX utiliza códigos e tokens emitidos pelos serviços Microsoft/Xbox para
          manter a sessão e realizar chamadas necessárias aos recursos do app.
        </p>
        <p>
          O projeto não solicita que você envie sua senha por e-mail, Discord, formulário de suporte ou qualquer canal do XTOYBOX.
          Nunca compartilhe senha, código de verificação ou token de sessão com pessoas que afirmem prestar suporte em nome do projeto.
        </p>
      </LegalCard>

      <LegalCard Icon={Gamepad2} title="3. Remote Play e Xbox Cloud Gaming">
        <p>
          O Remote Play depende de um console Xbox compatível associado à sua conta, da disponibilidade dos serviços Xbox e das
          condições da sua rede. Recursos de Xbox Cloud Gaming dependem do catálogo, região, conta, assinatura e regras definidas
          pela Microsoft. Nem todo jogo, conta, plano ou região terá necessariamente os mesmos recursos disponíveis.
        </p>
        <p>
          O XTOYBOX funciona como cliente para esses serviços. O projeto não controla filas, catálogo, disponibilidade, manutenção,
          bloqueios, limites de sessão ou mudanças aplicadas pela Microsoft aos serviços oficiais.
        </p>
      </LegalCard>

      <LegalCard Icon={Database} title="4. Dados locais, sessão e configurações">
        <p>
          Para funcionar corretamente, o aplicativo pode manter localmente tokens de autenticação e streaming, informações em cache
          sobre consoles e jogos e as preferências escolhidas por você, como vídeo, áudio, controles, idioma e opções de rede.
          Esses dados ajudam a manter a sessão e reduzir carregamentos repetidos.
        </p>
        <p>
          Tokens de sessão são informações sensíveis. Você é responsável por manter seu aparelho protegido e evitar compartilhar
          arquivos, backups, logs ou dados do aplicativo com terceiros desconhecidos.
        </p>
      </LegalCard>

      <LegalCard Icon={Smartphone} title="5. Permissões e recursos do aparelho">
        <p>
          O Android pode apresentar permissões relacionadas a internet/rede, áudio e microfone, Bluetooth, controles, vibração,
          sensores, armazenamento e outros recursos necessários ou mantidos por compatibilidade. Alguns recursos são opcionais e
          só fazem sentido quando ativados pelo usuário, como o uso de microfone durante uma sessão compatível.
        </p>
        <p>
          Não conceda permissões a um APK obtido de origem desconhecida. Compare a versão e, se desejar uma conferência adicional,
          o SHA-256 publicado na página oficial de segurança.
        </p>
      </LegalCard>

      <LegalCard Icon={Package} title="6. Instalação do APK e origem oficial">
        <p>
          O XTOYBOX é distribuído como APK externo para Android. A instalação pode exigir que o sistema permita aplicativos obtidos
          fora da loja. Baixe somente pelo site oficial do projeto ou pela Release oficial correspondente e não instale arquivos
          enviados por terceiros como se fossem versões oficiais do XTOYBOX.
        </p>
        <a className="legal-text-link" href="/seguranca-download">
          <FileCheck2 className="xt-i" /> Ver como confirmar o arquivo oficial
        </a>
      </LegalCard>

      <LegalCard Icon={CircleCheck} title="7. Uso adequado">
        <p>
          O aplicativo deve ser usado com contas, consoles, jogos e serviços aos quais você tenha acesso legítimo. Não use o XTOYBOX
          para tentar obter acesso não autorizado a contas, consoles ou serviços, contornar mecanismos de segurança ou praticar
          atividades que violem regras dos serviços utilizados ou a legislação aplicável.
        </p>
      </LegalCard>

      <LegalCard Icon={RefreshCw} title="8. Atualizações e compatibilidade">
        <p>
          O XTOYBOX pode receber correções, otimizações, alterações de interface, mudanças de compatibilidade e novos requisitos.
          Uma atualização dos serviços Xbox, do Android ou de APIs externas pode exigir mudanças no aplicativo e, em alguns casos,
          causar indisponibilidade temporária de determinadas funções.
        </p>
        <p>
          Não existe garantia de funcionamento permanente em todos os aparelhos, redes, versões do Android, controles ou serviços
          externos. Versões antigas do APK podem deixar de funcionar corretamente e não devem ser tratadas como permanentemente suportadas.
        </p>
      </LegalCard>

      <LegalCard Icon={Link2} title="9. Serviços e conteúdos de terceiros">
        <p>
          Microsoft, Xbox, GitHub, Discord e outros serviços acessados por links ou funções próprias mantêm seus próprios
          termos e políticas. O XTOYBOX não controla contas, assinaturas, conteúdos, disponibilidade ou decisões tomadas por essas
          plataformas. Ao utilizar um serviço externo, as regras desse serviço também se aplicam.
        </p>
      </LegalCard>

      <LegalCard Icon={Lock} title="10. Privacidade e segurança da conta">
        <p>
          O tratamento de tokens, dados da conta Xbox, dados locais, permissões e informações enviadas pelo site está detalhado na
          Política de Privacidade. Antes de usar uma conta no aplicativo, recomendamos a leitura desse documento, especialmente da
          seção sobre autenticação e armazenamento local.
        </p>
        <a className="legal-text-link" href="/privacidade">
          <ShieldCheck className="xt-i" /> Ler a Política de Privacidade
        </a>
      </LegalCard>

      <LegalCard Icon={Scale} title="11. Código, licenças e marcas">
        <p>
          A base open source utilizada pelo projeto mantém os créditos e licenças aplicáveis. O XTOYBOX inclui modificações,
          interface e otimizações próprias, preservando avisos de licença correspondentes ao código de origem. Xbox, Microsoft e
          marcas relacionadas pertencem aos seus respectivos proprietários e não indicam afiliação oficial com o XTOYBOX.
        </p>
      </LegalCard>

      <LegalCard Icon={Mail} title="12. Contato">
        <p>
          Para dúvidas sobre estes termos, privacidade, segurança do APK ou problemas no aplicativo, utilize o canal oficial abaixo.
          Não envie senhas, códigos de autenticação nem tokens de conta em mensagens de suporte.
        </p>
        <a className="legal-contact" href={`mailto:${SUPPORT_EMAIL}`}>
          <Mail className="xt-i" /> {SUPPORT_EMAIL}
        </a>
        <small>Última atualização: 30 de agosto de 2026.</small>
      </LegalCard>
    </LegalShell>
  );
}


export function DownloadSecurityPage() {
  const [metadata, setMetadata] = useState<SecurityMetadata | null>(null);
  const [copied, setCopied] = useState(false);

  usePageMetadata(
    "Segurança do Download — XTOYBOX",
    "Confira a origem oficial, versão e SHA-256 do APK XTOYBOX antes de instalar.",
    "/seguranca-download",
  );

  useEffect(() => {
    let active = true;
    fetch(`/api/apk-metadata?t=${Date.now()}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && data) setMetadata(data as SecurityMetadata);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const version = metadata?.versionName || "1.1.15";
  const sha256 = metadata?.apkSha256 || FALLBACK_SHA256;
  const fileName = `XTOYBOX-v${version}.apk`;

  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(sha256);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <SiteShell page="seguranca-download">
      <div className="xt-wrap xt-page">
        <PageHead
          Icon={ShieldCheck}
          title="Segurança do download"
          lede="Informações para você confirmar a origem e a integridade do APK antes de instalar."
        />
        <div className="xt-sgrid xt-doc__body">
          <section className="legal-card legal-card--highlight legal-security-intro" style={{ gridArea: "hl" }} data-reveal>
            <header className="legal-card__head">
              <span className="legal-card__ico" aria-hidden="true">
                <Link2 className="xt-i" />
              </span>
              <h2>Arquivo publicado na Release oficial</h2>
            </header>
            <div className="legal-card__body">
              <p>
                O botão de download do site redireciona para o asset público da Release do projeto no GitHub. O site não
                reconstrói nem altera o APK durante esse redirecionamento.
              </p>
            </div>
          </section>

          <div className="xt-sbox xt-card" data-reveal>
            <p className="xt-kick">
              <CircleCheck className="xt-i" aria-hidden="true" />
              Versão pública atual
            </p>
            <h2 className="xt-fn" translate="no">
              {fileName}
            </h2>
            <dl className="xt-meta">
              <div>
                <dt>
                  <Tag className="xt-i" aria-hidden="true" />
                  Versão
                </dt>
                <dd>{version}</dd>
              </div>
              <div>
                <dt>
                  <HardDrive className="xt-i" aria-hidden="true" />
                  Tamanho
                </dt>
                <dd>{metadata?.apkSizeFormatted || "107,2 MB"}</dd>
              </div>
              <div>
                <dt>
                  <Globe className="xt-i" aria-hidden="true" />
                  Origem
                </dt>
                <dd>GitHub Release</dd>
              </div>
            </dl>

            <div className="xt-hash">
              <div>
                <small>
                  <Fingerprint className="xt-i" aria-hidden="true" />
                  SHA-256
                </small>
                <code>{sha256}</code>
              </div>
              <button
                type="button"
                className="xt-btn xt-btn--secondary"
                data-state={copied ? "done" : undefined}
                onClick={copyHash}
              >
                <span className="xt-btn__icon" aria-hidden="true">
                  <Copy className="xt-i-idle" />
                  <CircleCheck className="xt-i-done" />
                </span>
                <span>{copied ? "Copiado" : "Copiar"}</span>
              </button>
            </div>

            <p className="xt-help">
              O SHA-256 funciona como uma impressão digital do arquivo. Se o valor calculado no APK que você recebeu for
              diferente do valor acima, não instale esse arquivo e faça o download novamente pela fonte oficial.
            </p>

            <div className="xt-btnrow">
              <DownloadButton href="/api/download">Baixar APK oficial</DownloadButton>
              <a className="xt-btn xt-btn--secondary" href={RELEASE_PAGE} target="_blank" rel="noreferrer">
                <span>Ver Release no GitHub</span>
                <ExternalLink className="xt-i" />
              </a>
            </div>
          </div>

          <section className="legal-card" style={{ gridArea: "ver" }} data-reveal>
            <header className="legal-card__head">
              <span className="legal-card__ico" aria-hidden="true">
                <ScanSearch className="xt-i" />
              </span>
              <h2>Como verificar</h2>
            </header>
            <div className="legal-card__body">
              <p>
                Usuários que desejarem uma conferência técnica podem calcular o SHA-256 do APK com um gerenciador de
                arquivos ou uma ferramenta de checksum compatível com o aparelho e comparar o resultado, caractere por
                caractere, com o valor publicado acima.
              </p>
            </div>
          </section>

          <section className="legal-card" style={{ gridArea: "fnd" }} data-reveal>
            <header className="legal-card__head">
              <span className="legal-card__ico" aria-hidden="true">
                <TriangleAlert className="xt-i" />
              </span>
              <h2>Encontrou algo diferente?</h2>
            </header>
            <div className="legal-card__body">
              <p>Não instale o arquivo e entre em contato com o projeto para que possamos verificar.</p>
              <a className="legal-contact" href={`mailto:${SUPPORT_EMAIL}`}>
                <Mail className="xt-i" /> {SUPPORT_EMAIL}
              </a>
            </div>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}
