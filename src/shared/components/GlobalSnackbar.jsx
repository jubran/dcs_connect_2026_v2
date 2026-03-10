// src/components/shared/GlobalSnackbar.jsx
import React from "react";
import SharedSnackbar from "./SharedSnackbar";
import { useSnackbar } from "src/shared/contexts/SnackbarContext";

const GlobalSnackbar = () => {
  const { snackbar, handleClose } = useSnackbar();

  return (
    <SharedSnackbar
      open={snackbar.open}
      message={snackbar.message}
      type={snackbar.type}
      autoHideDuration={snackbar.duration}
      onClose={handleClose}
    />
  );
};

export default GlobalSnackbar;
