const API_BASE = "/api/index.php?route=";

const API_ROUTES = {
  // نظام مجمع أكثر تنظيماً
  auth: {
    login: () => API_BASE + "fetchAuth",
    logout: () => API_BASE + "logout",
    refresh: () => API_BASE + "refreshToken",
    register: () => API_BASE + "register",
    verify: () => API_BASE + "verifyToken",
    hasRefresh: () => API_BASE + "hasRefresh",
  },

  units: {
    status: {
      all: () => API_BASE + "getUnitStatus",
      cotp: () => API_BASE + "getCOTPStatus",
      fu: () => API_BASE + "getFUStatus",
      ft6: () => API_BASE + "getFT6Status",
      hours: (unit = "") => {
        const baseUrl = API_BASE + "getUnitHours";
        return unit ? `${baseUrl}&unit=${unit}` : baseUrl;
      },
    },
    operations: {
      create: () => API_BASE + "createUnitOperation",
      update: (id = "") => {
        const baseUrl = API_BASE + "updateUnitOperation";
        return id ? `${baseUrl}&id=${id}` : baseUrl;
      },
    },
    delete: {
      multiple: () => API_BASE + "deleteUnitOperation",
    },
  },

  tanks: {
    status: {
      all: () => API_BASE + "getTankStatus",
      single: (tankNumber) =>
        `${API_BASE}getTankStatus&tank=${encodeURIComponent(tankNumber)}`,
    },
    operations: {
      create: () => API_BASE + "createTankOperation",
      update: (id = "") => {
        const baseUrl = API_BASE + "updateTankOperation";
        return id ? `${baseUrl}&id=${id}` : baseUrl;
      },
    },
    delete: {
      multiple: (id = "") => {
        const baseUrl = API_BASE + "deleteTankOperation";
        return id ? `${baseUrl}&id=${id}` : baseUrl;
      },
    },
  },

  transformers: {
    status: {
      all: () => API_BASE + "getTransformerStatus",
      single: (transformerNumber) =>
        `${API_BASE}getTransformerStatus&transformer=${encodeURIComponent(transformerNumber)}`,
    },
    operations: {
      create: () => API_BASE + "createTransformerOperation",
      update: (id = "") => {
        const baseUrl = API_BASE + "updateTransformerOperation";
        return id ? `${baseUrl}&id=${id}` : baseUrl;
      },
    },
  },

  sequences: {
    gt: {
      get: () => API_BASE + "getGTSequence",
      update: () => API_BASE + "updateCpsSequence",
    },
    pp29: {
      get: () => API_BASE + "get29ppSequence",
      update: () => API_BASE + "update29ppSequence",
    },
    cotp: {
      get: () => API_BASE + "getCotpSequence",
      update: () => API_BASE + "updateCotpSequence",
    },
  },

  events: {
    search: (params = {}) => {
      const baseUrl = API_BASE + "events";
      const queryParams = new URLSearchParams(params).toString();
      return queryParams ? `${baseUrl}&${queryParams}` : baseUrl;
    },
    dateQuery: (date) => `${API_BASE}events&dateQuery=${date}`,
    delete: {
      multiple: () => API_BASE + "deleteEvent",
      today: () => API_BASE + "deleteTodayEvents",
    },
  },

  notifications: {
    getAll:  () => API_BASE + "getNotifications",
    create:  () => API_BASE + "createNotification",
    update:  (id = "") => id ? `${API_BASE}updateNotification&id=${id}` : API_BASE + "updateNotification",
    delete:  (id = "") => id ? `${API_BASE}deleteNotification&id=${id}` : API_BASE + "deleteNotification",
    markRead: () => API_BASE + "markNotificationRead",
    markAllRead: () => API_BASE + "markAllNotificationsRead",
    stats: () => API_BASE + "getNotificationStats",
  },

  files: {
    upload:       () => API_BASE + "uploadOperationFiles",
    list:         () => API_BASE + "listOperationFiles",
    download: (filename) =>
      `${API_BASE}downloadOperationFile&filename=${encodeURIComponent(filename)}`,
    delete:       () => API_BASE + "deleteOperationFile",
    // folder operations
    createFolder: () => API_BASE + "createFolder",
    listFolders:  () => API_BASE + "listFolders",
    deleteFolder: () => API_BASE + "deleteFolder",
    renameFolder: () => API_BASE + "renameFolder",
    // file manager
    listAll:      (folder = "") => folder
      ? `${API_BASE}listAllFiles&folder=${encodeURIComponent(folder)}`
      : API_BASE + "listAllFiles",
    rename:       () => API_BASE + "renameFile",
    move:         () => API_BASE + "moveFile",
    star:         () => API_BASE + "starFile",
    stats:        () => API_BASE + "getStorageStats",
  },

  data: {
    fetch: () => API_BASE + "fetchData",
    dcs: () => API_BASE + "getDcs",
  },
};

API_ROUTES.withAuth = (url) => {
  return {
    url,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      "Content-Type": "application/json",
    },
  };
};

export default API_ROUTES;

// 1. reset tank state
// 2. get all operations ordered by event_time ASC
// 3. apply open / close sequentially
// 4. evaluate final state
// 5. if no open valves → SETTLING
