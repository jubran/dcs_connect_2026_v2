// OperationDispatcher/constants.js
// Moved from: constants/operationConstants.js
// Display constants used exclusively by the operation dispatcher UI.

// Entity type keys — kept here to avoid importing from external formConstants
export const ENTITY_TYPES = {
  UNITS: "units",
  TANK: "tank",
  TRANSFORMER: "transformer",
  NONE_STATUS: "noneStatus",
  BSDE: "bsde",
};

// Status colours for MUI Chip color prop
export const STATUS_COLORS = {
  "In Service": "success",
  "Stand By": "info",
  Shutdown: "error",
  "GSU ONLINE": "primary",
  "GSU OFFLINE": "warning",
};

// Arabic labels for operation types
export const OPERATION_LABELS = {
  "In Service": "تشغيل",
  Shutdown: "خروج اضطراري",
  "Stand By": "احتياطي",
  "GSU ONLINE": "شحن محول",
  "GSU OFFLINE": "فصل محول",
};

// Arabic labels for entity/form types
export const FORM_LABELS = {
  units: "وحدة غازية",
  tank: "خزان وقود",
  transformer: "محول وحدة غازية",
  noneStatus: "عملية فنية",
  bsde: "BSDE",
};
