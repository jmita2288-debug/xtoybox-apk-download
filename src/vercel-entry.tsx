import React from "react";
import { createRoot } from "react-dom/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { RefinedIndex } from "./routes/index-refined";
import { ReportarBugsPage } from "./routes/reportar-bugs";
import "./styles.css";
import "./refined-site.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

function App() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";

  if (path === "/reportar-bugs") {
    return <ReportarBugsPage />;
  }

  return <RefinedIndex />;
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
    <SpeedInsights />
  </React.StrictMode>,
);
