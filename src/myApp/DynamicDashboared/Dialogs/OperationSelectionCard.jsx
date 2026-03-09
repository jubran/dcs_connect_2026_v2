// OperationSelectionCard.jsx
// Action selection card shown in OperationDialogForm.
// getActionsForLocation is imported from tankUtils — single source of truth.
// Action shape: { name, label, type }
//   name  → selectedOperation sent to router state
//   type  → entityType sent to router state
//   label → display text

import React, { useContext } from "react";
import {
  Box,
  Card,
  Typography,
  FormControlLabel,
  Checkbox,
  useTheme,
  Divider,
  Stack,
} from "@mui/material";
import { AuthContext } from "src/auth/context/jwt";
import SvgColor from "src/components/svg-color";
import { getActionsForLocation } from "src/myApp/DynamicForms/tankUtils";

// ── DataRow helper ─────────────────────────────────────────────────────────────
export const DataRow = ({ label, value }) => (
  <Box display="flex" alignItems="center" width="100%" py={0.15} gap="1px">
    <Typography
      fontSize="14px"
      lineHeight={1.2}
      sx={{
        textTransform: "uppercase",
        color: "text.secondary",
        letterSpacing: "0.04em",
        minWidth: 90,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Typography>
    <Typography
      fontWeight={600}
      fontSize="14px"
      lineHeight={1.2}
      sx={{
        textTransform: "uppercase",
        color: "success.dark",
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </Typography>
  </Box>
);

// ── Icon map per action name ───────────────────────────────────────────────────
const ACTION_ICONS = {
  "In Service": "/assets/icons/dcs/3-dots.svg",
  "Stand By": "/assets/icons/dcs/alert-fill.svg",
  Shutdown: "/assets/icons/dcs/maint.svg",
  FSNL: "/assets/icons/dcs/generator.svg",
  LOAD: "/assets/icons/dcs/fuel-cell.svg",
  start: "/assets/icons/dcs/3-dots.svg",
  ready: "/assets/icons/dcs/alert-fill.svg",
  out: "/assets/icons/dcs/maint.svg",
  noneStatus: "/assets/icons/dcs/none.svg",
  transformer: "/assets/icons/dcs/power.svg",
  tank: "/assets/icons/dcs/fuel-cell.svg",
};

const DEFAULT_ICON = "/assets/icons/components/ic_default.svg";

// ── Color map per action name ──────────────────────────────────────────────────
const getActionColor = (actionName, theme) => {
  const map = {
    "In Service": theme.palette.success.main,
    "Stand By": theme.palette.info.main,
    Shutdown: theme.palette.error.dark,
    FSNL: theme.palette.warning.dark,
    LOAD: theme.palette.warning.dark,
    start: theme.palette.success.main,
    ready: theme.palette.warning.main,
    out: theme.palette.error.dark,
    noneStatus: theme.palette.grey[600],
    transformer: theme.palette.warning.dark,
    tank: theme.palette.primary.main,
  };
  return map[actionName] || theme.palette.primary.main;
};

// ── Status chip color ─────────────────────────────────────────────────────────
const getStatusColor = (status) => {
  const statusMap = {
    "In Service": "success",
    "Stand By": "warning",
    Shutdown: "error",
    SERVICE: "info",
    FEEDING: "warning",
    FILLING: "success",
    RETURN: "secondary",
  };
  return statusMap[status] || "default";
};

// ── Component ─────────────────────────────────────────────────────────────────
const OperationSelectionCard = ({ onActionSelect, data, selectedAction }) => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  // Single source of truth — same list that OperationDialogForm uses
  const actions = getActionsForLocation({ data });

  const handleActionChange = (action) => {
    const newAction = selectedAction?.name === action.name ? null : action;
    onActionSelect(newAction);
  };

  const getButtonStyles = (action) => {
    const isChecked = selectedAction?.name === action.name;
    const bg = getActionColor(action.name, theme);

    return {
      flex: 1,
      m: 0,
      borderRadius: 2,
      px: 2,
      py: 1.5,
      bgcolor: isChecked ? bg : "background.paper",
      border: isChecked
        ? `2px solid ${bg}`
        : `2px solid ${theme.palette.divider}`,
      color: isChecked ? "white" : "text.primary",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      justifyContent: "center",
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
      minHeight: 80,
      boxShadow: isChecked ? `0 4px 20px ${bg}40` : "none",
      "& .MuiCheckbox-root": {
        position: "absolute",
        opacity: 0,
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        margin: 0,
        cursor: "pointer",
      },
      "& .MuiFormControlLabel-label": {
        fontWeight: isChecked ? 700 : 500,
        fontSize: "1rem",
        textAlign: "center",
        width: "100%",
        zIndex: 1,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
      },
      "&:hover": {
        bgcolor: isChecked ? bg : "action.hover",
        transform: "translateY(-2px)",
        boxShadow: isChecked
          ? `0 6px 24px ${bg}60`
          : `0 4px 12px ${theme.palette.action.hover}`,
      },
      "&:active": { transform: "translateY(0)" },
    };
  };

  return (
    <Card
      sx={{
        p: 3.5,
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
        transition: "transform 0.3s ease",
        "&:hover": { transform: "translateY(-1px)" },
      }}
    >
      {/* Header */}
      <Box mb={3}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              variant="overline"
              sx={{
                color: "text.secondary",
                fontWeight: 800,
                mt: 0.5,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <SvgColor
                src="/assets/icons/components/ic_location.svg"
                width={16}
                height={16}
              />
              تنفيذ العملية على
            </Typography>

            <Typography
              variant="h5"
              sx={{
                color: "primary.main",
                fontWeight: 800,
                mt: 0.5,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {data?.location || "غير محدد"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2.5, borderWidth: 2, borderRadius: 2 }} />
      </Box>

      {/* Unit info */}
      <Box mb={4}>
        <Typography
          variant="subtitle1"
          sx={{
            color: "text.secondary",
            mb: 2,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <SvgColor
            src="/assets/icons/components/ic_info.svg"
            width={20}
            height={20}
          />
          معلومات الوحدة
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <DataRow label="الوضع الحالي" value={data?.status1 || "غير معروف"} />
          <DataRow label="المشغل" value={user?.name || "غير معروف"} />
          {data?.additionalInfo && (
            <Box sx={{ gridColumn: "1 / -1" }}>
              <DataRow label="معلومات إضافية" value={data.additionalInfo} />
            </Box>
          )}
        </Box>
      </Box>

      {/* Action selection */}
      <Box>
        <Typography
          variant="subtitle1"
          sx={{
            color: "text.secondary",
            mb: 3,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <SvgColor
            src="/assets/icons/components/ic_play.svg"
            width={20}
            height={20}
          />
          إختر نوع العملية:
        </Typography>

        <Stack
          display="grid"
          direction="row"
          spacing={2}
          sx={{
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: 2,
          }}
        >
          {actions.map((action) => {
            const isChecked = selectedAction?.name === action.name;
            const bg = getActionColor(action.name, theme);
            const icon = ACTION_ICONS[action.name] || DEFAULT_ICON;

            return (
              <FormControlLabel
                key={action.name}
                control={
                  <Checkbox
                    disabled={action.disabled || false}
                    checked={isChecked}
                    onChange={() => handleActionChange(action)}
                    name={action.name}
                    sx={{ display: "none" }}
                  />
                }
                label={
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={1.5}
                  >
                    <SvgColor
                      src={icon}
                      width={28}
                      height={28}
                      sx={{
                        color: isChecked ? "white" : bg,
                        transition: "color 0.1s ease",
                      }}
                    />
                    <Typography
                      variant="caption"
                      className="languages"
                      sx={{ fontWeight: 500, fontSize: "14px" }}
                    >
                      {action.label}
                    </Typography>
                  </Box>
                }
                sx={getButtonStyles(action)}
              />
            );
          })}
        </Stack>

        {actions.length === 0 && (
          <Box mt={2} p={2} bgcolor="info.lighter" borderRadius={2}>
            <Typography variant="body2">
              لا توجد عمليات متاحة لهذه الوحدة في الوقت الحالي
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default OperationSelectionCard;
