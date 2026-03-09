import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { useSettingsContext } from "src/components/settings";
import EventsSearchPage from "./SearchManager.eventsSearchPage";

// ----------------------------------------------------------------------

export default function SearchOperating() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"}>
      <Typography variant="h4"> Search Operating </Typography>

      <Box
        sx={{
          mt: 5,
          width: 1,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
        }}
      >
        <EventsSearchPage />
      </Box>
    </Container>
  );
}
