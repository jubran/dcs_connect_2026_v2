import {
  Box,
  Card,
  CardHeader,
  Typography,
  Stack,
  Divider,
  Fade,
} from "@mui/material";
import { useTabs } from "src/shared/utils/useTabs";
import { ItemLocations, DynamicAvatar } from "./PlantItemLocations";
import { _locations } from "src/_mock";
import { Tabs } from "./PlantTabsComponent";
import { useMemo, useState } from "react";
import OperationDialogForm from "./OperationDialogForm";

// Configurations for different tab views
const TAB_CONFIG = {
  fts_c: {
    avatarProps: {
      sx: {
        height: 52,
        borderRadius: 2,
        minWidth: 80,
      },
    },
    dialogProps: {
      maxWidth: "sm",
      fullWidth: true,
    },
  },
  crudeTank: {
    avatarProps: {
      typographySx: {
        fontSize: 13,
        fontWeight: 800,
      },
      sx: {
        height: 50,
        width: 100,
      },
    },
    renderAsList: true,
  },
  dieselTank: {
    avatarProps: {
      typographySx: {
        fontSize: 12.5,
        letterSpacing: "0.6px",
      },
      sx: {
        height: 48,
        borderRadius: 1.2,
      },
    },
    renderAsList: true,
  },
  units: {
    avatarProps: {
      sx: {
        height: 56,
        minWidth: 90,
      },
    },
  },
  fus: {
    avatarProps: {
      sx: {
        height: 54,
        // background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
      },
    },
  },
  ft6: {
    avatarProps: {
      sx: {
        height: 54,
        // background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
      },
    },
  },
};

const prepareLocationData = (tanks, cotp) => {
  const tanksArray = Array.isArray(tanks) ? tanks : [];
  const cotpArray = Array.isArray(cotp) ? cotp : [];

  const normalizedTanks = tanksArray.map((t) => ({
    ...t,
    location: t.location ? t.location.trim() : "",
  }));

  // تقسيم خزانات الديزل
  const dieselTreatedTank = normalizedTanks.filter((t) =>
    ["TANK#9", "TANK#11"].includes(t.location),
  );
  const dieselUntreatedTank = normalizedTanks.filter((t) =>
    ["TANK#6", "TANK#7", "TANK#8"].includes(t.location),
  );

  // تقسيم خزانات النفط الخام
  const crudeTreatedTank = normalizedTanks.filter((t) =>
    ["TANK#14", "TANK#15", "TANK#16", "TANK#17", "TANK#18"].includes(
      t.location,
    ),
  );
  const crudeUntreatedTank = normalizedTanks.filter((t) =>
    ["TANK#10", "TANK#12", "TANK#13"].includes(t.location),
  );

  // كل الخزانات معاً
  const dieselTank = [...dieselTreatedTank, ...dieselUntreatedTank];
  const crudeTank = [...crudeTreatedTank, ...crudeUntreatedTank];

  const skid1_cotp = cotpArray.filter(
    (u) => u.location && u.location.trim().toLowerCase().includes("skid#1"),
  );
  const skid2_cotp = cotpArray.filter(
    (u) => u.location && u.location.trim().toLowerCase().includes("skid#2"),
  );

  return {
    dieselTank,
    crudeTank,
    dieselTreatedTank,
    dieselUntreatedTank,
    crudeTreatedTank,
    crudeUntreatedTank,
    skid1_cotp,
    skid2_cotp,
  };
};

// دالة للحصول على لون الحالة
const getStatusColor = (status) => {
  if (!status) return "#757575";

  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "shutdown":
      return "#c62828";
    case "stand by":
      return "#1565c0";
    case "in service":
      return "#2e7d32";
    case "service":
      return "#1976d2";
    case "filling":
      return "#2e7d32";
    case "feeding":
      return "#ed6c02";
    case "return":
      return "#9c27b0";
    case "mint":
      return "#0097a7";
    case "settling":
      return "#757575";
    default:
      return "#757575";
  }
};

// دالة للحصول على لون الخلفية بناءً على نوع الخزان
const getTankTypeColor = (tankType) => {
  switch (tankType) {
    case "dieselTreatedTank":
      return "#1e7422";
    case "dieselUntreatedTank":
      return "#afa04c";
    case "crudeTreatedTank":
      return "coral";
    case "crudeUntreatedTank":
      return "#664830";
    default:
      return "linear-gradient(135deg, #78909C 0%, #546E7A 100%)";
  }
};

const TankView = ({
  treatedTanks,
  untreatedTanks,
  title,
  tankType,
  getTankTypeColor,
  onUnitClick,
}) => {
  // تحريك useState هنا داخل المكون المنفصل
  const [selectedTank, setSelectedTank] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleTankClick = (tank) => {
    setSelectedTank(tank);
    setDialogOpen(true);
    if (onUnitClick) {
      onUnitClick(tank.location, tank);
    }
  };

  const handleStatusClick = (status, tank) => {
    console.log(`Status clicked: ${status} for tank: ${tank.location}`);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTank(null);
  };

  return (
    <>
      <Fade in={true} timeout={600}>
        <Stack spacing={3} sx={{ p: 2, minWidth: 360 }}>
          {/* Treated Tanks */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              <Box
                component="span"
                fontWeight="bold"
                color={getTankTypeColor(`${tankType}TreatedTank`)}
              >
                {title} المعالجة
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mr: 1,
                  display: "block",
                  fontWeight: 600,
                  fontSize: "16px",
                }}
              >
                ({treatedTanks.length})
              </Typography>
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                pt: 1,
                borderLeft: "4px solid",
                borderColor: getTankTypeColor(`${tankType}TreatedTank`),
                pl: 1,
              }}
            >
              {treatedTanks.length > 0 ? (
                treatedTanks.map((tank, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1.5,
                      borderBottom: 1,
                      borderColor: "divider",
                      "&:last-child": {
                        borderBottom: 0,
                      },
                    }}
                  >
                    <TankAvatar
                      tank={tank}
                      tankType={`${tankType}TreatedTank`}
                      onClick={() => handleTankClick(tank)}
                    />
                    <StatusChips
                      statusArray={tank.status1}
                      onChipClick={(status) => handleStatusClick(status, tank)}
                      tank={tank}
                    />
                  </Box>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ py: 2 }}
                >
                  لا توجد خزانات معالجة
                </Typography>
              )}
            </Box>
          </Box>

          <Divider />

          {/* Untreated Tanks */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              <Box
                component="span"
                fontWeight="bold"
                color={getTankTypeColor(`${tankType}UntreatedTank`)}
              >
                {title} الغير معالجة
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mr: 1,
                  display: "block",
                  fontWeight: 600,
                  fontSize: "16px",
                }}
              >
                ({untreatedTanks.length})
              </Typography>
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                pt: 1,
                borderLeft: "4px solid",
                borderColor: getTankTypeColor(`${tankType}UntreatedTank`),
                pl: 1,
              }}
            >
              {untreatedTanks.length > 0 ? (
                untreatedTanks.map((tank, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1.5,
                      borderBottom: 1,
                      borderColor: "divider",
                      "&:last-child": {
                        borderBottom: 0,
                      },
                    }}
                  >
                    <TankAvatar
                      tank={tank}
                      tankType={`${tankType}UntreatedTank`}
                      onClick={() => handleTankClick(tank)}
                    />
                    <StatusChips
                      statusArray={tank.status1}
                      onChipClick={(status) => handleStatusClick(status, tank)}
                      tank={tank}
                    />
                  </Box>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ py: 2 }}
                >
                  لا توجد خزانات غير معالجة
                </Typography>
              )}
            </Box>
          </Box>
        </Stack>
      </Fade>

      {/* Dialog for tank details */}
      {selectedTank && (
        <OperationDialogForm
          data={selectedTank}
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        />
      )}
    </>
  );
};

// إنشاء مكون StatusChips منفصل
const StatusChips = ({ statusArray, onChipClick, tank }) => {
  // تحريك useState هنا داخل المكون المنفصل
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const handleChipClick = (status) => {
    setSelectedStatus(status);
    setDialogOpen(true);
    if (onChipClick) {
      onChipClick(status, tank);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedStatus(null);
  };

  if (!statusArray || !Array.isArray(statusArray) || statusArray.length === 0) {
    return (
      <>
        <DynamicAvatar
          item="SETTLING"
          matchedUnit={{ status1: "SETTLING" }}
          onClick={() => handleChipClick("SETTLING")}
          sx={{
            fontFamily: "system-ui !important",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 1.6,
            width: "auto",
            bgcolor: "#757575",
            color: "white",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            borderRadius: 1.5,
            fontWeight: "bold",
            fontSize: "0.9rem",
          }}
        />
      </>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        {statusArray.map((status, index) => (
          <DynamicAvatar
            key={index}
            item={status}
            matchedUnit={{ status1: status }}
            onClick={() => handleChipClick(status)}
            sx={{
              fontFamily: "system-ui !important",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 1.6,
              width: "auto",
              bgcolor: getStatusColor(status),
              color: "white",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              borderRadius: 1.5,
              cursor: "pointer",
              transition: "box-shadow 0.3s ease, transform 0.3s ease",
              fontWeight: "bold",
              fontSize: "0.85rem",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.25)",
                transform: "scale(1.05)",
              },
            }}
          />
        ))}
      </Box>
    </>
  );
};

// مكون TankAvatar منفصل
const TankAvatar = ({ tank, tankType, onClick }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(tank);
    }
  };

  return (
    <DynamicAvatar
      item={tank.location}
      matchedUnit={tank}
      onClick={handleClick}
      sx={{
        fontFamily: "system-ui !important",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 1.6,
        width: "auto",
        background: getTankTypeColor(tankType),
        color: "white",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        borderRadius: 1.5,
        cursor: "pointer",
        transition:
          "box-shadow 0.3s ease, transform 0.3s ease, opacity 0.3s ease",
        position: "relative",
        overflow: "hidden",
        fontWeight: "bold",
        fontSize: "1rem",
        "&:hover": {
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
          transform: "scale(1.05)",
          zIndex: 10,
        },
      }}
    />
  );
};

export function TabsCard({
  title,
  subheader,
  units = [],
  cotp = [],
  fus = [],
  ft6 = [],
  tanks = [],
  sx,
  onUnitClick,
  customConfig = {},
  onDialogOpen,
  onDialogClose,
  ...other
}) {
  const tabs = useTabs("units");
  const currentTabValue = tabs.value;

  // Merge custom config with default config
  const tabConfig = { ...TAB_CONFIG, ...customConfig };
  const currentTabConfig = tabConfig[currentTabValue] || {};

  const {
    dieselTank,
    crudeTank,
    dieselTreatedTank,
    dieselUntreatedTank,
    crudeTreatedTank,
    crudeUntreatedTank,
    skid1_cotp,
    skid2_cotp,
  } = useMemo(() => {
    return prepareLocationData(tanks, cotp);
  }, [tanks, cotp]);

  const allLocationData = useMemo(
    () => ({
      units,
      fus,
      ft6,
      dieselTank,
      crudeTank,
      dieselTreatedTank,
      dieselUntreatedTank,
      crudeTreatedTank,
      crudeUntreatedTank,
      cotp_skid1: skid1_cotp,
      cotp_skid2: skid2_cotp,
      cotp,
    }),
    [
      units,
      fus,
      ft6,
      dieselTank,
      crudeTank,
      dieselTreatedTank,
      dieselUntreatedTank,
      crudeTreatedTank,
      crudeUntreatedTank,
      skid1_cotp,
      skid2_cotp,
      cotp,
    ],
  );

  const filteredData = _locations.name[currentTabValue] || [];
  const isCotpTab = currentTabValue === "fts_c";
  const isCrudeTankTab = currentTabValue === "crudeTank";
  const isDieselTankTab = currentTabValue === "dieselTank";

  // Dynamic render function for ItemLocations
  const renderItemLocations = (data, configOverrides = {}) => {
    const mergedConfig = { ...currentTabConfig, ...configOverrides };

    return data.map((item, index) => {
      const handleAvatarClick = (clickedItem, unitData) => {
        console.log("Avatar clicked:", clickedItem, unitData);
        if (onUnitClick) {
          onUnitClick(clickedItem, unitData);
        }
      };

      const handleDialogOpen = (dialogItem, dialogData) => {
        console.log("Dialog opened for:", dialogItem);
        if (onDialogOpen) {
          onDialogOpen(dialogItem, dialogData);
        }
      };

      const handleDialogClose = (closedItem, closedData) => {
        console.log("Dialog closed for:", closedItem);
        if (onDialogClose) {
          onDialogClose(closedItem, closedData);
        }
      };

      return (
        <ItemLocations
          key={index}
          item={item}
          allLocationData={allLocationData}
          avatarProps={{
            ...mergedConfig.avatarProps,
          }}
          dialogProps={{
            maxWidth: "md",
            fullWidth: true,
            ...mergedConfig.dialogProps,
          }}
          onAvatarClick={handleAvatarClick}
          onDialogOpen={handleDialogOpen}
          onDialogClose={handleDialogClose}
          sx={mergedConfig.sx}
        />
      );
    });
  };

  const commonContentSx = {
    transition: "all 0.3s ease",
    p: 2,
    gap: 1,
    minWidth: 360,
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  };

  const renderMainContent = () => (
    <Fade in={!isCotpTab && !isCrudeTankTab && !isDieselTankTab} timeout={600}>
      <Box sx={commonContentSx}>
        {filteredData.length > 0 ? (
          renderItemLocations(filteredData)
        ) : (
          <Typography variant="body2" color="text.secondary">
            لا توجد بيانات في هذا القسم
          </Typography>
        )}
      </Box>
    </Fade>
  );

  const renderCotpSkidView = () => {
    const handleSkidAvatarClick = (item, unitData) => {
      console.log("Skid avatar clicked:", item);
      if (onUnitClick) {
        onUnitClick(item, unitData);
      }
    };

    return (
      <Fade in={isCotpTab} timeout={600}>
        <Stack spacing={3} sx={{ p: 2, minWidth: 360 }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              <Box component="span" fontWeight="bold" color="primary.main">
                SKID #1
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mr: 1,
                  display: "block",
                  fontWeight: 600,
                  fontSize: "12px",
                }}
              >
                ({skid1_cotp.length} منقيات)
              </Typography>
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                pt: 1,
                borderLeft: "4px solid",
                borderColor: "divider",
                pl: 1,
              }}
            >
              {skid1_cotp.map((unit, index) => (
                <ItemLocations
                  key={index}
                  item={unit.location}
                  allLocationData={allLocationData}
                  avatarProps={{
                    sx: {
                      height: 50,
                      borderRadius: 1.8,
                      minWidth: 75,
                    },
                  }}
                  dialogProps={{
                    maxWidth: "sm",
                    fullWidth: true,
                  }}
                  onAvatarClick={handleSkidAvatarClick}
                />
              ))}
            </Box>
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              <Box component="span" fontWeight="bold" color="primary.main">
                SKID #2
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mr: 1,
                  display: "block",
                  fontWeight: 600,
                  fontSize: "12px",
                }}
              >
                ({skid2_cotp.length} منقيات)
              </Typography>
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                pt: 1,
                borderLeft: "4px solid",
                borderColor: "divider",
                pl: 1,
              }}
            >
              {skid2_cotp.map((unit, index) => (
                <ItemLocations
                  key={index}
                  item={unit.location}
                  allLocationData={allLocationData}
                  avatarProps={{
                    sx: {
                      height: 50,
                      borderRadius: 1.8,
                      minWidth: 75,
                      // background: "linear-gradient(135deg, #7e22ce 0%, #6b21a8 100%)"
                    },
                  }}
                  dialogProps={{
                    maxWidth: "sm",
                    fullWidth: true,
                  }}
                  onAvatarClick={handleSkidAvatarClick}
                />
              ))}
            </Box>
          </Box>
        </Stack>
      </Fade>
    );
  };

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />
      <Tabs value={tabs.value} onChange={tabs.onChange} />

      <Box sx={{ position: "relative", minHeight: "100%" }}>
        {currentTabValue === "fts_c" && renderCotpSkidView()}
        {currentTabValue === "crudeTank" && (
          <TankView
            treatedTanks={crudeTreatedTank}
            untreatedTanks={crudeUntreatedTank}
            title="خزانات الوقود الخام"
            tankType="crude"
            getTankTypeColor={getTankTypeColor}
            onUnitClick={onUnitClick}
          />
        )}
        {currentTabValue === "dieselTank" && (
          <TankView
            treatedTanks={dieselTreatedTank}
            untreatedTanks={dieselUntreatedTank}
            title="خزانات الديزل"
            tankType="diesel"
            getTankTypeColor={getTankTypeColor}
            onUnitClick={onUnitClick}
          />
        )}
        {currentTabValue !== "fts_c" &&
          currentTabValue !== "crudeTank" &&
          currentTabValue !== "dieselTank" &&
          renderMainContent()}
      </Box>
    </Card>
  );
}
