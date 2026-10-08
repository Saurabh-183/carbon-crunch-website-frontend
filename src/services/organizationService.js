import axios from "axios";
import { resolveBaseUrl } from "../utils/baseUrl";

const API_URL = `${resolveBaseUrl()}/api`;

/**
 * Organization Service
 * Handles all HTTP requests to the Organization API
 */

/**
 * Get all organizations with pagination, search, and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search term
 * @param {string} params.industry - Filter by industry
 * @param {string} params.status - Filter by status
 * @param {string} params.sortBy - Sort field (default: name)
 * @param {string} params.sortOrder - Sort order (asc/desc)
 * @returns {Promise<Object>} Response with organizations array and pagination
 */
export const getAllOrganizations = async (params = {}) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.get(`${API_URL}/organizations`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching organizations:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get organization by ID
 * @param {string} id - Organization ID
 * @returns {Promise<Object>} Organization details
 */
export const getOrganizationById = async (id) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.get(`${API_URL}/organizations/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching organization:", error);
    throw error.response?.data || error;
  }
};

/**
 * Create new organization
 * @param {Object} organizationData - Organization data
 * @returns {Promise<Object>} Created organization
 */
export const createOrganization = async (organizationData) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.post(`${API_URL}/organizations`, organizationData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating organization:", error);
    throw error.response?.data || error;
  }
};

/**
 * Update organization
 * @param {string} id - Organization ID
 * @param {Object} updates - Updated fields
 * @returns {Promise<Object>} Updated organization
 */
export const updateOrganization = async (id, updates) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.patch(`${API_URL}/organizations/${id}`, updates, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating organization:", error);
    throw error.response?.data || error;
  }
};

/**
 * Delete organization
 * @param {string} id - Organization ID
 * @returns {Promise<Object>} Success message
 */
export const deleteOrganization = async (id) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.delete(`${API_URL}/organizations/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting organization:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get organization statistics
 * @param {string} id - Organization ID
 * @returns {Promise<Object>} Organization statistics
 */
export const getOrganizationStats = async (id) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.get(`${API_URL}/organizations/${id}/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching organization stats:", error);
    throw error.response?.data || error;
  }
};

/**
 * Toggle organization status
 * @param {string} id - Organization ID
 * @param {string} status - New status (active/inactive/suspended)
 * @returns {Promise<Object>} Updated organization
 */
export const toggleOrganizationStatus = async (id, status) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.patch(
      `${API_URL}/organizations/${id}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error toggling organization status:", error);
    throw error.response?.data || error;
  }
};

export default {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationStats,
  toggleOrganizationStatus,
};
