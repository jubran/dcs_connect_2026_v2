import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { useSettingsContext } from "src/components/settings";

// ----------------------------------------------------------------------

export default function DataSheet() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"}>
      <Typography variant="h4">Datasheet </Typography>
    </Container>
  );
}
