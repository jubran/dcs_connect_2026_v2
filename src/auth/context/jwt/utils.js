import { useContext, useMemo } from "react";
import axios from "src/myApp/utils/axios";
import { paths } from "src/routes/paths";
import { AuthContext } from "./auth-context";
// ----------------------------------------------------------------------

const STORAGE_KEY = "accessToken";
let expiredTimer = null;

// ---------------- JWT Decode ----------------
export function jwtDecode(token) {
  if (!token) return {};
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return {};
  }
}

// ---------------- Token Check ----------------
export const isValidToken = (token) => {
  const decoded = jwtDecode(token);
  return decoded?.exp > Date.now() / 1000;
};

// ---------------- Session ----------------
export const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem(STORAGE_KEY, accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem(STORAGE_KEY);
    delete axios.defaults.headers.common.Authorization;
  }
};

// ---------------- User Hook ----------------
export function useAuthUser() {
  const { user } = useContext(AuthContext);

  return useMemo(
    () => ({
      username: user?.username ?? null,
      fullName: user?.name ?? null,
      role: user?.u_role ?? null,
    }),
    [user],
  );
}
export const clearAuthData = () => {
  // مسح localStorage
  localStorage.removeItem("accessToken");

  // مسح جميع الـ cookies المرتبطة بالمصادقة
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

    // مسح أي cookie مرتبط بالمصادقة
    if (name.includes("token") || name.includes("session")) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  }

  // مسح axios headers
  delete axios.defaults.headers.common.Authorization;
};

// export function useDecodedUser() {
//   const { user } = useContext(AuthContext);

//   return useMemo(() => {
//     if (!user?.accessToken) return null;
//     try {
//       return jwtDecode(user.accessToken);
//     } catch {
//       return null;
//     }
//   }, [user?.accessToken]);
// }

// ----------------------------------------------------------------------

// function scheduleTokenRefresh(exp) {
//   clearTimeout(expiredTimer);

//   if (!exp || typeof exp !== "number") return handleTokenExpired();

//   const expMs = exp * 1000;
//   const currentTimeMs = Date.now();
//   let timeLeftMs = expMs - currentTimeMs;
//   // const refreshThresholdMs = 60 * 1000; // قبل دقيقة من انتهاء التوكن
//   const refreshThresholdMs = 1000 ; // قبل 30 ثانية من انتهاء التوكن

//   if (timeLeftMs <= 0) return handleTokenExpired();

//   if (timeLeftMs > refreshThresholdMs) {
//     expiredTimer = setTimeout(() => scheduleTokenRefresh(exp), timeLeftMs - refreshThresholdMs);
//   } else {
//     expiredTimer = setTimeout(refreshToken, 0);
//   }
// }

// ----------------------------------------------------------------------
// export async function refreshToken() {
//   try {
//     const oldToken = localStorage.getItem(STORAGE_KEY);
//     if (!oldToken) throw new Error("No token in localStorage");

//     const response = await axios.post("/api/api.php?action=refreshToken", { token: oldToken });
//     const newToken = response?.data?.accessToken;

//     if (!newToken) throw new Error("No new token received");

//     setSession(newToken);
//     console.log("Token refreshed successfully");
//     return newToken;  // <-- هنا نعيد التوكن الجديد
//   } catch (error) {
//     console.error("refreshToken failed:", error);
//     handleTokenExpired();
//     throw error; // <-- نعيد رمي الخطأ حتى initialize يعرف أن التجديد فشل
//   }
// }

// ----------------------------------------------------------------------

// function handleTokenExpired() {
//   localStorage.removeItem(STORAGE_KEY);
//   delete axios.defaults.headers.common.Authorization;
//   clearTimeout(expiredTimer);
//   window.location.href = paths.auth.jwt.login;
// }

// export function useAuthUser() {
//   const user = useDecodedUser();

//   return {
//     username: user?.username ?? null,
//     fullName: user?.name ?? null,
//     role: user?.u_role ?? null,
//   };
// }
