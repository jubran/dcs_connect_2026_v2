import Container from "@mui/material/Container";
import { useSettingsContext } from "src/components/settings";
import CustomBreadcrumbs from "src/components/custom-breadcrumbs";
import PlantStatusPage from "./components/PlantStatusPage";
import EventsView from "./components/EventsView";

// ----------------------------------------------------------------------

export default function DashboardPage() {
  const settings = useSettingsContext();

  return (
    <Container
      maxWidth={settings.themeStretch ? false : "xl"}
      sx={{
        marginTop: "50px",
        flexGrow: 1,
        gap: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CustomBreadcrumbs
        heading="الرئيسية"
        links={[{ name: "" }]}
      />
      <PlantStatusPage />
      <EventsView />
    </Container>
  );
}
