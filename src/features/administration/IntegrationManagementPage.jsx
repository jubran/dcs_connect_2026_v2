import { Box, Card, CardContent, Chip, Divider, Stack, Typography, Switch } from "@mui/material";
import { useState } from "react";
import SvgColor from "src/components/svg-color";

const integrations = [
  { key: "sap",       label: "SAP ERP",          desc: "تكامل نظام SAP للموارد البشرية والمخزون", status: "متصل",    color: "#1976d2", icon: "mdi:cloud-check" },
  { key: "scada",     label: "SCADA",             desc: "نظام الإشراف والتحكم والاستحواذ على البيانات", status: "متصل", color: "#388e3c", icon: "mdi:gauge" },
  { key: "historian", label: "PI Historian",      desc: "قاعدة بيانات السلاسل الزمنية للعمليات",  status: "متصل",    color: "#7b1fa2", icon: "mdi:chart-line" },
  { key: "email",     label: "خادم البريد",        desc: "SMTP لإرسال الإشعارات والتقارير",         status: "غير متصل",color: "#d32f2f", icon: "mdi:email-alert" },
  { key: "ldap",      label: "LDAP / AD",         desc: "خدمة دليل المستخدمين والمجموعات",         status: "متصل",    color: "#f57c00", icon: "mdi:account-lock" },
  { key: "backup",    label: "نسخ احتياطي سحابي", desc: "رفع النسخ الاحتياطية تلقائياً للسحابة",  status: "غير متصل",color: "#d32f2f", icon: "mdi:cloud-upload" },
];

export default function IntegrationManagementPage() {
  const [enabled, setEnabled] = useState(
    Object.fromEntries(integrations.map((i) => [i.key, i.status === "متصل"]))
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: "secondary.lighter",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SvgColor src="/assets/icons/components/ic_default.svg"
            icon="mdi:api" width={28} sx={{ color: "secondary.main" }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800}>إدارة التكاملات</Typography>
          <Typography variant="body2" color="text.secondary">إدارة اتصالات الأنظمة الخارجية والتكاملات</Typography>
        </Box>
      </Stack>

      {/* Summary chips */}
      <Stack direction="row" spacing={1} mb={3} flexWrap="wrap" gap={1}>
        <Chip icon={<SvgColor src="/assets/icons/components/ic_default.svg" icon="mdi:check-circle" width={16} />}
          label={`${integrations.filter(i => i.status === "متصل").length} متصل`} color="success" variant="outlined" />
        <Chip icon={<SvgColor src="/assets/icons/components/ic_default.svg" icon="mdi:alert-circle" width={16} />}
          label={`${integrations.filter(i => i.status !== "متصل").length} غير متصل`} color="error" variant="outlined" />
      </Stack>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={0.5}>
            {integrations.map((intg) => (
              <Box key={intg.key}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" py={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Switch checked={enabled[intg.key]}
                      onChange={(e) => setEnabled((p) => ({ ...p, [intg.key]: e.target.checked }))}
                      color="primary" />
                    <Chip label={enabled[intg.key] ? "متصل" : "غير متصل"} size="small"
                      color={enabled[intg.key] ? "success" : "error"} sx={{ fontWeight: 600 }} />
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box textAlign="right">
                      <Typography variant="body2" fontWeight={700}>{intg.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{intg.desc}</Typography>
                    </Box>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2,
                      bgcolor: intg.color + "18", display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <SvgColor src="/assets/icons/components/ic_default.svg"
                        icon={intg.icon} width={22} sx={{ color: intg.color }} />
                    </Box>
                  </Stack>
                </Stack>
                <Divider />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
