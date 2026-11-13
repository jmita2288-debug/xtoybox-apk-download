import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Paperclip, Send } from "lucide-react";
import { PageHead, SiteShell } from "@/components/xt/SiteChrome";
import { SpeedLinesIcon } from "@/components/xt/icons";

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
    <SiteShell page="reportar-bugs">
      <div className="xt-wrap xt-page">
        <div className="xt-rep">
          <div>
            <PageHead
              title="Ajude a gente a melhorar."
              lede="Um bom relatório encurta o caminho entre encontrar um problema e entregar a correção."
            />
            <ol className="xt-steps">
              <li>
                <span>
                  Descreva o momento
                  <small>Conte em qual tela o problema apareceu.</small>
                </span>
              </li>
              <li>
                <span>
                  Explique como repetir
                  <small>Liste os passos que levaram ao erro.</small>
                </span>
              </li>
              <li>
                <span>
                  Envie uma referência
                  <small>Imagem ou vídeo ajudam quando disponíveis.</small>
                </span>
              </li>
            </ol>
          </div>

          <form onSubmit={handleSubmit} className="xt-form xt-card">
            <h2 className="xt-h3" style={{ fontSize: 24 }}>
              Conte o que aconteceu.
            </h2>
            <p className="xt-fine" style={{ margin: "6px 0 22px" }}>
              Preencha os campos com o máximo de detalhes possível.
            </p>

            <div className="xt-field">
              <label htmlFor="name">Nome ou apelido</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                placeholder="Como podemos te chamar"
                className="xt-input"
                autoComplete="nickname"
                required
              />
            </div>
            <div className="xt-grid2">
              <div className="xt-field">
                <label htmlFor="appVersion">Versão do app</label>
                <input
                  id="appVersion"
                  type="text"
                  value={form.appVersion}
                  onChange={(event) => update("appVersion", event.target.value)}
                  placeholder="Ex.: 1.1.14"
                  className="xt-input"
                  autoComplete="off"
                  spellCheck={false}
                  required
                />
              </div>
              <div className="xt-field">
                <label htmlFor="deviceModel">Modelo do aparelho</label>
                <input
                  id="deviceModel"
                  type="text"
                  value={form.deviceModel}
                  onChange={(event) => update("deviceModel", event.target.value)}
                  placeholder="Ex.: Samsung, Xiaomi, TV Box"
                  className="xt-input"
                  autoComplete="off"
                  required
                />
              </div>
            </div>
            <div className="xt-field">
              <label htmlFor="deviceType">Tipo de aparelho</label>
              <select
                id="deviceType"
                value={form.deviceType}
                onChange={(event) => update("deviceType", event.target.value as DeviceType)}
                className="xt-input"
              >
                <option value="Celular">Celular</option>
                <option value="TV Box">TV Box</option>
                <option value="Smart TV">Smart TV</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div className="xt-field">
              <label htmlFor="description">Descrição do bug</label>
              <textarea
                id="description"
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="Explique o que aconteceu, em qual tela e como reproduzir."
                rows={7}
                className="xt-input"
                required
              />
            </div>
            <div className="xt-field">
              <span className="xt-label">
                Imagem ou vídeo <span>(opcional)</span>
              </span>
              <input
                id="attachment"
                type="file"
                accept="image/*,video/*"
                onChange={(event) => update("file", event.target.files?.[0] ?? null)}
                className="xt-file-input"
              />
              <label htmlFor="attachment" className="xt-file">
                <Paperclip />
                <span>{form.file ? form.file.name : "Selecionar um arquivo"}</span>
                <small>Imagem ou vídeo</small>
              </label>
            </div>

            {message && (
              <div role="status" className={`xt-msg xt-msg--${message.type}`}>
                {message.type === "success" && <CheckCircle2 />}
                {message.text}
              </div>
            )}

            <div className="xt-form__foot">
              <p>As informações serão usadas apenas para investigar o problema.</p>
              <button
                type="submit"
                disabled={submitting}
                className="xt-btn xt-btn--primary"
                data-state={submitting ? "loading" : undefined}
                aria-busy={submitting || undefined}
              >
                <span className="xt-btn__icon" aria-hidden="true">
                  <Send className="xt-i-idle" />
                  <SpeedLinesIcon className="xt-i-load" />
                </span>
                <span>{submitting ? "Enviando..." : "Enviar relatório"}</span>
                <i className="xt-btn__bar" aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </SiteShell>
  );
}
