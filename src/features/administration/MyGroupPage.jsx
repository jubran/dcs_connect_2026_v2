import { Box, Card, CardContent, Chip, Divider, Stack, Typography, Avatar, AvatarGroup } from "@mui/material";
import SvgColor from "src/components/svg-color";

const members = [
  { name: "محمد العمري",  role: "مشغل أول",   status: "نشط",   color: "#1976d2" },
  { name: "خالد الشمري", role: "مشغل ثانٍ",  status: "نشط",   color: "#388e3c" },
  { name: "سالم الغامدي",role: "مشرف تشغيل", status: "إجازة", color: "#f57c00" },
  { name: "عمر الزهراني",role: "مشغل ثالث",  status: "نشط",   color: "#7b1fa2" },
];

export default function MyGroupPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: "info.lighter",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SvgColor src="/assets/icons/components/ic_default.svg"
            icon="mdi:account-group" width={28} sx={{ color: "info.main" }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800}>إدارة مجموعتي</Typography>
          <Typography variant="body2" color="text.secondary">عرض أعضاء المجموعة وصلاحياتهم</Typography>
        </Box>
      </Stack>

      <Stack spacing={3}>
        {/* Group overview */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Chip label={`${members.length} أعضاء`} color="primary" variant="outlined" fontWeight={600} />
              <Typography variant="h6" fontWeight={700}>فريق التشغيل — المجموعة أ</Typography>
            </Stack>
            <AvatarGroup max={6} sx={{ justifyContent: "flex-end", mb: 2 }}>
              {members.map((m) => (
                <Avatar key={m.name} sx={{ bgcolor: m.color, width: 44, height: 44, fontSize: "1rem" }}>
                  {m.name[0]}
                </Avatar>
              ))}
            </AvatarGroup>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              {members.map((m) => (
                <Stack key={m.name} direction="row" alignItems="center"
                  justifyContent="space-between" sx={{ py: 1,
                    borderBottom: "1px solid", borderColor: "divider" }}>
                  <Chip label={m.status}
                    color={m.status === "نشط" ? "success" : "warning"}
                    size="small" sx={{ fontWeight: 600 }} />
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box textAlign="right">
                      <Typography variant="body2" fontWeight={700}>{m.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{m.role}</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: m.color, width: 36, height: 36 }}>{m.name[0]}</Avatar>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
