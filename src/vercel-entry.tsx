import React from "react";
import { createRoot } from "react-dom/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { HeroBackgroundCarousel } from "./components/HeroBackgroundCarousel";
import { Index } from "./routes/index";
import { ReportarBugsPage } from "./routes/reportar-bugs";
import "./styles.css";
import "./hero-carousel.css";

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
      <Index />
      <HeroBackgroundCarousel />
    </>
  );
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
    <SpeedInsights />
  </React.StrictMode>,
);
