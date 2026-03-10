import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Button,
  Grid,
  Typography,
  Box,
  Fade,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SvgColor from "src/components/svg-color";

import OperationSelectionCard from "./OperationSelectionCard";
import { useSnackbar } from "src/shared/contexts/SnackbarContext";

export default function OperationDialogForm({
  data,
  open,
  onClose,
  maxWidth = "sm",
  fullWidth = true,
}) {
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showInfo, showError } = useSnackbar();
  const { handleClose } = useSnackbar();

  const handleActionSelect = useCallback((action) => {
    setSelectedOperation(action);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setSelectedOperation(null);
    onClose?.();
  }, [onClose]);

  const handleContinue = useCallback(async () => {
    if (!selectedOperation || loading) return;

    setLoading(true);
    handleCloseDialog();
    showInfo("جاري الانتقال إلى صفحة العمليات...", 4000);

    try {
      await new Promise((r) => setTimeout(r, 400));

      // FIX:
      // selectedOperation.name = "In Service" / "Stand By" / "Shutdown" / "tank" / "bsde"
      //   → passed as selectedOperation → normalizeOperation() uses this to build fields
      // selectedOperation.type = "units" / "tank" / "bsde" / "transformer" / "noneStatus"
      //   → passed as entityType → resolveEntityType() uses this to pick the right form
      navigate("/dashboard/operations", {
        state: {
          mode: "new",
          selectedOperation: selectedOperation.name, // "In Service", "Stand By", etc.
          entityType: selectedOperation.type, // "units", "tank", "bsde", etc.
          location: data?.location,
          data: {
            location: data?.location,
            selectedOperation: selectedOperation.name, // action for normalizeOperation
            entityType: selectedOperation.type, // entity for resolveEntityType
            selectStatusMenu: data?.status1,
            status: data?.status1,
            unitData: data,
          },
        },
      });

      handleClose();
    } catch (err) {
      console.error("خطأ في التنقل:", err);
      showError("حدث خطأ أثناء الانتقال", 6000);
    } finally {
      setLoading(false);
    }
  }, [selectedOperation, loading, data, navigate, handleCloseDialog]);

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      fullWidth={fullWidth}
      maxWidth={"sm"}
      TransitionComponent={Fade}
      transitionDuration={250}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 12px 45px rgba(0,0,0,0.18)",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          marginBottom: "10px",
          textAlign: "center",
          bgcolor: "primary.main",
          color: "white",
          py: 2.5,
        }}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap={1.5}
        >
          <SvgColor src="/assets/icons/components/ic_check.svg" width={28} />
          <Typography variant="h5" fontWeight={600}>
            إختيار نوع العملية
          </Typography>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 3.5 }}>
        <Alert
          variant="filled"
          severity={selectedOperation ? "success" : "warning"}
          icon={
            <SvgColor
              src="/assets/icons/components/ic_default.svg"
              icon={
                selectedOperation
                  ? "mdi:check-circle-outline"
                  : "mdi:alert-circle-outline"
              }
            />
          }
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {selectedOperation ? (
            <Typography fontWeight={500}>
              العملية المختارة : {selectedOperation.label}
            </Typography>
          ) : (
            <Typography fontWeight={600}>يرجى اختيار نوع العملية</Typography>
          )}
        </Alert>

        <Grid container>
          <Grid item xs={12}>
            <OperationSelectionCard
              data={data}
              selectedAction={selectedOperation}
              onActionSelect={handleActionSelect}
            />
          </Grid>
        </Grid>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{ p: 3, gap: 2, borderTop: "1px solid", borderColor: "divider" }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleCloseDialog}
          startIcon={
            <SvgColor
              src="/assets/icons/components/ic_default.svg"
              icon="mdi:close-circle"
            />
          }
          sx={{ borderRadius: 2, minWidth: 120 }}
        >
          إلغاء
        </Button>

        <LoadingButton
          variant="contained"
          loading={loading}
          disabled={!selectedOperation}
          onClick={handleContinue}
          startIcon={
            !loading && (
              <SvgColor src="/assets/icons/components/ic_arrow_left.svg" />
            )
          }
          sx={{
            borderRadius: 2,
            minWidth: 160,
            fontWeight: 600,
          }}
        >
          الإستمرار
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
