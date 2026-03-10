import { lazy } from "react";
import { Outlet } from "react-router-dom";

import CompactLayout from "src/layouts/compact";

// ── Pages ──────────────────────────────────────────────────────────────
const Page404 = lazy(() => import("src/features/error/404"));

// ── Routes ─────────────────────────────────────────────────────────────
export const mainRoutes = [
  {
    element: (
      <CompactLayout>
        <Outlet />
      </CompactLayout>
    ),
    children: [{ path: "404", element: <Page404 /> }],
  },
];
