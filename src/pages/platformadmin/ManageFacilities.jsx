import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Factory, Filter, X, Building2, MapPin, Globe, Ruler, Building, Map } from "lucide-react";
import api from "../../utils/api";
import Loader from "../../components/rf/Loader";
import { getSiteUnitLabel } from "../../utils/uiTerminology";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";

const ManageFacilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    organizationId: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    type: "",
    facilityArea: "",
    facilityHeads: [{ name: "", email: "" }],
  });
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("All");
  const [showOrgFilterDropdown, setShowOrgFilterDropdown] = useState(false);

  const STATE_OPTIONS = [
    "Andaman and Nicobar Islands",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chandigarh",
    "Chhattisgarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Ladakh",
    "Lakshadweep",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Puducherry",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [facilitiesRes, orgsRes] = await Promise.all([api.get("/api/facilities"), api.get("/api/organizations")]);
      // Handle different API response structures
      const facilitiesData = facilitiesRes.data?.data?.facilities || facilitiesRes.data?.data || [];
      const orgsData = orgsRes.data?.data?.organizations || orgsRes.data?.data || [];

      console.log("Fetched organizations for dropdown:", orgsData);

      setFacilities(Array.isArray(facilitiesData) ? facilitiesData : []);
      setOrganizations(Array.isArray(orgsData) ? orgsData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setFacilities([]);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (formData.facilityArea === "") {
        const selectedOrg = organizations.find((org) => org._id === formData.organizationId);
        const selectedSiteUnit = getSiteUnitLabel(selectedOrg?.industry || "");
        setError(`${selectedSiteUnit} area is required`);
        return;
      }
      const locationParts = [formData.city, formData.state, formData.postalCode].filter(Boolean).join(", ");
      const payload = {
        name: formData.name,
        organizationId: formData.organizationId,
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
      };
      if (editingFacility) {
        await api.put(`/api/facilities/${editingFacility._id}`, payload);
      } else {
        await api.post("/api/facilities", payload);
      }
      fetchData();
      closeModal();
    } catch (error) {
      setError(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/facilities/${deleteId}`);
      fetchData();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      setDeleteError(error.response?.data?.message || "Delete failed");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
    setDeleteError("");
  };

  const openModal = (facility = null) => {
    if (facility) {
      setEditingFacility(facility);
      const existingHeads = facility.facilityHeads?.length ? [facility.facilityHeads[0]] : [{ name: "", email: "" }];
      setFormData({
        name: facility.facilityName || facility.name || "",
        organizationId: facility.organizationId?._id || facility.organizationId || "",
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
      setFormData({
        name: "",
        organizationId: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        type: "",
        facilityArea: "",
        facilityHeads: [{ name: "", email: "" }],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFacility(null);
    setFormData({
      name: "",
      organizationId: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      type: "",
      facilityArea: "",
      facilityHeads: [{ name: "", email: "" }],
    });
    setError("");
  };

  const updateHead = (index, key, value) => {
    setFormData((prev) => {
      const heads = [...prev.facilityHeads];
      heads[index] = { ...heads[index], [key]: value };
      return { ...prev, facilityHeads: heads };
    });
  };

  const getOrgName = (facility) => {
    if (typeof facility.organizationId === "object") {
      return facility.organizationId?.name || "N/A";
    }
    const org = organizations.find((o) => o._id === facility.organizationId);
    return org?.name || "N/A";
  };

  const filteredFacilities = facilities.filter((f) => (f.facilityName || f.name || "").toLowerCase().includes(searchTerm.toLowerCase()));

  const uniqueOrganizations = React.useMemo(() => {
    const orgNames = facilities.map((facility) => getOrgName(facility)).filter((name) => name !== "N/A");
    const sortedOrgs = [...new Set(orgNames)].sort();
    return ["All", ...sortedOrgs];
  }, [facilities, organizations]);

  const displayFacilities = filteredFacilities.filter((facility) => {
    if (organizationFilter === "All") return true;
    return getOrgName(facility) === organizationFilter;
  });

  const selectedOrgByFilter = organizationFilter !== "All" ? organizations.find((org) => org.name === organizationFilter) : null;
  const selectedOrgByForm = organizations.find((org) => org._id === formData.organizationId);
  const contextIndustry = selectedOrgByForm?.industry || selectedOrgByFilter?.industry || "";
  const siteUnitLabel = getSiteUnitLabel(contextIndustry);
  const siteUnitPlural = siteUnitLabel === "Branch" ? "Branches" : "Facilities";

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 mb-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-green-200 to-green-700 p-3 rounded-xl">
            <Factory className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{siteUnitPlural}</h1>
            <p className="text-md text-gray-500">Manage all {siteUnitPlural.toLowerCase()} across organizations</p>
          </div>
        </div>

        <div className="flex  items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search by ${siteUnitLabel.toLowerCase()} name...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 transition-all min-w-[280px]"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-200"
          >
            <Plus className="w-4 h-4" />
            Add {siteUnitLabel}
          </button>
        </div>
      </div>

      {/* Table */}
      {/* Table Section */}
      <TooltipProvider>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="min-w-[1000px] w-full text-left border-collapse">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">Name</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span>Organization</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowOrgFilterDropdown(!showOrgFilterDropdown);
                            }}
                            className={`
                              p-1 rounded-md transition-all focus:outline-none
                              ${organizationFilter !== "All" ? "bg-green-100 text-green-700" : "text-gray-400 hover:bg-gray-200 hover:text-gray-700"}
                            `}
                            id="org-filter-btn"
                          >
                            <Filter size={14} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Filter by Organization</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">Address</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">Type</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">Area</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayFacilities.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                          <Factory className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-md font-medium text-gray-900">No {siteUnitPlural.toLowerCase()} found</h3>
                        <p className="text-sm text-gray-400 mt-1">{organizationFilter !== "All" ? `No results for organization "${organizationFilter}"` : "Try adjusting your search terms"}</p>
                        {organizationFilter !== "All" && (
                          <button onClick={() => setOrganizationFilter("All")} className="mt-3 text-xs text-green-600 font-medium hover:underline">
                            Clear Filter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayFacilities.map((facility) => (
                    <tr key={facility._id} className="hover:bg-gray-100/80 transition-colors group">
                      {/* Name Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-900 group-hover:text-green-700 transition-colors">{facility.facilityName || facility.name || "-"}</span>
                        </div>
                      </td>

                      {/* Organization Column */}
                      <td className="px-6 py-4 ">
                        <div className="flex items-center gap-2 max-w-[200px] text-gray-600">
                          <span className="text-sm">{getOrgName(facility)}</span>
                        </div>
                      </td>

                      {/* Address Column */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600  max-w-[200px]" title={facility.facilityAddress || facility.address}>
                          {facility.facilityAddress || facility.address || "-"}
                          {(facility.facilityLocation || facility.location) && (
                            <span className="text-gray-400 ml-1">
                              {" "}
                              <br />({facility.facilityLocation || facility.location})
                            </span>
                          )}
                        </p>
                      </td>

                      {/* Type Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">{facility.type || "General"}</span>
                      </td>

                      {/* Area Column */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{facility.facilityArea ? `${facility.facilityArea} sq ft` : "-"}</td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={() => openModal(facility)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                <Edit className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit {siteUnitLabel}</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={() => handleDelete(facility._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete {siteUnitLabel}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </TooltipProvider>

      {/* Organization Filter Dropdown - Positioned outside table */}
      {showOrgFilterDropdown && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setShowOrgFilterDropdown(false)} />
          <div
            className="fixed w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-[101] max-h-[350px] overflow-y-auto"
            style={{
              top: document.getElementById("org-filter-btn")?.getBoundingClientRect().bottom + 8 + "px",
              left: document.getElementById("org-filter-btn")?.getBoundingClientRect().left + "px",
            }}
          >
            <div className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 bg-gray-50/50 sticky top-0 backdrop-blur-sm z-10">Select Organization</div>
            {uniqueOrganizations.map((org) => (
              <button
                key={org}
                onClick={() => {
                  setOrganizationFilter(org);
                  setShowOrgFilterDropdown(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-gray-50 transition-colors flex items-center justify-between
                  ${organizationFilter === org ? "text-green-700 bg-green-50/50" : "text-gray-600"}
                `}
              >
                <span>{org}</span>
                {organizationFilter === org && <span className="w-1.5 h-1.5 rounded-full bg-green-600" />}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop with Blur */}
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={closeModal} />
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden relative z-10 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{editingFacility ? `Edit ${siteUnitLabel}` : `New ${siteUnitLabel}`}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingFacility ? `Update the ${siteUnitLabel.toLowerCase()} information` : `Add a new ${siteUnitLabel.toLowerCase()} to your organization`}
                </p>
              </div>
              <button onClick={closeModal} className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-8 py-6">
              {error && (
                <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} id="facility-form">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {siteUnitLabel} Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          placeholder={`Enter ${siteUnitLabel.toLowerCase()} name`}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.organizationId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              organizationId: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          required
                        >
                          <option value="">Select an organization</option>
                          {organizations.map((org) => (
                            <option key={org._id} value={org._id}>
                              {org.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{siteUnitLabel} Type</label>
                        <input
                          type="text"
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          placeholder="e.g., Manufacturing, Office"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Area (sq ft) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.facilityArea}
                          onChange={(e) => setFormData({ ...formData, facilityArea: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          placeholder="0"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">Address Details</h3>
                    <div className="grid grid-cols-1 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                        <input
                          type="text"
                          value={formData.addressLine1}
                          onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          placeholder="Building number, Street name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                        <input
                          type="text"
                          value={formData.addressLine2}
                          onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          placeholder="Area, Landmark (optional)"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                            placeholder="City name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">State / UT</label>
                          <select
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          >
                            <option value="">Select State/UT</option>
                            {STATE_OPTIONS.map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                          <input
                            type="text"
                            value={formData.postalCode}
                            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                            placeholder="6-digit PIN code"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                          <input type="text" value={formData.country} disabled className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="facility-form"
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-200 transition-all active:scale-95"
              >
                {editingFacility ? `Update ${siteUnitLabel}` : `Create ${siteUnitLabel}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this {siteUnitLabel.toLowerCase()}? This action cannot be undone.</p>
            {deleteError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{deleteError}</div>}
            <div className="flex justify-end gap-3">
              <button onClick={cancelDelete} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFacilities;
