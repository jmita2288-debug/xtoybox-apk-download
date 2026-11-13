import React from "react";
import { createRoot } from "react-dom/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { DownloadAdGate } from "./components/DownloadAdGate";
import { DownloadCounter } from "./components/DownloadCounter";
import { RefinedIndex } from "./routes/index-refined";
import { DownloadsPage } from "./routes/downloads-page";
import { DownloadSecurityPage, PrivacyPage, TermsPage } from "./routes/legal-pages";
import { ReportarBugsPage } from "./routes/reportar-bugs";
import { XtoyTouchPage } from "./routes/xtoytouch";
import "./xt-ui.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

function App() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (path === "/reportar-bugs") return <ReportarBugsPage />;
  if (path === "/privacidade") return <PrivacyPage />;
  if (path === "/termos") return <TermsPage />;
  if (path === "/seguranca-download") return <DownloadSecurityPage />;
  if (path === "/xtoytouch") return <XtoyTouchPage />;
  if (path === "/downloads") return <DownloadsPage />;
  return (
    <>
      <RefinedIndex />
      <DownloadCounter />
    </>
  );
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
    <DownloadAdGate />
    <SpeedInsights />
  </React.StrictMode>,
);
