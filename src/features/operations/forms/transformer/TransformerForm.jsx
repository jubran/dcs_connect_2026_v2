// TransformerForm/index.jsx
// Moved from: components/DynamicTransformerForm.jsx
// Self-contained Transformer form module.

import React from "react";
import { Box } from "@mui/material";
import { useTransformerForm } from "./useTransformerForm";
import { useFormSubmit } from "src/features/operations/shared/useFormSubmit";
import { FormActions } from "src/features/operations/shared/FormComponents";
import { useFieldRenderer } from "src/features/operations/shared/useFieldRenderer";

const TransformerForm = ({
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
  } = useTransformerForm(data);

  const { submit, loading } = useFormSubmit({
    formData,
    entityType,
    selectedOperation,
    mode,
    data,
    validateForm,
    onSave,
    onError: (message) => alert(message),
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

  const renderGroupedFields = () =>
    Object.keys(groupedFields).map((levelKey) => {
      const fields = groupedFields[levelKey];
      if (!fields.length) return null;
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
          {fields.map((field) => renderField(field))}
        </Box>
      );
    });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  return (
    <form onSubmit={handleFormSubmit}>
      {renderGroupedFields()}
      <FormActions
        onSave={submit}
        onCancel={onCancel}
        loading={loading}
        isEditMode={mode === "edit"}
      />
    </form>
  );
};

export default TransformerForm;
