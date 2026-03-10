// PrintFooter.jsx (المصحح)
import React from "react";
import { Typography, Box } from "@mui/material";
import { formatPrintDate } from "./printUtils";

export default function PrintFooter() {
  const printDate = formatPrintDate(); // جلب التاريخ الهجري من printUtils.js

  return (
    <Box
      sx={{
        mt: 2,
        pt: 1,
        borderTop: "1px solid #ddd",
        textAlign: "right",
        "@media print": {
          position: "fixed",
          bottom: 0,
          width: "100%",
        },
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {printDate}
      </Typography>
    </Box>
  );
}
