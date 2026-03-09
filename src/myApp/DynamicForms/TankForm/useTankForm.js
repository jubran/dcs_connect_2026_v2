// TankForm/useTankForm.js
// Moved from: hooks/entities/useTankForm.js
// Self-contained state hook for the Tank form.
// Stores eventDate/eventTime as formatted strings (not Date objects).
// DatePicker/TimePicker display via separate dateValue/timeValue state.

import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import {
  TYPE_STATUS_MENU,
  TANK_TAGS_MENU,
  TANK_CONFIG,
  DB_DATE_FORMAT,
  TIME_FORMAT,
} from "./constants";

export default function useTankForm(initialData = {}) {
  // ── Form state ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    location: "",
    eventDate: "", // string 'YYYY-MM-DD'
    eventTime: "", // string 'HH:mm'
    TypeStatus: "",
    ValveStatus: "",
    TankTag: "",
    isDoubleOperation: false,
    TypeStatus2: "",
    ValveStatus2: "",
    TankTag2: "",
    OperationData: "",
  });

  // Picker display values (Date objects for MUI)
  const [dateValue, setDateValue] = useState(null);
  const [timeValue, setTimeValue] = useState(null);

  // ── Hydrate from initialData (edit mode) ───────────────────────────────────
  useEffect(() => {
    if (!initialData || Object.keys(initialData).length === 0) return;

    let parsedDate = null;
    let dateStr = "";
    if (initialData.eventDate) {
      const d = dayjs(initialData.eventDate);
      if (d.isValid()) {
        parsedDate = d.toDate();
        dateStr = d.format(DB_DATE_FORMAT);
      }
    }

    let parsedTime = null;
    let timeStr = "";
    if (initialData.eventTime) {
      let t;
      if (dayjs.isDayjs(initialData.eventTime)) {
        t = initialData.eventTime;
      } else if (typeof initialData.eventTime === "string") {
        t = dayjs(initialData.eventTime, "HH:mm", true);
        if (!t.isValid()) t = dayjs(initialData.eventTime);
      } else if (initialData.eventTime instanceof Date) {
        t = dayjs(initialData.eventTime);
      }
      if (t && t.isValid()) {
        parsedTime = t.toDate();
        timeStr = t.format(TIME_FORMAT);
      }
    }

    setDateValue(parsedDate);
    setTimeValue(parsedTime);
    setFormData((prev) => ({
      ...prev,
      location: initialData.location || "",
      eventDate: dateStr,
      eventTime: timeStr,
      TypeStatus: initialData.typeStatus || "",
      ValveStatus: initialData.ValveStatus || "",
      TankTag: initialData.tankTag || "",
      isDoubleOperation: Boolean(initialData.isDoubleOperation),
      TypeStatus2: initialData.typeStatus2 || "",
      ValveStatus2: initialData.ValveStatus2 || "",
      TankTag2: initialData.tankTag2 || "",
      OperationData: initialData.OperationData || "",
    }));
  }, [initialData]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    const newVal = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const next = { ...prev, [name]: newVal };

      // When double operation is turned OFF → clear all operation2 fields
      // so they don't silently remain in the API payload or operationData text
      if (name === "isDoubleOperation" && !checked) {
        next.TypeStatus2 = "";
        next.ValveStatus2 = "";
        next.TankTag2 = "";
      }

      // When TypeStatus (op1) changes → reset op1 dependent fields
      // and reset op2 entirely since its dropdown filter depends on TypeStatus
      if (name === "TypeStatus") {
        next.ValveStatus = "";
        next.TankTag = "";
        next.TypeStatus2 = "";
        next.ValveStatus2 = "";
        next.TankTag2 = "";
      }

      // When TypeStatus2 changes → reset its dependent fields
      if (name === "TypeStatus2") {
        next.ValveStatus2 = "";
        next.TankTag2 = "";
      }

      return next;
    });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    let dateObj = null;
    let dateStr = "";

    if (value) {
      if (dayjs.isDayjs(value)) {
        dateObj = value.toDate();
        dateStr = value.format(DB_DATE_FORMAT);
      } else if (value instanceof Date) {
        const d = dayjs(value);
        dateObj = value;
        dateStr = d.isValid() ? d.format(DB_DATE_FORMAT) : "";
      } else {
        const d = dayjs(value);
        if (d.isValid()) {
          dateObj = d.toDate();
          dateStr = d.format(DB_DATE_FORMAT);
        }
      }
    }

    setDateValue(dateObj);
    setFormData((prev) => ({ ...prev, [name]: dateStr }));
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    let timeObj = null;
    let timeStr = "";

    if (value) {
      if (dayjs.isDayjs(value)) {
        timeObj = value.toDate();
        timeStr = value.format(TIME_FORMAT);
      } else if (value instanceof Date) {
        const t = dayjs(value);
        timeObj = value;
        timeStr = t.isValid() ? t.format(TIME_FORMAT) : "";
      } else {
        const t = dayjs(value, "HH:mm", true);
        if (t.isValid()) {
          timeObj = t.toDate();
          timeStr = t.format(TIME_FORMAT);
        } else {
          const loose = dayjs(value);
          if (loose.isValid()) {
            timeObj = loose.toDate();
            timeStr = loose.format(TIME_FORMAT);
          }
        }
      }
    }

    setTimeValue(timeObj);
    setFormData((prev) => ({ ...prev, [name]: timeStr }));
  };

  // ── Tank business logic ────────────────────────────────────────────────────
  const location = (formData.location || "").toUpperCase().trim();

  const getAllowedOperations = useMemo(() => {
    if (!location) return [];
    const allowedOps = TANK_CONFIG.TYPE_RULES[location];
    if (allowedOps?.length > 0) return allowedOps;
    if (location.includes("TANK#6") || location.includes("TANK#8"))
      return ["FILLING", "FEEDING", "RETURN", "MAINTENANCE"];
    if (location.includes("TANK#7"))
      return ["FILLING", "FEEDING", "MAINTENANCE"];
    if (location.includes("TANK#9") || location.includes("TANK#11"))
      return ["FILLING", "SERVICE", "RETURN", "MAINTENANCE"];
    return [];
  }, [location]);

  const getFilteredTypeStatus = useMemo(() => {
    if (!getAllowedOperations.length) return [];
    return TYPE_STATUS_MENU.filter((item) =>
      getAllowedOperations.includes(item.value),
    );
  }, [getAllowedOperations]);

  const getFilteredTankTags = useMemo(
    () => (typeStatus) => {
      if (!location || !typeStatus) return [];
      const allowedTags =
        TANK_CONFIG.TAG_RULES[location]?.[typeStatus.toUpperCase()] || [];
      return TANK_TAGS_MENU.filter((t) => allowedTags.includes(t.value));
    },
    [location],
  );

  const getOperationDirection = (typeStatus, valveStatus) => {
    switch (typeStatus) {
      case "FILLING":
        return valveStatus === "OPEN" ? "BY" : "FROM";
      case "FEEDING":
        return valveStatus === "OPEN" ? "TO" : "FROM";
      case "RETURN":
        return "FROM";
      case "SERVICE":
        return "TO";
      case "MAINTENANCE":
        return "UNDER MAINTENANCE";
      default:
        return "";
    }
  };

  const getOperationText = (index = 1) => {
    const typeKey = `TypeStatus${index === 1 ? "" : index}`;
    const valveKey = `ValveStatus${index === 1 ? "" : index}`;
    const tagKey = `TankTag${index === 1 ? "" : index}`;
    const type = formData[typeKey] || "";
    const valve = (formData[valveKey] || "").toUpperCase();
    const tag = formData[tagKey] || "";
    if (!type) return "";
    if (type === "MAINTENANCE") return `${location} - UNDER MAINTENANCE`;
    return `${type} ${getOperationDirection(type, valve)} ${tag} (${valve})`;
  };

  const operationData = useMemo(() => {
    const op1 = getOperationText(1);
    const op2 = formData.isDoubleOperation ? getOperationText(2) : "";
    if (op1 && op2) return `${op1} AND ${op2}`;
    return op1 || op2 || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, location]);

  const validateForm = () => !!(formData.location && formData.TypeStatus);

  return {
    formData,
    setFormData,
    dateValue,
    timeValue,
    handleChange,
    handleDateChange,
    handleTimeChange,
    validateForm,
    getFilteredTypeStatus,
    getFilteredTankTags,
    operationData,
  };
}
