import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";

import { useMockedUser } from "src/shared/hooks/use-mocked-user";

import { useAuthUser } from "src/auth/context/jwt/utils";
import { Button } from "@mui/material";
import { useAuthContext } from "src/auth/hooks";
import { useRouter } from "src/routes/hooks";
import Label from "src/components/label";

// ----------------------------------------------------------------------

export default function NavUserShort() {
  const { user } = useMockedUser();
  const { username, fullName, role } = useAuthUser();
  const router = useRouter();

  const { logout } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Stack
      sx={{
        px: 10,
        py: 8,
        pb: 2,
        textAlign: "center",
      }}
    >
      <Stack alignItems="center">
        <Box sx={{ position: "relative" }}>
          <Avatar
            variant="rounded"
            src={user?.photoURL}
            alt={fullName}
            sx={{ width: 48, height: 48 }}
          >
            {fullName?.charAt(0).toUpperCase()}
          </Avatar>
          {/* <SvgColor  src="/assets/icons/components/ic_default.svg"
            style={{ color: "#f50057" }}
            sx={{
              top: -6,
              px: 0.8,
              left: 40,
              height: 25,
              position: "absolute",
              borderBottomLeftRadius: 2,
            }}
            icon="mynaui:danger-waves"
            width={50}
          />
          <Label
            color="error"
            variant="filled"
            sx={{
              top: -6,
              px: 0.5,
              left: 40,
              height: 20,
              position: 'absolute',
              borderBottomLeftRadius: 2,
            }}
          >
            <SvgColor  src="/assets/icons/setting/ic_setting.svg" width={10} />
          </Label> */}
        </Box>

        <Stack spacing={0.5} sx={{ mb: 2, mt: 1.5, width: 1 }}>
          <Typography variant="subtitle2">{fullName}</Typography>

          <Typography variant="body2" noWrap sx={{ color: "text.disabled" }}>
            {username}
          </Typography>
        </Stack>
        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
          target="_blank"
          rel="noopener"
          sx={{
            color: "white",
            width: "100px",
            fontFamily: "GE-SS-Two-Light",
            fontWeight: "bold",
          }}
        >
          خروج
        </Button>
      </Stack>
    </Stack>
  );
}
