// BsdeForm/useBsdeForm.js
// Self-contained state + field definitions + validation for the BSDE form.
//
// selectedOperation drives which options appear in selectStatusMenu:
//
//   "start"  → BSDE starting   → options: [ FSNL, LOAD ]
//   "ready"  → BSDE stopping   → options: [ ready ]
//   "out"    → BSDE shutdown   → options: [ out ]
//   default  → same as "start" → options: [ FSNL, LOAD ]

import { useState, useEffect, useCallback, useMemo } from "react";
import dayjs from "dayjs";

const DB_DATE_FORMAT = "YYYY-MM-DD";
const TIME_FORMAT = "HH:mm";

// ── Status option sets per operation ──────────────────────────────────────────
const STATUS_OPTIONS = {
  start: [
    { value: "fsnl", label: "FSNL" },
    { value: "load", label: "LOAD" },
  ],
  ready: [{ value: "ready", label: "إيقاف (Ready)" }],
  out: [{ value: "Shutdown", label: "Shutdown" }],
};

const DEFAULT_STATUS = {
  start: "fsnl",
  ready: "ready",
  out: "out",
};

// ── Normalise raw selectedOperation → internal BSDE operation key ─────────────
// Handles both clean keys ("start","ready","out") and raw strings from edit mode
const normalizeBsdeOperation = (selectedOperation = "") => {
  const op = (selectedOperation || "").toLowerCase().trim();
  if (op === "start" || op.includes("fsnl") || op.includes("load"))
    return "start";
  if (op === "ready" || op.includes("stop") || op.includes("إيقاف"))
    return "ready";
  if (op === "out" || op.includes("shutdown") || op.includes("خروج"))
    return "out";
  return "start"; // default to start
};

// ── Common fields (location, date, time, eventText) ───────────────────────────
const COMMON_FIELDS = [
  {
    type: "text",
    name: "location",
    label: "الموقع",
    width: "200px",
    level: 1,
    required: true,
    disabled: true,
  },
  {
    type: "date",
    name: "eventDate",
    label: "التاريخ",
    width: "200px",
    level: 1,
    required: true,
  },
  {
    type: "text",
    name: "eventTime",
    label: "وقت الحدث",
    width: "200px",
    level: 1,
    required: true,
    format: "HH:mm",
  },
  {
    type: "text",
    name: "eventText",
    label: "وصف الحدث",
    multiline: true,
    level: 3,
    width: "632px",
    required: true,
  },
];

// ── Build fields for a given BSDE operation ───────────────────────────────────
const buildBsdeFields = (operation) => {
  const options = STATUS_OPTIONS[operation] || STATUS_OPTIONS.start;
  const defaultVal = DEFAULT_STATUS[operation] || DEFAULT_STATUS.start;

  return [
    ...COMMON_FIELDS,
    {
      type: "select",
      name: "selectStatusMenu",
      label: "الحالة",
      options,
      default: defaultVal,
      width: "200px",
      level: 4,
      required: true,
    },
  ];
};

const groupByLevel = (fields) => ({
  level1: fields.filter((f) => f.level === 1),
  level2: fields.filter((f) => f.level === 2),
  level3: fields.filter((f) => f.level === 3),
  level4: fields.filter((f) => f.level === 4),
  level5: fields.filter((f) => f.level === 5),
});

// ── Validation ─────────────────────────────────────────────────────────────────
const validate = (formData) => {
  const errors = {};
  if (!formData.location) errors.location = "الموقع مطلوب.";
  if (!formData.eventDate) errors.eventDate = "التاريخ مطلوب.";
  if (!formData.eventTime) errors.eventTime = "وقت الحدث مطلوب.";
  if (!formData.eventText) errors.eventText = "وصف الحدث مطلوب.";
  if (!formData.selectStatusMenu) errors.selectStatusMenu = "الحالة مطلوبة.";
  return errors;
};

// ── Hook ───────────────────────────────────────────────────────────────────────
export const useBsdeForm = (initialData = {}, selectedOperation = "") => {
  // Resolve which BSDE operation this is
  const bsdeOperation = useMemo(
    () => normalizeBsdeOperation(selectedOperation),
    [selectedOperation],
  );

  // Fields and grouped fields derived from operation
  const fields = useMemo(() => buildBsdeFields(bsdeOperation), [bsdeOperation]);

  const groupedFields = useMemo(() => groupByLevel(fields), [fields]);

  // Default selectStatusMenu for this operation
  const defaultStatus = DEFAULT_STATUS[bsdeOperation];

  const [formData, setFormData] = useState({
    location: "",
    eventDate: "",
    eventTime: "",
    eventText: "",
    selectStatusMenu: defaultStatus,
    ...initialData,
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [dateValue, setDateValue] = useState(null);
  const [timeValue, setTimeValue] = useState(null);

  // Initialise date / time pickers on mount
  useEffect(() => {
    const date = initialData.eventDate ? dayjs(initialData.eventDate) : dayjs();

    const time = initialData.eventTime
      ? dayjs(initialData.eventTime, TIME_FORMAT, true)
      : dayjs();

    const validDate = date.isValid() ? date : dayjs();
    const validTime = time.isValid() ? time : dayjs();

    setDateValue(validDate.toDate());
    setTimeValue(validTime.toDate());

    setFormData((prev) => ({
      ...prev,
      location: prev.location || initialData.location || "",
      eventDate: validDate.format(DB_DATE_FORMAT),
      eventTime: validTime.format(TIME_FORMAT),
      // Only set default if not already hydrated from initialData
      selectStatusMenu: prev.selectStatusMenu || defaultStatus,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, checked, type } = e.target;
    const newVal = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newVal }));
    setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleDateChange = useCallback((newValue) => {
    const d = dayjs(newValue);
    if (!d.isValid()) return;
    setDateValue(d.toDate());
    setFormData((prev) => ({ ...prev, eventDate: d.format(DB_DATE_FORMAT) }));
    setValidationErrors((prev) => ({ ...prev, eventDate: undefined }));
  }, []);

  const handleTimeChange = useCallback((newValue) => {
    const t = dayjs(newValue);
    if (!t.isValid()) return;
    setTimeValue(t.toDate());
    setFormData((prev) => ({ ...prev, eventTime: t.format(TIME_FORMAT) }));
    setValidationErrors((prev) => ({ ...prev, eventTime: undefined }));
  }, []);

  const validateForm = useCallback(() => {
    const errors = validate(formData);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  return {
    formData,
    setFormData,
    validationErrors,
    dateValue,
    timeValue,
    bsdeOperation, // "start" | "ready" | "out"  — exposed for debugging
    fields,
    groupedFields,
    handleChange,
    handleDateChange,
    handleTimeChange,
    validateForm,
  };
};
