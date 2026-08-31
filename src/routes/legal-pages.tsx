import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileCheck2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import logo from "@/assets/logo-xtoybox.png";

const SUPPORT_EMAIL = "xtoybox@proton.me";
const RELEASE_PAGE = "https://github.com/jmita2288-debug/xtoybox-apk-download/releases/tag/xtoybox-latest";
const FALLBACK_SHA256 = "1e75f0dcab47773c3a146717ebdade7e49b6859a769aabb9bdafed15c04edf5e";

type SecurityMetadata = {
  versionName?: string;
  apkUrl?: string;
  apkSizeFormatted?: string | null;
  apkSha256?: string | null;
  publishedAt?: string | null;
};

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function usePageMetadata(title: string, description: string, path: string) {
  useEffect(() => {
    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", `https://xtoybox.cloud${path}`);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `https://xtoybox.cloud${path}`;
  }, [description, path, title]);
}

function LegalHeader() {
  return (
    <header className="legal-header">
      <div className="legal-container legal-header__inner">
        <a className="legal-brand" href="/" aria-label="Página inicial do XTOYBOX">
          <img src={logo} alt="" />
          <span>
            <strong>XTOYBOX</strong>
            <small>Informações oficiais</small>
          </span>
        </a>
        <nav className="legal-header__nav" aria-label="Informações do projeto">
          <a href="/seguranca-download">Segurança</a>
          <a href="/privacidade">Privacidade</a>
          <a href="/termos">Termos</a>
        </nav>
        <a className="legal-back" href="/">
          <ArrowLeft /> Voltar ao site
        </a>
      </div>
    </header>
  );
}

function LegalFooter() {
  return (
    <footer className="legal-footer">
      <div className="legal-container legal-footer__inner">
        <div>
          <strong>XTOYBOX</strong>
          <p>Projeto independente, sem vínculo ou afiliação com Microsoft ou Xbox.</p>
        </div>
        <div className="legal-footer__links">
          <a href="/privacidade">Privacidade</a>
          <a href="/termos">Termos</a>
          <a href="/seguranca-download">Segurança do download</a>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </div>
      </div>
    </footer>
  );
}

function LegalShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="legal-page">
      <LegalHeader />
      <main className="legal-container legal-main">
        <section className="legal-hero">
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
        </section>
        <div className="legal-content">{children}</div>
      </main>
      <LegalFooter />
    </div>
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
      eyebrow="PRIVACIDADE"
      title="Política de Privacidade"
      intro="O que o aplicativo realmente acessa, o que fica no seu aparelho e como o site trata as informações que você envia."
    >
      <section className="legal-card legal-card--highlight">
        <ShieldCheck />
        <div>
          <h2>Conta e senha: o ponto mais importante</h2>
          <p>
            O código atual do XTOYBOX não implementa um sistema próprio para receber ou armazenar a senha da sua conta Microsoft.
            A autenticação é realizada por fluxos de autorização da Microsoft e do Xbox. Depois que a autorização é concluída,
            o aplicativo recebe e utiliza tokens de autenticação e de sessão para acessar os recursos permitidos pela sua conta.
          </p>
          <p>
            Esses tokens são diferentes da sua senha, mas continuam sendo informações sensíveis. Eles podem permanecer armazenados
            localmente no aparelho para manter a sessão ativa e permitir renovação de acesso sem exigir um novo login a cada uso.
          </p>
        </div>
      </section>

      <section className="legal-card">
        <h2>1. A quem esta política se aplica</h2>
        <p>
          Esta política cobre o aplicativo XTOYBOX para Android e o site oficial xtoybox.cloud. O aplicativo é um cliente
          independente para Remote Play do seu próprio console Xbox e para experiências compatíveis disponibilizadas pelos serviços
          oficiais do Xbox. O XTOYBOX não opera um serviço próprio de cloud gaming nem substitui os serviços da Microsoft.
        </p>
      </section>

      <section className="legal-card">
        <h2>2. Como funciona a autenticação</h2>
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
      </section>

      <section className="legal-card">
        <h2>3. Informações da conta Xbox acessadas</h2>
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
      </section>

      <section className="legal-card">
        <h2>4. O que fica armazenado localmente no aplicativo</h2>
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
      </section>

      <section className="legal-card">
        <h2>5. Permissões do Android</h2>
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
      </section>

      <section className="legal-card">
        <h2>6. Comunicação com serviços externos no aplicativo</h2>
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
      </section>

      <section className="legal-card">
        <h2>7. Site oficial e download</h2>
        <p>
          Você não precisa criar uma conta no site nem informar sua conta Microsoft para navegar ou baixar o APK. O botão oficial de
          download leva ao arquivo publicado pelo projeto. O site pode processar dados técnicos básicos necessários para entregar as
          páginas, proteger as requisições e manter o funcionamento do serviço, sem transformar esses dados em um perfil de conta do
          XTOYBOX.
        </p>
        <a className="legal-text-link" href="/seguranca-download">
          <FileCheck2 /> Conferir o APK oficial e o SHA-256
        </a>
      </section>

      <section className="legal-card">
        <h2>8. Relatórios de bugs e contato</h2>
        <p>
          Se você decidir enviar um relatório pelo site, podem ser enviados nome ou apelido, versão do aplicativo, modelo e tipo do
          aparelho, descrição do problema e, opcionalmente, uma imagem ou vídeo anexado. Essas informações são usadas para entender
          e corrigir o problema relatado.
        </p>
        <p>
          Nunca envie senha, código de verificação, token de autenticação ou outra credencial de conta em relatórios de bug, e-mail,
          Discord ou mensagem de suporte. O suporte do XTOYBOX não precisa da sua senha para investigar problemas no aplicativo.
        </p>
      </section>

      <section className="legal-card">
        <h2>9. Publicidade no site</h2>
        <p>
          A publicidade do site é separada do aplicativo. O site oficial atualmente carrega o Google AdSense; o APK XTOYBOX não usa
          o código do AdSense instalado na página. Quando anúncios são exibidos no site, o Google e fornecedores autorizados podem
          processar cookies, armazenamento local, identificadores e dados técnicos conforme suas regras e as escolhas de consentimento
          aplicáveis ao visitante.
        </p>
        <div className="legal-inline-links">
          <a href="https://policies.google.com/technologies/partner-sites?hl=pt-BR" target="_blank" rel="noreferrer">
            Como o Google usa dados <ExternalLink />
          </a>
          <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer">
            Preferências de anúncios <ExternalLink />
          </a>
        </div>
      </section>

      <section className="legal-card">
        <h2>10. Compartilhamento, retenção e controle</h2>
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
          <Mail /> {SUPPORT_EMAIL}
        </a>
        <small>Última atualização: 30 de agosto de 2026.</small>
      </section>
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
      eyebrow="TERMOS"
      title="Termos de Uso"
      intro="Regras simples para usar o aplicativo e o site XTOYBOX com segurança e sem promessas que dependem de serviços externos."
    >
      <section className="legal-card legal-card--highlight">
        <ShieldCheck />
        <div>
          <h2>Em resumo</h2>
          <p>
            O XTOYBOX é um cliente independente para Android. Use o aplicativo com sua própria conta e seus próprios dispositivos,
            baixe o APK pela fonte oficial e lembre que Remote Play, autenticação e Xbox Cloud Gaming dependem dos serviços da Microsoft.
          </p>
        </div>
      </section>

      <section className="legal-card">
        <h2>1. Sobre o XTOYBOX</h2>
        <p>
          O XTOYBOX é um projeto independente para Android, desenvolvido a partir de uma base open source e modificado para oferecer
          uma interface própria de Remote Play e acesso a experiências compatíveis com Xbox Cloud Gaming. O projeto não é afiliado,
          patrocinado ou endossado pela Microsoft ou Xbox, e não opera servidores próprios de jogos na nuvem.
        </p>
      </section>

      <section className="legal-card">
        <h2>2. Conta Microsoft/Xbox e autenticação</h2>
        <p>
          Para utilizar funções ligadas ao Xbox, você precisa usar uma conta Microsoft/Xbox válida e autorizá-la pelos fluxos
          compatíveis oferecidos pelo aplicativo. O XTOYBOX utiliza códigos e tokens emitidos pelos serviços Microsoft/Xbox para
          manter a sessão e realizar chamadas necessárias aos recursos do app.
        </p>
        <p>
          O projeto não solicita que você envie sua senha por e-mail, Discord, formulário de suporte ou qualquer canal do XTOYBOX.
          Nunca compartilhe senha, código de verificação ou token de sessão com pessoas que afirmem prestar suporte em nome do projeto.
        </p>
      </section>

      <section className="legal-card">
        <h2>3. Remote Play e Xbox Cloud Gaming</h2>
        <p>
          O Remote Play depende de um console Xbox compatível associado à sua conta, da disponibilidade dos serviços Xbox e das
          condições da sua rede. Recursos de Xbox Cloud Gaming dependem do catálogo, região, conta, assinatura e regras definidas
          pela Microsoft. Nem todo jogo, conta, plano ou região terá necessariamente os mesmos recursos disponíveis.
        </p>
        <p>
          O XTOYBOX funciona como cliente para esses serviços. O projeto não controla filas, catálogo, disponibilidade, manutenção,
          bloqueios, limites de sessão ou mudanças aplicadas pela Microsoft aos serviços oficiais.
        </p>
      </section>

      <section className="legal-card">
        <h2>4. Dados locais, sessão e configurações</h2>
        <p>
          Para funcionar corretamente, o aplicativo pode manter localmente tokens de autenticação e streaming, informações em cache
          sobre consoles e jogos e as preferências escolhidas por você, como vídeo, áudio, controles, idioma e opções de rede.
          Esses dados ajudam a manter a sessão e reduzir carregamentos repetidos.
        </p>
        <p>
          Tokens de sessão são informações sensíveis. Você é responsável por manter seu aparelho protegido e evitar compartilhar
          arquivos, backups, logs ou dados do aplicativo com terceiros desconhecidos.
        </p>
      </section>

      <section className="legal-card">
        <h2>5. Permissões e recursos do aparelho</h2>
        <p>
          O Android pode apresentar permissões relacionadas a internet/rede, áudio e microfone, Bluetooth, controles, vibração,
          sensores, armazenamento e outros recursos necessários ou mantidos por compatibilidade. Alguns recursos são opcionais e
          só fazem sentido quando ativados pelo usuário, como o uso de microfone durante uma sessão compatível.
        </p>
        <p>
          Não conceda permissões a um APK obtido de origem desconhecida. Compare a versão e, se desejar uma conferência adicional,
          o SHA-256 publicado na página oficial de segurança.
        </p>
      </section>

      <section className="legal-card">
        <h2>6. Instalação do APK e origem oficial</h2>
        <p>
          O XTOYBOX é distribuído como APK externo para Android. A instalação pode exigir que o sistema permita aplicativos obtidos
          fora da loja. Baixe somente pelo site oficial do projeto ou pela Release oficial correspondente e não instale arquivos
          enviados por terceiros como se fossem versões oficiais do XTOYBOX.
        </p>
        <a className="legal-text-link" href="/seguranca-download">
          <FileCheck2 /> Ver como confirmar o arquivo oficial
        </a>
      </section>

      <section className="legal-card">
        <h2>7. Uso adequado</h2>
        <p>
          O aplicativo deve ser usado com contas, consoles, jogos e serviços aos quais você tenha acesso legítimo. Não use o XTOYBOX
          para tentar obter acesso não autorizado a contas, consoles ou serviços, contornar mecanismos de segurança ou praticar
          atividades que violem regras dos serviços utilizados ou a legislação aplicável.
        </p>
      </section>

      <section className="legal-card">
        <h2>8. Atualizações e compatibilidade</h2>
        <p>
          O XTOYBOX pode receber correções, otimizações, alterações de interface, mudanças de compatibilidade e novos requisitos.
          Uma atualização dos serviços Xbox, do Android ou de APIs externas pode exigir mudanças no aplicativo e, em alguns casos,
          causar indisponibilidade temporária de determinadas funções.
        </p>
        <p>
          Não existe garantia de funcionamento permanente em todos os aparelhos, redes, versões do Android, controles ou serviços
          externos. Versões antigas do APK podem deixar de funcionar corretamente e não devem ser tratadas como permanentemente suportadas.
        </p>
      </section>

      <section className="legal-card">
        <h2>9. Serviços e conteúdos de terceiros</h2>
        <p>
          Microsoft, Xbox, GitHub, Discord, Instagram e outros serviços acessados por links ou funções próprias mantêm seus próprios
          termos e políticas. O XTOYBOX não controla contas, assinaturas, conteúdos, disponibilidade ou decisões tomadas por essas
          plataformas. Ao utilizar um serviço externo, as regras desse serviço também se aplicam.
        </p>
      </section>

      <section className="legal-card">
        <h2>10. Privacidade e segurança da conta</h2>
        <p>
          O tratamento de tokens, dados da conta Xbox, dados locais, permissões e informações enviadas pelo site está detalhado na
          Política de Privacidade. Antes de usar uma conta no aplicativo, recomendamos a leitura desse documento, especialmente da
          seção sobre autenticação e armazenamento local.
        </p>
        <a className="legal-text-link" href="/privacidade">
          <ShieldCheck /> Ler a Política de Privacidade
        </a>
      </section>

      <section className="legal-card">
        <h2>11. Código, licenças e marcas</h2>
        <p>
          A base open source utilizada pelo projeto mantém os créditos e licenças aplicáveis. O XTOYBOX inclui modificações,
          interface e otimizações próprias, preservando avisos de licença correspondentes ao código de origem. Xbox, Microsoft e
          marcas relacionadas pertencem aos seus respectivos proprietários e não indicam afiliação oficial com o XTOYBOX.
        </p>
      </section>

      <section className="legal-card">
        <h2>12. Contato</h2>
        <p>
          Para dúvidas sobre estes termos, privacidade, segurança do APK ou problemas no aplicativo, utilize o canal oficial abaixo.
          Não envie senhas, códigos de autenticação nem tokens de conta em mensagens de suporte.
        </p>
        <a className="legal-contact" href={`mailto:${SUPPORT_EMAIL}`}>
          <Mail /> {SUPPORT_EMAIL}
        </a>
        <small>Última atualização: 30 de agosto de 2026.</small>
      </section>
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
    <LegalShell
      eyebrow="DOWNLOAD OFICIAL"
      title="Segurança do download"
      intro="Informações para você confirmar a origem e a integridade do APK antes de instalar."
    >
      <section className="legal-card legal-card--highlight legal-security-intro">
        <ShieldCheck />
        <div>
          <h2>Arquivo publicado na Release oficial</h2>
          <p>
            O botão de download do site redireciona para o asset público da Release do projeto no GitHub. O site não reconstrói
            nem altera o APK durante esse redirecionamento.
          </p>
        </div>
      </section>

      <section className="legal-card">
        <div className="security-status">
          <span className="security-status__icon"><CheckCircle2 /></span>
          <div>
            <small>VERSÃO PÚBLICA ATUAL</small>
            <h2>{fileName}</h2>
          </div>
        </div>

        <div className="security-grid">
          <div>
            <small>Versão</small>
            <strong>{version}</strong>
          </div>
          <div>
            <small>Tamanho</small>
            <strong>{metadata?.apkSizeFormatted || "107,2 MB"}</strong>
          </div>
          <div>
            <small>Origem</small>
            <strong>GitHub Release</strong>
          </div>
        </div>

        <div className="hash-box">
          <div>
            <small>SHA-256</small>
            <code>{sha256}</code>
          </div>
          <button type="button" onClick={copyHash}>
            <Copy /> {copied ? "Copiado" : "Copiar"}
          </button>
        </div>

        <p className="hash-help">
          O SHA-256 funciona como uma impressão digital do arquivo. Se o valor calculado no APK que você recebeu for diferente do
          valor acima, não instale esse arquivo e faça o download novamente pela fonte oficial.
        </p>

        <div className="legal-actions">
          <a className="legal-primary-button" href="/api/download">
            <Download /> Baixar APK oficial
          </a>
          <a className="legal-secondary-button" href={RELEASE_PAGE} target="_blank" rel="noreferrer">
            Ver Release no GitHub <ExternalLink />
          </a>
        </div>
      </section>

      <section className="legal-card">
        <h2>Como verificar</h2>
        <p>
          Usuários que desejarem uma conferência técnica podem calcular o SHA-256 do APK com um gerenciador de arquivos ou uma
          ferramenta de checksum compatível com o aparelho e comparar o resultado, caractere por caractere, com o valor publicado
          acima.
        </p>
      </section>

      <section className="legal-card">
        <h2>Encontrou algo diferente?</h2>
        <p>Não instale o arquivo e entre em contato com o projeto para que possamos verificar.</p>
        <a className="legal-contact" href={`mailto:${SUPPORT_EMAIL}`}>
          <Mail /> {SUPPORT_EMAIL}
        </a>
      </section>
    </LegalShell>
  );
}
