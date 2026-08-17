import React from "react";
import { createRoot } from "react-dom/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { DownloadAdGate } from "./components/DownloadAdGate";
import { DownloadCounter } from "./components/DownloadCounter";
import { SocialContactEnhancer } from "./components/SocialContactEnhancer";
import { RefinedIndex } from "./routes/index-refined";
import { ReportarBugsPage } from "./routes/reportar-bugs";
import "./styles.css";
import "./refined-site.css";
import "./download-counter.css";
import "./download-ad-gate.css";
import "./social-contact.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

function App() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";

  if (path === "/reportar-bugs") {
    return <ReportarBugsPage />;
  }

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
    <SocialContactEnhancer />
    <SpeedInsights />
  </React.StrictMode>,
);
