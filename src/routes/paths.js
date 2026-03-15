// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: "/auth",
  DASHBOARD: "/dashboard",
};

// ----------------------------------------------------------------------

export const paths = {
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    operations: `${ROOTS.DASHBOARD}/operations`,
    fts: `${ROOTS.DASHBOARD}/fts`,
    tanks: `${ROOTS.DASHBOARD}/tanks`,
    fus: `${ROOTS.DASHBOARD}/fus`,
    nightReport: `${ROOTS.DASHBOARD}/nightReport`,
    notes: `${ROOTS.DASHBOARD}/notes`,
    privateDiscution: `${ROOTS.DASHBOARD}/privateDiscution`,

    administration: {
      root:                   `${ROOTS.DASHBOARD}/administration`,
      myProfile:              `${ROOTS.DASHBOARD}/administration/myprofile`,
      myGroup:                `${ROOTS.DASHBOARD}/administration/myGroup`,
      operationManagement:    `${ROOTS.DASHBOARD}/administration/operationManagement`,
      siteManagement:         `${ROOTS.DASHBOARD}/administration/siteManagement`,
      databaseManagement:     `${ROOTS.DASHBOARD}/administration/databaseManagement`,
      integrationManagement:  `${ROOTS.DASHBOARD}/administration/integrationManagement`,
      notificationManagement: `${ROOTS.DASHBOARD}/administration/notificationManagement`,
      ismsManagement:         `${ROOTS.DASHBOARD}/administration/ismsManagement`,
      usersManagement:        `${ROOTS.DASHBOARD}/administration/usersManagement`,
    },

    forms: {
      root:       `${ROOTS.DASHBOARD}/forms`,
      datasheets: `${ROOTS.DASHBOARD}/forms/datasheets`,
      wcm:        `${ROOTS.DASHBOARD}/forms/wcm`,
    },

    search: {
      root:     `${ROOTS.DASHBOARD}/search`,
      vehicles: `${ROOTS.DASHBOARD}/search/vehicles`,
      search:   `${ROOTS.DASHBOARD}/search/search`,
    },

    safety: {
      root: `${ROOTS.DASHBOARD}/safety`,
      swp:  `${ROOTS.DASHBOARD}/safety/swp`,
      tra:  `${ROOTS.DASHBOARD}/safety/tra`,
    },

    sequences: {
      root:  `${ROOTS.DASHBOARD}/sequences`,
      fts:   `${ROOTS.DASHBOARD}/sequences/fts`,
      units: `${ROOTS.DASHBOARD}/sequences/units`,
      crude: `${ROOTS.DASHBOARD}/sequences/crude`,
    },

    notifications: {
      root:                     `${ROOTS.DASHBOARD}/notifications`,
      createNotification:       `${ROOTS.DASHBOARD}/notifications/create`,
      displayNotifications:     `${ROOTS.DASHBOARD}/notifications/display`,
      notificationControlPanel: `${ROOTS.DASHBOARD}/notifications/control-panel`,
    },

    files: {
      root:    `${ROOTS.DASHBOARD}/files`,
      manager: `${ROOTS.DASHBOARD}/files/manager`,
      upload:  `${ROOTS.DASHBOARD}/files/upload`,
    },
  },
};
