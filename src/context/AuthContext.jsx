import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { authFacade } from "../facades";
import axios from "axios";
import { resolveBaseUrl } from "../utils/baseUrl";
import { getDashboardRouteForRole } from "../config/roleConfig";

const AuthContext = createContext(null);

// Channel name for cross-tab communication
const AUTH_CHANNEL_NAME = "ghg_auth_channel";
const LOGOUT_EVENT = "logout";
const LOGIN_EVENT = "login";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const broadcastChannelRef = useRef(null);

  const resolvedApiUrl = resolveBaseUrl();

  axios.defaults.baseURL = resolvedApiUrl;
  axios.defaults.withCredentials = true;

  // Initialize cross-tab logout listener
  useEffect(() => {
    // Use BroadcastChannel if available (modern browsers)
    if (typeof BroadcastChannel !== "undefined") {
      broadcastChannelRef.current = new BroadcastChannel(AUTH_CHANNEL_NAME);
      broadcastChannelRef.current.onmessage = (event) => {
        if (event.data?.type === LOGOUT_EVENT) {
          // Another tab logged out - clear local state without API call
          clearAuthDataSilent();
          window.location.href = "/";
        } else if (event.data?.type === LOGIN_EVENT && event.data?.user) {
          // Another tab logged in - sync the user state and redirect if on login page
          setUser(event.data.user);
          Cookies.set("user", JSON.stringify(event.data.user), { expires: 7 });
          // Redirect to role-appropriate dashboard if currently on login/auth pages
          const currentPath = window.location.pathname;
          if (currentPath === "/" || currentPath === "/login" || currentPath === "/admin/login" || currentPath === "/god/login" || currentPath.startsWith("/auth")) {
            window.location.href = getDashboardRouteForRole(event.data.user.role);
          }
        }
      };
    }

    // Fallback: localStorage event for older browsers
    const handleStorageChange = (event) => {
      if (event.key === "ghg_logout_event") {
        // Another tab logged out
        clearAuthDataSilent();
        window.location.href = "/";
      } else if (event.key === "ghg_login_event" && event.newValue) {
        // Another tab logged in - sync the user state
        try {
          const userData = JSON.parse(event.newValue);
          setUser(userData);
          Cookies.set("user", JSON.stringify(userData), { expires: 7 });
          // Redirect to role-appropriate dashboard if currently on login/auth pages
          const currentPath = window.location.pathname;
          if (currentPath === "/" || currentPath === "/login" || currentPath === "/admin/login" || currentPath === "/god/login" || currentPath.startsWith("/auth")) {
            window.location.href = getDashboardRouteForRole(userData.role);
          }
        } catch (e) {
          console.error("Failed to parse login event data:", e);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const storedUser = Cookies.get("user");

    const safeParseUser = (value) => {
      if (!value) {
        return null;
      }
      try {
        return JSON.parse(value);
      } catch (error) {
        console.error("Error parsing user cookie:", error);
        return null;
      }
    };

    const applyUserFromResponse = (response) => {
      if (!response?.data?.success) {
        return false;
      }

      const verifiedUser = response.data.data?.user || safeParseUser(storedUser);
      if (verifiedUser) {
        setUser(verifiedUser);
        Cookies.set("user", JSON.stringify(verifiedUser), { expires: 7 });
      }

      return true;
    };

    const verifyUserAuth = async () => {
      try {
        const response = await axios.get("/api/v2/auth/verify");
        if (applyUserFromResponse(response)) {
          return true;
        }
      } catch (error) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          Cookies.remove("user");
        } else if (status) {
          console.error("Error verifying token:", error);
        }
      }

      return false;
    };

    const refreshSession = async () => {
      try {
        const response = await axios.post("/api/v2/auth/refresh", {});
        if (response.data?.success) {
          const { accessToken, refreshToken } = response.data.data || {};
          if (accessToken) {
            Cookies.set("accessToken", accessToken, { expires: 1 });
          }
          if (refreshToken) {
            Cookies.set("refreshToken", refreshToken, { expires: 7 });
          }
          return true;
        }
      } catch (error) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          Cookies.remove("user");
        } else if (status) {
          console.error("Error refreshing token:", error);
        }
      }

      return false;
    };

    const bootstrapAuth = async () => {
      const parsedUser = safeParseUser(storedUser);
      if (parsedUser) {
        setUser(parsedUser);
      }

      const isVerified = await verifyUserAuth();
      if (!isVerified) {
        const refreshed = await refreshSession();
        if (refreshed) {
          const reverified = await verifyUserAuth();
          if (reverified) {
            setIsLoading(false);
            return;
          }
        }
        clearAuthDataSilent();
      }

      setIsLoading(false);
    };

    bootstrapAuth();
  }, []);

  // Silent clear - used when receiving logout from another tab
  const clearAuthDataSilent = () => {
    setUser(null);
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("user");
  };

  // Broadcast logout to other tabs
  const broadcastLogout = () => {
    // BroadcastChannel method
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: LOGOUT_EVENT });
    }
    // localStorage fallback - triggers storage event in other tabs
    localStorage.setItem("ghg_logout_event", Date.now().toString());
    localStorage.removeItem("ghg_logout_event");
  };

  // Broadcast login to other tabs
  const broadcastLogin = (userData) => {
    // BroadcastChannel method
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: LOGIN_EVENT, user: userData });
    }
    // localStorage fallback - triggers storage event in other tabs
    localStorage.setItem("ghg_login_event", JSON.stringify(userData));
    localStorage.removeItem("ghg_login_event");
  };

  const login = (userData, accessToken, refreshToken) => {
    const updatedUser = {
      ...userData,
      accessToken: accessToken,
    };

    setUser(updatedUser);

    // Store tokens and user data in cookies
    Cookies.set("user", JSON.stringify(updatedUser), { expires: 7 }); // 7 days
    Cookies.set("accessToken", accessToken, { expires: 1 }); // 1 day
    Cookies.set("refreshToken", refreshToken, { expires: 7 }); // 7 days

    // Notify other tabs about the login
    broadcastLogin(updatedUser);
  };

  const logout = async () => {
    try {
      // Use facade instead of direct API call
      await authFacade.logout();
      clearAuthDataSilent();
      // Notify other tabs about the logout
      broadcastLogout();
    } catch (error) {
      console.error("Logout failed:", error);
      // Clear data even if API call fails
      clearAuthDataSilent();
      broadcastLogout();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
