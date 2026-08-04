import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Bug, CheckCircle2, Paperclip, Send } from "lucide-react";
import logo from "@/assets/logo-xtoybox.png";

export const Route = createFileRoute("/reportar-bugs")({
  head: () => ({
    meta: [
      { title: "Reportar bugs — XTOYBOX" },
      {
        name: "description",
        content:
          "Envie um relatório de bug do XTOYBOX com detalhes do aparelho, versão do app e descrição do problema.",
      },
      { property: "og:title", content: "Reportar bugs — XTOYBOX" },
      {
        property: "og:description",
        content: "Formulário para reportar bugs do app XTOYBOX.",
      },
    ],
  }),
  component: ReportarBugsPage,
});

type DeviceType = "Celular" | "TV Box" | "Smart TV" | "Outro";

type FormState = {
  name: string;
  appVersion: string;
  deviceModel: string;
  deviceType: DeviceType;
  description: string;
  file: File | null;
};

const initialState: FormState = {
  name: "",
  appVersion: "",
  deviceModel: "",
  deviceType: "Celular",
  description: "",
  file: null,
};

export function ReportarBugsPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("appVersion", form.appVersion);
      data.append("deviceModel", form.deviceModel);
      data.append("deviceType", form.deviceType);
      data.append("description", form.description);
      if (form.file) data.append("attachment", form.file);

      const response = await fetch("/api/report-bug", { method: "POST", body: data });
      if (response.ok) {
        setMessage({ type: "success", text: "Relatório enviado com sucesso. Obrigado!" });
        setForm(initialState);
      } else {
        setMessage({
          type: "error",
          text: "Não foi possível enviar agora. Tente novamente mais tarde.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Não foi possível enviar agora. Tente novamente mais tarde.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="support-page">
      <header className="site-header">
        <div className="site-container site-header__inner">
          <a href="/" className="brand-lockup" aria-label="Voltar para a página inicial">
            <span className="brand-lockup__mark">
              <img src={logo} alt="" />
            </span>
            <span className="brand-lockup__copy">
              <strong>XTOYBOX</strong>
              <small>Central de suporte</small>
            </span>
          </a>
          <a href="/" className="support-back">
            <ArrowLeft /> Voltar ao site
          </a>
        </div>
      </header>

      <section className="site-container support-layout">
        <aside className="support-intro">
          <span className="support-label">SUPORTE / 01</span>
          <div className="support-intro__icon">
            <Bug />
          </div>
          <h1>
            Ajude a gente
            <br />a melhorar.
          </h1>
          <p>
            Um bom relatório encurta o caminho entre encontrar um problema e entregar a correção.
          </p>
          <ol className="support-guide">
            <li>
              <span>01</span>
              <div>
                <strong>Descreva o momento</strong>
                <small>Conte em qual tela o problema apareceu.</small>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Explique como repetir</strong>
                <small>Liste os passos que levaram ao erro.</small>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Envie uma referência</strong>
                <small>Imagem ou vídeo ajudam quando disponíveis.</small>
              </div>
            </li>
          </ol>
        </aside>

        <form onSubmit={handleSubmit} className="support-form">
          <div className="support-form__heading">
            <span>RELATÓRIO DE BUG</span>
            <h2>Conte o que aconteceu.</h2>
            <p>Preencha os campos com o máximo de detalhes possível.</p>
          </div>

          <div className="support-form__grid">
            <div className="form-field">
              <label htmlFor="name">Nome ou apelido</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                placeholder="Como podemos te chamar"
                className="field"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="appVersion">Versão do app</label>
              <input
                id="appVersion"
                type="text"
                value={form.appVersion}
                onChange={(event) => update("appVersion", event.target.value)}
                placeholder="Ex.: 1.1.14"
                className="field"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="deviceModel">Modelo do aparelho</label>
              <input
                id="deviceModel"
                type="text"
                value={form.deviceModel}
                onChange={(event) => update("deviceModel", event.target.value)}
                placeholder="Ex.: Samsung, Xiaomi, TV Box"
                className="field"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="deviceType">Tipo de aparelho</label>
              <select
                id="deviceType"
                value={form.deviceType}
                onChange={(event) => update("deviceType", event.target.value as DeviceType)}
                className="field"
              >
                <option value="Celular">Celular</option>
                <option value="TV Box">TV Box</option>
                <option value="Smart TV">Smart TV</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="description">Descrição do bug</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Explique o que aconteceu, em qual tela e como reproduzir."
              rows={7}
              className="field resize-y"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="attachment">
              Imagem ou vídeo <span>(opcional)</span>
            </label>
            <label htmlFor="attachment" className="file-field">
              <Paperclip />
              <span>{form.file ? form.file.name : "Selecionar um arquivo"}</span>
              <small>Imagem ou vídeo</small>
            </label>
            <input
              id="attachment"
              type="file"
              accept="image/*,video/*"
              onChange={(event) => update("file", event.target.files?.[0] ?? null)}
              className="hidden"
            />
          </div>

          {message && (
            <div role="status" className={`form-message form-message--${message.type}`}>
              {message.type === "success" && <CheckCircle2 />}
              {message.text}
            </div>
          )}

          <div className="support-form__footer">
            <p>As informações serão usadas apenas para investigar o problema.</p>
            <button type="submit" disabled={submitting} className="support-submit">
              <Send />
              {submitting ? "Enviando..." : "Enviar relatório"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
