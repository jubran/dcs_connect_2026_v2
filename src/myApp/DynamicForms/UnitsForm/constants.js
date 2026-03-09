// UnitsForm/constants.js
// Units-specific constants extracted from: constants/formConstants.js

export const DB_DATE_FORMAT = "YYYY-MM-DD";
export const TIME_FORMAT = "HH:mm";

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

export const RATCHING_MENU = [
  { value: "Ratching In Service", label: "Ratching In Service" },
  { value: "Ratching Not Working", label: "Ratching Not Working" },
];

export const STATUS_MENU = [
  { value: "In Service", label: "In Service" },
  { value: "Stand By", label: "Stand By" },
  { value: "Shutdown", label: "Shutdown" },
  // { value: "FSNL",       label: "FSNL" },
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

// ── Base field configs (COMMON block shared within units domain) ───────────────
export const COMMON_FIELDS = [
  {
    type: FIELD_TYPES.TEXT,
    name: "location",
    label: "الموقع",
    width: FIELD_WIDTHS.LARGE,
    level: FIELD_LEVELS.LEVEL_1,
    required: true,
    disabled: true,
  },
  {
    type: FIELD_TYPES.DATE,
    name: "eventDate",
    label: "التاريخ",
    width: FIELD_WIDTHS.LARGE,
    level: FIELD_LEVELS.LEVEL_1,
    required: true,
  },
  {
    type: FIELD_TYPES.TEXT,
    name: "eventTime",
    label: "وقت الحدث",
    width: FIELD_WIDTHS.LARGE,
    level: FIELD_LEVELS.LEVEL_1,
    required: true,
    format: "HH:mm",
  },
  {
    type: FIELD_TYPES.TEXT,
    name: "eventText",
    label: "وصف الحدث",
    multiline: true,
    level: FIELD_LEVELS.LEVEL_3,
    width: FIELD_WIDTHS.FULL,
    required: true,
  },
];

// ── Operation-specific helper builders ────────────────────────────────────────

const getGTStartFields = () => [
  {
    type: FIELD_TYPES.TEXT,
    name: "flameRPM",
    label: "Flame RPM",
    width: FIELD_WIDTHS.MEDIUM,
    level: FIELD_LEVELS.LEVEL_2,
    required: true,
    maxLength: 3,
  },
  {
    type: FIELD_TYPES.TEXT,
    name: "fsnlTime",
    label: "FSNL Time",
    width: FIELD_WIDTHS.MEDIUM,
    level: FIELD_LEVELS.LEVEL_2,
    required: true,
    format: "HH:mm",
  },
  {
    type: FIELD_TYPES.TEXT,
    name: "synchTime",
    label: "Synch Time",
    width: FIELD_WIDTHS.MEDIUM,
    level: FIELD_LEVELS.LEVEL_2,
    required: true,
    format: "HH:mm",
  },
];

const getSTCFields = (options, defaultVal) => [
  ...COMMON_FIELDS,
  {
    type: FIELD_TYPES.SELECT,
    name: "selectStatusMenu",
    label: "الحالة",
    options,
    default: defaultVal,
    width: FIELD_WIDTHS.LARGE,
    level: FIELD_LEVELS.LEVEL_4,
    required: true,
  },
];

/**
 * Returns the field array for the given operation + isGT flag.
 */
export const buildFieldsForOperation = (operation, isGT) => {
  switch (operation) {
    case "start":
      return [
        ...COMMON_FIELDS,
        ...(isGT ? getGTStartFields() : []),
        {
          type: FIELD_TYPES.SELECT,
          name: "selectStatusMenu",
          label: "الحالة",
          options: ["In Service"],
          default: "In Service",
          width: FIELD_WIDTHS.LARGE,
          level: FIELD_LEVELS.LEVEL_4,
          required: true,
        },
      ];
    case "stop":
      return getSTCFields(["Stand By", "Shutdown"], "Stand By");
    case "trip":
      return getSTCFields(["Shutdown", "Stand By"], "");
    case "change":
      return getSTCFields(["Stand By", "Shutdown"], "Stand By");
    default:
      return COMMON_FIELDS;
  }
};

/**
 * Groups a flat field array by level.
 */
export const groupFieldsByLevel = (fields) => ({
  level1: fields.filter((f) => f.level === FIELD_LEVELS.LEVEL_1),
  level2: fields.filter((f) => f.level === FIELD_LEVELS.LEVEL_2),
  level3: fields.filter((f) => f.level === FIELD_LEVELS.LEVEL_3),
  level4: fields.filter((f) => f.level === FIELD_LEVELS.LEVEL_4),
  level5: fields.filter((f) => f.level === FIELD_LEVELS.LEVEL_5),
});

/**
 * Normalises a raw selectedOperation string to an internal operation key.
 */
export const normalizeOperation = (operation) => {
  if (!operation) return "start";
  const op = operation.toLowerCase().trim();

  // Already a clean internal key
  if (["start", "stop", "trip", "change"].includes(op)) return op;

  // Status strings coming from edit mode (rowData.status1)
  if (op.includes("in service")) return "start";
  if (op.includes("service")) return "start";
  if (op.includes("stand")) return "stop";
  if (op.includes("shutdown")) return "trip";
  if (op.includes("change")) return "change";
  if (op.includes("fsnl")) return "start";

  // Entity type strings coming from new mode (selectedOperation.type = "units")
  // When the dispatcher sends "units" we default to "start"
  if (op === "units") return "start";

  // Final fallback — render the start form so GT fields appear
  return "start";
};

/**
 * Returns the default status value for a given operation.
 */
export const getDefaultStatusMenu = (operation) => {
  switch (operation) {
    case "start":
      return "In Service";
    case "stop":
      return "Stand By";
    case "trip":
      return "Shutdown";
    case "change":
      return "Stand By";
    default:
      return "";
  }
};
