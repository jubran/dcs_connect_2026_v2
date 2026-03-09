// src/config/api-config.js
import { apiBaseUrl } from "src/config-global";

class ApiConfig {
  static getBaseUrl() {
    // استخدام متغيرات Vite البيئية
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }

    // الافتراضي بناءً على الموقع الحالي
    const currentOrigin = window.location.origin;

    // في التطوير
    if (import.meta.env.DEV) {
      return currentOrigin.includes("localhost")
        ? "http://localhost"
        : currentOrigin;
    }

    // في الإنتاج
    return currentOrigin;
  }

  static getApiUrl(route, params = {}) {
    const baseUrl = this.getBaseUrl();

    // بناء الرابط مع تجنب الازدواجية في الشرطة المائلة
    const apiPath = "/api/index.php";
    let url = "";

    if (baseUrl.endsWith("/api")) {
      url = `${baseUrl}/index.php`;
    } else if (baseUrl.endsWith("/")) {
      url = `${baseUrl}api/index.php`;
    } else {
      url = `${baseUrl}/api/index.php`;
    }

    // بناء معلمات URL
    const queryParams = new URLSearchParams({ route, ...params });

    return `${url}?${queryParams.toString()}`;
  }

  static getFullApiUrl(route, params = {}) {
    const urlString = this.getApiUrl(route, params);

    try {
      return new URL(urlString);
    } catch (error) {
      console.error("Invalid URL:", urlString, error);

      // محاولة إصلاح الرابط
      if (!urlString.startsWith("http")) {
        const fixedUrl =
          window.location.origin +
          (urlString.startsWith("/") ? "" : "/") +
          urlString;
        return new URL(fixedUrl);
      }

      throw new Error(`Invalid API URL: ${urlString}`);
    }
  }

  // دالة مساعدة للاستخدام المباشر مع fetch
  static async fetchApi(route, options = {}, params = {}) {
    const url = this.getApiUrl(route, params);

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
      },
      credentials: "include",
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, mergedOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API Fetch Error:", error);
      throw error;
    }
  }

  // دالة خاصة للـ Auth
  static async authFetch(route, credentials) {
    return this.fetchApi(route, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }
}

export default ApiConfig;
