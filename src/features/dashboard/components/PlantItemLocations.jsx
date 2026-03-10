import SvgColor from "src/components/svg-color";

import { Box, Avatar, Typography, Stack, Tooltip } from "@mui/material";
import {
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { secondaryFont } from "src/theme/typography";
import OperationDialogForm from "./OperationDialogForm";
import "./plant.css";
import { width } from "@mui/system";

// Configurable status colors
export const STATUS_CONFIG = {
  "In Service": {
    gradient:
      "linear-gradient(135deg, #10b981 0%, #059669 25%, #047857 75%, #065f46 100%)",
    icon: "/assets/icons/dcs/3-dots.svg",
  },
  "Stand By": {
    gradient:
      "linear-gradient(135deg, #f59e0b 0%, #d97706 25%, #b45309 75%, #92400e 100%)",
    icon: "/assets/icons/dcs/sharp-error.svg",
  },
  Shutdown: {
    gradient:
      "linear-gradient(135deg, #ef4444 0%, #dc2626 25%, #b91c1c 75%, #991b1b 100%)",
    icon: "/assets/icons/dcs/maint.svg",
  },
  fsnl: {
    gradient:
     "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 25%, #1e40af 75%, #1e3a8a 100%)",
    // icon: "/assets/icons/dcs/arrow-down.svg"
  },
  load: {
    gradient:
      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 25%, #1e40af 75%, #1e3a8a 100%)",
    // icon: "/assets/icons/dcs/networking.svg"
  },
  ready: {
    gradient:
     "linear-gradient(135deg, #6b7280 0%, #4b5563 25%, #374151 75%, #1f2937 100%)",
    // icon: "/assets/icons/dcs/3-dots.svg"
  },
  SETTLING: {
    gradient:
      "linear-gradient(135deg, #6b7280 0%, #4b5563 25%, #374151 75%, #1f2937 100%)",
    icon: "/assets/icons/dcs/code-working.svg",
  },
  SERVICE: {
    gradient:
      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 25%, #1e40af 75%, #1e3a8a 100%)",
    icon: "/assets/icons/dcs/networking.svg",
  },
  FEEDING: {
    gradient:
      "linear-gradient(135deg, #f59e0b 0%, #d97706 25%, #b45309 75%, #92400e 100%)",
    icon: "/assets/icons/dcs/arrow-down.svg",
  },
  FILLING: {
    gradient:
      "linear-gradient(135deg, #10b981 0%, #059669 25%, #047857 75%, #065f46 100%)",
    icon: "/assets/icons/dcs/mdi-water-pump.svg",
  },
  RETURN: {
    gradient:
      "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 25%, #6d28d9 75%, #5b21b6 100%)",
    icon: "/assets/icons/dcs/return.svg",
  },
  "No Data": {
    gradient:
      "linear-gradient(135deg, #6b7280 0%, #4b5563 25%, #374151 75%, #1f2937 100%)",
    icon: "/assets/icons/dcs/sharp-error.svg",
  },
};

// Configurable unit matching rules
export const UNIT_MATCHING_RULES = {
  FUS: {
    pattern: /^FUS#/i,
    dataKey: "fus",
    matcher: (trimmedItem, dataArray) =>
      dataArray.find((u) =>
        u.location?.toUpperCase().endsWith(trimmedItem.toUpperCase()),
      ),
  },
  SP: {
    pattern: /^SP#/i,
    dataKey: "ft6",
    matcher: (trimmedItem, dataArray) => {
      const regex = new RegExp(`\\b${trimmedItem}\\b`, "i");
      return dataArray.find((u) => regex.test(u.location));
    },
  },
  TANK: {
    pattern: /^TANK#/i,
    dataKey: null,
    matcher: (trimmedItem, allData) => {
      return (
        allData.dieselTank?.find((u) =>
          u.location?.toUpperCase().endsWith(trimmedItem.toUpperCase()),
        ) ||
        allData.crudeTank?.find((u) =>
          u.location?.toUpperCase().endsWith(trimmedItem.toUpperCase()),
        )
      );
    },
  },
  DEFAULT: {
    dataKey: "units",
    matcher: (trimmedItem, allData, cotpSearchArray) => {
      return (
        allData.units?.find(
          (u) => u.location?.trim().toUpperCase() === trimmedItem.toUpperCase(),
        ) ||
        cotpSearchArray?.find(
          (u) => u.location?.trim().toUpperCase() === trimmedItem.toUpperCase(),
        )
      );
    },
  },
};

// Avatar configuration
export const AVATAR_CONFIG = {
  default: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    p: 1.6,
    width: "auto",
    height: 56,
    color: "white",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    borderRadius: 1.5,
    cursor: "pointer",
    transition: "box-shadow 0.3s ease, transform 0.3s ease, opacity 0.3s ease",
    position: "relative",
    overflow: "hidden",
    "&:hover": {
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
      transform: "scale(1.25)",
      zIndex: 10,
    },
  },
  typography: {
    fontSize: 14,
    fontWeight: 700,
    noWrap: true,
    letterSpacing: "0.8px",
    textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
    lineHeight: 1,
    userSelect: "none",
    position: "relative",
    zIndex: 11,
    transition: "letter-spacing 0.3s ease",
  },
};

// Dynamic unit finder
export const findMatchedUnit = (trimmedItem, allLocationData) => {
  if (!trimmedItem) return null;

  const lowerTrimmedItem = trimmedItem.toLowerCase();
  let cotpSearchArray = allLocationData.cotp;

  // Check for skid-specific COTP
  if (lowerTrimmedItem.includes("skid#1")) {
    cotpSearchArray = allLocationData.cotp_skid1 || [];
  } else if (lowerTrimmedItem.includes("skid#2")) {
    cotpSearchArray = allLocationData.cotp_skid2 || [];
  }

  // Apply matching rules
  for (const [key, rule] of Object.entries(UNIT_MATCHING_RULES)) {
    if (rule.pattern && rule.pattern.test(trimmedItem)) {
      if (rule.dataKey) {
        const dataArray = allLocationData[rule.dataKey] || [];
        return rule.matcher(trimmedItem, dataArray);
      }
      return rule.matcher(trimmedItem, allLocationData, cotpSearchArray);
    }
  }

  // Default matching
  return UNIT_MATCHING_RULES.DEFAULT.matcher(
    trimmedItem,
    allLocationData,
    cotpSearchArray,
  );
};

// Custom hook for matched unit
export const useMatchedUnit = (item, allLocationData) => {
  return useMemo(() => {
    const trimmedItem = item ? item.trim() : "";
    return findMatchedUnit(trimmedItem, allLocationData);
  }, [item, allLocationData]);
};

// Custom hook for status tooltip
export const useStatusTooltip = (matchedUnit) => {
  const status = matchedUnit?.status1 || "No Data";
  const config = STATUS_CONFIG[status] || STATUS_CONFIG["No Data"];

  const tooltipBgColor =
    config.gradient.split(",")[3]?.replace(" 100%)", "").trim() || "#424242";

  return {
    title: (
      <div style={{ padding: "4px 8px", textAlign: "center" }}>
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{ color: "#ffffff" }}
        >
          {status}
        </Typography>
      </div>
    ),
    sx: {
      [`& .MuiTooltip-tooltip`]: {
        backgroundColor: tooltipBgColor,
        borderRadius: 1,
        boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        padding: "0px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      },
      [`& .MuiTooltip-arrow`]: {
        color: tooltipBgColor,
      },
    },
  };
};

// Dynamic Avatar Component
export const DynamicAvatar = forwardRef(
  (
    {
      item,
      matchedUnit,
      onClick,
      sx = {},
      typographySx = {},
      iconSize = 16,
      children,
      ...props
    },
    ref,
  ) => {
    const status = matchedUnit?.status1 || "No Data";

    // تحويل status إلى مصفوفة إذا كان نصاً
    const statusArray = Array.isArray(status) ? status : [status];

    // الحصول على تكوينات جميع الحالات
    const statusConfigs = statusArray.map(
      (s) => STATUS_CONFIG[s] || STATUS_CONFIG["No Data"],
    );

    useImperativeHandle(ref, () => ({
      getStatus: () => status,
      getUnitData: () => matchedUnit,
    }));

    const handleClick = useCallback(
      (e) => {
        e.stopPropagation();
        if (onClick) {
          onClick(e);
        }
      },
      [onClick],
    );

    return (
      <Avatar
        variant="rounded"
        onClick={handleClick}
        className="cardAll"
        sx={{
          ...AVATAR_CONFIG.default,
          background:
            statusConfigs[0]?.gradient || STATUS_CONFIG["No Data"].gradient,
          opacity: matchedUnit ? 1 : 0.7,

          ...sx,
        }}
        {...props}
      >
        {children || (
          <>
            <Typography
              fontFamily={secondaryFont}
              sx={{
                ...AVATAR_CONFIG.typography,
                ...typographySx,
              }}
            >
              {item}
            </Typography>

            {/* عرض جميع الأيقونات */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 8,
                display: "flex",
                gap: 0.5,
                opacity: 0.8,
                padding: "1px",
                width: "22px",
              }}
            >
              {statusConfigs.map((config, index) => (
                <SvgColor
                  src={config.icon}
                  key={index}
                  style={{
                    fontSize: Math.max(
                      iconSize - (statusConfigs.length > 1 ? 2 : 0),
                      12,
                    ),
                    // opacity: 0.8,
                  }}
                />
              ))}
            </Box>
          </>
        )}
      </Avatar>
    );
  },
);

// Main ItemLocations component with dynamic features
export const ItemLocations = forwardRef(
  (
    {
      item,
      allLocationData,
      sx,
      avatarProps = {},
      dialogProps = {},
      onAvatarClick,
      onDialogOpen,
      onDialogClose,
      ...other
    },
    ref,
  ) => {
    const matchedUnit = useMatchedUnit(item, allLocationData);
    const [openDialog, setOpenDialog] = useState(false);
    const tooltipProps = useStatusTooltip(matchedUnit);

    const handleOpenDialog = useCallback(
      (e) => {
        e?.stopPropagation();
        setOpenDialog(true);
        if (onAvatarClick) {
          onAvatarClick(item, matchedUnit);
        }
        if (onDialogOpen) {
          onDialogOpen(item, matchedUnit);
        }
      },
      [item, matchedUnit, onAvatarClick, onDialogOpen],
    );

    const handleCloseDialog = useCallback(() => {
      setOpenDialog(false);
      if (onDialogClose) {
        onDialogClose(item, matchedUnit);
      }
    }, [item, matchedUnit, onDialogClose]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      openDialog: handleOpenDialog,
      closeDialog: handleCloseDialog,
      getUnitData: () => matchedUnit,
      getStatus: () => matchedUnit?.status1 || "No Data",
    }));

    const dialogData = matchedUnit || {
      id: item,
      location: item || "No Data",
      status1: "No Data",
      ...(dialogProps.defaultData || {}),
    };

    return (
      <Box
        sx={{
          gap: 2,
          display: "flex",
          alignItems: "center",
          padding: "4px",
          ...sx,
        }}
        {...other}
      >
        <Tooltip {...tooltipProps} arrow>
          <span>
            <DynamicAvatar
              ref={ref}
              item={item}
              matchedUnit={matchedUnit}
              onClick={handleOpenDialog}
              {...avatarProps}
            />
          </span>
        </Tooltip>

        {dialogProps.renderDialog !== false && (
          <OperationDialogForm
            data={dialogData}
            open={openDialog}
            onClose={handleCloseDialog}
            {...dialogProps}
          />
        )}
      </Box>
    );
  },
);

// HOC for enhanced ItemLocations with custom configurations
export const createCustomItemLocations = (config = {}) => {
  return forwardRef((props, ref) => {
    const mergedConfig = {
      STATUS_CONFIG: { ...STATUS_CONFIG, ...config.STATUS_CONFIG },
      UNIT_MATCHING_RULES: {
        ...UNIT_MATCHING_RULES,
        ...config.UNIT_MATCHING_RULES,
      },
      AVATAR_CONFIG: { ...AVATAR_CONFIG, ...config.AVATAR_CONFIG },
      ...config,
    };

    return <ItemLocations ref={ref} {...props} config={mergedConfig} />;
  });
};
