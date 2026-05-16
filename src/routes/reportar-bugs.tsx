import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Bug, Send, Paperclip } from "lucide-react";

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

function ReportarBugsPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

      let apiAvailable = false;
      try {
        const res = await fetch("/api/report-bug", { method: "POST", body: data });
        apiAvailable = res.ok;
      } catch {
        apiAvailable = false;
      }

      if (apiAvailable) {
        setMessage({ type: "success", text: "Relatório enviado com sucesso. Obrigado!" });
        setForm(initialState);
      } else {
        setMessage({
          type: "success",
          text: "Formulário preparado. O envio será ativado em breve.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border/70 bg-background/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 transition focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/30">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <div className="inline-flex items-center gap-2 text-sm font-medium">
            <Bug className="h-4 w-4 text-primary" />
            Reportar bugs
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Reportar um bug</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Preencha os campos abaixo com o máximo de detalhes possível. Isso ajuda a identificar
            e corrigir o problema mais rápido.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-border/70 bg-card/40 p-6 shadow-sm"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium">
                Nome ou apelido
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Como podemos te chamar"
                className={inputClass}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="appVersion" className="text-sm font-medium">
                Versão do app
              </label>
              <input
                id="appVersion"
                type="text"
                value={form.appVersion}
                onChange={(e) => update("appVersion", e.target.value)}
                placeholder="Ex.: 1.4.2"
                className={inputClass}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="deviceModel" className="text-sm font-medium">
                Modelo do aparelho
              </label>
              <input
                id="deviceModel"
                type="text"
                value={form.deviceModel}
                onChange={(e) => update("deviceModel", e.target.value)}
                placeholder="Ex.: Samsung Galaxy A54"
                className={inputClass}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="deviceType" className="text-sm font-medium">
                Tipo de aparelho
              </label>
              <select
                id="deviceType"
                value={form.deviceType}
                onChange={(e) => update("deviceType", e.target.value as DeviceType)}
                className={inputClass}
              >
                <option value="Celular">Celular</option>
                <option value="TV Box">TV Box</option>
                <option value="Smart TV">Smart TV</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium">
              Descrição do bug
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Explique o que aconteceu, em qual tela e como reproduzir."
              rows={6}
              className={`${inputClass} resize-y`}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="attachment" className="text-sm font-medium">
              Anexar imagem ou vídeo (opcional)
            </label>
            <label
              htmlFor="attachment"
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border/70 bg-background/30 px-3 py-3 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              <Paperclip className="h-4 w-4" />
              <span className="truncate">
                {form.file ? form.file.name : "Selecionar arquivo"}
              </span>
            </label>
            <input
              id="attachment"
              type="file"
              accept="image/*,video/*"
              onChange={(e) => update("file", e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </div>

          {message && (
            <div
              className={`rounded-lg border px-3 py-2 text-sm ${
                message.type === "success"
                  ? "border-primary/30 bg-primary/10 text-foreground"
                  : "border-destructive/40 bg-destructive/10 text-destructive"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Enviando..." : "Enviar relatório"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}