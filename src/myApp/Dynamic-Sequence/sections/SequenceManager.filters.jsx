import React from "react";
import {
  Paper,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Chip,
} from "@mui/material";

import SvgColor from "src/components/svg-color";

const SequenceFilters = ({
  filterType,
  onFilterChange,
  filteredCount,
  tasks,
}) => {
  const getLabelUnit = (tasksCount, filteredCount) => {
    if (tasksCount > 10) {
      return filteredCount >= 11 ? "وحدة" : "وحدات";
    }

    return filteredCount >= 2 ? "منقيات" : "منقيات";
  };
  return (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: "grey.50" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" color="primary">
          <SvgColor
            src="/assets/icons/components/ic_default.svg"
            icon="mdi:filter"
            width={24}
            height={24}
            style={{ marginRight: 8, verticalAlign: "middle" }}
          />
          تصفية التغييرات :
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ToggleButtonGroup
            value={filterType}
            exclusive
            onChange={onFilterChange}
            aria-label="فلتر التغييرات"
            size="small"
          >
            <Tooltip
              title={`${filteredCount < 9 ? "عرض جميع المنقيات" : "عرض جميع الوحدات"}`}
            >
              <ToggleButton value="all" aria-label="الكل">
                <SvgColor
                  src="/assets/icons/components/ic_default.svg"
                  icon="mdi:view-grid"
                  width={18}
                  height={18}
                  style={{ marginRight: 4 }}
                />
                الكل
              </ToggleButton>
            </Tooltip>

            <Tooltip
              title={`${filteredCount < 9 ? "عرض المنقيات المتغيرة فقط" : "عرض الوحدات المتغيرة فقط"}`}
            >
              <ToggleButton value="changed" aria-label="المتغيرة">
                <SvgColor
                  src="/assets/icons/components/ic_default.svg"
                  icon="mdi:pencil"
                  width={18}
                  height={18}
                  style={{ marginRight: 4 }}
                />
                المتغيرة
              </ToggleButton>
            </Tooltip>

            <Tooltip
              title={` ${filteredCount < 9 ? "عرض المنقيات الغير متغيرة" : "عرض الوحدات الغير متغيرة"}`}
            >
              <ToggleButton value="unchanged" aria-label="غير المتغيرة">
                <SvgColor
                  src="/assets/icons/components/ic_check.svg"
                  width={18}
                  height={18}
                  style={{ marginRight: 4 }}
                />
                غير المتغيرة
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>

          <Chip
            label={`${filteredCount} ${getLabelUnit(tasks, filteredCount)}`}
            color="info"
            variant="outlined"
            size="small"
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default SequenceFilters;
