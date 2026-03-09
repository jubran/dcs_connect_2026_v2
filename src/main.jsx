import React from "react";
import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./app";
import { LinearProgress } from "@mui/material";
import "src/theme/global.css";

// ----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <HelmetProvider>
    <BrowserRouter
      future={{
        v7_relativeSplatPath: true,
      }}
    >
      <Suspense fallback={<LinearProgress />}>
        <App />
      </Suspense>
    </BrowserRouter>
  </HelmetProvider>,
);
