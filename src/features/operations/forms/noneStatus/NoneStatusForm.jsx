// NoneStatusForm/index.jsx
// Moved from: components/DynamicNoneStatusForm.jsx
// GenericStatusForm shell is inlined here — removing the shared dependency.
// Self-contained NoneStatus form module.

import React from "react";
import { Box } from "@mui/material";
import { useNoneStatusForm } from "./useNoneStatusForm";
import { useFormSubmit } from "src/features/operations/shared/useFormSubmit";
import { useFieldRenderer } from "src/features/operations/shared/useFieldRenderer";
import { FormActions } from "src/features/operations/shared/FormComponents";

const NoneStatusForm = ({
  data,
  mode,
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
    groupedFields,
    handleChange,
    handleDateChange,
    handleTimeChange,
    validateForm,
  } = useNoneStatusForm(data);

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
    submit();
  };

  return (
    <form onSubmit={handleFormSubmit}>
      {/* Render fields grouped by level — GenericStatusForm shell inlined */}
      {Object.entries(groupedFields).map(([levelKey, fields]) => {
        if (!fields || !fields.length) return null;
        return (
          <Box
            key={levelKey}
            mt={2}
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap={2}
            flexWrap="wrap"
            width="100%"
          >
            {fields.map(renderField)}
          </Box>
        );
      })}

      <FormActions
        onSave={submit}
        onCancel={onCancel}
        loading={loading}
        isEditMode={mode === "edit"}
      />
    </form>
  );
};

export default NoneStatusForm;
