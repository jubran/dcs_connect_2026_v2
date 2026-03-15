import { useState, useEffect, useMemo } from "react";
import {
  Box, Button, Card, CardContent, CardHeader, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  IconButton, MenuItem, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography, Alert, Paper,
} from "@mui/material";

import SvgColor from "src/components/svg-color";
import { useSnackbar } from "src/shared/contexts/SnackbarContext";
import { fToNow } from "src/shared/utils/format-time";
import {
  useNotifications, deleteNotification, updateNotification,
  NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES,
} from "../services/notificationService";

// ─── Priority chip ────────────────────────────────────────────────────────────
const PRIORITY_COLORS = {
  low:      { bg: "#e8f5e9", color: "#2e7d32" },
  medium:   { bg: "#fff8e1", color: "#f57f17" },
  high:     { bg: "#fff3e0", color: "#e65100" },
  critical: { bg: "#fce4ec", color: "#b71c1c" },
};

function PriorityChip({ value }) {
  const obj = NOTIFICATION_PRIORITIES.find((p) => p.value === value);
  const c   = PRIORITY_COLORS[value] || PRIORITY_COLORS.low;
  return (
    <Chip label={obj?.label || value} size="small"
      sx={{ bgcolor: c.bg, color: c.color, fontWeight: 700, fontSize: "0.7rem", height: 22 }} />
  );
}

// ─── Stats summary card ───────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, flex: 1, minWidth: 140 }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight={800} color={color}>{value}</Typography>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
          </Box>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2,
            bgcolor: color, opacity: 0.12, display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <SvgColor src="/assets/icons/components/ic_default.svg"
              icon={icon} width={22} sx={{ opacity: 1, color }} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────
function DeleteDialog({ open, onClose, onConfirm, notification, deleting }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ bgcolor: "error.main", color: "white", py: 2 }}>
        تأكيد الحذف
      </DialogTitle>
      <DialogContent dividers sx={{ py: 2 }}>
        <Typography>هل تريد حذف هذا الإشعار بشكل نهائي؟</Typography>
        {notification && (
          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="body2" fontWeight={600}
              dangerouslySetInnerHTML={{ __html: notification.title }} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إلغاء</Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={deleting}
          startIcon={deleting ? <CircularProgress size={16} color="inherit" /> :
            <SvgColor src="/assets/icons/components/ic_delete.svg" width={18} />}>
          {deleting ? "جاري الحذف..." : "حذف"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Edit dialog ──────────────────────────────────────────────────────────────
function EditDialog({ open, onClose, notification, onSave, saving }) {
  const [form, setForm] = useState({});

  // Sync form whenever the dialog opens with a new notification
  useEffect(() => {
    if (open && notification) setForm({ ...notification });
  }, [open, notification]);

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: "primary.main", color: "white", py: 2 }}>
        تعديل الإشعار
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} pt={1}>
          <TextField
            label="عنوان الإشعار"
            fullWidth
            value={form.title || ""}
            onChange={update("title")}
          />
          <TextField
            label="وصف الإشعار"
            fullWidth multiline minRows={3}
            value={form.description || ""}
            onChange={update("description")}
          />
          <TextField select label="نوع الإشعار" fullWidth
            value={form.type || "system"} onChange={update("type")}>
            {NOTIFICATION_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </TextField>
          <TextField select label="الأولوية" fullWidth
            value={form.priority || "medium"} onChange={update("priority")}>
            {NOTIFICATION_PRIORITIES.map((p) => (
              <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إلغاء</Button>
        <Button variant="contained" onClick={() => onSave(form)} disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> :
            <SvgColor src="/assets/icons/components/ic_default.svg" icon="mdi:content-save" width={18} />}>
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Control Panel ───────────────────────────────────────────────────────
export default function NotificationControlPanelPage() {
  const { notifications, isLoading } = useNotifications();
  const { showSuccess, showError } = useSnackbar();

  const [search, setSearch]           = useState("");
  const [filterType, setFilterType]   = useState("all");
  const [page, setPage]               = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [saving, setSaving]             = useState(false);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    notifications.length,
    unread:   notifications.filter((n) => n.isUnRead).length,
    critical: notifications.filter((n) => n.priority === "critical").length,
    today:    notifications.filter((n) => {
      const d = new Date(n.createdAt);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length,
  }), [notifications]);

  // ── Filtered ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = notifications;
    if (filterType !== "all") list = list.filter((n) => n.type === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((n) =>
        n.title?.toLowerCase().includes(q) || n.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [notifications, filterType, search]);

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteNotification(deleteTarget.id);
      showSuccess("تم حذف الإشعار بنجاح", 2500);
      setDeleteTarget(null);
    } catch {
      showError("حدث خطأ أثناء الحذف");
    } finally {
      setDeleting(false);
    }
  };

  // ── Save edit ──────────────────────────────────────────────────────────────
  const handleSaveEdit = async (form) => {
    setSaving(true);
    try {
      await updateNotification(form.id, form);
      showSuccess("تم تحديث الإشعار بنجاح", 2500);
      setEditTarget(null);
    } catch {
      showError("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const headCell = {
    fontWeight: 700, fontSize: "0.78rem", color: "text.secondary",
    bgcolor: "grey.100", whiteSpace: "nowrap",
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* ── Page header ── */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <Box sx={{
          width: 44, height: 44, borderRadius: 2, bgcolor: "warning.main",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <SvgColor src="/assets/icons/components/ic_default.svg"
            icon="mdi:tune" width={24} sx={{ color: "white" }} />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>لوحة تحكم الإشعارات</Typography>
          <Typography variant="body2" color="text.secondary">
            إدارة وتعديل وحذف الإشعارات
          </Typography>
        </Box>
      </Stack>

      {/* ── Stats ── */}
      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap" useFlexGap>
        <StatCard label="إجمالي الإشعارات" value={stats.total}    icon="mdi:bell"       color="#1976d2" />
        <StatCard label="غير مقروءة"       value={stats.unread}   icon="mdi:bell-ring"  color="#ed6c02" />
        <StatCard label="حرجة"             value={stats.critical} icon="mdi:alert"      color="#d32f2f" />
        <StatCard label="اليوم"            value={stats.today}    icon="mdi:calendar"   color="#2e7d32" />
      </Stack>

      {/* ── Table card ── */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardHeader
          title="جميع الإشعارات"
          titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }}
          action={
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TextField
                size="small" placeholder="بحث..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                sx={{ width: 200, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                select size="small" value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setPage(0); }}
                sx={{ width: 140, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              >
                <MenuItem value="all">جميع الأنواع</MenuItem>
                {NOTIFICATION_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </TextField>
            </Stack>
          }
        />
        <Divider />

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={headCell}>#</TableCell>
                <TableCell sx={headCell}>العنوان</TableCell>
                <TableCell sx={headCell}>النوع</TableCell>
                <TableCell sx={headCell}>الأولوية</TableCell>
                <TableCell sx={headCell}>الحالة</TableCell>
                <TableCell sx={headCell}>التاريخ</TableCell>
                <TableCell sx={{ ...headCell, textAlign: "center" }}>إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 5 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 5 }}>
                    <Typography color="text.secondary">لا توجد إشعارات</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((n, idx) => {
                  const typeObj = NOTIFICATION_TYPES.find((t) => t.value === n.type);
                  return (
                    <TableRow key={n.id} hover
                      sx={{
                        bgcolor: n.isUnRead ? "rgba(25,118,210,0.04)" : "inherit",
                        "&:hover": { bgcolor: "action.hover" },
                      }}>
                      <TableCell sx={{ color: "text.disabled", fontSize: "0.75rem" }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>

                      <TableCell sx={{ maxWidth: 280 }}>
                        <Stack direction="row" alignItems="center" spacing={0.8}>
                          {n.isUnRead && (
                            <Box sx={{ width: 7, height: 7, borderRadius: "50%",
                              bgcolor: "info.main", flexShrink: 0 }} />
                          )}
                          <Typography variant="body2" fontWeight={n.isUnRead ? 700 : 400}
                            sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            dangerouslySetInnerHTML={{ __html: n.title }} />
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.6}>
                          <SvgColor src="/assets/icons/components/ic_default.svg"
                            icon={typeObj?.icon} width={16} />
                          <Typography variant="body2" fontSize="0.78rem">
                            {typeObj?.label || n.type}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell><PriorityChip value={n.priority} /></TableCell>

                      <TableCell>
                        <Chip
                          label={n.isUnRead ? "غير مقروء" : "مقروء"}
                          size="small"
                          sx={{
                            height: 20, fontSize: "0.68rem", fontWeight: 700,
                            bgcolor: n.isUnRead ? "#e3f2fd" : "#f5f5f5",
                            color: n.isUnRead ? "#1565c0" : "#666",
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="caption" color="text.disabled">
                          {fToNow(n.createdAt)}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ textAlign: "center" }}>
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="تعديل">
                            <IconButton size="small" color="primary"
                              onClick={() => setEditTarget(n)}>
                              <SvgColor src="/assets/icons/components/ic_edit.svg" width={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="حذف">
                            <IconButton size="small" color="error"
                              onClick={() => setDeleteTarget(n)}>
                              <SvgColor src="/assets/icons/components/ic_delete.svg" width={18} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 8, 10, 25]}
          labelRowsPerPage="عدد الصفوف:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}
        />
      </Card>

      {/* ── Dialogs ── */}
      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        notification={deleteTarget}
        deleting={deleting}
      />
      <EditDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        notification={editTarget}
        onSave={handleSaveEdit}
        saving={saving}
      />
    </Box>
  );
}
