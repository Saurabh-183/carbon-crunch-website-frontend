/**
 * Auth Facade
 * Handles all authentication-related business logic
 * Components should use this facade instead of calling API directly
 */
import { authAPI } from "../utils/api";
import Cookies from "js-cookie";
import { toast } from "sonner";

class AuthFacade {
  /**
   * Login user (regular users with username + organizationId)
   * @param {string} username
   * @param {string} password
   * @param {string} organizationId
   * @returns {Promise<{user, accessToken, refreshToken}>}
   */
  async login(username, password, organizationId) {
    try {
      const response = await authAPI.login(username, password, organizationId);

      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;

        // Store tokens in cookies
        Cookies.set("accessToken", accessToken, { expires: 1 }); // 1 day
        Cookies.set("refreshToken", refreshToken, { expires: 7 }); // 7 days
        Cookies.set("user", JSON.stringify(user), { expires: 7 });

        return { user, accessToken, refreshToken };
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Login Platform Admin (uses email + role)
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user, accessToken, refreshToken}>}
   */
  async loginPlatformAdmin(email, password) {
    try {
      const response = await authAPI.loginPlatformAdmin(email, password);

      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        Cookies.set("accessToken", accessToken, { expires: 1 });
        Cookies.set("refreshToken", refreshToken, { expires: 7 });
        Cookies.set("user", JSON.stringify(user), { expires: 7 });
        return { user, accessToken, refreshToken };
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Login God Mode (uses email + role)
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user, accessToken, refreshToken}>}
   */
  async loginGodMode(email, password) {
    try {
      const response = await authAPI.loginGodMode(email, password);

      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;

        // Store tokens in cookies
        Cookies.set("accessToken", accessToken, { expires: 1 }); // 1 day
        Cookies.set("refreshToken", refreshToken, { expires: 7 }); // 7 days
        Cookies.set("user", JSON.stringify(user), { expires: 7 });

        return { user, accessToken, refreshToken };
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Login Maintainer (uses email + role)
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user, accessToken, refreshToken}>}
   */
  async loginMaintainer(email, password) {
    try {
      const response = await authAPI.loginMaintainer(email, password);

      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;

        // Store tokens in cookies
        Cookies.set("accessToken", accessToken, { expires: 1 }); // 1 day
        Cookies.set("refreshToken", refreshToken, { expires: 7 }); // 7 days
        Cookies.set("user", JSON.stringify(user), { expires: 7 });

        return { user, accessToken, refreshToken };
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with local cleanup even if API fails
    } finally {
      // Always clear local storage
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      Cookies.remove("user");
      toast.success("Logged out successfully");
    }
  }

  /**
   * Register new user
   * @param {Object} userData
   */
  async register(userData) {
    try {
      const response = await authAPI.register(userData);

      if (response.data.success) {
        toast.success("User registered successfully!");
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Registration failed";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Verify current token
   */
  async verifyToken() {
    try {
      const response = await authAPI.verifyToken();
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Change password
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword);

      if (response.data.success) {
        toast.success("Password changed successfully!");
        return true;
      } else {
        throw new Error(response.data.message || "Password change failed");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Password change failed";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get active sessions
   */
  async getSessions() {
    try {
      const response = await authAPI.getSessions();
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch sessions";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Revoke a specific session
   * @param {string} sessionId
   */
  async revokeSession(sessionId) {
    try {
      const response = await authAPI.revokeSession(sessionId);

      if (response.data.success) {
        toast.success("Session revoked successfully");
        return true;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to revoke session";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Revoke all sessions
   */
  async revokeAllSessions() {
    try {
      const response = await authAPI.revokeAllSessions();

      if (response.data.success) {
        toast.success("All sessions revoked successfully");
        return true;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to revoke sessions";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get current user from cookies
   */
  getCurrentUser() {
    try {
      const userCookie = Cookies.get("user");
      return userCookie ? JSON.parse(userCookie) : null;
    } catch (error) {
      console.error("Error parsing user cookie:", error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!Cookies.get("accessToken");
  }

  /**
   * Get user's role
   */
  getUserRole() {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  /**
   * Generate recovery keys for PLATFORM_ADMIN
   * @param {string} userId - User ID
   * @returns {Promise<{recoveryKeys: string[]}>}
   */
  async generateRecoveryKeys(userId) {
    try {
      const response = await authAPI.post("/auth/generate-recovery-keys", { userId });

      if (response.data.success) {
        toast.success("Recovery keys generated successfully!");
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to generate recovery keys");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to generate recovery keys";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Forgot password - use recovery key to reset
   * @param {string} username
   * @param {string} recoveryKey
   * @returns {Promise<{tempPassword: string, newRecoveryKeys: string[]}>}
   */
  async forgotPassword(username, recoveryKey) {
    try {
      const deviceInfo = {
        ipAddress: "browser", // Will be detected on backend
        userAgent: navigator.userAgent,
      };

      const response = await authAPI.post("/auth/forgot-password", {
        username,
        recoveryKey,
        deviceInfo,
      });

      if (response.data.success) {
        toast.success("Password reset successful!");
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Password reset failed");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Password reset failed";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export default new AuthFacade();
