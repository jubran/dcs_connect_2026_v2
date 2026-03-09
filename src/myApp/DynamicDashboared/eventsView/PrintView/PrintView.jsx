import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Button,
  Typography,
  Box,
} from "@mui/material";
import SvgColor from "src/components/svg-color";

import PrintTable from "./PrintTable";
import PrintHeader from "./PrintHeader";
import { handlePrint } from "./printUtils"; // تأكد من استيراد handlePrint
import { margin } from "@mui/system";

export default function PrintView({
  open,
  onClose,
  dataIs = [],
  printDate,
  searchCriteria,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          direction: "rtl",
          maxHeight: "50%",
          // تطبيق خط النظام على الـ Dialog بالكامل
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
        },
      }}
    >
      <DialogTitle
        className="no-print"
        sx={{ textAlign: "center", borderBottom: "1px solid #ddd" }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: 2 }}
        >
          <Typography variant="h5" fontWeight="bold">
            تقرير العمليات اليومية
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              color="error"
              startIcon={<SvgColor src="/assets/icons/dcs/print.svg" />}
              onClick={() => handlePrint(dataIs)}
              variant="contained"
            >
              <Typography sx={{ marginInline: "10px" }}> طباعة </Typography>
            </Button>
            <Button size="small" onClick={onClose} variant="outlined">
              {" "}
              <Typography sx={{ marginInline: "10px" }}> إغلاق </Typography>
            </Button>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{ bgcolor: "#fafafa", overflowX: "auto", p: 2 }}
        dividers
      >
        <Box
          id="print-section"
          sx={{
            bgcolor: "#fff",
            borderRadius: 2,
            boxShadow: 1,
            p: 3,
            "@media print": { boxShadow: "none", p: 0, bgcolor: "white" },
          }}
        >
          <PrintHeader criteria={searchCriteria} date={printDate} />{" "}
          <PrintTable data={dataIs} />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
