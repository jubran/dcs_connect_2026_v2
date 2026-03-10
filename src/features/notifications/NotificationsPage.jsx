import { m, AnimatePresence } from "framer-motion";
import { useState, useCallback, useMemo } from "react";

import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import List from "@mui/material/List";
import Stack from "@mui/material/Stack";
import Badge from "@mui/material/Badge";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import { useBoolean } from "src/shared/hooks/use-boolean";
import { useResponsive } from "src/shared/hooks/use-responsive";

import Label from "src/components/label";
import SvgColor from "src/components/svg-color";

import Scrollbar from "src/components/scrollbar";
import { varHover } from "src/components/animate";
import NotificationItem from "./hooks/useNotificationItem";

// ----------------------------------------------------------------------

export const notificationsData = [
  {
    id: "ntf-001",
    avatarUrl: null,
    type: "system",
    category: "النظام",
    isUnRead: true,
    isNew: true,
    title: "تم <strong>تشغيل البوابة</strong> بنجاح",
    description: "تم تشغيل جميع الخدمات بدون أخطاء.",
    createdAt: new Date(),
  },
  {
    id: "ntf-002",
    avatarUrl: null,
    type: "order",
    category: "الطلبات",
    isUnRead: true,
    isNew: true,
    title: "طلب تحديث أولوية التشغيل رقم <strong>#4587</strong>",
    description: "تم استلام طلب جديد ويحتاج إلى مراجعة.",
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: "ntf-003",
    avatarUrl: null,
    type: "file",
    category: "الملفات",
    isUnRead: true,
    isNew: true,
    title: "تم رفع ملف <strong>DCS datasheet.xlxc</strong>",
    description: "تم رفع الملف بواسطة فريق التشغيل.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "ntf-004",
    avatarUrl: null,
    type: "network",
    category: "الشبكة",
    isUnRead: false,
    isNew: false,
    title: "انقطاع مؤقت في <strong>DCS Dashboard</strong>",
    description: "تم تسجيل انقطاع لمدة 3 ايام وتمت المعالجة.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
  {
    id: "ntf-005",
    avatarUrl: null,
    type: "approval",
    category: "الموافقات",
    isUnRead: false,
    isNew: false,
    title:
      "<strong>تمت الموافقة على طلب تحديث اولوية التشغيل للمنقيات</strong>",
    description: "تم اعتماد الطلب من المدير المباشر.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
];

// ----------------------------------------------------------------------

export default function NotificationsManager() {
  const drawer = useBoolean();
  const smUp = useResponsive("up", "sm");
  const [currentTab, setCurrentTab] = useState("unread");
  const [notifications, setNotifications] = useState(notificationsData);

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  // حساب الأعداد للتبويبات
  const totalUnRead = notifications.filter((n) => n.isUnRead).length;
  const totalNew = notifications.filter((n) => n.isNew).length;
  const totalArchived = notifications.filter((n) => !n.isUnRead).length;

  const TABS = useMemo(
    () => [
      {
        value: "unread",
        label: "غير مقروءة",
        count: totalUnRead,
        color: "info",
      },
      { value: "new", label: "مقروءه", count: totalNew, color: "error" },
      {
        value: "archived",
        label: "المؤرشفة",
        count: totalArchived,
        color: "success",
      },
    ],
    [totalUnRead, totalNew, totalArchived],
  );

  const filteredNotifications = useMemo(() => {
    if (currentTab === "unread")
      return notifications.filter((item) => item.isUnRead);
    if (currentTab === "new") return notifications.filter((item) => item.isNew);
    if (currentTab === "archived")
      return notifications.filter((item) => !item.isUnRead);
    return notifications;
  }, [currentTab, notifications]);

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnRead: false } : n)),
    );

    // إزالة صفة "جديد" بعد فترة بسيطة إذا أردت أن يختفي من تبويب "جديد" أيضاً
    setTimeout(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isNew: false } : n)),
      );
    }, 3000);
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        isUnRead: false,
        isNew: false,
      })),
    );
  };

  const handleDeleteArchived = () => {
    setNotifications((prev) => prev.filter((n) => n.isUnRead));
  };

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        الإشعارات
      </Typography>

      {!!totalUnRead && (
        <Tooltip title="تحديد الكل كمقروء">
          <IconButton color="primary" onClick={handleMarkAllAsRead}>
            <SvgColor src="/assets/icons/notification/ic_check_all.svg" />
          </IconButton>
        </Tooltip>
      )}

      {!smUp && (
        <IconButton onClick={drawer.onFalse}>
          <SvgColor src="/assets/icons/components/ic_close.svg" />
        </IconButton>
      )}
    </Stack>
  );

  const renderTabs = (
    <Tabs value={currentTab} onChange={handleChangeTab} sx={{ px: 2 }}>
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          label={tab.label}
          iconPosition="end"
          icon={
            <Label
              variant={tab.value === currentTab ? "filled" : "soft"}
              color={tab.color}
            >
              {tab.count}
            </Label>
          }
          sx={{ minWidth: 0, mr: 2 }}
        />
      ))}
    </Tabs>
  );

  const renderList = (
    <Scrollbar sx={{ height: 1 }}>
      {filteredNotifications.length === 0 ? (
        <EmptyState
          title={
            (currentTab === "unread" && "لا توجد رسائل غير مقروءة") ||
            (currentTab === "new" && "لا توجد رسائل جديدة") ||
            "الأرشيف فارغ"
          }
          description="سيتم إدراج التنبيهات هنا فور وصولها"
          icon={
            (currentTab === "unread" && "solar:check-circle-bold-duotone") ||
            (currentTab === "new" && "solar:bell-bold-duotone") ||
            "solar:archive-bold-duotone"
          }
        />
      ) : (
        <List disablePadding>
          <AnimatePresence initial={false}>
            {filteredNotifications.map((notification) => (
              <m.div
                key={notification.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <NotificationItem
                  notification={notification}
                  onClick={() => handleMarkAsRead(notification.id)}
                />
              </m.div>
            ))}
          </AnimatePresence>
        </List>
      )}
    </Scrollbar>
  );

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        color={drawer.value ? "primary" : "default"}
        onClick={drawer.onTrue}
      >
        <Badge badgeContent={totalUnRead} color="error">
          <SvgColor src="/assets/icons/dcs/notification-fill.svg" />
        </Badge>
      </IconButton>

      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: 1, maxWidth: 420 } }}
      >
        {renderHead}

        <Divider />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          {renderTabs}
        </Stack>

        <Divider />

        {currentTab === "archived" && filteredNotifications.length > 0 && (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Button
              fullWidth
              color="error"
              variant="soft"
              startIcon={
                <SvgColor src="/assets/icons/components/ic_delete.svg" />
              }
              onClick={handleDeleteArchived}
            >
              حذف جميع المؤرشفة
            </Button>
          </Box>
        )}

        {renderList}

        <Divider sx={{ borderStyle: "dashed" }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth size="large" color="inherit">
            عرض جميع الإشعارات
          </Button>
        </Box>
      </Drawer>
    </>
  );
}

// ----------------------------------------------------------------------

export function EmptyState({ title, description, icon }) {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{ py: 10, px: 3, textAlign: "center", color: "text.secondary" }}
    >
      <SvgColor
        src="/assets/icons/components/ic_default.svg"
        icon={icon}
        width={64}
        sx={{ opacity: 0.48 }}
      />
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2">{description}</Typography>
    </Stack>
  );
}
