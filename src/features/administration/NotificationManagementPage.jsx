import { Box, Card, CardContent, Chip, Divider, Stack, Typography, Switch } from "@mui/material";
import { useState } from "react";
import SvgColor from "src/components/svg-color";

const channels = [
  { key: "push",    label: "إشعارات البوابة",   desc: "إشعارات فورية داخل النظام",           on: true  },
  { key: "email",   label: "البريد الإلكتروني",  desc: "إرسال الإشعارات عبر البريد",          on: false },
  { key: "sms",     label: "رسائل SMS",          desc: "إشعارات نصية على الجوال",             on: false },
  { key: "webhook", label: "Webhook",            desc: "إرسال بيانات الأحداث لأنظمة خارجية", on: false },
];

const types = [
  { label: "إشعارات عمليات التشغيل",  count: 124, icon: "mdi:factory",      color: "#1976d2" },
  { label: "إشعارات الصيانة",          count: 38,  icon: "mdi:wrench",       color: "#f57c00" },
  { label: "إشعارات الأمان",           count: 7,   icon: "mdi:shield-alert", color: "#d32f2f" },
  { label: "إشعارات النظام",           count: 55,  icon: "mdi:bell",         color: "#7b1fa2" },
];

export default function NotificationManagementPage() {
  const [enabled, setEnabled] = useState(
    Object.fromEntries(channels.map((c) => [c.key, c.on]))
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: "error.lighter",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SvgColor src="/assets/icons/components/ic_default.svg"
            icon="mdi:bell-cog" width={28} sx={{ color: "error.main" }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800}>إدارة الإشعارات</Typography>
          <Typography variant="body2" color="text.secondary">ضبط قنوات الإشعارات وأنواعها وإعداداتها</Typography>
        </Box>
      </Stack>

      <Stack spacing={3}>
        {/* Stats */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 2 }}>
          {types.map((t) => (
            <Card key={t.label} variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: t.color + "18",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <SvgColor src="/assets/icons/components/ic_default.svg"
                      icon={t.icon} width={20} sx={{ color: t.color }} />
                  </Box>
                  <Typography variant="h5" fontWeight={800} color={t.color}>{t.count}</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" textAlign="right" display="block">{t.label}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Channels */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2} textAlign="right">قنوات الإشعارات</Typography>
            <Stack spacing={0.5}>
              {channels.map((c) => (
                <Box key={c.key}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" py={1.2}>
                    <Switch checked={enabled[c.key]}
                      onChange={(e) => setEnabled((p) => ({ ...p, [c.key]: e.target.checked }))}
                      color="primary" />
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
