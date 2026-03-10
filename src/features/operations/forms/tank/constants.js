// TankForm/constants.js
// Tank-specific constants extracted from: constants/formConstants.js
// All constants used exclusively by TankForm live here.

export const DB_DATE_FORMAT = "YYYY-MM-DD";
export const TIME_FORMAT = "HH:mm";

export const VALVE_STATUS_MENU = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "partially_open", label: "Partially Open" },
];

export const TYPE_STATUS_MENU = [
  { value: "SERVICE", label: "SERVICE" },
  { value: "FEEDING", label: "FEEDING" },
  { value: "FILLING", label: "FILLING" },
  { value: "RETURN", label: "RETURN" },
  { value: "MAINTENANCE", label: "MAINTENANCE" },
];

export const TANK_TAGS_MENU = [
  {
    value: "CRUDE FWD UNITS #16,19,20,21,22,23",
    label: "CRUDE FWD UNITS #16,19,20,21,22,23",
  },
  {
    value: "CRUDE UNITS #24,25,26,27,28,29,30",
    label: "CRUDE UNITS #24,25,26,27,28,29,30",
  },
  {
    value: "CRUDE UNITS #16,19,20,21,22,23",
    label: "CRUDE UNITS #16,19,20,21,22,23",
  },
  { value: "FUS", label: "FUS" },
  { value: "29 PURIFIER", label: "29 PURIFIER" },
  { value: "COTP PURIFIER", label: "COTP PURIFIER" },
  {
    value: "CRUDE FWD UNITS #24,25,26,27,28,29,30",
    label: "CRUDE FWD UNITS #24,25,26,27,28,29,30",
  },
  { value: "DIESEL GTS", label: "DIESEL GTS" },
  { value: "DIESEL FWD", label: "DIESEL FWD" },
];

export const TANK_CONFIG = {
  TYPE_RULES: {
    "TANK#6": ["FILLING", "FEEDING", "RETURN", "MAINTENANCE"],
    "TANK#7": ["FILLING", "FEEDING", "MAINTENANCE"],
    "TANK#8": ["FILLING", "FEEDING", "RETURN", "MAINTENANCE"],
    "TANK#9": ["FILLING", "SERVICE", "RETURN", "MAINTENANCE"],
    "TANK#10": ["FILLING", "FEEDING", "RETURN", "MAINTENANCE"],
    "TANK#11": ["FILLING", "SERVICE", "RETURN", "MAINTENANCE"],
    "TANK#12": ["FILLING", "FEEDING", "RETURN", "MAINTENANCE"],
    "TANK#13": ["FILLING", "FEEDING", "RETURN", "MAINTENANCE"],
    "TANK#14": ["FILLING", "SERVICE", "MAINTENANCE"],
    "TANK#15": ["FILLING", "SERVICE", "RETURN", "MAINTENANCE"],
    "TANK#16": ["FILLING", "SERVICE", "RETURN", "MAINTENANCE"],
    "TANK#17": ["FILLING", "SERVICE", "MAINTENANCE"],
    "TANK#18": ["FILLING", "SERVICE", "MAINTENANCE"],
  },
  TAG_RULES: {
    "TANK#6": {
      FILLING: ["FUS"],
      FEEDING: ["29 PURIFIER"],
      RETURN: ["29 PURIFIER"],
      MAINTENANCE: [],
    },
    "TANK#7": { FILLING: ["FUS"], FEEDING: ["29 PURIFIER"], MAINTENANCE: [] },
    "TANK#8": {
      FILLING: ["FUS"],
      FEEDING: ["29 PURIFIER"],
      RETURN: ["29 PURIFIER"],
      MAINTENANCE: [],
    },
    "TANK#9": {
      FILLING: ["29 PURIFIER"],
      SERVICE: ["DIESEL GTS"],
      RETURN: ["DIESEL FWD"],
      MAINTENANCE: [],
    },
    "TANK#10": {
      FILLING: ["FUS"],
      FEEDING: ["COTP PURIFIER"],
      RETURN: ["COTP PURIFIER"],
      MAINTENANCE: [],
    },
    "TANK#11": {
      FILLING: ["29 PURIFIER"],
      SERVICE: ["DIESEL GTS"],
      RETURN: ["DIESEL FWD"],
      MAINTENANCE: [],
    },
    "TANK#12": {
      FILLING: ["FUS"],
      FEEDING: ["COTP PURIFIER"],
      RETURN: ["COTP PURIFIER"],
      MAINTENANCE: [],
    },
    "TANK#13": {
      FILLING: ["FUS"],
      FEEDING: ["COTP PURIFIER"],
      RETURN: ["COTP PURIFIER"],
      MAINTENANCE: [],
    },
    "TANK#14": {
      FILLING: ["COTP PURIFIER"],
      SERVICE: ["CRUDE UNITS #16,19,20,21,22,23"],
      RETURN: ["CRUDE FWD UNITS #16,19,20,21,22,23"],
      MAINTENANCE: [],
    },
    "TANK#15": {
      FILLING: ["COTP PURIFIER"],
      SERVICE: ["CRUDE UNITS #16,19,20,21,22,23"],
      RETURN: ["CRUDE FWD UNITS #16,19,20,21,22,23"],
      MAINTENANCE: [],
    },
    "TANK#16": {
      FILLING: ["COTP PURIFIER"],
      SERVICE: ["CRUDE UNITS #24,25,26,27,28,29,30"],
      RETURN: ["CRUDE FWD UNITS #24,25,26,27,28,29,30"],
      MAINTENANCE: [],
    },
    "TANK#17": {
      FILLING: ["COTP PURIFIER"],
      SERVICE: ["CRUDE UNITS #24,25,26,27,28,29,30"],
      RETURN: ["CRUDE FWD UNITS #24,25,26,27,28,29,30"],
      MAINTENANCE: [],
    },
    "TANK#18": {
      FILLING: ["COTP PURIFIER"],
      SERVICE: ["CRUDE UNITS #24,25,26,27,28,29,30"],
      RETURN: ["CRUDE FWD UNITS #24,25,26,27,28,29,30"],
      MAINTENANCE: [],
    },
  },
};
