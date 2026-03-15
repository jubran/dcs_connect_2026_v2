import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";

import { AuthGuard } from "src/auth/guard";
import DashboardLayout from "src/layouts/dashboard";
import { LoadingScreen } from "src/components/loading-screen";

const HomePage       = lazy(() => import("src/features/dashboard/DashboardPage"));
const OperationsPage = lazy(() => import("src/features/operations/OperationsPage"));
const SearchPage     = lazy(() => import("src/features/search/OperatingSearchPage"));
const UnitsSeqPage   = lazy(() => import("src/features/sequences/UnitsSequencePage"));
const FtsSeqPage     = lazy(() => import("src/features/sequences/FtsSequencePage"));
const CrudeSeqPage   = lazy(() => import("src/features/sequences/CrudeSequencePage"));

const FileManagerPage = lazy(() => import("src/features/files/components/FileManagerPage"));
const FileUploadPage  = lazy(() => import("src/features/files/components/FileUploadPage"));

const CreateNotificationPage       = lazy(() => import("src/features/notifications/components/CreateNotificationPage"));
const DisplayNotificationsPage     = lazy(() => import("src/features/notifications/components/DisplayNotificationsPage"));
const NotificationControlPanelPage = lazy(() => import("src/features/notifications/components/NotificationControlPanelPage"));

const MyProfilePage              = lazy(() => import("src/features/administration/MyProfilePage"));
const MyGroupPage                = lazy(() => import("src/features/administration/MyGroupPage"));
const OperationManagementPage    = lazy(() => import("src/features/administration/OperationManagementPage"));
const SiteManagementPage         = lazy(() => import("src/features/administration/SiteManagementPage"));
const DatabaseManagementPage     = lazy(() => import("src/features/administration/DatabaseManagementPage"));
const IntegrationManagementPage  = lazy(() => import("src/features/administration/IntegrationManagementPage"));
const NotificationManagementPage = lazy(() => import("src/features/administration/NotificationManagementPage"));
const IsmsManagementPage         = lazy(() => import("src/features/administration/IsmsManagementPage"));
const UsersManagementPage        = lazy(() => import("src/features/administration/UsersManagementPage"));

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
      {
        path: "files",
        children: [
          { element: <FileManagerPage />, index: true },
          { path: "manager", element: <FileManagerPage /> },
          { path: "upload",  element: <FileUploadPage /> },
        ],
      },
      {
        path: "notifications",
        children: [
          { element: <CreateNotificationPage />, index: true },
          { path: "create",        element: <CreateNotificationPage /> },
          { path: "display",       element: <DisplayNotificationsPage /> },
          { path: "control-panel", element: <NotificationControlPanelPage /> },
        ],
      },
      {
        path: "administration",
        children: [
          { element: <MyProfilePage />, index: true },
          { path: "myprofile",              element: <MyProfilePage /> },
          { path: "myGroup",                element: <MyGroupPage /> },
          { path: "operationManagement",    element: <OperationManagementPage /> },
          { path: "siteManagement",         element: <SiteManagementPage /> },
          { path: "databaseManagement",     element: <DatabaseManagementPage /> },
          { path: "integrationManagement",  element: <IntegrationManagementPage /> },
          { path: "notificationManagement", element: <NotificationManagementPage /> },
          { path: "ismsManagement",         element: <IsmsManagementPage /> },
          { path: "usersManagement",        element: <UsersManagementPage /> },
        ],
      },
    ],
  },
];
