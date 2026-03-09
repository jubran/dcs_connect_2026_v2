import React, { useEffect } from "react";
import Container from "@mui/material/Container";
import { useSettingsContext } from "src/components/settings";
import EventsViewPage from "./eventsView/index";
import PlantStatusPage from "./plantStatusView/PlantStatusPage";
import { useSnackbar } from "src/myApp/contexts/SnackbarContext";

export default function DashboaredViewPage() {
  const settings = useSettingsContext();
  const { showInfo } = useSnackbar();

  // useEffect(() => {
  //     const timer = setTimeout(() => {
  //       showInfo('مرحباً بك في لوحة التحكم', 3000);
  //     }, 1000);

  //     return () => clearTimeout(timer);
  //   }, [showInfo]);

  return (
    <>
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
        <PlantStatusPage />
        <EventsViewPage />
      </Container>
    </>
  );
}
