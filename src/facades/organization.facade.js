/**
 * Organization Facade
 * Handles all organization-related business logic
 * Components should use this facade instead of calling API directly
 */
import axios from "axios";
import Cookies from "js-cookie";
import { resolveBaseUrl } from "../utils/baseUrl";

const API_URL = `${resolveBaseUrl()}/api`;

class OrganizationFacade {
  /**
   * Get authorization headers
   */
  getHeaders() {
    const token = Cookies.get("accessToken");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Get all organizations (PLATFORM_ADMIN only)
   * @returns {Promise<{data: Array}>}
   */
  async getAllOrganizations() {
    try {
      const response = await axios.get(`${API_URL}/organizations`, {
        headers: this.getHeaders(),
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch organizations");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch organizations";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get organization by ID
   * @param {string} organizationId
   * @returns {Promise<{data: Object}>}
   */
  async getOrganizationById(organizationId) {
    try {
      const response = await axios.get(`${API_URL}/organizations/${organizationId}`, {
        headers: this.getHeaders(),
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch organization");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch organization";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Create new organization (PLATFORM_ADMIN only)
   * @param {Object} organizationData
   * @returns {Promise<{data: Object}>}
   */
  async createOrganization(organizationData) {
    try {
      // Validate required fields
      if (!organizationData.name) {
        throw new Error("Organization name is required");
      }
      if (!organizationData.industry) {
        throw new Error("Industry is required");
      }
      if (!organizationData.address) {
        throw new Error("Address is required");
      }
      if (!organizationData.contactEmail) {
        throw new Error("Contact email is required");
      }

      const response = await axios.post(`${API_URL}/organizations`, organizationData, {
        headers: this.getHeaders(),
      });

      if (response.data.success) {
        toast.success("Organization created successfully!");
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to create organization");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create organization";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Update organization (PLATFORM_ADMIN only)
   * @param {string} organizationId
   * @param {Object} updateData
   * @returns {Promise<{data: Object}>}
   */
  async updateOrganization(organizationId, updateData) {
    try {
      const response = await axios.patch(`${API_URL}/organizations/${organizationId}`, updateData, {
        headers: this.getHeaders(),
      });

      if (response.data.success) {
        toast.success("Organization updated successfully!");
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to update organization");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update organization";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete organization (PLATFORM_ADMIN only)
   * @param {string} organizationId
   * @returns {Promise<{data: Object}>}
   */
  async deleteOrganization(organizationId) {
    try {
      const response = await axios.delete(`${API_URL}/organizations/${organizationId}`, {
        headers: this.getHeaders(),
      });

      if (response.data.success) {
        toast.success("Organization deleted successfully!");
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to delete organization");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete organization";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get organization statistics
   * @param {string} organizationId
   * @returns {Promise<{data: Object}>}
   */
  async getOrganizationStats(organizationId) {
    try {
      const response = await axios.get(`${API_URL}/organizations/${organizationId}/stats`, {
        headers: this.getHeaders(),
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch organization statistics");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch organization statistics";
      console.error(errorMessage);
      // Don't show toast for stats errors (non-critical)
      throw new Error(errorMessage);
    }
  }
}

export default new OrganizationFacade();
