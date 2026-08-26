import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AutenticacaoProvider } from "./context/AutenticacaoContext.tsx";
import { EmpresaAtivaProvider } from "./context/EmpresaAtivaContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AppWrapper>
        <AutenticacaoProvider>
          <EmpresaAtivaProvider>
            <App />
          </EmpresaAtivaProvider>
        </AutenticacaoProvider>
      </AppWrapper>
    </ThemeProvider>
  </StrictMode>,
);
