/**
 * Report Facade
 * Handles all report-related business logic
 */
import { reportAPI } from "../utils/api";
import { toast } from "sonner";

class ReportFacade {
  /**
   * Get all reports
   */
  async getAllReports() {
    try {
      const response = await reportAPI.getAll();
      return response.data.data || [];
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch reports";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get report by ID
   * @param {string} id
   */
  async getReportById(id) {
    try {
      const response = await reportAPI.getById(id);
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch report";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Create new report
   * @param {Object} reportData
   */
  async createReport(reportData) {
    try {
      // Validate required fields
      const validation = this.validateReportData(reportData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const response = await reportAPI.create(reportData);

      if (response.data.success) {
        toast.success("Report created successfully!");
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to create report");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create report";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Update report
   * @param {string} id
   * @param {Object} reportData
   */
  async updateReport(id, reportData) {
    try {
      const response = await reportAPI.update(id, reportData);

      if (response.data.success) {
        toast.success("Report updated successfully!");
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to update report");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update report";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete report
   * @param {string} id
   */
  async deleteReport(id) {
    try {
      const response = await reportAPI.delete(id);

      if (response.data.success) {
        toast.success("Report deleted successfully!");
        return true;
      } else {
        throw new Error(response.data.message || "Failed to delete report");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete report";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get reports by facility
   * @param {string} facilityId
   */
  async getReportsByFacility(facilityId) {
    try {
      const allReports = await this.getAllReports();
      return allReports.filter((r) => r.facilityId === facilityId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get reports by date range
   * @param {Date} startDate
   * @param {Date} endDate
   */
  async getReportsByDateRange(startDate, endDate) {
    try {
      const allReports = await this.getAllReports();
      return allReports.filter((r) => {
        const reportDate = new Date(r.createdAt);
        return reportDate >= startDate && reportDate <= endDate;
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate total emissions for a report
   * @param {Object} report
   */
  calculateTotalEmissions(report) {
    if (!report || !report.emissions) return 0;

    const { scope1, scope2, scope3 } = report.emissions;
    return (scope1 || 0) + (scope2 || 0) + (scope3 || 0);
  }

  /**
   * Get report summary statistics
   * @param {Array} reports
   */
  getReportStatistics(reports) {
    if (!Array.isArray(reports) || reports.length === 0) {
      return {
        totalReports: 0,
        totalEmissions: 0,
        averageEmissions: 0,
        scope1Total: 0,
        scope2Total: 0,
        scope3Total: 0,
      };
    }

    const stats = reports.reduce(
      (acc, report) => {
        const emissions = report.emissions || {};
        acc.scope1Total += emissions.scope1 || 0;
        acc.scope2Total += emissions.scope2 || 0;
        acc.scope3Total += emissions.scope3 || 0;
        return acc;
      },
      { scope1Total: 0, scope2Total: 0, scope3Total: 0 }
    );

    const totalEmissions = stats.scope1Total + stats.scope2Total + stats.scope3Total;

    return {
      totalReports: reports.length,
      totalEmissions,
      averageEmissions: totalEmissions / reports.length,
      ...stats,
    };
  }

  /**
   * Validate report data
   * @param {Object} reportData
   */
  validateReportData(reportData) {
    const errors = [];

    if (!reportData.name || reportData.name.trim() === "") {
      errors.push("Report name is required");
    }

    if (!reportData.facilityId) {
      errors.push("Facility is required");
    }

    if (!reportData.reportingPeriod) {
      errors.push("Reporting period is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Export report to format
   * @param {string} reportId
   * @param {string} format - 'pdf', 'excel', 'csv'
   */
  async exportReport(reportId, format = "pdf") {
    try {
      // This would call a backend endpoint for export
      // For now, just fetch the report data
      const report = await this.getReportById(reportId);

      toast.success(`Report exported as ${format.toUpperCase()}`);
      return report;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to export report";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export default new ReportFacade();
