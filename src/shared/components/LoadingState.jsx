import React from "react";
import { Box, Paper, Typography } from "@mui/material";

import SvgColor from "src/components/svg-color";

const LoadingState = ({ message = "جارٍ تحميل البيانات..." }) => {
  return (
    <Box sx={{ width: "80%", mx: "auto", mt: 4, px: 2 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>
          <SvgColor
            src="/assets/icons/components/ic_default.svg"
            icon="mdi:loading"
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

export default LoadingState;
