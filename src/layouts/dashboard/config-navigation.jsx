import { useMemo } from "react";

import { paths } from "src/routes/paths";

import { useTranslate } from "src/locales";

import SvgColor from "src/components/svg-color";

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor
    src={`/assets/icons/navbar/${name}.svg`}
    sx={{ width: 1, height: 1 }}
  />
);

const ICONS = {
  job:       icon("ic_job"),
  blog:      icon("ic_blog"),
  chat:      icon("ic_chat"),
  mail:      icon("ic_mail"),
  user:      icon("ic_user"),
  file:      icon("ic_file"),
  lock:      icon("ic_lock"),
  tour:      icon("ic_tour"),
  order:     icon("ic_order"),
  label:     icon("ic_label"),
  blank:     icon("ic_blank"),
  kanban:    icon("ic_kanban"),
  folder:    icon("ic_folder"),
  banking:   icon("ic_banking"),
  booking:   icon("ic_booking"),
  invoice:   icon("ic_invoice"),
  product:   icon("ic_product"),
  calendar:  icon("ic_calendar"),
  disabled:  icon("ic_disabled"),
  external:  icon("ic_external"),
  menuItem:  icon("ic_menu_item"),
  ecommerce: icon("ic_ecommerce"),
  analytics: icon("ic_analytics"),
  dashboard: icon("ic_dashboard"),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useTranslate();

  const data = useMemo(
    () => [
      // OVERVIEW
      // ─────────────────────────────────────────────────────────────────────
      {
        subheader: t("overview"),
        items: [
          {
            title: t("dashboard"),
            path:  paths.dashboard.root,
            icon:  ICONS.dashboard,
          },
          {
            title: t("operations"),
            path:  paths.dashboard.operations,
            icon:  ICONS.ecommerce,
          },
        ],
      },

      // MANAGEMENT
      // ─────────────────────────────────────────────────────────────────────
      {
        subheader: t(""),
        items: [

          // Sequences
          {
            title: t("sequence"),
            roles: ["admin", "manager"],
            path:  paths.dashboard.sequences.root,
            icon:  ICONS.user,
            children: [
              { title: t("secUnits"), path: paths.dashboard.sequences.units },
              { title: t("secFts"),   path: paths.dashboard.sequences.fts },
              { title: t("secCrude"), path: paths.dashboard.sequences.crude },
            ],
          },

          // Search
          {
            title: t("search"),
            path:  paths.dashboard.search.root,
            icon:  ICONS.user,
            roles: ["admin", "manager"],
            children: [
              {
                title: t("operating_data"),
                path:  paths.dashboard.search.search,
              },
            ],
          },

          // Notifications
          {
            title: t("الإشعارات"),
            path:  paths.dashboard.notifications.root,
            icon:  ICONS.user,
            children: [
              {
                title:   t("create_notification"),
                path:    paths.dashboard.notifications.createNotification,
                disabled: false,
                caption: "أضافة إشعار جديد",
                roles:   ["manager"],
              },
              {
                title:   t("display_notifications"),
                path:    paths.dashboard.notifications.displayNotifications,
                disabled: false,
                caption: "عرض الإشعارات",
                roles:   ["manager"],
              },
              {
                title:   t("notification_control_panel"),
                path:    paths.dashboard.notifications.notificationControlPanel,
                disabled: false,
                caption: "لوحة تحكم الإشعارات",
                roles:   ["manager"],
              },
            ],
          },

          // File Manager
          {
            title: t("files"),
            path:  paths.dashboard.files.root,
            icon:  ICONS.folder,
            children: [
              {
                title: t("file_manager"),
                path:  paths.dashboard.files.manager,
              },
              {
                title: t("file_upload"),
                path:  paths.dashboard.files.upload,
              },
            ],
          },

          // Control Panel (Administration)
          {
            title: t("control_panel"),
            path:  paths.dashboard.administration.root,
            icon:  ICONS.user,
            children: [
              {
                title:   t("my_profile"),
                path:    paths.dashboard.administration.myProfile,
                disabled: false,
                caption: "my profile" /* roles: ['manager'] */,
              },
              {
                title:   t("my_group"),
                path:    paths.dashboard.administration.myGroup,
                disabled: false,
                caption: "my group" /* roles: ['manager'] */,
              },
              {
                title:   t("operation_dev"),
                path:    paths.dashboard.administration.operationManagement,
                disabled: false,
                caption: "operation department" /* roles: ['manager'] */,
              },
              {
                title:   t("web_site"),
                path:    paths.dashboard.administration.siteManagement,
                disabled: false,
                caption: "web site" /* roles: ['manager'] */,
              },
              {
                title:   t("database_management"),
                path:    paths.dashboard.administration.databaseManagement,
                disabled: false,
                caption: "database management" /* roles: ['manager'] */,
              },
              {
                title:   t("integration_management"),
                path:    paths.dashboard.administration.integrationManagement,
                disabled: false,
                caption: "integration management" /* roles: ['manager'] */,
              },
              {
                title:   t("notification_management"),
                path:    paths.dashboard.administration.notificationManagement,
                disabled: false,
                caption: "notification management" /* roles: ['manager'] */,
              },
              {
                title:   t("isms_management"),
                path:    paths.dashboard.administration.ismsManagement,
                disabled: false,
                caption: "isms management" /* roles: ['manager'] */,
              },
              {
                title:   t("users_management"),
                path:    paths.dashboard.administration.usersManagement,
                disabled: false,
                caption: "users management" /* roles: ['manager'] */,
              },
            ],
          },

        ],
      },
    ],
    [t],
  );

  return data;
}
