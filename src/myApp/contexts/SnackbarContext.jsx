// src/contexts/SnackbarContext.jsx
import React, { createContext, useState, useContext, useCallback } from "react";

const SnackbarContext = createContext();

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within SnackbarProvider");
  }
  return context;
};

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success", // success, error, warning, info
    duration: 4000,
  });

  const showSnackbar = useCallback(
    (message, type = "success", duration = 4000) => {
      setSnackbar({
        open: true,
        message,
        type,
        duration,
      });
    },
    [],
  );

  const showSuccess = useCallback(
    (message, duration = 4000) => {
      showSnackbar(message, "success", duration);
    },
    [showSnackbar],
  );

  const showError = useCallback(
    (message, duration = 6000) => {
      showSnackbar(message, "error", duration);
    },
    [showSnackbar],
  );

  const showWarning = useCallback(
    (message, duration = 5000) => {
      showSnackbar(message, "warning", duration);
    },
    [showSnackbar],
  );

  const showInfo = useCallback(
    (message, duration = 4000) => {
      showSnackbar(message, "info", duration);
    },
    [showSnackbar],
  );

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <SnackbarContext.Provider
      value={{
        showSnackbar,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        snackbar,
        handleClose,
      }}
    >
      {children}
    </SnackbarContext.Provider>
  );
};
