import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { setupI18n } from "./i18n/setupI18n";
import "./styles/global.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found in index.html");
}

setupI18n();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
