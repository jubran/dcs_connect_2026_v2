import { Box, Card, CardContent, Chip, Divider, Stack, Typography, Switch } from "@mui/material";
import { useState } from "react";
import SvgColor from "src/components/svg-color";

const settings = [
  { key: "maintenance",  label: "وضع الصيانة",      desc: "تعطيل الموقع مؤقتاً للصيانة",           defaultOn: false },
  { key: "registration", label: "تسجيل المستخدمين", desc: "السماح بتسجيل مستخدمين جدد",             defaultOn: true  },
  { key: "cache",        label: "التخزين المؤقت",   desc: "تفعيل التخزين المؤقت لتحسين الأداء",     defaultOn: true  },
  { key: "analytics",   label: "تحليلات الموقع",    desc: "تتبع إحصائيات الزوار والاستخدام",         defaultOn: false },
  { key: "https",        label: "إجبار HTTPS",       desc: "إعادة التوجيه التلقائي إلى الاتصال الآمن",defaultOn: true  },
];

const info = [
  { label: "رابط الموقع",    value: "https://dcs.aramco.com", icon: "mdi:web" },
  { label: "إصدار النظام",   value: "v2.4.1",                 icon: "mdi:tag" },
  { label: "آخر تحديث",      value: "15 مارس 2026",          icon: "mdi:calendar" },
  { label: "حجم قاعدة البيانات", value: "2.4 GB",            icon: "mdi:database" },
];

export default function SiteManagementPage() {
  const [switches, setSwitches] = useState(
    Object.fromEntries(settings.map((s) => [s.key, s.defaultOn]))
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: "success.lighter",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SvgColor src="/assets/icons/components/ic_default.svg"
            icon="mdi:web" width={28} sx={{ color: "success.main" }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800}>إدارة البوابة الإلكترونية</Typography>
          <Typography variant="body2" color="text.secondary">إعدادات وتكوين البوابة الإلكترونية</Typography>
        </Box>
      </Stack>

      <Stack spacing={3}>
        {/* Site info */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2} textAlign="right">معلومات البوابة</Typography>
            <Stack spacing={1}>
              {info.map((row) => (
                <Stack key={row.label} direction="row" alignItems="center"
                  justifyContent="space-between" sx={{ py: 0.8, borderBottom: "1px solid", borderColor: "divider" }}>
                  <Typography variant="body2" color="text.secondary">{row.value}</Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" fontWeight={600}>{row.label}</Typography>
                    <SvgColor src="/assets/icons/components/ic_default.svg"
                      icon={row.icon} width={18} sx={{ color: "primary.main" }} />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Settings toggles */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2} textAlign="right">إعدادات التشغيل</Typography>
            <Stack spacing={0.5}>
              {settings.map((s) => (
                <Box key={s.key}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" py={1.2}>
                    <Switch checked={switches[s.key]}
                      onChange={(e) => setSwitches((p) => ({ ...p, [s.key]: e.target.checked }))}
                      color="primary" />
                    <Box textAlign="right">
                      <Typography variant="body2" fontWeight={700}>{s.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{s.desc}</Typography>
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
