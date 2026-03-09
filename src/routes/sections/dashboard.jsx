import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";

import { AuthGuard } from "src/auth/guard";
import DashboardLayout from "src/layouts/dashboard";

import { LoadingScreen } from "src/components/loading-screen";

// ----------------------------------------------------------------------

const PageHome = lazy(() => import("src/myApp/pages/dashboard/helmets/homeP"));
const OperationsView = lazy(
  () => import("src/myApp/DynamicForms/OperationsView"),
);
const PageSearchOperating = lazy(
  () => import("src/myApp/pages/dashboard/search/searchOperating"),
);
const PageSortFTS = lazy(
  () => import("src/myApp/pages/dashboard/sequence/sortFts"),
);
const PageSortUnits = lazy(
  () => import("src/myApp/pages/dashboard/sequence/sortUnits"),
);
const PageSortCrude = lazy(
  () => import("src/myApp/pages/dashboard/sequence/sortCrude"),
);

// const PageFts = lazy(() => import("src/myApp/pages/dashboard/helmets/ftsP"));
// const PageFus = lazy(() => import("src/myApp/pages/dashboard/helmets/fusP"));
// const PageFuleTanks = lazy(
//   () => import("src/myApp/pages/dashboard/helmets/fuel_tanksP"),
// );
// const PageGeneralNotes = lazy(
//   () => import("src/myApp/pages/dashboard/helmets/general_notesP"),
// );
// const PageNightReport = lazy(
//   () => import("src/myApp/pages/dashboard/helmets/night_reportP"),
// );
// const PagePrivateDiscution = lazy(
//   () => import("src/myApp/pages/dashboard/helmets/private_discutionP"),
// );
// const PageUnits = lazy(
//   () => import("src/myApp/pages/Forms-sections/UnitManagerForm"));

// const PageManageMyGroup = lazy(
//   () => import("src/myApp/pages/dashboard/CPanel/myGroupP"),
// );
// const PageManageMyProfile = lazy(
//   () => import("src/myApp/pages/dashboard/CPanel/myProfileP"),
// );
// const PageManageOperationDev = lazy(
//   () => import("src/myApp/pages/dashboard/CPanel/operationDevP"),
// );
// const PageManageSite = lazy(
//   () => import("src/myApp/pages/dashboard/CPanel/siteAdminP"),
// );

// const PageFormsDatasheet = lazy(
//   () => import("src/myApp/pages/dashboard/forms/dataSheets"),
// );
// const PageFormsWCM = lazy(() => import("src/myApp/pages/dashboard/forms/wcm"));

// const PageSafetySWP = lazy(
//   () => import("src/myApp/pages/dashboard/safety/safeWorkPro"),
// );
// const PageSafetyTRA = lazy(
//   () => import("src/myApp/pages/dashboard/safety/taskRiskAss"),
// );

// const PageSearchCars = lazy(
//   () => import("src/myApp/pages/dashboard/search/searchCars"),
// );

// ----------------------------------------------------------------------

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
      { element: <PageHome />, index: true },
      { path: "operations", element: <OperationsView /> },
      // { path: "fts", element: <PageFts /> },
      // { path: "tanks", element: <PageFuleTanks /> },
      // { path: "fus", element: <PageFus /> },
      // { path: "nightReport", element: <PageNightReport /> },
      // { path: "notes", element: <PageGeneralNotes /> },
      // { path: "privateDiscution", element: <PagePrivateDiscution /> },
      // {
      //   path: "administration",
      //   children: [
      //     { element: <PageManageMyProfile />, index: true },
      //     { path: "myProfile", element: <PageManageMyProfile /> },
      //     { path: "myGroup", element: <PageManageMyGroup /> },
      //     { path: "operationManagement", element: <PageManageOperationDev /> },
      //     { path: "siteManagement", element: <PageManageSite /> },
      //   ],
      // },
      // {
      //   path: "forms",
      //   children: [
      //     { element: <PageFormsDatasheet />, index: true },
      //     { path: "datasheets", element: <PageFormsDatasheet /> },
      //     { path: "wcm", element: <PageFormsWCM /> },
      //   ],
      // },
      {
        path: "search",
        children: [
          { element: <PageSearchOperating />, index: true },
          { path: "search", element: <PageSearchOperating /> },
          // { path: "vehicles", element: <PageSearchCars /> },
        ],
      },
      // {
      //   path: "safety",
      //   children: [
      //     { element: <PageSafetySWP />, index: true },
      //     { path: "swp", element: <PageSafetySWP /> },
      //     { path: "tra", element: <PageSafetyTRA /> },
      //   ],
      // },
      {
        path: "sequences",
        children: [
          { element: <PageSortUnits />, index: true },
          { path: "fts", element: <PageSortFTS /> },
          { path: "units", element: <PageSortUnits /> },
          { path: "crude", element: <PageSortCrude /> },
        ],
      },
    ],
  },
];
