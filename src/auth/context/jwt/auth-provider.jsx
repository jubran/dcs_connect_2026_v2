import PropTypes from "prop-types";
import { useMemo, useEffect, useReducer, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./auth-context";
import { setSession } from "./utils";
import { isLoggingOut, setIsLoggingOut } from "src/auth/hooks/auth-flag";
import { apiBaseUrl } from "src/config-global";
import API_ROUTES from "src/shared/utils/API_ROUTES";

const initialState = {
  user: null,
  loading: true,
  accessToken: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INITIAL":
      return { ...state, loading: false, ...action.payload };
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
      };
    case "LOGOUT":
      return { ...state, user: null, accessToken: null };
    case "REFRESH":
      return { ...state, accessToken: action.payload.accessToken };
    default:
      return state;
  }
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();

  const didInit = useRef(false);

  /* ================= LOGOUT ================= */

  const logout = useCallback(async () => {
    setIsLoggingOut(true);

    try {
      await axios
        .post(
          `${apiBaseUrl}${API_ROUTES.auth.logout()}`,
          {},
          { withCredentials: true },
        )
        .catch(() => {});
    } finally {
      setSession(null);
      delete axios.defaults.headers.common.Authorization;
      dispatch({ type: "LOGOUT" });
      navigate("/auth/jwt/login");
    }
  }, [apiBaseUrl, navigate]);

  /* ================= REFRESH ================= */

  const refreshAccessToken = useCallback(async () => {
    try {
      const res = await axios.post(
        `${apiBaseUrl}${API_ROUTES.auth.refresh()}`,
        {},
        { withCredentials: true },
      );

      const { accessToken, user } = res.data;
      if (!accessToken) return null;

      setSession(accessToken);
      dispatch({ type: "REFRESH", payload: { accessToken } });

      return accessToken;
    } catch {
      return null;
    }
  }, [apiBaseUrl]);

  /* ================= INITIALIZE (مرة واحدة فقط) ================= */
  const initialize = useCallback(async () => {
    try {
      const res = await axios.post(
        `${apiBaseUrl}${API_ROUTES.auth.refresh()}`,
        {},
        { withCredentials: true },
      );

      const { accessToken, user } = res.data;

      setSession(accessToken);
      dispatch({
        type: "INITIAL",
        payload: { user: { ...user, accessToken }, accessToken },
      });
    } catch {
      dispatch({
        type: "INITIAL",
        payload: { user: null, accessToken: null },
      });
      navigate("/auth/jwt/login?returnTo=%2Fdashboard");
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    initialize();
  }, [initialize]);

  /* ================= LOGIN ================= */

  const login = useCallback(
    async (user_name, password) => {
      const res = await axios.post(
        `${apiBaseUrl}${API_ROUTES.auth.login()}`,
        { user_name, password },
        { withCredentials: true },
      );

      const { accessToken, user } = res.data;

      setSession(accessToken);
      dispatch({
        type: "LOGIN",
        payload: { user: { ...user, accessToken }, accessToken },
      });
      navigate("/dashboard");
    },
    [apiBaseUrl, navigate],
  );

  /* ================= AXIOS INTERCEPTOR ================= */
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      async (error) => {
        if (isLoggingOut) return Promise.reject(error);

        const original = error.config;
        if (
          error.response?.status === 401 &&
          !original._retry &&
          !original.url.includes("refreshToken")
        ) {
          original._retry = true;

          const newToken = await refreshAccessToken();
          if (newToken) {
            original.headers.Authorization = `Bearer ${newToken}`;
            return axios(original);
          }

          logout();
        }

        return Promise.reject(error);
      },
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [refreshAccessToken, logout]);

  /* ================= CONTEXT ================= */
  const value = useMemo(
    () => ({
      user: state.user,
      accessToken: state.accessToken,
      loading: state.loading,
      authenticated: !!state.user,
      login,
      logout,
    }),
    [state, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node };
