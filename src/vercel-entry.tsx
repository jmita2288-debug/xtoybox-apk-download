import React from "react";
import { createRoot } from "react-dom/client";
import { Index } from "./routes/index";
import { ReportarBugsPage } from "./routes/reportar-bugs";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

function App() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";

  if (path === "/reportar-bugs") {
    return <ReportarBugsPage />;
  }

  return <Index />;
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);