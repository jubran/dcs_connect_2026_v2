import { Box, Card, CardContent, Chip, Divider, Stack, Typography, LinearProgress } from "@mui/material";
import SvgColor from "src/components/svg-color";

const tables = [
  { name: "operations",     label: "العمليات التشغيلية", rows: 12480, size: "348 MB", status: "سليمة" },
  { name: "users",          label: "المستخدمون",          rows: 94,    size: "2.1 MB", status: "سليمة" },
  { name: "notifications",  label: "الإشعارات",           rows: 3210,  size: "45 MB",  status: "سليمة" },
  { name: "sequences",      label: "أولويات التشغيل",     rows: 870,   size: "18 MB",  status: "سليمة" },
  { name: "files_meta",     label: "بيانات الملفات",      rows: 2100,  size: "12 MB",  status: "سليمة" },
  { name: "audit_logs",     label: "سجل المراجعة",        rows: 45200, size: "980 MB", status: "تحتاج تنظيف" },
];

const stats = [
  { label: "إجمالي الحجم",   value: "2.4 GB",  icon: "mdi:database",      color: "#1976d2" },
  { label: "عدد الجداول",    value: "24",       icon: "mdi:table",          color: "#388e3c" },
  { label: "نسخة احتياطية",  value: "اليوم",    icon: "mdi:backup-restore", color: "#7b1fa2" },
  { label: "حالة الاتصال",   value: "متصل",     icon: "mdi:check-network",  color: "#f57c00" },
];

export default function DatabaseManagementPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 960, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: "primary.lighter",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SvgColor src="/assets/icons/components/ic_default.svg"
            icon="mdi:database" width={28} sx={{ color: "primary.main" }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800}>إدارة قواعد البيانات</Typography>
          <Typography variant="body2" color="text.secondary">مراقبة وإدارة قواعد بيانات النظام</Typography>
        </Box>
      </Stack>

      {/* Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 2, mb: 3 }}>
        {stats.map((s) => (
          <Card key={s.label} variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: s.color + "18",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SvgColor src="/assets/icons/components/ic_default.svg"
                    icon={s.icon} width={22} sx={{ color: s.color }} />
                </Box>
                <Typography variant="h5" fontWeight={800} color={s.color}>{s.value}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" textAlign="right">{s.label}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Tables */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2.5} textAlign="right">جداول قاعدة البيانات</Typography>
          <Stack spacing={2}>
            {tables.map((t) => (
              <Box key={t.name}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.disabled">{t.size}</Typography>
                    <Typography variant="caption" color="text.secondary">{t.rows.toLocaleString()} صف</Typography>
                    <Chip label={t.status} size="small" fontWeight={600}
                      color={t.status === "سليمة" ? "success" : "warning"} />
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box textAlign="right">
                      <Typography variant="body2" fontWeight={700}>{t.label}</Typography>
                      <Typography variant="caption" color="text.disabled">{t.name}</Typography>
                    </Box>
                    <SvgColor src="/assets/icons/components/ic_default.svg"
                      icon="mdi:table" width={18} sx={{ color: "primary.main" }} />
                  </Stack>
                </Stack>
                <LinearProgress variant="determinate"
                  value={Math.min((t.rows / 50000) * 100, 100)}
                  sx={{ height: 5, borderRadius: 3, bgcolor: "grey.200" }} />
                <Divider sx={{ mt: 1.5 }} />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
