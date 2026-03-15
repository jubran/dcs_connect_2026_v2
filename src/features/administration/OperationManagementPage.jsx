import { Box, Card, CardContent, Chip, Divider, Stack, Typography, LinearProgress } from "@mui/material";
import SvgColor from "src/components/svg-color";

const stats = [
  { label: "إجمالي الوحدات",    value: "24",  icon: "mdi:factory",        color: "#1976d2" },
  { label: "وحدات نشطة",        value: "18",  icon: "mdi:check-circle",   color: "#388e3c" },
  { label: "وحدات في الصيانة",  value: "4",   icon: "mdi:wrench",         color: "#f57c00" },
  { label: "وحدات متوقفة",      value: "2",   icon: "mdi:alert-circle",   color: "#d32f2f" },
];

const sections = [
  { name: "وحدة التكرير A",    status: "نشط",    load: 87, manager: "م. محمد" },
  { name: "وحدة التكرير B",    status: "صيانة",  load: 0,  manager: "م. خالد" },
  { name: "وحدة المنقيات",     status: "نشط",    load: 72, manager: "م. سالم" },
  { name: "وحدة التخزين",      status: "نشط",    load: 95, manager: "م. عمر" },
  { name: "وحدة الضخ الرئيسي", status: "متوقف",  load: 0,  manager: "م. فارس" },
];

export default function OperationManagementPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 960, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: "warning.lighter",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SvgColor src="/assets/icons/components/ic_default.svg"
            icon="mdi:factory" width={28} sx={{ color: "warning.main" }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800}>إدارة قسم التشغيل</Typography>
          <Typography variant="body2" color="text.secondary">مراقبة وإدارة وحدات العمليات التشغيلية</Typography>
        </Box>
      </Stack>

      {/* Stats row */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 2, mb: 3 }}>
        {stats.map((s) => (
          <Card key={s.label} variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2,
                  bgcolor: s.color + "18", display: "flex",
                  alignItems: "center", justifyContent: "center" }}>
                  <SvgColor src="/assets/icons/components/ic_default.svg"
                    icon={s.icon} width={22} sx={{ color: s.color }} />
                </Box>
                <Typography variant="h4" fontWeight={800} color={s.color}>{s.value}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" textAlign="right">{s.label}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Sections table */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2} textAlign="right">حالة الوحدات</Typography>
          <Stack spacing={2}>
            {sections.map((s) => (
              <Box key={s.name}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.8}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">{s.manager}</Typography>
                    <Chip label={s.status} size="small" fontWeight={600}
                      color={s.status === "نشط" ? "success" : s.status === "صيانة" ? "warning" : "error"} />
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Typography variant="body2" fontWeight={700}>{s.name}</Typography>
                    <SvgColor src="/assets/icons/components/ic_default.svg"
                      icon="mdi:factory" width={18} sx={{ color: "text.secondary" }} />
                  </Stack>
                </Stack>
                <LinearProgress variant="determinate" value={s.load}
                  sx={{ height: 7, borderRadius: 4, bgcolor: "grey.200",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: s.load > 80 ? "#d32f2f" : s.load > 50 ? "#388e3c" : "grey.400"
                    }}} />
                <Typography variant="caption" color="text.secondary">{s.load}% حمل التشغيل</Typography>
                <Divider sx={{ mt: 1.5 }} />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
