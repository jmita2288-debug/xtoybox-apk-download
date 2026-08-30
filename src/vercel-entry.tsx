import React from "react";
import { createRoot } from "react-dom/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { DownloadAdGate } from "./components/DownloadAdGate";
import { DownloadCounter } from "./components/DownloadCounter";
import { HomeUiEnhancer } from "./components/HomeUiEnhancer";
import { SocialContactEnhancer } from "./components/SocialContactEnhancer";
import { TrustEnhancer } from "./components/TrustEnhancer";
import { RefinedIndex } from "./routes/index-refined";
import { DownloadSecurityPage, PrivacyPage, TermsPage } from "./routes/legal-pages";
import { ReportarBugsPage } from "./routes/reportar-bugs";
import { XtoyTouchPage } from "./routes/xtoytouch";
import "./styles.css";
import "./refined-site.css";
import "./download-counter.css";
import "./download-ad-gate.css";
import "./social-contact.css";
import "./trust-legal.css";
import "./xtoytouch.css";
import "./home-ui-enhancements.css";
import "./home-menu-refinement.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

function App() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (path === "/reportar-bugs") return <ReportarBugsPage />;
  if (path === "/privacidade") return <PrivacyPage />;
  if (path === "/termos") return <TermsPage />;
  if (path === "/seguranca-download") return <DownloadSecurityPage />;
  if (path === "/xtoytouch") return <XtoyTouchPage />;
  return <><RefinedIndex /><DownloadCounter /><HomeUiEnhancer /></>;
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
    <DownloadAdGate />
    <SocialContactEnhancer />
    <TrustEnhancer />
    <SpeedInsights />
  </React.StrictMode>,
);
