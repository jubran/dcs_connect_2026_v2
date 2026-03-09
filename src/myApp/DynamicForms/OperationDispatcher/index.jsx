// OperationDispatcher/index.jsx
// Moved from: components/DynamicOperationForm.jsx
// Pure dispatcher — receives pre-resolved entityType and canonicalData from OperationsView.
// Renders the correct feature-module form via FORM_COMPONENTS map.

import React from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Tooltip,
  Alert,
  Fade,
} from "@mui/material";
import SvgColor from "src/components/svg-color";

import {
  FORM_LABELS,
  STATUS_COLORS,
  OPERATION_LABELS,
  ENTITY_TYPES,
} from "./constants";

// ── Feature-module sub-forms ──────────────────────────────────────────────────
import UnitsForm from "../UnitsForm";
import TankForm from "../TankForm";
import TransformerForm from "../TransformerForm";
import NoneStatusForm from "../NoneStatusForm";
import BsdeForm from "../BsdeForm";

// ── Entity type → Component map ───────────────────────────────────────────────
// To add a new entity: add 1 line here + create its feature module folder.
const FORM_COMPONENTS = {
  [ENTITY_TYPES.UNITS]: UnitsForm,
  [ENTITY_TYPES.TANK]: TankForm,
  [ENTITY_TYPES.TRANSFORMER]: TransformerForm,
  [ENTITY_TYPES.NONE_STATUS]: NoneStatusForm,
  [ENTITY_TYPES.BSDE]: BsdeForm,
};

// ─────────────────────────────────────────────────────────────────────────────

const OperationDispatcher = ({
  entityType,
  canonicalData,
  selectedOperation,
  mode = "new",
  onSave,
  onCancel,
  // Legacy prop support
  data,
}) => {
  const isEditMode = mode === "edit";
  const formData = canonicalData ?? data ?? {};

  const FormComponent = FORM_COMPONENTS[entityType] ?? UnitsForm;

  const getFormTypeLabel = () => FORM_LABELS[entityType] || "وحدة";
  const getStatusColor = () =>
    STATUS_COLORS[formData.selectStatusMenu] || "default";
  const getOperationLabel = () =>
    OPERATION_LABELS[formData.selectStatusMenu] || "عملية";
  const isShutdown = formData.selectStatusMenu === "Shutdown";

  return (
    <Box>
      {/* Sticky info bar */}
      <Fade in timeout={400}>
        <Box
          mb={3}
          p={2}
          borderRadius={2}
          boxShadow={3}
          sx={{
            bgcolor: `${getStatusColor()}.light`,
            position: "sticky",
            top: 80,
            zIndex: 10,
            borderLeft: isShutdown ? "6px solid" : "none",
            borderColor: isShutdown ? "error.main" : "transparent",
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            mb={1}
            display="flex"
            alignItems="center"
            gap={1}
          >
            <SvgColor
              src="/assets/icons/components/ic_default.svg"
              icon={isEditMode ? "solar:pen-bold" : "solar:add-circle-bold"}
              width={20}
            />
            {isEditMode ? "تعديل عملية فنية" : "إضافة عملية فنية جديدة"}
          </Typography>

          {isShutdown && (
            <Alert
              severity="error"
              icon={<SvgColor src="/assets/icons/dcs/maint.svg" />}
              sx={{ mb: 1 }}
            >
              ⚠️ تنبيه: أنت تقوم بعملية خروج اضطراري (Shutdown)
            </Alert>
          )}

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Tooltip title="الموقع">
              <Chip
                icon={<SvgColor src="/assets/icons/dcs/location.svg" />}
                label={getFormTypeLabel()}
                size="small"
                variant="outlined"
              />
            </Tooltip>

            <Tooltip title="نوع العملية">
              <Chip
                icon={<SvgColor src="/assets/icons/components/ic_bolt.svg" />}
                label={getOperationLabel()}
                size="small"
                color={getStatusColor()}
              />
            </Tooltip>

            <Tooltip title={formData.location}>
              <Chip
                icon={
                  <SvgColor src="/assets/icons/components/ic_location.svg" />
                }
                label={formData.location || "غير محدد"}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Tooltip>

            <Tooltip title="الحالة التشغيلية">
              <Chip
                icon={
                  <SvgColor src="/assets/icons/components/ic_activity.svg" />
                }
                label={formData.selectedOperation || "غير محدد"}
                size="small"
                color={getStatusColor()}
                sx={{ fontWeight: 600 }}
              />
            </Tooltip>
          </Stack>
        </Box>
      </Fade>

      {/* Delegated sub-form */}
      <FormComponent
        data={formData}
        mode={mode}
        entityType={entityType}
        selectedOperation={formData.selectedOperation}
        onSave={onSave}
        onCancel={onCancel}
      />
    </Box>
  );
};

export default OperationDispatcher;
