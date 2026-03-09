// TankForm/TankFormFields.jsx
// Moved from: components/TankFormFields.jsx
// Tank-specific field configuration and custom renderers.
// Uses its own date/time picker components (separate from shared/FormComponents).

import React from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { VALVE_STATUS_MENU } from "./constants";

// ── Field Configuration ────────────────────────────────────────────────────────
export const TankFormFields = {
  primary: [
    {
      type: "text",
      name: "location",
      label: "الموقع",
      component: "textfield",
      width: "100%",
    },
    {
      type: "date",
      name: "eventDate",
      label: "تاريخ العملية",
      component: "date",
      width: "100%",
    },
    {
      type: "time",
      name: "eventTime",
      label: "وقت العملية",
      component: "time",
      width: "100%",
    },
  ],
  operation1: [
    {
      type: "select",
      name: "TypeStatus",
      label: "نوع العملية",
      component: "select",
      dependencies: ["location"],
      disabledCondition: (formData) => (formData.location || "").trim() === "",
    },
    {
      type: "select",
      name: "ValveStatus",
      label: "وضع الصمام",
      component: "select",
      optionsSource: "VALVE_STATUS_MENU",
      disabledCondition: (formData) =>
        formData.TypeStatus === "MAINTENANCE" || !formData.TypeStatus,
    },
    {
      type: "select",
      name: "TankTag",
      label: "التفاصيل",
      component: "select",
      optionsSource: "dynamic",
      disabledCondition: (formData) =>
        formData.TypeStatus === "MAINTENANCE" || !formData.TypeStatus,
    },
  ],
  operation2: [
    {
      type: "select",
      name: "TypeStatus2",
      label: "نوع العملية",
      component: "select",
      dependencies: ["location"],
      disabledCondition: (formData) => (formData.location || "").trim() === "",
      optionsSource: "TypeStatusFiltered",
    },
    {
      type: "select",
      name: "ValveStatus2",
      label: "وضع الصمام",
      component: "select",
      optionsSource: "VALVE_STATUS_MENU",
      disabledCondition: (formData) =>
        formData.TypeStatus2 === "MAINTENANCE" || !formData.TypeStatus2,
    },
    {
      type: "select",
      name: "TankTag2",
      label: "التفاصيل",
      component: "select",
      optionsSource: "dynamic",
      disabledCondition: (formData) =>
        formData.TypeStatus2 === "MAINTENANCE" || !formData.TypeStatus2,
    },
  ],
  special: [
    {
      type: "checkbox",
      name: "isDoubleOperation",
      label: "هل توجد عملية ثانية؟",
      component: "checkbox",
    },
    {
      type: "textarea",
      name: "OperationData",
      label: "ملخص ووصف العملية",
      component: "textarea",
      disabled: true,
      rows: 4,
      fullWidth: true,
    },
  ],
};

// ── Date Picker (Tank-specific) ───────────────────────────────────────────────
// Receives dateValue (Date object) from useTankForm, not formData.eventDate (string).
export const DateFieldComponentTank = ({
  field,
  value,
  onChange,
  error,
  helperText,
}) => (
  <DatePicker
    label={field.label}
    value={value ?? null}
    onChange={(newValue) => {
      onChange({ target: { name: field.name, value: newValue } });
    }}
    format="yyyy-MM-dd"
    sx={{ width: field.width || 180 }}
    disabled={field.disabled || false}
    slotProps={{
      textField: {
        required: field.required || false,
        error,
        helperText: helperText || "",
        name: field.name,
      },
    }}
  />
);

// ── Time Picker (Tank-specific) ───────────────────────────────────────────────
// Receives timeValue (Date object) from useTankForm, not formData.eventTime (string).
export const TimeFieldComponentTank = ({
  field,
  value,
  onChange,
  error,
  helperText,
}) => (
  <TimePicker
    label={field.label}
    value={value ?? null}
    onChange={(newValue) => {
      onChange({ target: { name: field.name, value: newValue } });
    }}
    format="HH:mm"
    slotProps={{
      textField: {
        sx: {
          width: field.width || 180,
          "& input": {
            letterSpacing: "3px",
            textAlign: "center",
            fontWeight: "800",
            fontSize: "15px",
          },
        },
        InputProps: { endAdornment: null },
        required: field.required || false,
        error,
        helperText: helperText || "",
        name: field.name,
      },
    }}
  />
);

// ── renderField ────────────────────────────────────────────────────────────────
export const renderField = (field, formData, handlers) => {
  const {
    handleChange,
    handleDateChange,
    handleTimeChange,
    getFilteredTypeStatus,
    getFilteredTankTags,
    dateValue,
    timeValue,
  } = handlers;

  const value = formData[field.name];
  const disabled = field.disabledCondition
    ? field.disabledCondition(formData)
    : (field.disabled ?? false);

  const commonProps = {
    name: field.name,
    value: value || "",
    onChange: handleChange,
    disabled,
    label: field.label,
    fullWidth: field.fullWidth || false,
  };

  switch (field.component) {
    case "textfield":
      return <TextField {...commonProps} />;

    case "date":
      return (
        <DateFieldComponentTank
          field={{ ...field, width: "180px" }}
          value={dateValue}
          onChange={handleDateChange}
          error={false}
          helperText=""
        />
      );

    case "time":
      return (
        <TimeFieldComponentTank
          field={{ ...field, width: "180px" }}
          value={timeValue}
          onChange={handleTimeChange}
          error={false}
          helperText=""
        />
      );

    case "textarea":
      return <TextField {...commonProps} multiline rows={field.rows || 4} />;

    case "checkbox":
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={!!value}
              onChange={handleChange}
              name={field.name}
            />
          }
          label={field.label}
        />
      );

    case "select": {
      const selectOptions = getSelectOptions(field, formData, {
        getFilteredTypeStatus,
        getFilteredTankTags,
      });
      return (
        <FormControl fullWidth sx={{ mt: 2 }} disabled={disabled}>
          <InputLabel>{field.label}</InputLabel>
          <Select
            name={field.name}
            value={value || ""}
            onChange={handleChange}
            label={field.label}
          >
            {renderSelectOptions(selectOptions, field.name)}
          </Select>
        </FormControl>
      );
    }

    default:
      return null;
  }
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const getSelectOptions = (field, formData, handlers) => {
  const { getFilteredTypeStatus, getFilteredTankTags } = handlers;

  if (field.name === "TypeStatus" || field.name === "TypeStatus2") {
    return Array.isArray(getFilteredTypeStatus) ? getFilteredTypeStatus : [];
  }
  if (field.optionsSource === "VALVE_STATUS_MENU") {
    return VALVE_STATUS_MENU || [];
  }
  if (field.name === "TankTag") {
    return typeof getFilteredTankTags === "function"
      ? getFilteredTankTags(formData.TypeStatus)
      : [];
  }
  if (field.name === "TankTag2") {
    return typeof getFilteredTankTags === "function"
      ? getFilteredTankTags(formData.TypeStatus2)
      : [];
  }
  return [];
};

const renderSelectOptions = (options, fieldName) => {
  if (options.length > 0) {
    return options.map((opt) => (
      <MenuItem key={opt.value} value={opt.value}>
        {opt.label}
      </MenuItem>
    ));
  }
  return (
    <MenuItem disabled value="">
      {fieldName.includes("TypeStatus")
        ? "يجب اختيار الموقع أولاً"
        : "لا توجد عمليات يمكن اختيارها"}
    </MenuItem>
  );
};
