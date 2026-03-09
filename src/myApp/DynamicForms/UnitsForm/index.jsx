// UnitsForm/index.jsx
// Moved from: components/DynamicUnitsForm.jsx
// Self-contained Units (Gas Turbine) form module.
// useUnitsForm replaces the old useFormService + useFormLogic + useFieldService chain.

import React from "react";
import { Box } from "@mui/material";
import { useUnitsForm } from "./useUnitsForm";
import { useFormSubmit } from "../shared/useFormSubmit";
import { useFieldRenderer } from "../shared/useFieldRenderer";
import { FormActions } from "../shared/FormComponents";
import UnitsFormSection from "./UnitsFormSection";

const UnitsForm = ({
  data = {},
  mode = "new",
  entityType,
  selectedOperation,
  onSave,
  onCancel,
}) => {
  const {
    formData,
    validationErrors,
    dateValue,
    timeValue,
    operation,
    isEditMode,
    groupedFields,
    showRatching,
    showshutdownType,
    showfoReason,
    handleDateChange,
    handleTimeChange,
    handleChange,
    validateForm,
  } = useUnitsForm(selectedOperation, data, mode);

  const { submit, loading } = useFormSubmit({
    formData,
    entityType,
    selectedOperation,
    mode,
    data,
    validateForm,
    onSave,
    onError: (msg) => alert(msg),
  });

  const { renderField } = useFieldRenderer({
    formData,
    validationErrors,
    dateValue,
    timeValue,
    handleChange,
    handleDateChange,
    handleTimeChange,
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) submit();
  };

  return (
    <Box>
      <form onSubmit={handleFormSubmit}>
        <UnitsFormSection
          groupedFields={groupedFields}
          showRatching={showRatching}
          showshutdownType={showshutdownType}
          showfoReason={showfoReason}
          validationErrors={validationErrors}
          formData={formData}
          handleChange={handleChange}
          renderField={renderField}
          selectedOperation={operation}
          isEditMode={isEditMode}
          isNoneStatus={false}
        />

        <Box mt={3} display="flex" justifyContent="space-between" gap={2}>
          <FormActions
            onCancel={onCancel}
            onSave={submit}
            loading={loading}
            isEditMode={isEditMode}
          />
        </Box>
      </form>
    </Box>
  );
};

export default UnitsForm;
