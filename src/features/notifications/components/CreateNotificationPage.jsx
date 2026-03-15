import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Alert,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from "@mui/material";

import SvgColor from "src/components/svg-color";
import { useSnackbar } from "src/shared/contexts/SnackbarContext";
import {
  createNotification,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  TARGET_AUDIENCES,
} from "../services/notificationService";

// ─── Validation schema ────────────────────────────────────────────────────────
const schema = Yup.object({
  title: Yup.string()
    .required("عنوان الإشعار مطلوب")
    .min(5, "العنوان يجب أن يكون 5 أحرف على الأقل")
    .max(200, "العنوان طويل جداً"),
  description: Yup.string()
    .required("وصف الإشعار مطلوب")
    .min(10, "الوصف يجب أن يكون 10 أحرف على الأقل"),
  type: Yup.string().required("نوع الإشعار مطلوب"),
  priority: Yup.string().required("أولوية الإشعار مطلوبة"),
  targetAudience: Yup.string().required("الجهة المستهدفة مطلوبة"),
});

// ─── Priority colors ──────────────────────────────────────────────────────────
const PRIORITY_COLORS = {
  low:      { bg: "#e8f5e9", border: "#4caf50", text: "#2e7d32" },
  medium:   { bg: "#fff8e1", border: "#ffc107", text: "#f57f17" },
  high:     { bg: "#fff3e0", border: "#ff9800", text: "#e65100" },
  critical: { bg: "#fce4ec", border: "#f44336", text: "#b71c1c" },
};

// ─── Preview card ─────────────────────────────────────────────────────────────
function NotificationPreview({ values }) {
  const typeObj = NOTIFICATION_TYPES.find((t) => t.value === values.type);
  const prioObj = NOTIFICATION_PRIORITIES.find((p) => p.value === values.priority);
  const colors  = PRIORITY_COLORS[values.priority] || PRIORITY_COLORS.low;

  return (
    <Box
      sx={{
        border: `1.5px solid ${colors.border}`,
        borderRadius: 2,
        p: 2,
        bgcolor: colors.bg,
        transition: "all 0.3s ease",
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={1.5}>
        {/* Icon */}
        <Box
          sx={{
            width: 40, height: 40, borderRadius: "50%",
            bgcolor: "white", display: "flex",
            alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)", flexShrink: 0,
          }}
        >
          <SvgColor
            src="/assets/icons/components/ic_default.svg"
            icon={typeObj?.icon || "mdi:bell"}
            width={22}
          />
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={0.5} flexWrap="wrap">
            <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 700 }}>
              {values.title || "عنوان الإشعار"}
            </Typography>
            {prioObj && (
              <Chip
                label={prioObj.label}
                size="small"
                sx={{
                  bgcolor: colors.border, color: "white",
                  fontWeight: 700, height: 20, fontSize: "0.68rem",
                }}
              />
            )}
          </Stack>
          <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
            {values.description || "وصف الإشعار سيظهر هنا..."}
          </Typography>
          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
            {typeObj && (
              <Chip label={typeObj.label} size="small" variant="outlined"
                sx={{ fontSize: "0.7rem", height: 20 }} />
            )}
            <Typography variant="caption" color="text.disabled">الآن</Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CreateNotificationPage() {
  const { showSuccess, showError } = useSnackbar();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      type: "system",
      priority: "medium",
      targetAudience: "all",
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await createNotification({
        ...data,
        isUnRead: true,
        isNew: true,
        createdAt: new Date().toISOString(),
      });
      showSuccess("تم إنشاء الإشعار بنجاح ✓", 3000);
      setSubmitted(true);
      reset();
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      showError(err?.message || "حدث خطأ أثناء إنشاء الإشعار");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* ── Page header ── */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <Box
          sx={{
            width: 44, height: 44, borderRadius: 2,
            bgcolor: "primary.main", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <SvgColor
            src="/assets/icons/components/ic_default.svg"
            icon="mdi:bell-plus"
            width={24}
            sx={{ color: "white" }}
          />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>إنشاء إشعار جديد</Typography>
          <Typography variant="body2" color="text.secondary">
            أضف إشعاراً جديداً وأرسله للمستخدمين
          </Typography>
        </Box>
      </Stack>

      {submitted && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}
          icon={<SvgColor src="/assets/icons/components/ic_default.svg"
            icon="mdi:check-circle" width={20} />}>
          تم إرسال الإشعار بنجاح! سيظهر للمستخدمين المحددين فوراً.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* ── Form ── */}
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardHeader
              title="بيانات الإشعار"
              titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }}
              avatar={
                <SvgColor src="/assets/icons/files/ic_document.svg"
                  width={20} height={20} />
              }
            />
            <Divider />
            <CardContent>
              <Stack spacing={2.5}>

                {/* Title */}
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="عنوان الإشعار *"
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      placeholder="مثال: تم تشغيل الوحدة GT16 بنجاح"
                      inputProps={{ maxLength: 200 }}
                    />
                  )}
                />

                {/* Description */}
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="وصف الإشعار *"
                      fullWidth
                      multiline
                      minRows={3}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      placeholder="اكتب تفاصيل الإشعار هنا..."
                    />
                  )}
                />

                {/* Type */}
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="نوع الإشعار *"
                      fullWidth
                      error={!!errors.type}
                      helperText={errors.type?.message}
                    >
                      {NOTIFICATION_TYPES.map((t) => (
                        <MenuItem key={t.value} value={t.value}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <SvgColor
                              src="/assets/icons/components/ic_default.svg"
                              icon={t.icon} width={18} height={18}
                            />
                            <span>{t.label}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                {/* Priority */}
                <Box>
                  <Typography variant="body2" fontWeight={600} mb={1}
                    color={errors.priority ? "error" : "text.primary"}>
                    أولوية الإشعار *
                  </Typography>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <ToggleButtonGroup
                        {...field}
                        exclusive
                        onChange={(_, val) => val && field.onChange(val)}
                        size="small"
                        sx={{ flexWrap: "wrap", gap: 1,
                          "& .MuiToggleButton-root": { borderRadius: "8px !important", border: "1.5px solid !important" }
                        }}
                      >
                        {NOTIFICATION_PRIORITIES.map((p) => {
                          const c = PRIORITY_COLORS[p.value];
                          const active = field.value === p.value;
                          return (
                            <ToggleButton
                              key={p.value} value={p.value}
                              sx={{
                                px: 2, py: 0.8,
                                borderColor: `${c.border} !important`,
                                bgcolor: active ? `${c.border} !important` : "transparent",
                                color: active ? "white !important" : c.text,
                                fontWeight: 700,
                                "&:hover": { bgcolor: `${c.bg} !important` },
                              }}
                            >
                              {p.label}
                            </ToggleButton>
                          );
                        })}
                      </ToggleButtonGroup>
                    )}
                  />
                  {errors.priority && (
                    <Typography variant="caption" color="error" mt={0.5} display="block">
                      {errors.priority.message}
                    </Typography>
                  )}
                </Box>

                {/* Target audience */}
                <Controller
                  name="targetAudience"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="الجهة المستهدفة *"
                      fullWidth
                      error={!!errors.targetAudience}
                      helperText={errors.targetAudience?.message}
                    >
                      {TARGET_AUDIENCES.map((a) => (
                        <MenuItem key={a.value} value={a.value}>
                          {a.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                {/* Submit */}
                <Stack direction="row" spacing={2} pt={1}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSubmit(onSubmit)}
                    disabled={submitting}
                    startIcon={
                      submitting
                        ? <CircularProgress size={18} color="inherit" />
                        : <SvgColor src="/assets/icons/components/ic_default.svg"
                            icon="mdi:send" width={18} />
                    }
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    {submitting ? "جاري الإرسال..." : "إرسال الإشعار"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => reset()}
                    disabled={submitting}
                    sx={{ borderRadius: 2, minWidth: 100 }}
                  >
                    مسح
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Preview ── */}
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ borderRadius: 3, position: "sticky", top: 80 }}>
            <CardHeader
              title="معاينة الإشعار"
              titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }}
              avatar={
                <SvgColor src="/assets/icons/components/ic_default.svg"
                  icon="mdi:eye" width={20} />
              }
            />
            <Divider />
            <CardContent>
              <Typography variant="caption" color="text.secondary" mb={2} display="block">
                هكذا سيظهر الإشعار للمستخدمين
              </Typography>
              <NotificationPreview values={watchedValues} />

              {/* Info summary */}
              <Stack spacing={1} mt={3}>
                {[
                  { label: "النوع", value: NOTIFICATION_TYPES.find(t => t.value === watchedValues.type)?.label },
                  { label: "الأولوية", value: NOTIFICATION_PRIORITIES.find(p => p.value === watchedValues.priority)?.label },
                  { label: "المستهدفون", value: TARGET_AUDIENCES.find(a => a.value === watchedValues.targetAudience)?.label },
                ].map((item) => (
                  <Stack key={item.label} direction="row" justifyContent="space-between"
                    sx={{ p: 1, borderRadius: 1, bgcolor: "grey.50" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {item.label}
                    </Typography>
                    <Typography variant="caption" fontWeight={700}>
                      {item.value || "—"}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
