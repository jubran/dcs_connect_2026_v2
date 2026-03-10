// UnitsForm/useUnitsForm.js
// MERGED from:
//   hooks/form/useFormService.js
//   hooks/form/useFormLogic.js
//   hooks/fields/useFieldService.jsx
//
// All three files only served the Units form.
// Merging them eliminates the call chain and makes Units fully self-contained.

import { useState, useEffect, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  DB_DATE_FORMAT,
  TIME_FORMAT,
  VALIDATION_MESSAGES,
  RATCHING_MENU,
  normalizeOperation,
  getDefaultStatusMenu,
  buildFieldsForOperation,
  groupFieldsByLevel,
} from "./constants";

dayjs.extend(customParseFormat);

/**
 * Self-contained state + field + logic hook for the Units (Gas Turbine) form.
 *
 * @param {string} selectedOperation  - Raw operation string from router state
 * @param {object} initialData        - Canonical data (from modeResolver)
 * @param {'new'|'edit'} mode
 */
export const useUnitsForm = (
  selectedOperation,
  initialData = {},
  mode = "new",
) => {
  const location = initialData?.location || "";
  const isEditMode = mode === "edit";

  // ── Derived stable values ──────────────────────────────────────────────────
  const operation = useMemo(
    () => normalizeOperation(selectedOperation),
    [selectedOperation],
  );

  const isGT = useMemo(
    () => (location || "").toUpperCase().startsWith("GT"),
    [location],
  );

  const defaultStatus = useMemo(
    () => getDefaultStatusMenu(operation),
    [operation],
  );

  // ── Field definitions (replaces useFieldService) ───────────────────────────
  const fields = useMemo(
    () => buildFieldsForOperation(operation, isGT),
    [operation, isGT],
  );

  const groupedFields = useMemo(() => groupFieldsByLevel(fields), [fields]);

  // ── Conditional display flags (replaces useConditionalLogic) ───────────────
  // These are computed from formData so they live in state-dependent derived values.
  // Declared here but evaluated after formData state is defined below.

  // ── Form state ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    id: isEditMode ? initialData?.id || "" : "",
    location,
    eventDate: "",
    eventTime: "",
    eventText: initialData?.eventText || "",
    note: initialData?.note || "",
    selectStatusMenu: isEditMode
      ? initialData?.selectStatusMenu || defaultStatus
      : defaultStatus,
    selectedRatching: initialData?.selectedRatching || "",
    shutdownType: initialData?.shutdownType || "",
    foReason: initialData?.foReason || "",
    flameRPM: initialData?.flameRPM || "",
    fsnlTime: initialData?.fsnlTime || "",
    synchTime: initialData?.synchTime || "",
    transformerAction: initialData?.transformerAction || "",
    IER: initialData?.IER || "",
    linkToUnit: isGT || false,
    typeStatus: initialData?.typeStatus || "",
    ValveStatus: initialData?.ValveStatus || "",
    tankTag: initialData?.tankTag || "",
    typeStatus2: initialData?.typeStatus2 || "",
    ValveStatus2: initialData?.ValveStatus2 || "",
    tankTag2: initialData?.tankTag2 || "",
    isDoubleOperation: initialData?.isDoubleOperation || false,
    sapOrder: initialData?.sapOrder || "",
    hyd: initialData?.hyd || "",
    status1: initialData?.status1 || initialData?.selectedOperation || "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [dateValue, setDateValue] = useState(null);
  const [timeValue, setTimeValue] = useState(null);

  // ── Conditional display flags (depend on formData) ─────────────────────────
  const showRatching = isGT && ["stop", "trip", "change"].includes(operation);
  const showshutdownType =
    formData.linkToUnit && formData.selectStatusMenu === "Shutdown";
  const showfoReason = showshutdownType && formData.shutdownType === "FO";

  // ── Date / time initialisation ─────────────────────────────────────────────
  useEffect(() => {
    let finalDate = dayjs();
    let finalTime = dayjs();

    if (initialData) {
      if (initialData.eventDate) finalDate = dayjs(initialData.eventDate);
      else if (initialData.date1)
        finalDate = dayjs(
          initialData.date1,
          ["YYYY-MM-DD", "DD-MM-YYYY", "MM/DD/YYYY"],
          true,
        );
      else if (initialData.dayDate) finalDate = dayjs(initialData.dayDate);

      if (initialData.eventTime)
        finalTime = dayjs(initialData.eventTime, TIME_FORMAT);
      else if (initialData.time1)
        finalTime = dayjs(initialData.time1, ["HH:mm", "hh:mm A"], true);
      else if (initialData.dayTime)
        finalTime = dayjs(initialData.dayTime, TIME_FORMAT);
    }

    if (!finalDate.isValid()) finalDate = dayjs();
    if (!finalTime.isValid()) finalTime = dayjs();

    setDateValue(finalDate.toDate());
    setTimeValue(finalTime.toDate());

    setFormData((prev) => ({
      ...prev,
      eventDate: finalDate.format(DB_DATE_FORMAT),
      eventTime: finalTime.format(TIME_FORMAT),
      location: location || prev.location,
      selectStatusMenu: prev.selectStatusMenu || defaultStatus,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // ── Default Ratching on new forms ─────────────────────────────────────────
  useEffect(() => {
    if (showRatching && !formData.selectedRatching && !isEditMode) {
      setFormData((prev) => ({
        ...prev,
        selectedRatching: "Ratching In Service",
      }));
    }
  }, [showRatching, formData.selectedRatching, isEditMode]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDateChange = useCallback((newValue) => {
    const val = dayjs.isDayjs(newValue) ? newValue : dayjs(newValue);
    setDateValue(val.toDate());
    setFormData((prev) => ({ ...prev, eventDate: val.format(DB_DATE_FORMAT) }));
    setValidationErrors((prev) => ({ ...prev, eventDate: undefined }));
  }, []);

  const handleTimeChange = useCallback((newValue) => {
    const val = dayjs.isDayjs(newValue) ? newValue : dayjs(newValue);
    setTimeValue(val.toDate());
    setFormData((prev) => ({ ...prev, eventTime: val.format(TIME_FORMAT) }));
    setValidationErrors((prev) => ({ ...prev, eventTime: undefined }));
  }, []);

  const handleChange = useCallback((e) => {
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
  }, []);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateForm = useCallback(() => {
    const errors = {};

    fields.forEach((field) => {
      if (
        field.required &&
        field.type !== "checkbox" &&
        !formData[field.name]
      ) {
        errors[field.name] = VALIDATION_MESSAGES.REQUIRED(field.label);
      }
    });

    if (showRatching && !formData.selectedRatching) {
      errors.selectedRatching = "حالة Ratching مطلوبة.";
    }
    if (showshutdownType && !formData.shutdownType) {
      errors.shutdownType = "سبب Trip مطلوب.";
    }
    if (showfoReason && !formData.foReason) {
      errors.foReason = "سبب FO الفرعي مطلوب.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [fields, formData, showRatching, showshutdownType, showfoReason]);

  return {
    // State
    formData,
    setFormData,
    validationErrors,
    dateValue,
    timeValue,
    isEditMode,
    operation,

    // Fields
    fields,
    groupedFields,

    // Visibility
    showRatching,
    showshutdownType,
    showfoReason,

    // Handlers
    handleDateChange,
    handleTimeChange,
    handleChange,

    // Utilities
    validateForm,
  };
};
