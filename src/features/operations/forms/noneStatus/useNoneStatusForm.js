// NoneStatusForm/useNoneStatusForm.js
// Extracted from: engine/useEntityForm.js (noneStatus schema entry)
// Self-contained state + field definitions + validation for NoneStatus form.
// No generic engine, no shared schema — everything lives here.

import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";

const DB_DATE_FORMAT = "YYYY-MM-DD";
const TIME_FORMAT = "HH:mm";

// ── Field definitions ─────────────────────────────────────────────────────────
// Mirror of BASE_FIELD_CONFIGS.COMMON for the noneStatus entity.
const FIELDS = [
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

const groupByLevel = (fields) => ({
  level1: fields.filter((f) => f.level === 1),
  level2: fields.filter((f) => f.level === 2),
  level3: fields.filter((f) => f.level === 3),
  level4: fields.filter((f) => f.level === 4),
  level5: fields.filter((f) => f.level === 5),
});

const GROUPED_FIELDS = groupByLevel(FIELDS);

// ── Validation ─────────────────────────────────────────────────────────────────
const validate = (formData) => {
  const errors = {};
  if (!formData.location) errors.location = "الموقع مطلوب.";
  if (!formData.eventDate) errors.eventDate = "التاريخ مطلوب.";
  if (!formData.eventTime) errors.eventTime = "وقت الحدث مطلوب.";
  if (!formData.eventText) errors.eventText = "وصف الحدث مطلوب.";
  return errors;
};

// ── Hook ───────────────────────────────────────────────────────────────────────
export const useNoneStatusForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    location: "",
    eventDate: "",
    eventTime: "",
    eventText: "",
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
    fields: FIELDS,
    groupedFields: GROUPED_FIELDS,
    handleChange,
    handleDateChange,
    handleTimeChange,
    validateForm,
  };
};
