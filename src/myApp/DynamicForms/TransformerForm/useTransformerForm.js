// TransformerForm/useTransformerForm.js
// Moved from: hooks/entities/useTransformerForm.js
// Self-contained state + field definitions for the Transformer form.
// Conditional logic (showIER, showshutdownType, showfoReason) lives here.

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  FIELD_TYPES,
  FIELD_LEVELS,
  FIELD_WIDTHS,
  DB_DATE_FORMAT,
  TIME_FORMAT,
  STATUS_MENU,
  RATCHING_MENU,
  TRIP_REASONS,
  FO_SUB_REASONS,
  TRANSFORMER_ACTIONS,
  VALIDATION_MESSAGES,
} from "./constants";

dayjs.extend(customParseFormat);

export const useTransformerForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    location: initialData.location || "",
    eventDate: "",
    eventTime: "",
    transformerAction: "",
    IER: "",
    linkToUnit: !!initialData.linkToUnit,
    eventText: initialData.eventText || "",
    selectStatusMenu: initialData.selectStatusMenu || "",
    selectedRatching: initialData.selectedRatching || "",
    shutdownType: initialData.shutdownType || "",
    foReason: initialData.foReason || "",
    sapOrder: initialData.sapOrder || "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [dateValue, setDateValue] = useState(null);
  const [timeValue, setTimeValue] = useState(null);

  // ── Derived visibility flags ───────────────────────────────────────────────
  const showIER = formData.transformerAction === "DE-ENERGIZE AND EARTH";
  const showshutdownType =
    formData.linkToUnit && formData.selectStatusMenu === "Shutdown";
  const showfoReason = showshutdownType && formData.shutdownType === "FO";

  // ── Initialise dates ────────────────────────────────────────────────────────
  useEffect(() => {
    const now = dayjs();
    setDateValue(now.toDate());
    setTimeValue(now.toDate());
    setFormData((prev) => ({
      ...prev,
      eventDate: now.format(DB_DATE_FORMAT),
      eventTime: now.format(TIME_FORMAT),
      location: prev.location || initialData.location || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    const newVal = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const next = { ...prev, [name]: newVal };

      if (name === "linkToUnit" && !checked) {
        next.selectStatusMenu = "";
        next.selectedRatching = "";
        next.shutdownType = "";
        next.foReason = "";
        next.sapOrder = "";
        next.eventText = "";
      }

      if (name === "selectStatusMenu" && newVal !== "Shutdown") {
        next.shutdownType = "";
        next.foReason = "";
        next.sapOrder = "";
      }

      if (name === "shutdownType" && newVal !== "FO") {
        next.foReason = "";
        next.sapOrder = "";
      }

      return next;
    });

    setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleDateChange = (newValue) => {
    const val = dayjs(newValue);
    setDateValue(val.toDate());
    setFormData((prev) => ({ ...prev, eventDate: val.format(DB_DATE_FORMAT) }));
    setValidationErrors((prev) => ({ ...prev, eventDate: undefined }));
  };

  const handleTimeChange = (newValue) => {
    const val = dayjs(newValue);
    setTimeValue(val.toDate());
    setFormData((prev) => ({ ...prev, eventTime: val.format(TIME_FORMAT) }));
    setValidationErrors((prev) => ({ ...prev, eventTime: undefined }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateForm = () => {
    const errors = {};

    if (!formData.transformerAction)
      errors.transformerAction =
        VALIDATION_MESSAGES.REQUIRED("Transformer Action");
    if (showIER && !formData.IER)
      errors.IER = VALIDATION_MESSAGES.REQUIRED("IER");
    if (showshutdownType && !formData.shutdownType)
      errors.shutdownType = VALIDATION_MESSAGES.REQUIRED("Trip Reason");
    if (showfoReason && !formData.foReason)
      errors.foReason = VALIDATION_MESSAGES.REQUIRED("FO Sub Reason");

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Field definitions ──────────────────────────────────────────────────────
  const fields = [
    {
      type: FIELD_TYPES.TEXT,
      name: "location",
      label: "Location",
      width: FIELD_WIDTHS.LARGE,
      level: FIELD_LEVELS.LEVEL_1,
      required: true,
      disabled: true,
    },
    {
      type: FIELD_TYPES.DATE,
      name: "eventDate",
      label: "Event Date",
      width: FIELD_WIDTHS.LARGE,
      level: FIELD_LEVELS.LEVEL_1,
      required: true,
    },
    {
      type: FIELD_TYPES.TIME,
      name: "eventTime",
      label: "Event Time",
      width: FIELD_WIDTHS.LARGE,
      level: FIELD_LEVELS.LEVEL_1,
      required: true,
    },
    {
      type: FIELD_TYPES.SELECT,
      name: "transformerAction",
      label: "Transformer Action",
      options: TRANSFORMER_ACTIONS.map((v) => ({ value: v, label: v })),
      width: FIELD_WIDTHS.LARGE,
      level: FIELD_LEVELS.LEVEL_2,
      required: true,
    },
    ...(showIER
      ? [
          {
            type: FIELD_TYPES.TEXT,
            name: "IER",
            label: "IER",
            width: FIELD_WIDTHS.LARGE,
            level: FIELD_LEVELS.LEVEL_2,
          },
        ]
      : []),
    {
      type: FIELD_TYPES.CHECKBOX,
      name: "linkToUnit",
      label: "Transformer link to unit status",
      level: FIELD_LEVELS.LEVEL_3,
    },
    ...(formData.linkToUnit
      ? [
          {
            type: FIELD_TYPES.TEXT,
            name: "eventText",
            label: "Event Text",
            multiline: true,
            minRows: 2,
            width: FIELD_WIDTHS.FULL,
            level: FIELD_LEVELS.LEVEL_4,
          },
          {
            type: FIELD_TYPES.SELECT,
            name: "selectStatusMenu",
            label: "Unit Status",
            options: STATUS_MENU.filter((i) =>
              ["Shutdown", "Stand By"].includes(i.value),
            ),
            width: FIELD_WIDTHS.LARGE,
            level: FIELD_LEVELS.LEVEL_5,
          },
          {
            type: FIELD_TYPES.SELECT,
            name: "selectedRatching",
            label: "Ratching Status",
            options: RATCHING_MENU,
            width: FIELD_WIDTHS.LARGE,
            level: FIELD_LEVELS.LEVEL_5,
          },
        ]
      : []),
    ...(showshutdownType
      ? [
          {
            type: FIELD_TYPES.SELECT,
            name: "shutdownType",
            label: "Trip Reason",
            options: TRIP_REASONS.map((r) => ({ value: r, label: r })),
            width: FIELD_WIDTHS.LARGE,
            level: FIELD_LEVELS.LEVEL_5,
          },
        ]
      : []),
    ...(showfoReason
      ? [
          {
            type: FIELD_TYPES.SELECT,
            name: "foReason",
            label: "FO Sub Reason",
            options: FO_SUB_REASONS.map((s) => ({ value: s, label: s })),
            width: FIELD_WIDTHS.LARGE,
            level: FIELD_LEVELS.LEVEL_5,
          },
          {
            type: FIELD_TYPES.TEXT,
            name: "sapOrder",
            label: "SAP Order",
            width: FIELD_WIDTHS.MEDIUM,
            level: FIELD_LEVELS.LEVEL_5,
          },
        ]
      : []),
  ];

  const groupedFields = {
    level1: fields.filter((f) => f.level === FIELD_LEVELS.LEVEL_1),
    level2: fields.filter((f) => f.level === FIELD_LEVELS.LEVEL_2),
    level3: fields.filter((f) => f.level === FIELD_LEVELS.LEVEL_3),
    level4: fields.filter((f) => f.level === FIELD_LEVELS.LEVEL_4),
    level5: fields.filter((f) => f.level === FIELD_LEVELS.LEVEL_5),
  };

  return {
    formData,
    validationErrors,
    dateValue,
    timeValue,
    fields,
    groupedFields,
    showIER,
    showshutdownType,
    showfoReason,
    handleChange,
    handleDateChange,
    handleTimeChange,
    validateForm,
  };
};
