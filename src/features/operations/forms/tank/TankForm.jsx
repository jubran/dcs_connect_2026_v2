// TankForm/index.jsx
// Moved from: components/DynamicTanksForm.jsx
// Self-contained Tank form module.

import React, { useEffect } from "react";
import { Box, Divider, Typography } from "@mui/material";
import { Fade } from "@mui/material";
import { useFormSubmit } from "src/features/operations/shared/useFormSubmit";
import { TankFormFields, renderField } from "./TankFormFields";
import { FormContainer, FormActions } from "src/features/operations/shared/FormComponents";
import { VALVE_STATUS_MENU } from "./constants";
import useTankForm from "./useTankForm";

const TankForm = ({
  data,
  mode,
  entityType,
  selectedOperation,
  onSave,
  onCancel,
}) => {
  const {
    formData,
    dateValue,
    timeValue,
    handleChange,
    handleDateChange,
    handleTimeChange,
    validateForm,
    getFilteredTypeStatus,
    getFilteredTankTags,
    operationData,
  } = useTankForm(data);

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

  // Handlers object passed to TankFormFields renderField
  const handlers = {
    handleChange,
    handleDateChange,
    handleTimeChange,
    getFilteredTypeStatus,
    getFilteredTankTags,
    VALVE_STATUS_MENU,
    dateValue,
    timeValue,
  };

  // Sync computed operationData back into formData
  useEffect(() => {
    if (formData.OperationData !== operationData) {
      handleChange({ target: { name: "OperationData", value: operationData } });
    }
  }, [operationData, formData.OperationData, handleChange]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <FormContainer>
        {/* Primary fields: location, date, time */}
        <Box sx={{ mb: 1, display: "flex", flexDirection: "column" }}>
          <Typography variant="h6" gutterBottom mb={4}>
            المعلومات الأساسية للخزان
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "flex-row", gap: 2 }}>
            {TankFormFields.primary.map((field) => (
              <Box key={field.name} sx={{ width: "auto", minWidth: "15%" }}>
                {renderField(field, formData, handlers)}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Operation 1 */}
        <Box sx={{ display: "flex", flexDirection: "flex-row", gap: 2 }}>
          {TankFormFields.operation1.map((field) => {
            if (
              formData.TypeStatus === "MAINTENANCE" &&
              (field.name === "ValveStatus" || field.name === "TankTag")
            ) {
              return null;
            }
            return (
              <Box
                sx={{ width: "auto", mb: 2, minWidth: "15%" }}
                key={field.name}
              >
                {renderField(field, formData, handlers)}
              </Box>
            );
          })}
        </Box>

        {/* Double operation toggle */}
        <Fade in={!!formData.TypeStatus} timeout={600}>
          <Box sx={{ mb: 3 }}>
            {formData.TypeStatus &&
              formData.TypeStatus !== "MAINTENANCE" &&
              renderField(TankFormFields.special[0], formData, handlers)}
          </Box>
        </Fade>

        {/* Operation 2 */}
        {formData.TypeStatus !== "MAINTENANCE" &&
          formData.isDoubleOperation && (
            <Fade in={formData.isDoubleOperation} timeout={600}>
              <Box sx={{ mb: 3, display: "flex", flexDirection: "column" }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom mb={3}>
                  العملية الثانية
                </Typography>
                <Box
                  sx={{
                    mb: 3,
                    display: "flex",
                    flexDirection: "flex-row",
                    gap: 2,
                  }}
                >
                  {TankFormFields.operation2.map((field) => {
                    let customHandlers = { ...handlers };
                    if (field.name === "TypeStatus2") {
                      const filteredMenu =
                        handlers.getFilteredTypeStatus.filter(
                          (item) =>
                            item.value !== "MAINTENANCE" &&
                            item.value !== formData.TypeStatus,
                        );
                      customHandlers = {
                        ...handlers,
                        getFilteredTypeStatus: filteredMenu,
                      };
                    }
                    return (
                      <Box
                        key={field.name}
                        sx={{ width: "auto", mb: 2, minWidth: "15%" }}
                      >
                        {renderField(field, formData, customHandlers)}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Fade>
          )}

        {/* Operation data summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom mb={3}>
            ملخص بيانات العملية
          </Typography>
          {renderField(
            { ...TankFormFields.special[1], value: operationData },
            formData,
            handlers,
          )}
        </Box>

        <FormActions
          onSave={submit}
          onCancel={onCancel}
          loading={loading}
          isEditMode={mode === "edit"}
        />
      </FormContainer>
    </form>
  );
};

export default TankForm;
