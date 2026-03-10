import { memo } from "react";
import { Box, Typography } from "@mui/material";

const SequenceFooter = memo(({ total, footerText }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      mt: 3,
      pt: 2,
      borderTop: "1px solid",
      borderColor: "grey.200",
    }}
  >
    <Typography variant="body2" color="grey.600">
      {footerText}
    </Typography>

    <Typography variant="body2" color="grey.600">
      العدد: <strong>{total}</strong>
    </Typography>
  </Box>
));

export default SequenceFooter;
