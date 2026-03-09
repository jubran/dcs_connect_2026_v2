import { useRef } from "react";
import PropTypes from "prop-types";
import {
  closeSnackbar,
  SnackbarProvider as NotistackProvider,
} from "notistack";

import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";

import SvgColor from "src/components/svg-color";

import { useSettingsContext } from "../settings";
import { StyledIcon, StyledNotistack } from "./styles";

// ----------------------------------------------------------------------

export default function SnackbarProvider({ children }) {
  const settings = useSettingsContext();

  const isRTL = settings.themeDirection === "rtl";

  const notistackRef = useRef(null);

  return (
    <NotistackProvider
      ref={notistackRef}
      maxSnack={5}
      preventDuplicate
      autoHideDuration={3000}
      TransitionComponent={isRTL ? Collapse : undefined}
      variant="success" // Set default variant
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      iconVariant={{
        info: (
          <StyledIcon color="info">
            <SvgColor src="/assets/icons/components/ic_alert.svg" width={24} />
          </StyledIcon>
        ),
        success: (
          <StyledIcon color="success">
            <SvgColor src="/assets/icons/components/ic_check.svg" width={24} />
          </StyledIcon>
        ),
        warning: (
          <StyledIcon color="warning">
            <SvgColor
              src="/assets/icons/components/ic_warning.svg"
              width={24}
            />
          </StyledIcon>
        ),
        error: (
          <StyledIcon color="error">
            <SvgColor src="/assets/icons/components/ic_alert.svg" width={24} />
          </StyledIcon>
        ),
      }}
      Components={{
        default: StyledNotistack,
        info: StyledNotistack,
        success: StyledNotistack,
        warning: StyledNotistack,
        error: StyledNotistack,
      }}
      // with close as default
      action={(snackbarId) => (
        <IconButton
          size="small"
          onClick={() => closeSnackbar(snackbarId)}
          sx={{ p: 0.5 }}
        >
          <SvgColor width={16} src="/assets/icons/components/ic_close.svg" />
        </IconButton>
      )}
    >
      {children}
    </NotistackProvider>
  );
}

SnackbarProvider.propTypes = {
  children: PropTypes.node,
};
