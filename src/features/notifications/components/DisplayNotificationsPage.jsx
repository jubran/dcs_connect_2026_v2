import { useState, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";

import {
  Box, Card, CardContent, Chip, Divider, IconButton, InputAdornment,
  List, MenuItem, Stack, TextField, Tooltip, Typography, Badge,
  ToggleButton, ToggleButtonGroup, CircularProgress, Button,
} from "@mui/material";

import SvgColor from "src/components/svg-color";
import { useSnackbar } from "src/shared/contexts/SnackbarContext";
import { fToNow } from "src/shared/utils/format-time";
import {
  useNotifications, markAsRead, markAllAsRead,
  NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES,
} from "../services/notificationService";

// ─── Inline SVG ───────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

// ─── Priority style map ───────────────────────────────────────────────────────
const PRIORITY_STYLE = {
  low:      { bg: "#e8f5e9", border: "#4caf50", text: "#2e7d32" },
  medium:   { bg: "#fff8e1", border: "#ffc107", text: "#f57f17" },
  high:     { bg: "#fff3e0", border: "#ff9800", text: "#e65100" },
  critical: { bg: "#fce4ec", border: "#f44336", text: "#b71c1c" },
};

// ─── Single notification card ─────────────────────────────────────────────────
function NotificationCard({ notification, onMarkRead }) {
  const typeObj = NOTIFICATION_TYPES.find((t) => t.value === notification.type);
  const prioObj = NOTIFICATION_PRIORITIES.find((p) => p.value === notification.priority);
  const prioStyle = PRIORITY_STYLE[notification.priority] || PRIORITY_STYLE.low;

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        variant="outlined"
        sx={{
          mb: 1.5,
          borderRadius: 2,
          borderColor: notification.isUnRead ? prioStyle.border : "divider",
          borderWidth: notification.isUnRead ? 1.5 : 1,
          bgcolor: notification.isUnRead ? prioStyle.bg : "background.paper",
          transition: "all 0.25s ease",
          "&:hover": { boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
          position: "relative",
        }}
      >
        {/* Unread dot */}
        {notification.isUnRead && (
          <Box sx={{
            position: "absolute", top: 14, left: 14,
            width: 8, height: 8, borderRadius: "50%",
            bgcolor: "info.main",
          }} />
        )}

        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            {/* Type icon */}
            <Box sx={{
              width: 42, height: 42, borderRadius: "50%",
              bgcolor: "background.paper", border: "1.5px solid",
              borderColor: "divider", display: "flex",
              alignItems: "center", justifyContent: "center",
              flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              <SvgColor
                src="/assets/icons/components/ic_default.svg"
                icon={typeObj?.icon || "mdi:bell"}
                width={22}
              />
            </Box>

            {/* Body */}
            <Box flex={1} minWidth={0}>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" mb={0.4}>
                <Typography
                  variant="subtitle2"
                  fontWeight={notification.isUnRead ? 700 : 500}
                  sx={{ color: notification.isUnRead ? prioStyle.text : "text.primary" }}
                  dangerouslySetInnerHTML={{ __html: notification.title }}
                />
                {prioObj && notification.priority !== "low" && (
                  <Chip label={prioObj.label} size="small"
                    sx={{
                      height: 18, fontSize: "0.65rem", fontWeight: 700,
                      bgcolor: prioStyle.border, color: "white",
                    }}
                  />
                )}
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, mb: 1 }}>
                {notification.description}
              </Typography>

              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                <Stack direction="row" spacing={0.8} alignItems="center">
                  {typeObj && (
                    <Chip label={typeObj.label} size="small" variant="outlined"
                      sx={{ height: 20, fontSize: "0.68rem" }} />
                  )}
                  <Typography variant="caption" color="text.disabled">
                    {fToNow(notification.createdAt)}
                  </Typography>
                </Stack>

                {notification.isUnRead && (
                  <Tooltip title="تحديد كمقروء">
                    <IconButton size="small" onClick={() => onMarkRead(notification.id)}
                      sx={{ color: "primary.main" }}>
                      <SvgColor src="/assets/icons/components/ic_default.svg"
                        icon="mdi:check" width={16} />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </m.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ label }) {
  return (
    <Stack alignItems="center" justifyContent="center" py={8} spacing={1.5} color="text.secondary">
      <SvgColor src="/assets/icons/components/ic_default.svg"
        icon="mdi:bell-off" width={56} sx={{ opacity: 0.35 }} />
      <Typography variant="h6">{label}</Typography>
      <Typography variant="body2">لا توجد إشعارات تطابق الفلتر المحدد</Typography>
    </Stack>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DisplayNotificationsPage() {
  const { notifications, isLoading, mutate } = useNotifications();
  const { showSuccess, showError } = useSnackbar();

  const [search, setSearch]       = useState("");
  const [filterTab, setFilterTab] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // ── Stats ──────────────────────────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => n.isUnRead).length;

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = notifications;
    if (filterTab === "unread") list = list.filter((n) => n.isUnRead);
    if (filterTab === "read")   list = list.filter((n) => !n.isUnRead);
    if (filterType !== "all")   list = list.filter((n) => n.type === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.description?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [notifications, filterTab, filterType, search]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      showSuccess("تم تحديد الإشعار كمقروء", 2000);
    } catch {
      showError("حدث خطأ");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      showSuccess("تم تحديد جميع الإشعارات كمقروءة", 2000);
    } catch {
      showError("حدث خطأ");
    }
  };

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* ── Header ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={1}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{
            width: 44, height: 44, borderRadius: 2, bgcolor: "info.main",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Badge badgeContent={unreadCount} color="error">
              <SvgColor src="/assets/icons/components/ic_default.svg"
                icon="mdi:bell" width={24} sx={{ color: "white" }} />
            </Badge>
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>عرض الإشعارات</Typography>
            <Typography variant="body2" color="text.secondary">
              {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : "جميع الإشعارات مقروءة"}
            </Typography>
          </Box>
        </Stack>

        {unreadCount > 0 && (
          <Button variant="outlined" size="small" onClick={handleMarkAllRead}
            startIcon={<SvgColor src="/assets/icons/components/ic_default.svg"
              icon="mdi:check-all" width={18} />}
            sx={{ borderRadius: 2 }}>
            تحديد الكل كمقروء
          </Button>
        )}
      </Stack>

      {/* ── Filters row ── */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={2.5}>
        {/* Search */}
        <TextField
          size="small"
          placeholder="بحث في الإشعارات..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Type filter */}
        <TextField
          select size="small"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        >
          <MenuItem value="all">جميع الأنواع</MenuItem>
          {NOTIFICATION_TYPES.map((t) => (
            <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
          ))}
        </TextField>
      </Stack>

      {/* ── Tab toggles ── */}
      <ToggleButtonGroup
        exclusive value={filterTab}
        onChange={(_, v) => v && setFilterTab(v)}
        size="small" sx={{ mb: 2.5 }}
      >
        {[
          { value: "all",    label: "الكل",         count: notifications.length },
          { value: "unread", label: "غير مقروءة",   count: unreadCount, color: "#1976d2" },
          { value: "read",   label: "مقروءة",       count: notifications.length - unreadCount },
        ].map((tab) => (
          <ToggleButton key={tab.value} value={tab.value}
            sx={{
              px: 2, borderRadius: "8px !important",
              border: "1.5px solid !important",
              fontWeight: 600, gap: 0.8,
            }}>
            {tab.label}
            <Chip label={tab.count} size="small"
              sx={{
                height: 18, fontSize: "0.65rem", fontWeight: 700,
                bgcolor: filterTab === tab.value ? (tab.color || "primary.main") : "grey.200",
                color: filterTab === tab.value ? "white" : "text.secondary",
              }}
            />
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Divider sx={{ mb: 2 }} />

      {/* ── List ── */}
      {isLoading ? (
        <Stack alignItems="center" py={8}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" mt={2}>جاري التحميل...</Typography>
        </Stack>
      ) : filtered.length === 0 ? (
        <EmptyState label="لا توجد إشعارات" />
      ) : (
        <List disablePadding>
          <AnimatePresence initial={false}>
            {filtered.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onMarkRead={handleMarkRead}
              />
            ))}
          </AnimatePresence>
        </List>
      )}
    </Box>
  );
}
