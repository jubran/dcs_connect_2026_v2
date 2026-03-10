import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";

import { GuestGuard } from "src/auth/guard";
import AuthClassicLayout from "src/layouts/auth/classic";
import { SplashScreen } from "src/components/loading-screen";

// ── Pages ──────────────────────────────────────────────────────────────
const JwtLoginPage    = lazy(() => import("src/features/auth/LoginPage"));
const JwtRegisterPage = lazy(() => import("src/features/auth/RegisterPage"));

// ── Routes ─────────────────────────────────────────────────────────────
const authJwt = {
  path: "jwt",
  element: (
    <Suspense fallback={<SplashScreen />}>
      <Outlet />
    </Suspense>
  ),
  children: [
    {
      path: "login",
      element: (
        <GuestGuard>
          <AuthClassicLayout title="مرحبا بعودتك">
            <JwtLoginPage />
          </AuthClassicLayout>
        </GuestGuard>
      ),
    },
    {
      path: "register",
      element: (
        <GuestGuard>
          <AuthClassicLayout title="حياك معنا">
            <JwtRegisterPage />
          </AuthClassicLayout>
        </GuestGuard>
      ),
    },
  ],
};

export const authRoutes = [
  {
    path: "auth",
    children: [authJwt],
  },
];
