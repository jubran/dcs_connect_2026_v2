import { apiBaseUrl } from "src/config-global";
import API_ROUTES from "src/myApp/utils/API_ROUTES";

export const eventsApi = {
  search: async (params) => {
    const url = buildEventsApiUrl(params);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  },

  // يمكن إضافة المزيد من التوابع هنا
  getEventById: async (id) => {
    const response = await fetch(
      `${apiBaseUrl}${API_ROUTES.events.search()}/${id}`,
    );
    return response.json();
  },
};

export const fetcher = async (url) => {
  if (!url) return null; // لا يتم الطلب إذا الرابط فارغ
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
};

// دالة بناء رابط API
export const buildEventsApiUrl = (params = {}) => {
  const hasParams = Object.values(params).some(
    (val) => val !== undefined && val !== null && val !== "",
  );
  if (!hasParams) return null; // منع رابط فارغ

  const url = new URL(`${apiBaseUrl}${API_ROUTES.events.search()}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
};

// دالة معالجة البيانات
export const processEventsData = (rawData) => {
  if (!rawData) return [];
  const arr = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData.data)
      ? rawData.data
      : Array.isArray(rawData.events)
        ? rawData.events
        : [];
  return arr.map((item) => ({ ...item }));
};
