// TransformerForm/constants.js
// Transformer-specific constants extracted from: constants/formConstants.js

export const DB_DATE_FORMAT = "YYYY-MM-DD";
export const TIME_FORMAT = "HH:mm";

export const TRANSFORMER_ACTIONS = [
  "DE-ENERGIZE AND EARTH",
  "DE-ENERGIZE",
  "ENERGIZE",
  "TRIP",
];

export const RATCHING_MENU = [
  { value: "Ratching In Service", label: "Ratching In Service" },
  { value: "Ratching Not Working", label: "Ratching Not Working" },
];

export const STATUS_MENU = [
  { value: "In Service", label: "In Service" },
  { value: "Stand By", label: "Stand By" },
  { value: "Shutdown", label: "Shutdown" },
  { value: "FSNL", label: "FSNL" },
];

export const TRIP_REASONS = [
  "FO",
  "MO",
  "PO",
  "PE",
  "OMC",
  "Re-Start",
  "Re-Synch",
];
export const FO_SUB_REASONS = ["U1", "U2", "U3", "SF"];

export const VALIDATION_MESSAGES = {
  REQUIRED: (fieldName) => `${fieldName} مطلوب.`,
};

// Field type / level / width constants (local copy — no cross-module import)
export const FIELD_TYPES = {
  TEXT: "text",
  TEXTAREA: "textarea",
  DATE: "date",
  TIME: "time",
  SELECT: "select",
  CHECKBOX: "checkbox",
};

export const FIELD_LEVELS = {
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
  LEVEL_4: 4,
  LEVEL_5: 5,
};

export const FIELD_WIDTHS = {
  SMALL: "120px",
  MEDIUM: "150px",
  LARGE: "200px",
  FULL: "632px",
};
