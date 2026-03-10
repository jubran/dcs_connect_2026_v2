import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Stack,
  Divider,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SvgColor from "src/components/svg-color";

export default function EmptyDialogForm({ data, open, onClose }) {
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          textAlign: "center",
          bgcolor: "grey.100",
          color: "text.primary",
          py: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={1.5}
        >
          <SvgColor
            src="/assets/icons/components/ic_info.svg"
            width={24}
            height={24}
            sx={{ color: "primary.main" }}
          />
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            معلومات الوحدة
          </Typography>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 3 }}>
        <Alert
          variant="outlined"
          severity="info"
          sx={{
            mb: 3,
            borderRadius: 2,
            borderWidth: 2,
            bgcolor: "info.lighter",
          }}
          icon={<SvgColor src="/assets/icons/components/ic_info.svg" />}
        >
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            محتوى النافذة قيد التطوير
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
            سيتم إضافة المحتوى قريباً
          </Typography>
        </Alert>

        {/* Unit Information Card */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderWidth: 2,
            borderColor: "divider",
            mb: 3,
          }}
        >
          <CardContent>
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  الوحدة
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: "primary.main", fontWeight: 700 }}
                >
                  {data?.location || "غير محدد"}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  المعرف
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {data?.id || "غير متوفر"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  الحالة
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    color:
                      data?.status1 === "In Service"
                        ? "success.main"
                        : "text.primary",
                  }}
                >
                  {data?.status1 || "غير معروفة"}
                </Typography>
              </Box>

              {/* Placeholder for future content */}
              <Alert
                severity="warning"
                variant="outlined"
                sx={{
                  borderRadius: 1,
                  borderStyle: "dashed",
                }}
              >
                <Typography variant="body2">
                  محتوى إضافي سيظهر هنا عند اكتمال التطوير
                </Typography>
              </Alert>
            </Stack>
          </CardContent>
        </Card>

        {/* Development Note */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderColor: "warning.light",
            bgcolor: "warning.lighter",
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="flex-start" gap={1.5}>
              <SvgColor
                src="/assets/icons/components/ic_tools.svg"
                sx={{ color: "warning.main", mt: 0.5 }}
              />
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "warning.dark" }}
                >
                  قيد التطوير
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "warning.dark", opacity: 0.8 }}
                >
                  هذه الواجهة حالياً قيد التطوير وسيتم إضافة المزيد من الميزات
                  قريباً
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          p: 2.5,
          gap: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          color="inherit"
          sx={{
            minWidth: 100,
            borderRadius: 2,
          }}
        >
          إغلاق
        </Button>

        <LoadingButton
          variant="contained"
          color="primary"
          disabled
          sx={{
            minWidth: 120,
            borderRadius: 2,
          }}
        >
          قريباً
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
