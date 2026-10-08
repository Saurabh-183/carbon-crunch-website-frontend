/**
 * User Facade
 * Handles all user management business logic
 */
import api from "../utils/api";
import { toast } from "sonner";

class UserFacade {
  /**
   * Get all users
   */
  async getAllUsers() {
    try {
      const response = await api.get("/api/users");
      return response.data.data || [];
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch users";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get user by ID
   * @param {string} id
   */
  async getUserById(id) {
    try {
      const response = await api.get(`/api/users/${id}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch user";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Create new user
   * @param {Object} userData
   */
  async createUser(userData) {
    try {
      // Validate required fields
      const validation = this.validateUserData(userData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const response = await api.post("/api/users", userData);

      if (response.data.success) {
        toast.success("User created successfully!");
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to create user");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create user";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Update user
   * @param {string} id
   * @param {Object} userData
   */
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/api/users/${id}`, userData);

      if (response.data.success) {
        toast.success("User updated successfully!");
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to update user");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update user";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete user
   * @param {string} id
   */
  async deleteUser(id) {
    try {
      const response = await api.delete(`/api/users/${id}`);

      if (response.data.success) {
        toast.success("User deleted successfully!");
        return true;
      } else {
        throw new Error(response.data.message || "Failed to delete user");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete user";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get users by organization
   * @param {string} organizationId
   */
  async getUsersByOrganization(organizationId) {
    try {
      const allUsers = await this.getAllUsers();
      return allUsers.filter((u) => u.organizationId === organizationId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get users by role
   * @param {string} role
   */
  async getUsersByRole(role) {
    try {
      const allUsers = await this.getAllUsers();
      return allUsers.filter((u) => u.role === role);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get users by facility
   * @param {string} facilityId
   */
  async getUsersByFacility(facilityId) {
    try {
      const allUsers = await this.getAllUsers();
      return allUsers.filter((u) => u.facilities && u.facilities.some((f) => f.facilityId === facilityId));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Assign user to facility
   * @param {string} userId
   * @param {string} facilityId
   * @param {string} role
   */
  async assignUserToFacility(userId, facilityId, role) {
    try {
      const response = await api.post(`/api/users/${userId}/facilities`, {
        facilityId,
        role,
      });

      if (response.data.success) {
        toast.success("User assigned to facility successfully!");
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to assign user to facility");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to assign user";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Remove user from facility
   * @param {string} userId
   * @param {string} facilityId
   */
  async removeUserFromFacility(userId, facilityId) {
    try {
      const response = await api.delete(`/api/users/${userId}/facilities/${facilityId}`);

      if (response.data.success) {
        toast.success("User removed from facility successfully!");
        return true;
      } else {
        throw new Error(response.data.message || "Failed to remove user from facility");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to remove user";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Update user status
   * @param {string} userId
   * @param {string} status - 'active', 'inactive', 'suspended'
   */
  async updateUserStatus(userId, status) {
    try {
      const response = await api.patch(`/api/users/${userId}/status`, { status });

      if (response.data.success) {
        toast.success(`User status updated to ${status}`);
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to update user status");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update status";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate user data
   * @param {Object} userData
   */
  validateUserData(userData) {
    const errors = [];

    if (!userData.username || userData.username.trim() === "") {
      errors.push("Username is required");
    }

    if (userData.username && (userData.username.length < 3 || userData.username.length > 30)) {
      errors.push("Username must be between 3 and 30 characters");
    }

    if (!userData.role) {
      errors.push("Role is required");
    }

    if (userData.role !== "PLATFORM_ADMIN" && !userData.organizationId) {
      errors.push("Organization is required for this role");
    }

    if (userData.email && !this.isValidEmail(userData.email)) {
      errors.push("Invalid email format");
    }

    if (userData.password && userData.password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   * @param {string} email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get user statistics
   * @param {Array} users
   */
  getUserStatistics(users) {
    if (!Array.isArray(users) || users.length === 0) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        suspendedUsers: 0,
        byRole: {},
      };
    }

    const byRole = users.reduce((acc, user) => {
      const role = user.role || "unknown";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    const activeUsers = users.filter((u) => u.status === "active").length;
    const inactiveUsers = users.filter((u) => u.status === "inactive").length;
    const suspendedUsers = users.filter((u) => u.status === "suspended").length;

    return {
      totalUsers: users.length,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      byRole,
    };
  }
}

export default new UserFacade();
