import { Button, Stack, TextField } from "@mui/material";
import SvgColor from "src/components/svg-color";

import ShowData from "./ShowData";
import { useState } from "react";
import PrintView from "./PrintView/PrintView";

export default function DataGridToolbar({
  dataIs,
  dateValue,
  setDateValue,
  location,
  setLocation,
}) {
  const [open, setOpen] = useState(false);

  const handleOpenPrint = () => setOpen(true);
  const handleClosePrint = () => setOpen(false);

  const formattedDate = dateValue.format("YYYY-MM-DD");

  return (
    <Stack
      direction="row"
      padding={"10px 20px"}
      alignItems="center"
      justifyContent="space-between"
      flexWrap="wrap"
      gap={2}
    >
      <ShowData dateValue={dateValue} setDateValue={setDateValue} />

      <Button
        size="small"
        color="error"
        startIcon={<SvgColor src="/assets/icons/dcs/print.svg" />}
        onClick={handleOpenPrint}
      >
        طباعة
      </Button>

      <PrintView
        open={open}
        onClose={handleClosePrint}
        dataIs={dataIs}
        printDate={formattedDate}
      />
    </Stack>
  );
}
