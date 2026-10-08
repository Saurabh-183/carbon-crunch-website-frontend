import { useState, useEffect } from "react";
import api from "../../../../utils/api";

/**
 * Custom hook to fetch and manage reports data
 * @param {string} organizationId - The organization ID
 * @returns {Object} - Reports data and loading state
 */
export const useReportsData = (organizationId) => {
  const [reports, setReports] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [approvedData, setApprovedData] = useState([]);
  const [productAllocationsByFacility, setProductAllocationsByFacility] = useState({});
  const [loading, setLoading] = useState(true);

  const resolvedOrganizationId = typeof organizationId === "object" ? organizationId?._id : organizationId;

  const fetchData = async () => {
    try {
      const [reportsRes, facilitiesRes, approvedRes] = await Promise.all([
        api.get(`/api/reports?organizationId=${resolvedOrganizationId}&includeDetails=true&limit=100`),
        api.get(`/api/facilities?organizationId=${resolvedOrganizationId}`),
        api.get("/api/submissions/approved-data"),
      ]);

      setReports(reportsRes.data?.data || []);

      const facilitiesData = facilitiesRes.data?.data?.facilities || facilitiesRes.data?.data || [];
      setFacilities(facilitiesData);

      setApprovedData(approvedRes.data?.data || []);

      if (facilitiesData.length) {
        const allocationsResults = await Promise.all(
          facilitiesData.map(async (facility) => {
            try {
              const res = await api.get(`/api/product-allocations?facilityId=${facility._id}`);
              return {
                facilityId: facility._id,
                allocations: res.data?.data || [],
              };
            } catch (error) {
              console.error("Error fetching product allocations:", error);
              return { facilityId: facility._id, allocations: [] };
            }
          }),
        );

        const allocationMap = allocationsResults.reduce((acc, entry) => {
          acc[entry.facilityId] = entry.allocations;
          return acc;
        }, {});

        setProductAllocationsByFacility(allocationMap);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resolvedOrganizationId) {
      fetchData();
    }
  }, [resolvedOrganizationId]);

  const consolidatedReports = reports.filter((report) => report.reportData?.reportType === "ORG_CONSOLIDATED" || report.reportData?.reportType === "RCO" || report.reportData?.reportType === "CBAM");

  return {
    reports,
    facilities,
    approvedData,
    productAllocationsByFacility,
    loading,
    consolidatedReports,
    refetch: fetchData,
  };
};
