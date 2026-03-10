// shared/useFieldRenderer.jsx
// Moved from: hooks/fields/useFieldRenderer.jsx
// Generic field renderer — used by UnitsForm and TransformerForm.
// TankForm uses its own dedicated renderer (TankFormFields.jsx).

import React from "react";
import {
  TextFieldComponent,
  DateFieldComponent,
  TimeFieldComponent,
  SelectFieldComponent,
  CheckboxFieldComponent,
} from "./FormComponents";
import { formatCompleteTime, formatHHMM24Display } from "./timeUtils";

export const useFieldRenderer = ({
  formData,
  validationErrors,
  dateValue,
  timeValue,
  handleChange,
  handleDateChange,
  handleTimeChange,
}) => {
  const renderField = (field) => {
    const fieldHasError = !!validationErrors?.[field.name];
    const helperText = fieldHasError
      ? validationErrors[field.name]
      : field.helperText;
    const value = formData[field.name];

    const commonProps = {
      field,
      value,
      error: fieldHasError,
      helperText,
      onChange: handleChange,
    };

    switch (field.type) {
      case "text": {
        // Multi-line event description
        if (field.name === "eventText") {
          return (
            <TextFieldComponent
              key={field.name}
              {...commonProps}
              multiline
              minRows={2}
            />
          );
        }

        // Time text input (HH:mm mask)
        if (field.format === "HH:mm") {
          return (
            <TextFieldComponent
              key={field.name}
              {...commonProps}
              placeholder="HH:mm"
              value={formatHHMM24Display(value)}
              onChange={(e) => {
                let val = e.target.value;
                const digits = val.replace(/\D/g, "");
                if (digits.length >= 2) {
                  const hh = digits.slice(0, 2);
                  const mm = digits.slice(2, 4);
                  val = `${hh}${mm ? ":" + mm : ":"}`;
                }
                handleChange({ target: { name: field.name, value: val } });
              }}
              onBlur={(e) => {
                const finalValue = formatCompleteTime(e.target.value);
                if (finalValue !== value) {
                  handleChange({
                    target: { name: field.name, value: finalValue },
                  });
                }
              }}
              inputProps={{ maxLength: 5, inputMode: "numeric" }}
            />
          );
        }

        // Numeric-only (e.g. flameRPM, max 3 digits)
        if (field.maxLength === 3) {
          return (
            <TextFieldComponent
              key={field.name}
              {...commonProps}
              value={value || ""}
              onChange={(e) => {
                const digitsOnly = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 3);
                handleChange({
                  target: { name: field.name, value: digitsOnly },
                });
              }}
              inputProps={{
                maxLength: 3,
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
            />
          );
        }

        return <TextFieldComponent key={field.name} {...commonProps} />;
      }

      case "date":
        return (
          <DateFieldComponent
            key={field.name}
            field={field}
            value={dateValue}
            onChange={handleDateChange}
            error={fieldHasError}
            helperText={helperText}
          />
        );

      case "time":
        return (
          <TimeFieldComponent
            key={field.name}
            field={field}
            value={timeValue}
            onChange={handleTimeChange}
            error={fieldHasError}
            helperText={helperText}
          />
        );

      case "select":
        return (
          <SelectFieldComponent
            key={field.name}
            field={field}
            value={value}
            onChange={handleChange}
            error={fieldHasError}
            helperText={helperText}
          />
        );

      case "checkbox":
        return (
          <CheckboxFieldComponent
            key={field.name}
            field={field}
            value={value}
            onChange={handleChange}
            error={fieldHasError}
          />
        );

      default:
        return null;
    }
  };

  return { renderField };
};
