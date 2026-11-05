import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { LanguageProvider } from "./i18n.jsx";
import { initializeTheme, ThemeProvider } from "./theme.jsx";
import "./styles.css";
import "./app-theme.css";

const initialTheme = initializeTheme();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider initialTheme={initialTheme}>
      <LanguageProvider><App /></LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
