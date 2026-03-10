import axios from "axios";
import { HOST_API } from "src/config-global";

// ----------------------------------------------------------------------
const axiosInstance = axios.create({ baseURL: HOST_API });

// ----------------- دالة الحصول على التوكن -----------------
const getAuthToken = () => {
  try {
    return localStorage.getItem("accessToken") || null;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

// ----------------- interceptor -----------------
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken(); // استخدم الدالة مباشرة
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosInstance;

// ----------------------------------------------------------------------
export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  const responseData = res.data;

  if (
    responseData &&
    typeof responseData === "object" &&
    responseData.success !== undefined &&
    responseData.data !== undefined
  ) {
    return responseData.data;
  }

  return responseData;
};
