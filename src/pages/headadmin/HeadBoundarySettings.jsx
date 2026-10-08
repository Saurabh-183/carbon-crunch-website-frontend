import React, { useState, useEffect } from "react";
import { Settings2Icon } from "lucide-react";
import { toast } from "sonner";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import FacilityGrid from "../../features/organizationAdmin/boundarySettings/FacilityGrid";
import BoundaryModal from "../../features/organizationAdmin/boundarySettings/BoundaryModal";
import { DEFAULT_BOUNDARY_CONFIG, transformScopesForDisplay, transformScopesToBackend } from "../../config/constants";
import SectionHeader from "../../components/rf/Header";
import Loader from "../../components/rf/Loader";
import { getSiteUnitLabel } from "../../utils/uiTerminology";

const HeadBoundarySettings = () => {
  const { user } = useAuth();
  const organizationId = user?.organizationId?._id || user?.organizationId || "";
  const industry = user?.organizationId?.industry || user?.organizationIndustry || "";
  const siteUnitLabel = getSiteUnitLabel(industry, "singular", user?.role);
  const siteUnitPluralLabel = getSiteUnitLabel(industry, "plural", user?.role);
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState("");
  const [boundaryConfig, setBoundaryConfig] = useState({
    boundaryMethod: "",
    equityShare: 0,
    reportingScopes: [],
    systemBoundaries: [],
    systemBoundaryProjects: [],
    systemBoundaryProducts: [],
    reportingPeriod: {
      startDate: "",
      endDate: "",
    },
  });
  const [projectInput, setProjectInput] = useState("");
  const [productInput, setProductInput] = useState("");
  const [orgBoundaryMethods, setOrgBoundaryMethods] = useState([]);
  const [orgReportingScopes, setOrgReportingScopes] = useState([]);
  const [orgSystemBoundaries, setOrgSystemBoundaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const moduleLabel = "Global";

  useEffect(() => {
    fetchFacilities();
  }, [organizationId]);

  useEffect(() => {
    if (organizationId) {
      fetchOrganizationSettings();
    }
  }, [organizationId]);

  const fetchFacilities = async () => {
    try {
      if (!organizationId) {
        setFacilities([]);
        return;
      }

      const res = await api.get(`/api/facilities?organizationId=${organizationId}`);
      // Handle different API response structures
      const facilitiesData = res.data?.data?.facilities || res.data?.data || res.data || [];
      setFacilities(Array.isArray(facilitiesData) ? facilitiesData : []);
    } catch (error) {
      console.error("Error fetching facilities:", error);
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizationSettings = async () => {
    try {
      const res = await api.get(`/api/organizations/${organizationId}`);
      const org = res.data?.data || res.data;
      setOrgBoundaryMethods(org?.complianceSettings?.allowedBoundaryMethods || []);
      // Transform backend scopes to display scopes
      const backendScopes = org?.complianceSettings?.allowedReportingScopes || [];
      setOrgReportingScopes(transformScopesForDisplay(backendScopes));
      setOrgSystemBoundaries(org?.complianceSettings?.allowedSystemBoundaries || []);
    } catch (error) {
      console.error("Error fetching organization settings:", error);
      setOrgBoundaryMethods([]);
      setOrgReportingScopes([]);
      setOrgSystemBoundaries([]);
    }
  };

  const loadBoundaryForFacility = (facilityId) => {
    if (!facilityId) return;
    const facility = facilities.find((f) => f._id === facilityId);
    if (facility?.boundarySettings) {
      const boundary = facility.boundarySettings;
      let selectedBoundary = "";
      if (boundary.operationalControl) selectedBoundary = "Operational Control";
      if (boundary.financialControl) selectedBoundary = "Financial Control";
      if ((boundary.equityShare ?? 0) > 0) selectedBoundary = "Equity Share";

      // Transform backend scopes to display scopes
      const backendScopes = Array.isArray(facility.reportingScopes) ? facility.reportingScopes : [];
      const displayScopes = transformScopesForDisplay(backendScopes);

      setBoundaryConfig({
        boundaryMethod: selectedBoundary,
        equityShare: Number(boundary.equityShare || 0),
        reportingScopes: displayScopes,
        systemBoundaries: Array.isArray(facility.systemBoundaries) ? facility.systemBoundaries : [],
        systemBoundaryProjects: Array.isArray(facility.systemBoundaryProjects) ? facility.systemBoundaryProjects : [],
        systemBoundaryProducts: Array.isArray(facility.systemBoundaryProducts) ? facility.systemBoundaryProducts : [],
        reportingPeriod: {
          startDate: facility.reportingPeriod?.startDate ? facility.reportingPeriod.startDate.split("T")[0] : "",
          endDate: facility.reportingPeriod?.endDate ? facility.reportingPeriod.endDate.split("T")[0] : "",
        },
      });
    } else {
      setBoundaryConfig(DEFAULT_BOUNDARY_CONFIG);
    }
    setProjectInput("");
    setProductInput("");
  };

  const handleFacilitySelect = (facilityId) => {
    setSelectedFacility(facilityId);
    if (facilityId) {
      loadBoundaryForFacility(facilityId);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSave = async () => {
    if (!selectedFacility) {
      toast.error(`Please select a ${siteUnitLabel.toLowerCase()} first`);
      return;
    }

    setSaving(true);

    try {
      // Transform display scopes back to backend scopes
      const backendScopes = transformScopesToBackend(boundaryConfig.reportingScopes);

      await api.put(`/api/facilities/${selectedFacility}`, {
        boundarySettings: {
          operationalControl: boundaryConfig.boundaryMethod === "Operational Control",
          financialControl: boundaryConfig.boundaryMethod === "Financial Control",
          equityShare: boundaryConfig.boundaryMethod === "Equity Share" ? boundaryConfig.equityShare : 0,
        },
        reportingScopes: backendScopes,
        systemBoundaries: boundaryConfig.systemBoundaries,
        systemBoundaryProjects: boundaryConfig.systemBoundaryProjects,
        systemBoundaryProducts: boundaryConfig.systemBoundaryProducts,
        reportingPeriod: {
          startDate: boundaryConfig.reportingPeriod.startDate || null,
          endDate: boundaryConfig.reportingPeriod.endDate || null,
        },
      });
      await fetchFacilities();
      toast.success("Boundary settings saved successfully!");
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save boundary settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <SectionHeader icon={Settings2Icon} title={`${moduleLabel} Boundary Settings`} description={`Select a ${siteUnitLabel} to configure its emission boundary settings.`} />

      {/* Facility Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <FacilityGrid facilities={facilities} selectedFacility={selectedFacility} onFacilitySelect={handleFacilitySelect} siteUnitPluralLabel={siteUnitPluralLabel} />
      </div>

      <BoundaryModal
        showModal={showModal}
        moduleLabel={moduleLabel}
        boundaryConfig={boundaryConfig}
        setBoundaryConfig={setBoundaryConfig}
        orgBoundaryMethods={orgBoundaryMethods}
        orgReportingScopes={orgReportingScopes}
        orgSystemBoundaries={orgSystemBoundaries}
        projectInput={projectInput}
        setProjectInput={setProjectInput}
        productInput={productInput}
        setProductInput={setProductInput}
        saving={saving}
        siteUnitLabel={siteUnitLabel}
        onSave={handleSave}
        onClose={closeModal}
      />
    </div>
  );
};

export default HeadBoundarySettings;
