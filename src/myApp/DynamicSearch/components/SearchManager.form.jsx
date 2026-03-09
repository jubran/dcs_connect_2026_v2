import React from "react";
import { Stack, Button, TextField } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import SvgColor from "src/components/svg-color";

const SearchForm = ({
  searchCriteria,
  onCriteriaChange,
  onSearch,
  onReset,
  isSearchDisabled,
  onOpenPrint,
  hasData,
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ p: 2, borderBottom: "1px solid #eee" }}
      >
        <DatePicker
          label="من تاريخ"
          value={searchCriteria.startDate}
          onChange={(date) => onCriteriaChange({ startDate: date })}
          format="YYYY-MM-DD"
          slotProps={{ textField: { size: "small", fullWidth: true } }}
        />

        <DatePicker
          label="إلى تاريخ"
          value={searchCriteria.endDate}
          onChange={(date) => onCriteriaChange({ endDate: date })}
          format="YYYY-MM-DD"
          slotProps={{ textField: { size: "small", fullWidth: true } }}
        />

        <TextField
          label="الموقع"
          value={searchCriteria.location}
          onChange={(e) => onCriteriaChange({ location: e.target.value })}
          size="small"
          fullWidth
        />

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={onSearch}
            sx={{ minWidth: 100 }}
            disabled={isSearchDisabled}
          >
            بحث
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onReset}
            sx={{ minWidth: 100 }}
          >
            مسح
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={onOpenPrint}
            disabled={!hasData}
            startIcon={<SvgColor src="/assets/icons/dcs/print.svg" />}
          >
            طباعة
          </Button>
        </Stack>
      </Stack>
    </LocalizationProvider>
  );
};

export default SearchForm;
