// UnitsForm/UnitsFormSection.jsx
// Moved from: components/UnitsFormSection.jsx
// Rendering section for Units form — handles level-by-level layout
// and conditional fields (Ratching, Trip Reason, FO).

import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  TextField,
  Typography,
} from "@mui/material";
import { RATCHING_MENU, TRIP_REASONS, FO_SUB_REASONS } from "./constants";

const UnitsFormSection = ({
  groupedFields,
  showRatching,
  showshutdownType,
  showfoReason,
  validationErrors,
  formData,
  handleChange,
  renderField,
  selectedOperation,
  isEditMode = false,
  isNoneStatus = false,
}) => (
  <Box
    display="flex"
    flexDirection="column"
    gap={3}
    sx={{
      "& .MuiInputBase-input": { fontSize: 15, fontWeight: 600 },
      "& .MuiInputLabel-root": { fontSize: 15, fontWeight: 600 },
    }}
  >
    {/* Edit mode indicator */}
    {isEditMode && (
      <Box
        p={1.5}
        bgcolor="info.light"
        borderRadius={1}
        display="flex"
        alignItems="center"
      >
        <Typography variant="body2" color="info.contrastText">
          ⚠️ أنت في وضع التعديل. التغييرات سيتم حفظها على السجل الحالي.
        </Typography>
      </Box>
    )}

    {/* Level 1 */}
    {groupedFields.level1.length > 0 && (
      <Box
        mt={2}
        display="flex"
        flexDirection="row"
        alignItems="center"
        gap={2}
        flexWrap="wrap"
        width="70%"
      >
        {groupedFields.level1.map(renderField)}
      </Box>
    )}

    {/* Level 2 */}
    {groupedFields.level2.length > 0 && (
      <Box
        mt={2}
        display="flex"
        flexDirection="row"
        alignItems="center"
        gap={2}
        flexWrap="wrap"
        width="70%"
      >
        {groupedFields.level2.map(renderField)}
      </Box>
    )}

    {/* Level 3 */}
    {groupedFields.level3.length > 0 && (
      <Box
        mt={2}
        display="flex"
        flexDirection="row"
        alignItems="center"
        gap={2}
        flexWrap="wrap"
        width="70%"
      >
        {groupedFields.level3.map(renderField)}
      </Box>
    )}

    {/* Level 4 + Ratching + Trip Reason */}
    {groupedFields.level4.length > 0 && (
      <Box
        mt={2}
        display="flex"
        flexDirection="row"
        alignItems="center"
        gap={2}
        flexWrap="nowrap"
        width="70%"
      >
        {showRatching && (
          <FormControl
            sx={{ width: "200px" }}
            required
            error={!!validationErrors.selectedRatching}
          >
            <InputLabel>Ratching Status</InputLabel>
            <Select
              name="selectedRatching"
              value={formData.selectedRatching || ""}
              onChange={handleChange}
              label="Ratching Status"
            >
              {RATCHING_MENU.map((r) => (
                <MenuItem key={r.value} value={r.label}>
                  {r.label}
                </MenuItem>
              ))}
            </Select>
            {!!validationErrors.selectedRatching && (
              <FormHelperText>
                {validationErrors.selectedRatching}
              </FormHelperText>
            )}
          </FormControl>
        )}

        {groupedFields.level4.map(renderField)}

        {showshutdownType && (
          <FormControl
            sx={{ width: "200px" }}
            required
            error={!!validationErrors.shutdownType}
          >
            <InputLabel>نوع الخروج</InputLabel>
            <Select
              name="shutdownType"
              value={formData.shutdownType || ""}
              onChange={handleChange}
              label="Trip Reason"
            >
              {TRIP_REASONS.map((reason) => (
                <MenuItem key={reason} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </Select>
            {!!validationErrors.shutdownType && (
              <FormHelperText>{validationErrors.shutdownType}</FormHelperText>
            )}
          </FormControl>
        )}
      </Box>
    )}

    {/* Level 5 + FO reason + SAP order */}
    {showfoReason && (
      <Box
        mt={2}
        display="flex"
        flexDirection="row"
        alignItems="center"
        gap={2}
        flexWrap="nowrap"
        width="100%"
      >
        {groupedFields.level5.map(renderField)}

        <FormControl
          sx={{ width: "200px" }}
          required
          error={!!validationErrors.foReason}
        >
          <InputLabel>تصنيف FO</InputLabel>
          <Select
            name="foReason"
            value={formData.foReason || ""}
            onChange={handleChange}
            label="FO Sub-Reason"
          >
            {FO_SUB_REASONS.map((reason) => (
              <MenuItem key={reason} value={reason}>
                {reason}
              </MenuItem>
            ))}
          </Select>
          {!!validationErrors.foReason && (
            <FormHelperText>{validationErrors.foReason}</FormHelperText>
          )}
        </FormControl>

        <TextField
          name="sapOrder"
          label="رقم أمر SAP"
          value={formData.sapOrder || ""}
          onChange={handleChange}
          sx={{ width: "200px" }}
          required
          error={!!validationErrors.sapOrder}
          helperText={validationErrors.sapOrder || ""}
        />
      </Box>
    )}
  </Box>
);

export default UnitsFormSection;
