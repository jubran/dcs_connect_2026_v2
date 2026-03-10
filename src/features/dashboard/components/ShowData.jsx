// ShowData.jsx
import { Stack } from "@mui/system";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function ShowData({ dateValue, setDateValue, setDate }) {
  const handleDateChange = (newValue) => {
    setDateValue(newValue);
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack sx={{ width: "20%", padding: "10px" }}>
        <DatePicker
          label="التاريخ"
          value={dateValue}
          format="YYYY-MM-DD"
          onChange={handleDateChange}
          slotProps={{ textField: { size: "small" } }}
          sx={{
            "& .MuiInputBase-input": { fontSize: "16px", fontWeight: "bold" },
          }}
        />
      </Stack>
    </LocalizationProvider>
  );
}