import React from "react";
import { Box, Paper, Typography } from "@mui/material";

const ErrorState = ({ message }) => {
  return (
    <Box sx={{ width: "80%", mx: "auto", mt: 4, px: 2 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography color="error" align="center">
          <SvgColor
            src="/assets/icons/components/ic_alert.svg"
            width={24}
            height={24}
            style={{ marginRight: 8 }}
          />
          {message}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ErrorState;
