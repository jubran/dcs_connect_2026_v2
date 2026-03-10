// BsdeForm/index.jsx
// Self-contained BSDE form module.
// Passes selectedOperation into useBsdeForm so the correct
// selectStatusMenu options are built for each action:
//   start → [ FSNL, LOAD ]
//   ready → [ ready ]
//   out   → [ out ]

import React from "react";
import { Box } from "@mui/material";
import { useBsdeForm } from "./useBsdeForm";
import { useFormSubmit } from "src/features/operations/shared/useFormSubmit";
import { useFieldRenderer } from "src/features/operations/shared/useFieldRenderer";
import { FormActions } from "src/features/operations/shared/FormComponents";

const BsdeForm = ({
  data,
  mode,
  entityType,
  selectedOperation,
  onSave,
  onCancel,
}) => {
  // selectedOperation ("start" | "ready" | "out") drives which status options appear
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
  } = useBsdeForm(data, selectedOperation);

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

export default BsdeForm;
