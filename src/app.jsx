// src/App.js
import "src/locales/i18n";

import Router from "src/routes/sections";
import ThemeProvider from "src/theme";
import { LocalizationProvider } from "src/locales";
import { useScrollToTop } from "src/myApp/hooks/use-scroll-to-top";

import { MotionLazy } from "src/components/animate/motion-lazy";
import ProgressBar from "src/components/progress-bar";
import { SettingsDrawer, SettingsProvider } from "src/components/settings";
import { AuthProvider } from "src/auth/context/jwt";
import { SnackbarProvider } from "src/myApp/contexts/SnackbarContext";
import GlobalSnackbar from "src/components/shared/GlobalSnackbar";

// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();

  return (
    <AuthProvider>
      <LocalizationProvider>
        <SettingsProvider
          defaultSettings={{
            themeMode: "light",
            themeDirection: "rtl",
            themeContrast: "default",
            themeLayout: "vertical",
            themeColorPresets: "default",
            themeStretch: false,
          }}
        >
          <SnackbarProvider>
            <ThemeProvider>
              <MotionLazy>
                <SettingsDrawer />
                <ProgressBar />
                <GlobalSnackbar />
                <Router />
              </MotionLazy>
            </ThemeProvider>
          </SnackbarProvider>
        </SettingsProvider>
      </LocalizationProvider>
    </AuthProvider>
  );
}
