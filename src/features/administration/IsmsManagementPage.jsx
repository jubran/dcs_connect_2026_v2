import { Box, Card, CardContent, Chip, Divider, Stack, Typography, Switch, LinearProgress } from "@mui/material";
import { useState } from "react";
import SvgColor from "src/components/svg-color";

const controls = [
  { key: "audit",    label: "سجل المراجعة",       desc: "تسجيل جميع العمليات للمراجعة",           on: true  },
  { key: "encrypt",  label: "تشفير البيانات",      desc: "تشفير البيانات الحساسة في قاعدة البيانات",on: true  },
  { key: "session",  label: "انتهاء الجلسة",       desc: "تسجيل الخروج تلقائياً بعد 30 دقيقة",    on: true  },
  { key: "2fa",      label: "التحقق الثنائي",      desc: "إلزام التحقق بخطوتين لجميع المستخدمين",  on: false },
  { key: "pentest",  label: "فحص الثغرات",         desc: "تفعيل الفحص الدوري للثغرات الأمنية",    on: false },
];

const risks = [
  { label: "سرية المعلومات",  level: 92, color: "#388e3c" },
  { label: "سلامة البيانات",  level: 88, color: "#388e3c" },
  { label: "التوفر",           level: 95, color: "#388e3c" },
  { label: "الامتثال",         level: 74, color: "#f57c00" },
];

export default function IsmsManagementPage() {
  const [enabled, setEnabled] = useState(
    Object.fromEntries(controls.map((c) => [c.key, c.on]))
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: "error.lighter",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SvgColor src="/assets/icons/components/ic_default.svg"
            icon="mdi:shield-lock" width={28} sx={{ color: "error.main" }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800}>إدارة نظام ISMS</Typography>
          <Typography variant="body2" color="text.secondary">نظام إدارة أمن المعلومات — ISO/IEC 27001</Typography>
        </Box>
      </Stack>

      <Stack spacing={3}>
        {/* Risk scores */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Chip label="ISO 27001" color="primary" variant="outlined" size="small" />
              <Typography variant="h6" fontWeight={700}>مؤشرات أمن المعلومات</Typography>
            </Stack>
            <Stack spacing={2}>
              {risks.map((r) => (
                <Box key={r.label}>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" fontWeight={700} color={r.color}>{r.level}%</Typography>
                    <Typography variant="body2" fontWeight={600}>{r.label}</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={r.level}
                    sx={{ height: 8, borderRadius: 4, bgcolor: "grey.200",
                      "& .MuiLinearProgress-bar": { bgcolor: r.color } }} />
                  <Divider sx={{ mt: 1.5 }} />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Security controls */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2} textAlign="right">ضوابط الأمان</Typography>
            <Stack spacing={0.5}>
              {controls.map((c) => (
                <Box key={c.key}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" py={1.2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Switch checked={enabled[c.key]}
                        onChange={(e) => setEnabled((p) => ({ ...p, [c.key]: e.target.checked }))}
                        color="error" />
                      <Chip label={enabled[c.key] ? "مفعّل" : "معطّل"} size="small"
                        color={enabled[c.key] ? "success" : "default"} sx={{ fontWeight: 600 }} />
                    </Stack>
                    <Box textAlign="right">
                      <Typography variant="body2" fontWeight={700}>{c.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{c.desc}</Typography>
                    </Box>
                  </Stack>
                  <Divider />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
