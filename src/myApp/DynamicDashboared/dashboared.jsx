import Container from "@mui/material/Container";
import { useSettingsContext } from "src/components/settings";
import CustomBreadcrumbs from "src/components/custom-breadcrumbs";

import DashboaredViewPage from "./DashboaredViewPage";

export default function Dashboard() {
  const settings = useSettingsContext();

  return (
    <>
      <Container
        maxWidth={settings.themeStretch ? false : "xl"}
        sx={{
          direction: "ltr",
          marginTop: "50px",
          flexGrow: 1,
          gap: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {" "}
        <CustomBreadcrumbs
          heading="الرئيسية"
          links={[{ name: "" }]}
          sx={{
            mb: {
              // xs: 3,
              // md: 5,
            },
          }}
        />
        <DashboaredViewPage />
      </Container>
    </>
  );
}
