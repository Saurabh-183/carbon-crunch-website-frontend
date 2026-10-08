/**
 * Facility Facade
 * Handles all facility-related business logic
 */
import { facilityAPI } from "../utils/api";
import { toast } from "sonner";

class FacilityFacade {
  /**
   * Get all facilities
   */
  async getAllFacilities() {
    try {
      const response = await facilityAPI.getAll();
      return response.data.data || [];
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch facilities";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get facility by ID
   * @param {string} id
   */
  async getFacilityById(id) {
    try {
      const response = await facilityAPI.getById(id);
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch facility";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get facilities by organization
   * @param {string} organizationId
   */
  async getFacilitiesByOrganization(organizationId) {
    try {
      const response = await facilityAPI.getByOrganization(organizationId);
      return { data: response.data.data || [] };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch facilities";
      console.error(errorMessage);
      // Don't show toast for this method as it's used in background fetching
      return { data: [] };
    }
  }

  /**
   * Create new facility
   * @param {Object} facilityData
   */
  async createFacility(facilityData) {
    try {
      // Validate required fields
      if (!facilityData.name || !facilityData.organizationId) {
        throw new Error("Facility name and organization are required");
      }

      const response = await facilityAPI.create(facilityData);

      if (response.data.success) {
        toast.success("Facility created successfully!");
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to create facility");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create facility";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Update facility
   * @param {string} id
   * @param {Object} facilityData
   */
  async updateFacility(id, facilityData) {
    try {
      const response = await facilityAPI.update(id, facilityData);

      if (response.data.success) {
        toast.success("Facility updated successfully!");
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to update facility");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update facility";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete facility
   * @param {string} id
   */
  async deleteFacility(id) {
    try {
      const response = await facilityAPI.delete(id);

      if (response.data.success) {
        toast.success("Facility deleted successfully!");
        return true;
      } else {
        throw new Error(response.data.message || "Failed to delete facility");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete facility";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get facilities by organization
   * @param {string} organizationId
   */
  async getFacilitiesByOrganization(organizationId) {
    try {
      const allFacilities = await this.getAllFacilities();
      return allFacilities.filter((f) => f.organizationId === organizationId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate facility data
   * @param {Object} facilityData
   */
  validateFacilityData(facilityData) {
    const errors = [];

    if (!facilityData.name || facilityData.name.trim() === "") {
      errors.push("Facility name is required");
    }

    if (!facilityData.organizationId) {
      errors.push("Organization is required");
    }

    if (facilityData.name && facilityData.name.length > 100) {
      errors.push("Facility name must be less than 100 characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default new FacilityFacade();
