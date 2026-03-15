import useSWR, { mutate as globalMutate } from "swr";
import axiosInstance, { fetcher } from "src/shared/utils/axios";
import API_ROUTES from "src/shared/utils/API_ROUTES";

// ─── SWR hook: fetch all notifications ───────────────────────────────────────
export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR(
    API_ROUTES.notifications.getAll(),
    fetcher,
  );
  return {
    notifications: data || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

// ─── Refresh helper ───────────────────────────────────────────────────────────
export const refreshNotifications = () =>
  globalMutate(API_ROUTES.notifications.getAll());

// ─── Create notification ─────────────────────────────────────────────────────
export async function createNotification(payload) {
  const response = await axiosInstance.post(
    API_ROUTES.notifications.create(),
    payload,
  );
  await refreshNotifications();
  return response.data;
}

// ─── Update notification ──────────────────────────────────────────────────────
export async function updateNotification(id, payload) {
  const response = await axiosInstance.post(
    API_ROUTES.notifications.update(id),
    { ...payload, id },   // always include id in body too
  );
  await refreshNotifications();
  return response.data;
}

// ─── Delete notification ──────────────────────────────────────────────────────
export async function deleteNotification(id) {
  const response = await axiosInstance.post(
    API_ROUTES.notifications.delete(id),
    { id },
  );
  await refreshNotifications();
  return response.data;
}

// ─── Mark single as read ──────────────────────────────────────────────────────
export async function markAsRead(id) {
  const response = await axiosInstance.post(
    API_ROUTES.notifications.markRead(),
    { id },
  );
  await refreshNotifications();
  return response.data;
}

// ─── Mark all as read ─────────────────────────────────────────────────────────
export async function markAllAsRead() {
  const response = await axiosInstance.post(
    API_ROUTES.notifications.markAllRead(),
  );
  await refreshNotifications();
  return response.data;
}

// ─── Notification types & priorities ─────────────────────────────────────────
export const NOTIFICATION_TYPES = [
  { value: "system",   label: "النظام",     icon: "mdi:server" },
  { value: "order",    label: "الطلبات",    icon: "mdi:clipboard-text" },
  { value: "file",     label: "الملفات",    icon: "mdi:file-document" },
  { value: "network",  label: "الشبكة",     icon: "mdi:lan" },
  { value: "approval", label: "الموافقات",  icon: "mdi:check-circle" },
  { value: "security", label: "الأمان",     icon: "mdi:shield-check" },
  { value: "update",   label: "التحديثات",  icon: "mdi:update" },
  { value: "chat",     label: "المحادثات",  icon: "mdi:message-text" },
];

export const NOTIFICATION_PRIORITIES = [
  { value: "low",      label: "منخفضة",   color: "success" },
  { value: "medium",   label: "متوسطة",   color: "warning" },
  { value: "high",     label: "عالية",    color: "error" },
  { value: "critical", label: "حرجة",     color: "error" },
];

export const TARGET_AUDIENCES = [
  { value: "all",      label: "الجميع" },
  { value: "manager",  label: "المديرون فقط" },
  { value: "user",     label: "المستخدمون فقط" },
];
