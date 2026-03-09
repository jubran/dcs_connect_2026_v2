// shared/FormComponents.jsx
// Moved from: components/shared/FormComponents.jsx
// Pure MUI field wrappers — no form-specific logic.

import React from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Box,
  styled,
  Card,
  Button,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

// ── Text Field ────────────────────────────────────────────────────────────────
export const TextFieldComponent = ({
  field,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  multiline = false,
  minRows = 2,
  sx = {},
  inputProps,
  placeholder,
}) => {
  const isEventText = field.name === "eventText";
  return (
    <TextField
      name={field.name}
      label={field.label}
      value={value || ""}
      onChange={onChange}
      onBlur={onBlur}
      multiline={multiline || field.multiline}
      rows={multiline ? minRows : undefined}
      placeholder={placeholder}
      sx={{
        width: field.width || 180,
        textAlign: "right",
        ...(isEventText && {
          "& .MuiInputBase-input": { fontSize: 15, fontFamily: "inherit" },
          "& .MuiInputBase-root": {
            fontSize: 15,
            alignItems: "flex-start",
            minHeight: "80px",
          },
        }),
        ...sx,
      }}
      required={field.required || false}
      error={error}
      helperText={helperText || ""}
      disabled={field.disabled || false}
      inputProps={inputProps}
    />
  );
};

// ── Date Field ────────────────────────────────────────────────────────────────
export const DateFieldComponent = ({
  field,
  value,
  onChange,
  error,
  helperText,
}) => (
  <DatePicker
    label={field.label}
    value={value}
    onChange={onChange}
    format="yyyy-MM-dd"
    sx={{ width: field.width || 180 }}
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

// ── Time Field ────────────────────────────────────────────────────────────────
export const TimeFieldComponent = ({
  field,
  value,
  onChange,
  error,
  helperText,
}) => (
  <TimePicker
    label={field.label}
    value={value}
    onChange={(newValue) => {
      onChange({
        target: {
          name: field.name,
          value: newValue ? dayjs(newValue).format("HH:mm") : "",
        },
      });
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

// ── Select Field ──────────────────────────────────────────────────────────────
export const SelectFieldComponent = ({
  field,
  value,
  onChange,
  error,
  helperText,
}) => (
  <FormControl
    sx={{ width: field.width || 200 }}
    required={field.required || false}
    error={error}
  >
    <InputLabel>{field.label}</InputLabel>
    <Select
      name={field.name}
      value={value || field.default || ""}
      onChange={onChange}
      label={field.label}
    >
      {(field.options || []).map((option, index) => {
        const key =
          typeof option === "object" ? (option.value ?? index) : option;
        const label =
          typeof option === "object" ? (option.label ?? option.value) : option;
        const val = typeof option === "object" ? option.value : option;
        return (
          <MenuItem key={key} value={val}>
            {label}
          </MenuItem>
        );
      })}
    </Select>
    {error && <FormHelperText>{helperText}</FormHelperText>}
  </FormControl>
);

// ── Checkbox Field ────────────────────────────────────────────────────────────
export const CheckboxFieldComponent = ({ field, value, onChange }) => (
  <FormControlLabel
    control={
      <Checkbox
        checked={value || false}
        onChange={onChange}
        name={field.name}
      />
    }
    label={field.label}
  />
);

// ── Layout Helpers ────────────────────────────────────────────────────────────
export const CardStyled = styled(Card)(({ theme }) => ({
  minHeight: 400,
  transition: "0.3s",
  "&:hover": { boxShadow: theme.shadows[10] },
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.background.paper,
}));

export const FormContainer = ({ children }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      paddingTop: "16px",
    }}
  >
    {children}
  </Box>
);

export const FormActions = ({ onSave, onCancel, loading, isEditMode }) => (
  <Box mt={3} display="flex" justifyContent="space-between" gap={2}>
    <Button
      variant="outlined"
      color="secondary"
      onClick={onCancel}
      type="button"
      sx={{ minWidth: 120 }}
    >
      إلغاء
    </Button>
    <Button
      variant="contained"
      color="primary"
      onClick={onSave}
      disabled={loading}
      sx={{ minWidth: 120 }}
    >
      {loading ? "جارٍ الحفظ..." : isEditMode ? "تحديث" : "حفظ"}
    </Button>
  </Box>
);
