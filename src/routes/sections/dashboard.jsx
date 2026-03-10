import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";

import { AuthGuard } from "src/auth/guard";
import DashboardLayout from "src/layouts/dashboard";
import { LoadingScreen } from "src/components/loading-screen";

// ── Pages (lazy loaded) ────────────────────────────────────────────────
const HomePage        = lazy(() => import("src/features/dashboard/DashboardPage"));
const OperationsPage  = lazy(() => import("src/features/operations/OperationsPage"));
const SearchPage      = lazy(() => import("src/features/search/OperatingSearchPage"));
const UnitsSeqPage    = lazy(() => import("src/features/sequences/UnitsSequencePage"));
const FtsSeqPage      = lazy(() => import("src/features/sequences/FtsSequencePage"));
const CrudeSeqPage    = lazy(() => import("src/features/sequences/CrudeSequencePage"));

// ── Routes ─────────────────────────────────────────────────────────────
export const dashboardRoutes = [
  {
    path: "dashboard",
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { element: <HomePage />, index: true },
      { path: "operations", element: <OperationsPage /> },
      {
        path: "search",
        children: [
          { element: <SearchPage />, index: true },
          { path: "search", element: <SearchPage /> },
        ],
      },
      {
        path: "sequences",
        children: [
          { element: <UnitsSeqPage />, index: true },
          { path: "units", element: <UnitsSeqPage /> },
          { path: "fts",   element: <FtsSeqPage /> },
          { path: "crude", element: <CrudeSeqPage /> },
        ],
      },
    ],
  },
];
