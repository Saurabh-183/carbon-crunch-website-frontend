import React, { useState, useEffect, useCallback } from "react";
import { Plus, Building2, Search } from "lucide-react";
import { toast } from "sonner";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { FacilityList } from "../../features/organizationAdmin/facilities";
import { DEFAULT_FACILITY_FORM } from "../../config/constants";
import FacilityModal from "../../features/organizationAdmin/facilities/FacilityModal";
import ConfirmModal from "../../components/modals/ConfirmModal";
import Loader from "../../components/rf/Loader";
import { getSiteUnitLabel, isServiceSectorIndustry } from "../../utils/uiTerminology";

const OrgFacilities2 = () => {
  const { user } = useAuth();
  const organizationId = user?.organizationId?._id || user?.organizationId || "";
  const userIndustry = user?.organizationId?.industry || user?.organizationIndustry || "";
  const [resolvedIndustry, setResolvedIndustry] = useState(userIndustry);
  const industry = resolvedIndustry || userIndustry;
  const isHeadRole = user?.role === "HEAD";
  const isServiceSector = isServiceSectorIndustry(industry);
  const siteUnitLabel = getSiteUnitLabel(industry, "singular", user?.role);
  const siteUnitPlural = getSiteUnitLabel(industry, "plural", user?.role);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FACILITY_FORM);
  const [error, setError] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFacilities();
  }, [organizationId]);

  useEffect(() => {
    const fetchOrganizationIndustry = async () => {
      if (!organizationId) return;

      try {
        const res = await api.get(`/api/organizations/${organizationId}`);
        const org = res.data?.data || res.data;
        if (org?.industry) {
          setResolvedIndustry(org.industry);
        }
      } catch (error) {
        console.error("Error fetching organization industry:", error);
      }
    };

    fetchOrganizationIndustry();
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
      // console.log("Fetched facilities:", facilitiesData);
      setFacilities(Array.isArray(facilitiesData) ? facilitiesData : []);

      if (!resolvedIndustry && Array.isArray(facilitiesData) && facilitiesData.length > 0) {
        const orgIndustryFromFacility = facilitiesData[0]?.organizationId?.industry || facilitiesData[0]?.organizationIndustry;
        if (orgIndustryFromFacility) {
          setResolvedIndustry(orgIndustryFromFacility);
        }
      }
    } catch (error) {
      console.error("Error fetching facilities:", error);
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = useCallback((facility = null) => {
    if (facility) {
      setEditingFacility(facility);
      const existingHeads = facility.facilityHeads?.length ? [facility.facilityHeads[0]] : [{ name: "", email: "" }];
      setFormData({
        name: facility.facilityName || facility.name || "",
        addressLine1: facility.facilityAddress || facility.address || "",
        addressLine2: facility.facilityAddressLine2 || "",
        city: facility.facilityCity || "",
        state: facility.facilityState || facility.state || "",
        postalCode: facility.facilityPostalCode || "",
        country: "India",
        type: facility.type || "",
        facilityArea: facility.facilityArea ?? "",
        facilityHeads: existingHeads,
      });
    } else {
      setEditingFacility(null);
      setFormData(DEFAULT_FACILITY_FORM);
    }
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingFacility(null);
    setFormData(DEFAULT_FACILITY_FORM);
    setError("");
  }, []);

  const updateHead = (index, key, value) => {
    setFormData((prev) => {
      const heads = [...prev.facilityHeads];
      heads[index] = { ...heads[index], [key]: value };
      return { ...prev, facilityHeads: heads };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError(`${siteUnitLabel} name is required`);
      return;
    }
    if (formData.facilityArea === "") {
      setError(`${siteUnitLabel} area is required`);
      return;
    }

    const locationParts = [formData.city, formData.state, formData.postalCode].filter(Boolean).join(", ");
    const payload = {
      name: formData.name.trim(),
      address: formData.addressLine1,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      city: formData.city,
      postalCode: formData.postalCode,
      state: formData.state,
      location: locationParts,
      type: formData.type,
      facilityArea: formData.facilityArea,
      facilityHeads: formData.facilityHeads.filter((head) => head.name || head.email),
      organizationId,
      ...(user?.role === "REGION_ADMIN" && user?.regionId ? { regionId: user.regionId?._id || user.regionId } : {}),
    };

    try {
      const action = editingFacility ? `Updating ${siteUnitLabel.toLowerCase()}...` : `Creating ${siteUnitLabel.toLowerCase()}...`;
      const loadingToast = toast.loading(action);

      if (editingFacility) {
        await api.put(`/api/facilities/${editingFacility._id}`, payload);
        toast.dismiss(loadingToast);
        toast.success(`${siteUnitLabel} updated successfully!`);
      } else {
        await api.post("/api/facilities", payload);
        toast.dismiss(loadingToast);
        toast.success(`${siteUnitLabel} created successfully!`);
      }
      fetchFacilities();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    setFacilityToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/api/facilities/${facilityToDelete}`);
      toast.success(`${siteUnitLabel} deleted successfully!`);
      fetchFacilities();
      setDeleteModalOpen(false);
      setFacilityToDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  // const boundaryConfigured = (facility) => {
  //   const boundary = facility.boundarySettings;
  //   return Boolean(boundary && (boundary.operationalControl || boundary.financialControl || (boundary.equityShare ?? 0) > 0));
  // };

  const filteredFacilities = facilities.filter((facility) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    const searchableText = [facility.facilityName, facility.name, facility.facilityAddress, facility.address, facility.facilityLocation, facility.location, facility.type]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });

  useEffect(() => {
    const handleTourStep = (event) => {
      const stepIndex = event?.detail?.stepIndex ?? -1;
      if (stepIndex >= 8 && stepIndex <= 12) {
        if (!showModal) {
          openModal();
        }
      } else if (showModal && (stepIndex < 8 || stepIndex > 12)) {
        closeModal();
      }
    };

    window.addEventListener("orgAdminTourStep", handleTourStep);
    return () => {
      window.removeEventListener("orgAdminTourStep", handleTourStep);
    };
  }, [showModal, openModal, closeModal]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="flex flex-col mb-4 md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-green-200 to-green-700 p-3 rounded-xl">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{siteUnitPlural}</h1>
            <p className="text-md text-gray-500">
              Manage {siteUnitPlural.toLowerCase()} in your {isHeadRole && isServiceSector ? "organization" : "organization"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${siteUnitPlural.toLowerCase()}...`}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 tour-facility-search"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-200 tour-facility-add-button"
          >
            <Plus className="w-4 h-4" />
            Add {siteUnitLabel}
          </button>
        </div>
      </div>

      {/* facility cards */}
      <FacilityList facilities={filteredFacilities} onEdit={openModal} onDelete={handleDelete} siteUnitLabel={siteUnitLabel} />

      <FacilityModal
        showModal={showModal}
        editingFacility={editingFacility}
        formData={formData}
        setFormData={setFormData}
        error={error}
        onSubmit={handleSubmit}
        onClose={closeModal}
        siteUnitLabel={siteUnitLabel}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        processing={deleting}
        title={`Delete ${siteUnitLabel}`}
        description={`Are you sure you want to delete this ${siteUnitLabel.toLowerCase()}? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous
      />
    </div>
  );
};

export default OrgFacilities2;
