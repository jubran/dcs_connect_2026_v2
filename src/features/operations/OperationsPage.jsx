// OperationsView.jsx
// Top-level entry point for all operation forms.
// Replaces the old views/OperationsView.jsx.
//
// Responsibilities:
//   1. Read router state ONCE
//   2. Resolve entityType (inlined — was entityResolver.js)
//   3. Normalise inbound data (was modeResolver.js)
//   4. Guard against missing / malformed data
//   5. Render OperationDispatcher with clean props
//
// Mode flow:
//   "new"  → from OperationDialogForm.jsx → initializes dynamic schema
//   "edit" → from ShowDataGrid.jsx        → hydrates canonical data
//
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  CardContent,
  Typography,
  Divider,
  Box,
  Breadcrumbs,
  Link,
  Alert,
  Chip,
} from "@mui/material";
import dayjs from "dayjs";
import { useAuthContext } from "src/auth/hooks";
import { useSnackbar } from "src/shared/contexts/SnackbarContext";
import SvgColor from "src/components/svg-color";

import { CardStyled } from "./shared/FormComponents";
import OperationDispatcher from "./OperationDispatcher";
import { parseTankActionSingleLine } from "./forms/tank/tankDataParser";

// ── Constants ──────────────────────────────────────────────────────────────────
const DB_DATE_FORMAT = "YYYY-MM-DD";
const TIME_FORMAT = "HH:mm";

const ENTITY_TYPES = {
  UNITS: "units",
  TANK: "tank",
  TRANSFORMER: "transformer",
  NONE_STATUS: "noneStatus",
  BSDE: "bsde",
};

const SECTION_TITLE = {
  units: "عمليات الوحدات",
  tank: "عمليات خزانات الوقود",
  transformer: "عمليات المحولات",
  noneStatus: "العمليات الفنية",
  bsde: "عمليات BSDE",
};

const SCHEMA_LABELS = {
  units: "وحدة غازية",
  tank: "خزان وقود",
  transformer: "محول وحدة غازية",
  noneStatus: "عملية فنية",
  bsde: "BSDE",
};

// ── Entity type resolver (inlined from schema/entityResolver.js) ──────────────
// Priority:
//   Tier 1 — selectedOperation wins (explicit intent)
//   Tier 2 — location pattern matching
//   Tier 3 — default: units
const resolveEntityType = (location = "", selectedOperation = "") => {
  const op = (selectedOperation || "").toLowerCase().trim();
  const loc = (location || "").toUpperCase().trim();

  const OP_MAP = {
    transformer: ENTITY_TYPES.TRANSFORMER,
    nonestatus: ENTITY_TYPES.NONE_STATUS,
    bsde: ENTITY_TYPES.BSDE,
    tank: ENTITY_TYPES.TANK,
    start: ENTITY_TYPES.UNITS,
  };
  if (OP_MAP[op]) return OP_MAP[op];

  if (/^TANK#?\d+/.test(loc)) return ENTITY_TYPES.TANK;
  if (/^(BS|DE)/.test(loc)) return ENTITY_TYPES.BSDE;
  if (/^(TR|XFMR)/.test(loc)) return ENTITY_TYPES.TRANSFORMER;
  if (/^GT/.test(loc)) return ENTITY_TYPES.UNITS;

  return ENTITY_TYPES.UNITS;
};

// ── Date / time helpers ────────────────────────────────────────────────────────
const resolveDate = (...candidates) => {
  for (const d of candidates) {
    if (!d) continue;
    const parsed = dayjs(d);
    if (parsed.isValid()) return parsed.format(DB_DATE_FORMAT);
  }
  return dayjs().format(DB_DATE_FORMAT);
};

const resolveTime = (...candidates) => {
  for (const t of candidates) {
    if (!t) continue;
    const strict = dayjs(t, "HH:mm", true);
    if (strict.isValid()) return strict.format(TIME_FORMAT);
    const loose = dayjs(t);
    if (loose.isValid()) return loose.format(TIME_FORMAT);
  }
  return dayjs().format(TIME_FORMAT);
};

// ── Inbound data normaliser (simplified from schema/modeResolver.js) ──────────
const normalizeInboundData = (routerState = {}) => {
  const mode = routerState.mode || "new";
  const raw = routerState.data || routerState || {};

  const canonicalData = {
    id: raw.id || null,
    location: raw.location || "",
    eventDate: resolveDate(raw.eventDate, raw.date1, raw.dayDate),
    eventTime: resolveTime(raw.eventTime, raw.time1, raw.dayTime),
    eventText: raw.eventText || raw.action || "",
    selectedOperation: raw.selectedOperation || raw.status1 || "",
    note: raw.note || "",

    // Units / shared
    selectStatusMenu: raw.selectStatusMenu || raw.status1 || "",
    selectedRatching: raw.selectedRatching || raw.hyd || "",
    shutdownType: raw.shutdownType || "",
    foReason: raw.foReason || "",
    sapOrder: raw.sapOrder || "",
    flameRPM: raw.flameRPM || raw.flame || "",
    fsnlTime: raw.fsnlTime || raw.fsnl || "",
    synchTime: raw.synchTime || raw.synch || "",
    hyd: raw.hyd || "",
    status1: raw.status1 || "",

    // Transformer
    transformerAction: raw.transformerAction || "",
    IER: raw.IER || "",
    linkToUnit: Boolean(raw.linkToUnit),

    // Tank
    typeStatus: raw.typeStatus || "",
    ValveStatus: raw.ValveStatus || "",
    tankTag: raw.tankTag || "",
    typeStatus2: raw.typeStatus2 || "",
    ValveStatus2: raw.ValveStatus2 || "",
    tankTag2: raw.tankTag2 || "",
    isDoubleOperation: Boolean(raw.isDoubleOperation),
    OperationData: raw.OperationData || "",
  };

  // Prefer the entityType explicitly sent by OperationDialogForm (new mode).
  // Fall back to resolveEntityType for edit mode (ShowDataGrid never sends entityType).
  const entityType =
    raw.entityType ||
    resolveEntityType(canonicalData.location, canonicalData.selectedOperation);

  // For tank edits, parse the action text into structured fields
  if (
    entityType === ENTITY_TYPES.TANK &&
    mode === "edit" &&
    (raw.eventText || raw.action)
  ) {
    const parsed = parseTankActionSingleLine(raw.eventText || raw.action || "");
    Object.assign(canonicalData, parsed);
  }

  return { mode, entityType, canonicalData };
};

// ── Component ──────────────────────────────────────────────────────────────────
const OperationsView = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { showSuccess, showError } = useSnackbar();

  // Guard: no router state
  if (!state) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="warning">
          ⚠️ لم يتم تمرير بيانات النموذج من الصفحة السابقة.
        </Alert>
      </Container>
    );
  }

  const { mode, entityType, canonicalData } = normalizeInboundData(state);
  const isEditMode = mode === "edit";

  // Guard: edit without id
  if (isEditMode && !canonicalData.id) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">
          ❌ وضع التعديل يتطلب تمرير بيانات السجل المراد تعديله (id مفقود).
        </Alert>
      </Container>
    );
  }

  // Handlers
  const handleSave = (result) => {
    if (result?.success) {
      showSuccess(
        isEditMode ? "تم تحديث العملية بنجاح" : "تم إضافة العملية بنجاح",
        2000,
      );
      navigate(-1);
    } else {
      showError(result?.message || "حدث خطأ أثناء الحفظ");
    }
  };

  const handleCancel = () => navigate(-1);

  const sectionTitle = SECTION_TITLE[entityType] || "العمليات التشغيلية";
  const schemaLabel = SCHEMA_LABELS[entityType] || entityType;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Box mb={3}>
        <Breadcrumbs>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate("/")}
            sx={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <SvgColor src="/assets/icons/navbar/ic_dashboard.svg" width={16} />
            الرئيسية
          </Link>
          <Typography color="text.primary">
            {isEditMode ? "وضع التعديل" : "وضع الإضافة"}
          </Typography>
        </Breadcrumbs>
      </Box>

      <CardStyled elevation={4}>
        <CardContent>
          {/* Title row */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <SvgColor
                src="/assets/icons/components/ic_default.svg"
                icon={isEditMode ? "solar:pen-bold" : "solar:add-circle-bold"}
                width={26}
                color={isEditMode ? "#ed6c02" : "#1976d2"}
              />
              <Box>
                <Typography variant="h5">{sectionTitle}</Typography>
                {user && (
                  <Box display="flex" gap={1} mt={0.5}>
                    <Chip
                      label={isEditMode ? "تعديل عملية" : "عملية جديدة"}
                      color={isEditMode ? "warning" : "primary"}
                      size="small"
                      variant="outlined"
                    />
                    <Chip label={schemaLabel} size="small" />
                  </Box>
                )}
              </Box>
            </Box>

            {isEditMode && canonicalData.id && (
              <Chip
                icon={
                  <SvgColor
                    src="/assets/icons/components/ic_id.svg"
                    width={16}
                    height={16}
                  />
                }
                label={`رقم السجل: ${canonicalData.id}`}
                variant="outlined"
              />
            )}
          </Box>

          {/* Edit record summary */}
          {isEditMode && (
            <Box mb={2} p={1.5} bgcolor="grey.100" borderRadius={1}>
              <Typography variant="body2" color="text.secondary">
                <strong>رقم السجل:</strong> {canonicalData.id} |{" "}
                <strong>الموقع:</strong> {canonicalData.location || "غير محدد"}{" "}
                | <strong>الحالة:</strong>{" "}
                {canonicalData.selectStatusMenu ||
                  canonicalData.selectedOperation ||
                  "—"}
              </Typography>
            </Box>
          )}

          <Divider sx={{ mb: 3 }} />

          {/* Dispatcher — receives pre-resolved entityType + canonicalData */}
          <OperationDispatcher
            key={`${mode}-${entityType}-${canonicalData.id ?? "new"}`}
            entityType={entityType}
            canonicalData={canonicalData}
            selectedOperation={canonicalData.selectedOperation}
            mode={mode}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </CardContent>
      </CardStyled>
    </Container>
  );
};

export default OperationsView;
