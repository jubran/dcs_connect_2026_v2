import { useState, useMemo } from "react";
import {
  Avatar, Box, Button, Card, CardContent, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  FormControl, Grid, IconButton, InputAdornment, InputLabel,
  Menu, MenuItem, Paper, Select, Stack, Switch, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField,
  Typography, FormControlLabel,
} from "@mui/material";
import SvgColor from "src/components/svg-color";

// ─── Constants ────────────────────────────────────────────────────────────────
const GROUPS = ["المجموعة 1", "المجموعة 2", "المجموعة 3", "المجموعة 4", "خدمات التشغيل", "الإدارة"];

const LEVELS = [
  { value: "user",                         label: "مستخدم",                      color: "default"  },
  { value: "admin",                        label: "مدير النظام",                  color: "error"    },
  { value: "developer",                    label: "مطوّر",                        color: "secondary"},
  { value: "shift_supervisor",             label: "مشرف وردية",                   color: "warning"  },
  { value: "shift_assistant_supervisor",   label: "مساعد مشرف وردية",             color: "info"     },
  { value: "manager",                      label: "مدير",                        color: "primary"  },
];

const levelLabel = (v) => LEVELS.find((l) => l.value === v)?.label || v;
const levelColor = (v) => LEVELS.find((l) => l.value === v)?.color || "default";

const STATUS_COLORS = { نشط: "success", إجازة: "warning", معلق: "error" };

// ─── Seed users ───────────────────────────────────────────────────────────────
let NEXT_ID = 10;
const SEED_USERS = [
  { id: 1,  name: "محمد العمري",   username: "m.omari",   email: "m.omari@dcs.com",   level: "shift_supervisor",           group: "المجموعة 1", status: "نشط",   verified: true,  company: "DCS",   phone: "0501234567" },
  { id: 2,  name: "خالد الشمري",  username: "k.shamri",  email: "k.shamri@dcs.com",  level: "shift_assistant_supervisor", group: "المجموعة 2", status: "نشط",   verified: true,  company: "DCS",   phone: "0502345678" },
  { id: 3,  name: "سالم الغامدي", username: "s.ghamdi",  email: "s.ghamdi@dcs.com",  level: "user",                       group: "المجموعة 3", status: "إجازة", verified: false, company: "DCS",   phone: "0503456789" },
  { id: 4,  name: "عمر الزهراني", username: "o.zahrani", email: "o.zahrani@dcs.com", level: "manager",                    group: "الإدارة",   status: "نشط",   verified: true,  company: "DCS",   phone: "0504567890" },
  { id: 5,  name: "فارس الدوسري", username: "f.dosari",  email: "f.dosari@dcs.com",  level: "user",                       group: "المجموعة 4", status: "نشط",   verified: true,  company: "DCS",   phone: "0505678901" },
  { id: 6,  name: "ناصر البقمي",  username: "n.baqmi",   email: "n.baqmi@dcs.com",   level: "shift_supervisor",           group: "المجموعة 1", status: "معلق",  verified: false, company: "DCS",   phone: "0506789012" },
  { id: 7,  name: "علي المطيري",  username: "a.mutairi", email: "a.mutairi@dcs.com", level: "user",                       group: "خدمات التشغيل", status: "نشط", verified: true, company: "DCS",   phone: "0507890123" },
  { id: 8,  name: "يوسف القحطاني",username: "y.qhtani",  email: "y.qhtani@dcs.com",  level: "developer",                  group: "الإدارة",   status: "نشط",   verified: true,  company: "DCS",   phone: "0508901234" },
  { id: 9,  name: "طارق العتيبي", username: "t.utaibi",  email: "t.utaibi@dcs.com",  level: "admin",                      group: "الإدارة",   status: "نشط",   verified: true,  company: "DCS",   phone: "0509012345" },
];

// ─── Inline SVGs ──────────────────────────────────────────────────────────────
const MoreVertIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

// ─── Row action menu ──────────────────────────────────────────────────────────
function RowMenu({ user, onEdit, onDelete, onTransfer }) {
  const [anchor, setAnchor] = useState(null);
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        PaperProps={{ sx: { minWidth: 180, borderRadius: 2 } }}>
        <MenuItem onClick={() => { onEdit(user); setAnchor(null); }} sx={{ gap: 1.5, fontSize: 14 }}>
          <SvgColor src="/assets/icons/components/ic_edit.svg" width={18} />
          تعديل المستخدم
        </MenuItem>
        <MenuItem onClick={() => { onTransfer(user); setAnchor(null); }} sx={{ gap: 1.5, fontSize: 14 }}>
          <SvgColor src="/assets/icons/components/ic_default.svg" icon="mdi:account-switch" width={18} />
          نقل إلى مجموعة
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { onDelete(user); setAnchor(null); }}
          sx={{ gap: 1.5, fontSize: 14, color: "error.main" }}>
          <SvgColor src="/assets/icons/components/ic_delete.svg" width={18} />
          حذف المستخدم
        </MenuItem>
      </Menu>
    </>
  );
}

// ─── Create / Edit user dialog ────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "", username: "", email: "", phone: "",
  country: "", city: "", state: "", zip: "", address: "",
  role: "", company: "", level: "user", group: "المجموعة 1",
  verified: true, photo: null,
};

function UserFormDialog({ open, editUser, onClose, onSave }) {
  const isEdit = Boolean(editUser);
  const [form, setForm] = useState(EMPTY_FORM);

  // Sync form when editUser changes
  useState(() => {
    if (editUser) {
      setForm({ ...EMPTY_FORM, ...editUser });
    } else {
      setForm(EMPTY_FORM);
    }
  });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center",
        justifyContent: "space-between", pb: 1 }}>
        <IconButton onClick={onClose} size="small">
          <SvgColor src="/assets/icons/components/ic_close.svg" width={20} />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>
          {isEdit ? "تعديل المستخدم" : "إنشاء مستخدم جديد"}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 3 }}>
        <Grid container spacing={2} mt={0.5}>

          {/* Left form fields */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="البريد الإلكتروني" placeholder="Email address"
                  value={form.email} onChange={set("email")}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="الاسم الكامل" placeholder="Full name"
                  value={form.name} onChange={set("name")}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                  <InputLabel>الدولة</InputLabel>
                  <Select value={form.country} onChange={set("country")} label="الدولة">
                    <MenuItem value="SA">المملكة العربية السعودية</MenuItem>
                    <MenuItem value="AE">الإمارات العربية المتحدة</MenuItem>
                    <MenuItem value="KW">الكويت</MenuItem>
                    <MenuItem value="BH">البحرين</MenuItem>
                    <MenuItem value="QA">قطر</MenuItem>
                    <MenuItem value="OM">عُمان</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="رقم الهاتف" placeholder="Phone number"
                  value={form.phone} onChange={set("phone")}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="المدينة" placeholder="City"
                  value={form.city} onChange={set("city")}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="المنطقة / الولاية" placeholder="State/region"
                  value={form.state} onChange={set("state")}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="الرمز البريدي" placeholder="Zip/code"
                  value={form.zip} onChange={set("zip")}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="العنوان" placeholder="Address"
                  value={form.address} onChange={set("address")}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                  <InputLabel>المستوى الوظيفي</InputLabel>
                  <Select value={form.level} onChange={set("level")} label="المستوى الوظيفي">
                    {LEVELS.map((l) => (
                      <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="الشركة" placeholder="Company"
                  value={form.company} onChange={set("company")}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                  <InputLabel>المجموعة</InputLabel>
                  <Select value={form.group} onChange={set("group")} label="المجموعة">
                    {GROUPS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="اسم المستخدم" placeholder="Username"
                  value={form.username} onChange={set("username")}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
              </Grid>
            </Grid>
          </Grid>

          {/* Right panel: photo + verification */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
              <CardContent sx={{ p: 3, display: "flex", flexDirection: "column",
                alignItems: "center", gap: 2 }}>

                {/* Photo upload */}
                <Box sx={{
                  width: 100, height: 100, borderRadius: "50%",
                  bgcolor: "grey.100", border: "2px dashed", borderColor: "divider",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  cursor: "pointer", "&:hover": { bgcolor: "grey.200" },
                }}>
                  {form.photo ? (
                    <Avatar src={form.photo} sx={{ width: "100%", height: "100%" }} />
                  ) : (
                    <>
                      <SvgColor src="/assets/icons/components/ic_default.svg"
                        icon="mdi:camera" width={28} sx={{ color: "text.disabled" }} />
                      <Typography variant="caption" color="text.disabled" mt={0.5}>
                        رفع صورة
                      </Typography>
                    </>
                  )}
                </Box>
                <Typography variant="caption" color="text.disabled" textAlign="center">
                  الصيغ المسموحة: *.jpeg, *.jpg, *.png, *.gif
                  <br />الحجم الأقصى: 3 ميجابايت
                </Typography>

                <Divider sx={{ width: "100%" }} />

                {/* Email verified toggle */}
                <Box sx={{ width: "100%" }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
                    <Switch
                      checked={form.verified}
                      onChange={(e) => setForm((p) => ({ ...p, verified: e.target.checked }))}
                      color="success"
                    />
                    <Typography variant="subtitle2" fontWeight={700}>
                      البريد موثّق
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" textAlign="right" display="block">
                    إيقاف هذا الخيار سيرسل بريد تحقق للمستخدم تلقائياً
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>إلغاء</Button>
        <Button variant="contained" onClick={() => onSave(form)}
          sx={{ bgcolor: "#111", color: "white", borderRadius: 2,
            fontWeight: 700, "&:hover": { bgcolor: "#333" } }}>
          {isEdit ? "حفظ التعديلات" : "إنشاء المستخدم"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Transfer group dialog ────────────────────────────────────────────────────
function TransferDialog({ open, user, onClose, onTransfer }) {
  const [target, setTarget] = useState("");
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center",
        justifyContent: "space-between", pb: 1 }}>
        <IconButton onClick={onClose} size="small">
          <SvgColor src="/assets/icons/components/ic_close.svg" width={20} />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>نقل إلى مجموعة</Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 3 }}>
        {user && (
          <Stack direction="row" alignItems="center" spacing={2} mb={2.5}
            sx={{ p: 1.5, bgcolor: "grey.50", borderRadius: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main" }}>{user.name[0]}</Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>{user.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                المجموعة الحالية: <strong>{user.group}</strong>
              </Typography>
            </Box>
          </Stack>
        )}
        <FormControl fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
          <InputLabel>المجموعة الجديدة</InputLabel>
          <Select value={target} onChange={(e) => setTarget(e.target.value)} label="المجموعة الجديدة">
            {GROUPS.filter((g) => g !== user?.group).map((g) => (
              <MenuItem key={g} value={g}>{g}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>إلغاء</Button>
        <Button variant="contained" disabled={!target} onClick={() => onTransfer(target)}
          sx={{ borderRadius: 2, fontWeight: 700 }}>
          نقل
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────
function DeleteDialog({ open, user, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ bgcolor: "error.main", color: "white", py: 2, fontWeight: 700 }}>
        تأكيد حذف المستخدم
      </DialogTitle>
      <DialogContent dividers sx={{ py: 2 }}>
        <Typography>
          هل تريد حذف <strong>{user?.name}</strong> بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>إلغاء</Button>
        <Button color="error" variant="contained" onClick={onConfirm} sx={{ borderRadius: 2 }}>
          حذف
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UsersManagementPage() {
  const [users, setUsers]           = useState(SEED_USERS);
  const [search, setSearch]         = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  // dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser]     = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [transferUser, setTransferUser] = useState(null);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = users;
    if (groupFilter !== "all") list = list.filter((u) => u.group === groupFilter);
    if (levelFilter !== "all") list = list.filter((u) => u.level === levelFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, search, groupFilter, levelFilter]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSave = (form) => {
    if (editUser) {
      setUsers((p) => p.map((u) => u.id === editUser.id ? { ...u, ...form } : u));
    } else {
      setUsers((p) => [...p, { ...form, id: NEXT_ID++, status: "نشط" }]);
    }
    setEditUser(null);
    setCreateOpen(false);
  };

  const handleDelete = () => {
    setUsers((p) => p.filter((u) => u.id !== deleteUser.id));
    setDeleteUser(null);
  };

  const handleTransfer = (targetGroup) => {
    setUsers((p) => p.map((u) => u.id === transferUser.id ? { ...u, group: targetGroup } : u));
    setTransferUser(null);
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = [
    { label: "إجمالي المستخدمين", value: users.length, color: "primary" },
    { label: "نشط",   value: users.filter((u) => u.status === "نشط").length,   color: "success" },
    { label: "إجازة", value: users.filter((u) => u.status === "إجازة").length, color: "warning" },
    { label: "معلق",  value: users.filter((u) => u.status === "معلق").length,  color: "error"   },
  ];

  const headCell = {
    fontWeight: 700, fontSize: "0.8rem", color: "text.secondary",
    bgcolor: "grey.100", whiteSpace: "nowrap",
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>

      {/* ── Header ── */}
      <Stack direction={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "center" }} justifyContent="space-between" mb={3} gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800}>إدارة المستخدمين</Typography>
          <Typography variant="body2" color="text.secondary">
            عرض وإدارة حسابات مستخدمي النظام
          </Typography>
        </Box>
        <Button variant="contained"
          onClick={() => { setEditUser(null); setCreateOpen(true); }}
          startIcon={<SvgColor src="/assets/icons/components/ic_default.svg"
            icon="mdi:account-plus" width={20} />}
          sx={{ bgcolor: "#111", color: "white", borderRadius: 2.5,
            fontWeight: 700, px: 3, "&:hover": { bgcolor: "#333" }, whiteSpace: "nowrap" }}>
          إنشاء مستخدم جديد
        </Button>
      </Stack>

      {/* ── Stats cards ── */}
      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap" gap={1.5}>
        {stats.map((s) => (
          <Card key={s.label} variant="outlined" sx={{ borderRadius: 2.5, flex: "1 1 140px", minWidth: 120 }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, textAlign: "center" }}>
              <Typography variant="h4" fontWeight={800} color={`${s.color}.main`}>
                {s.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* ── Filters ── */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={2.5} alignItems="center">
        <TextField size="small" placeholder="...بحث عن مستخدم"
          value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" sx={{ color: "text.disabled" }}>
                <SearchIcon />
              </InputAdornment>
            ),
          }} />

        <FormControl size="small" sx={{ minWidth: 160, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
          <InputLabel>المجموعة</InputLabel>
          <Select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} label="المجموعة">
            <MenuItem value="all">جميع المجموعات</MenuItem>
            {GROUPS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
          <InputLabel>المستوى</InputLabel>
          <Select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} label="المستوى">
            <MenuItem value="all">جميع المستويات</MenuItem>
            {LEVELS.map((l) => <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      {/* ── Table ── */}
      <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...headCell, textAlign: "right" }}>المستخدم</TableCell>
                <TableCell sx={{ ...headCell, textAlign: "center" }}>المجموعة</TableCell>
                <TableCell sx={{ ...headCell, textAlign: "center" }}>المستوى</TableCell>
                <TableCell sx={{ ...headCell, textAlign: "center" }}>الحالة</TableCell>
                <TableCell sx={{ ...headCell, textAlign: "center" }}>موثَّق</TableCell>
                <TableCell sx={{ ...headCell, textAlign: "center" }}>الشركة</TableCell>
                <TableCell sx={{ ...headCell, width: 52 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 6 }}>
                    <Typography color="text.secondary">لا توجد نتائج</Typography>
                  </TableCell>
                </TableRow>
              ) : filtered.map((u) => (
                <TableRow key={u.id} hover sx={{ transition: "background 0.15s" }}>

                  {/* User */}
                  <TableCell sx={{ textAlign: "right", py: 1.5, px: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="flex-end">
                      <Box textAlign="right">
                        <Typography variant="body2" fontWeight={700}>{u.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {u.username} · {u.email}
                        </Typography>
                      </Box>
                      <Avatar sx={{
                        width: 40, height: 40, fontWeight: 700,
                        bgcolor: ["#1976d2","#388e3c","#f57c00","#7b1fa2","#d32f2f",
                                  "#546e7a","#00838f","#558b2f","#6a1b9a"][u.id % 9],
                      }}>
                        {u.name[0]}
                      </Avatar>
                    </Stack>
                  </TableCell>

                  {/* Group */}
                  <TableCell sx={{ textAlign: "center", py: 1.5 }}>
                    <Chip label={u.group} size="small" variant="outlined"
                      sx={{ fontWeight: 600, fontSize: "0.72rem" }} />
                  </TableCell>

                  {/* Level */}
                  <TableCell sx={{ textAlign: "center", py: 1.5 }}>
                    <Chip label={levelLabel(u.level)} size="small"
                      color={levelColor(u.level)}
                      sx={{ fontWeight: 600, fontSize: "0.72rem" }} />
                  </TableCell>

                  {/* Status */}
                  <TableCell sx={{ textAlign: "center", py: 1.5 }}>
                    <Chip label={u.status} size="small"
                      color={STATUS_COLORS[u.status] || "default"}
                      sx={{ fontWeight: 600, fontSize: "0.72rem" }} />
                  </TableCell>

                  {/* Verified */}
                  <TableCell sx={{ textAlign: "center", py: 1.5 }}>
                    {u.verified ? (
                      <SvgColor src="/assets/icons/components/ic_default.svg"
                        icon="mdi:check-circle" width={20} sx={{ color: "success.main" }} />
                    ) : (
                      <SvgColor src="/assets/icons/components/ic_default.svg"
                        icon="mdi:close-circle" width={20} sx={{ color: "error.light" }} />
                    )}
                  </TableCell>

                  {/* Company */}
                  <TableCell sx={{ textAlign: "center", py: 1.5,
                    color: "text.secondary", fontSize: "0.83rem" }}>
                    {u.company || "—"}
                  </TableCell>

                  {/* Actions */}
                  <TableCell sx={{ textAlign: "center", py: 1.5, px: 0.5 }}>
                    <RowMenu
                      user={u}
                      onEdit={(u) => { setEditUser(u); setCreateOpen(true); }}
                      onDelete={setDeleteUser}
                      onTransfer={setTransferUser}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Table footer */}
        <Box sx={{ px: 2, py: 1.2, bgcolor: "grey.50",
          borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary">
            عرض {filtered.length} من أصل {users.length} مستخدم
          </Typography>
        </Box>
      </Paper>

      {/* ── Dialogs ── */}
      <UserFormDialog
        open={createOpen}
        editUser={editUser}
        onClose={() => { setCreateOpen(false); setEditUser(null); }}
        onSave={handleSave}
      />
      <TransferDialog
        open={Boolean(transferUser)}
        user={transferUser}
        onClose={() => setTransferUser(null)}
        onTransfer={handleTransfer}
      />
      <DeleteDialog
        open={Boolean(deleteUser)}
        user={deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
