import React from "react";
import { Container, Typography, Box } from "@mui/material";

import { useSettingsContext } from "src/components/settings";
import { useAuthUser } from "src/auth/context/jwt/utils";
import SequenceManagerContainer from "src/myApp/Dynamic-Sequence/sections/SequenceManager.container";

const SequenceMainViewPage = ({ sequenceType, pageTitle }) => {
  const settings = useSettingsContext();
  const { username } = useAuthUser();

  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"}>
      <Typography
        variant="h5"
        align="left"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        {pageTitle}
      </Typography>

      <Box sx={{ mt: 3, p: 2, borderRadius: 2 }}>
        <SequenceManagerContainer
          apiEndpoint={sequenceType.apiEndpoint}
          apiUpdateEndpoint={sequenceType.apiUpdateEndpoint}
          type={sequenceType.type}
          title={sequenceType.title}
          employeeId={username}
        />
      </Box>
    </Container>
  );
};

export default SequenceMainViewPage;
