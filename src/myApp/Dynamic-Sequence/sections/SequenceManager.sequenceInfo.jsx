import { memo } from "react";
import { Alert, Stack, Typography } from "@mui/material";

const SequenceInfo = memo(() => (
  <Alert severity="info" sx={{ mb: 3 }}>
    <Stack spacing={0}>
      <Typography variant="body"> اسحب وأفلت العناصر لإعادة ترتيبها</Typography>
      <Typography variant="body">
        {" "}
        انقر على العنصر المراد تحريكه للإمساك به{" "}
      </Typography>
      <Typography variant="body"> حرر الزر لتحديد الموقع الجديد</Typography>
    </Stack>
  </Alert>
));

export default SequenceInfo;
