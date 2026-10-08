import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Building2, Filter, Mail, Phone } from "lucide-react";
import api from "../../utils/api";
import Loader from "../../components/rf/Loader";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";

const CBAM_ELIGIBLE_INDUSTRIES = ["iron and steel", "aluminium", "cement"];

const normalizeIndustryKey = (value = "") => String(value).trim().toLowerCase().replace(/&/g, "and").replace(/\s+/g, " ");

const isCbamEligibleIndustry = (industry = "") => CBAM_ELIGIBLE_INDUSTRIES.includes(normalizeIndustryKey(industry));

const ManageOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    industry: "",
    organizationType: "",
    enabledModules: [],
    GHGProtocolVersion: "GHG Protocol",
    allowedBoundaryMethods: [],
    allowedReportingScopes: [],
    allowedSystemBoundaries: [],
  });
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [typeFilter, setTypeFilter] = useState("All");
  const [showTypeFilterDropdown, setShowTypeFilterDropdown] = useState(false);

  const normalizeModules = (modules = []) => modules.map((module) => (module === "GHG" ? "GHG" : module));

  // Organization type options (matches backend enum)
  const organizationTypes = [
    { value: 1, label: "Corporate" },
    { value: 2, label: "SME" },
    { value: 3, label: "Manufacturing" },
    { value: 4, label: "Services" },
    { value: 5, label: "Government" },
  ];

  // Industry options
  const industries = [
    "Service Sector",
    "Aluminium",
    "Cement",
    // "Commercial Buildings",
    // "Chlor-Alkali",
    // "Electricity Distribution (DISCOMs)",
    // "Fertilizer",
    "Iron and Steel",
    "Pulp and Paper",
    // "Petroleum Refinery",
    // "Petrochemical",
    // "Railways",
    "Textiles",
    // "Petrochemical Manufacturing Units",
    "Sugar",
    // "Chemicals - (i) Alkali Chemical (Soda Ash, Potassium Hydroxide)",
    // "Chemicals - (ii) Inorganic Chemicals",
    //   "Chemicals - (iii) Organic Chemicals",
    //   "Chemicals - (iv) Pesticides (Technical)",
    //   "Chemicals - (v) Dyes and Pigments",
    //   "Chemicals - (vi) Pharmaceuticals (Active Pharmaceutical Ingredient)",
    "Ceramic",
    // "Glass",
    // "Zinc",
    // "Copper",
    // "Port Trust",
    // "Dairy",
    // "Automobile Assembly",
    // "Tyre Manufacturer",
    // "Forging",
    // "Foundry",
    // "Refractories",
    // "Others"
  ];

  const enabledModulesOptions = ["GHG", "RCO", "CBAM", "CCTS", "PAT"];
  const GHGProtocolVersions = ["GHG Protocol", "GHG Protocol v2", "ISO 14064", "IPCC 2006"];
  const boundaryMethods = ["Operational Control", "Financial Control", "Equity Share"];
  const reportingScopes = ["Scope 1", "Scope 2", "Scope 3"];
  const systemBoundaries = ["Organizational level", "Project level", "Product level"];

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await api.get("/api/organizations?page=1&limit=1000&sortBy=name&sortOrder=asc");
      // Handle various API response formats - API returns { data: { organizations: [...] } }
      let orgsData = [];
      if (Array.isArray(res.data)) {
        orgsData = res.data;
      } else if (Array.isArray(res.data?.data?.organizations)) {
        orgsData = res.data.data.organizations;
      } else if (Array.isArray(res.data?.data)) {
        orgsData = res.data.data;
      } else if (Array.isArray(res.data?.organizations)) {
        orgsData = res.data.organizations;
      }
      console.log("Fetched organizations:", orgsData); // Debug log
      setOrganizations(orgsData);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setOrganizations([]); // Ensure it's always an array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!formData.name || formData.name.trim().length < 3) {
      setError("Organization name must be at least 3 characters");
      return;
    }
    if (!formData.industry) {
      setError("Industry is required");
      return;
    }
    if (!formData.organizationType) {
      setError("Organization type is required");
      return;
    }
    if (!formData.enabledModules.length) {
      setError("Select at least one enabled module");
      return;
    }

    if (formData.enabledModules.includes("CBAM") && !isCbamEligibleIndustry(formData.industry)) {
      setError("CBAM can only be enabled for Iron and Steel, Aluminum, or Cement industries");
      return;
    }

    try {
      const sanitizedEnabledModules = formData.enabledModules.filter((module) => module !== "CBAM" || isCbamEligibleIndustry(formData.industry));

      // Structure data to match backend IAM model
      const payload = {
        name: formData.name.trim(),
        industry: formData.industry,
        organizationType: Number(formData.organizationType),
        contact: {
          email: formData.email || "",
          phone: formData.phone || "",
          address: {
            street: formData.address || "",
          },
        },
        contactInfo: {
          email: formData.email || "",
          phone: formData.phone || "",
        },
        address: {
          street: formData.address || "",
        },
        complianceSettings: {
          enabledModules: sanitizedEnabledModules,
          GHGProtocolVersion: formData.GHGProtocolVersion,
          allowedBoundaryMethods: formData.allowedBoundaryMethods,
          allowedReportingScopes: formData.allowedReportingScopes,
          allowedSystemBoundaries: formData.allowedSystemBoundaries,
          auditLogEnforcement: true,
        },
      };

      if (editingOrg) {
        await api.patch(`/api/organizations/${editingOrg._id}`, payload);
      } else {
        await api.post("/api/organizations", payload);
      }
      fetchOrganizations();
      closeModal();
    } catch (error) {
      console.error("Submit error:", error.response?.data);
      // Handle different error formats from backend
      const errorData = error.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        setError(errorData.errors.join(", "));
      } else if (errorData?.message) {
        setError(errorData.message);
      } else {
        setError("Operation failed. Please try again.");
      }
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/organizations/${deleteId}`);
      fetchOrganizations();
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

  const openModal = (org = null) => {
    if (org) {
      setEditingOrg(org);
      setFormData({
        name: org.name || "",
        email: org.contact?.email || org.contactInfo?.email || "",
        phone: org.contact?.phone || org.contactInfo?.phone || "",
        address: org.contact?.address?.street || org.address?.street || "",
        industry: org.industry || "",
        organizationType: org.organizationType !== undefined && org.organizationType !== null ? String(org.organizationType) : "",
        enabledModules: normalizeModules(org.complianceSettings?.enabledModules || []),
        GHGProtocolVersion: org.complianceSettings?.GHGProtocolVersion || "GHG Protocol",
        allowedBoundaryMethods: org.complianceSettings?.allowedBoundaryMethods || [],
        allowedReportingScopes: org.complianceSettings?.allowedReportingScopes || [],
        allowedSystemBoundaries: org.complianceSettings?.allowedSystemBoundaries || [],
      });
    } else {
      setEditingOrg(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        industry: "",
        organizationType: "",
        enabledModules: [],
        GHGProtocolVersion: "GHG Protocol",
        allowedBoundaryMethods: [],
        allowedReportingScopes: [],
        allowedSystemBoundaries: [],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOrg(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      industry: "",
      organizationType: "",
      enabledModules: [],
      GHGProtocolVersion: "GHG Protocol",
      allowedBoundaryMethods: [],
      allowedReportingScopes: [],
      allowedSystemBoundaries: [],
    });
    setError("");
  };

  const toggleListValue = (key, value) => {
    setFormData((prev) => {
      const list = Array.isArray(prev[key]) ? prev[key] : [];
      const exists = list.includes(value);
      return {
        ...prev,
        [key]: exists ? list.filter((item) => item !== value) : [...list, value],
      };
    });
  };

  // Ensure organizations is always an array before filtering
  const filteredOrgs = Array.isArray(organizations) ? organizations.filter((org) => org.name?.toLowerCase().includes(searchTerm.toLowerCase())) : [];

  const uniqueIndustries = React.useMemo(() => {
    const industries = organizations.map((org) => org.industry || "Other");
    return ["All", ...new Set(industries)].sort();
  }, [organizations]);

  const displayOrgs = filteredOrgs.filter((org) => {
    if (industryFilter === "All") return true;
    return (org.industry || "Other") === industryFilter;
  });

  if (loading) {
    return <Loader />;
  }

  // --- HELPER: COLOR CODING FOR INDUSTRIES ---
  const getIndustryStyle = (industryName) => {
    if (!industryName) return "bg-slate-100 text-slate-600 border-slate-200";

    const name = industryName.toLowerCase();

    // Group 1: Heavy Industry & Metals (Slate/Gray)
    if (["cement", "iron", "steel", "aluminium", "zinc", "copper", "forging", "foundry", "refractories", "glass", "ceramic", "construction"].some((k) => name.includes(k))) {
      return "bg-slate-100 text-slate-700 border-slate-300";
    }

    // Group 2: Energy, Oil & Gas (Amber/Orange)
    if (["energy", "electricity", "discom", "petroleum", "petrochemical", "chlor"].some((k) => name.includes(k))) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }

    // Group 3: Transport & Auto (Blue/Sky)
    if (["transport", "rail", "auto", "tyre", "port", "aviation"].some((k) => name.includes(k))) {
      return "bg-sky-50 text-sky-700 border-sky-200";
    }

    // Group 4: Agriculture, Bio & Paper (Emerald/Green)
    if (["agriculture", "pulp", "paper", "sugar", "dairy", "textile", "food"].some((k) => name.includes(k))) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    // Group 5: Chemicals & Process (Purple/Rose)
    if (["chemical", "fertilizer", "health", "pharma"].some((k) => name.includes(k))) {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }

    // Group 6: Services & Tech (Indigo)
    if (["commercial", "tech", "finance", "education", "retail", "service", "gov"].some((k) => name.includes(k))) {
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }

    // Default
    return "bg-gray-50 text-gray-600 border-gray-200";
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 mb-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-green-200 to-green-700 p-3 rounded-xl">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Organizations</h1>
            <p className="text-md text-gray-500">Manage all organizations in the system</p>
          </div>
        </div>

        <div className="flex  items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search organizations by name ..."
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
            Add Organization
          </button>
        </div>
      </div>

      {/* Table */}
      <TooltipProvider>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="min-w-[1100px] w-full text-left border-collapse">
              <thead className="bg-gray-50/50">
                <tr>
                  {/* NAME HEADER */}
                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">Name</th>

                  {/* INDUSTRY HEADER WITH FILTER */}
                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span>Industry</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowFilterDropdown(!showFilterDropdown);
                            }}
                            className={`
                            p-1 rounded-md transition-all focus:outline-none
                            ${industryFilter !== "All" ? "bg-green-100 text-green-700" : "text-gray-400 hover:bg-gray-200 hover:text-gray-700"}
                          `}
                            id="industry-filter-btn"
                          >
                            <Filter size={14} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Filter by Industry</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </th>

                  {/* OTHER HEADERS */}
                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">Email</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">Phone</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {displayOrgs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                          <Building2 className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-md font-medium text-gray-900">No organizations found</h3>
                        <p className="text-sm text-gray-400 mt-1">{industryFilter !== "All" ? `No results for industry "${industryFilter}"` : "Try adding a new organization"}</p>
                        {industryFilter !== "All" && (
                          <button onClick={() => setIndustryFilter("All")} className="mt-3 text-xs text-green-600 font-medium hover:underline">
                            Clear Filter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayOrgs.map((org) => (
                    <tr key={org._id} className="hover:bg-gray-50/80 transition-colors group">
                      {/* NAME */}
                      <td className="px-6 py-4">
                        <div className="flex items-center  gap-3">
                          {/* <div className="w-9 h-9 rounded-lg bg-gray-100  border border-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                          {(org.name || "UN").substring(0, 2).toUpperCase()}
                        </div> */}
                          <div>
                            <p className="text-sm font-medium text-gray-900 group-hover:text-green-700 transition-colors">{org.name}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{org.organizationType === 1 ? "Corporate" : "Entity"}</p>
                          </div>
                        </div>
                      </td>

                      {/* INDUSTRY (Color Coded Pill) */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getIndustryStyle(org.industry)}`}>
                          {org.industry || "Uncategorized"}
                        </span>
                      </td>

                      {/* EMAIL */}
                      <td className="px-6 py-4 text-sm text-gray-600">{org.contact?.email || org.contactInfo?.email || "-"}</td>

                      {/* PHONE */}
                      <td className="px-6 py-4 text-sm text-gray-600">{org.contact?.phone || org.contactInfo?.phone || "-"}</td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={() => openModal(org)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                <Edit className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>

                            <TooltipContent>
                              <p>Edit Organization</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={() => handleDelete(org._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>

                            <TooltipContent>
                              <p>Delete Organization</p>
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

      {/* Filter Dropdown - Positioned outside table */}
      {showFilterDropdown && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setShowFilterDropdown(false)} />
          <div
            className="fixed w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-[101] max-h-[350px] overflow-y-auto"
            style={{
              top: document.getElementById("industry-filter-btn")?.getBoundingClientRect().bottom + 8 + "px",
              left: document.getElementById("industry-filter-btn")?.getBoundingClientRect().left + "px",
            }}
          >
            <div className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 bg-gray-50/50 sticky top-0 backdrop-blur-sm z-10">Select Industry</div>
            {uniqueIndustries.map((ind) => (
              <button
                key={ind}
                onClick={() => {
                  setIndustryFilter(ind);
                  setShowFilterDropdown(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-gray-50 transition-colors flex items-center justify-between
                  ${industryFilter === ind ? "text-green-700 bg-green-50/50" : "text-gray-600"}
                `}
              >
                <span>{ind}</span>
                {industryFilter === ind && <span className="w-1.5 h-1.5 rounded-full bg-green-600" />}
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
                <h2 className="text-2xl font-bold text-gray-900">{editingOrg ? "Edit Organization" : "New Organization"}</h2>
                <p className="text-sm text-gray-500 mt-1">{editingOrg ? "Update the organization details" : "Register a new organization in the system"}</p>
              </div>
              <button onClick={closeModal} className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                <Plus className="w-5 h-5 rotate-45" />
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

              <form onSubmit={handleSubmit} id="organization-form">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          placeholder="Enter organization name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.organizationType}
                          onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          required
                        >
                          <option value="">Select type</option>
                          {organizationTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Industry <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.industry}
                          onChange={(e) => {
                            const selectedIndustry = e.target.value;
                            setFormData((prev) => {
                              const nextModules =
                                !isCbamEligibleIndustry(selectedIndustry) && prev.enabledModules.includes("CBAM") ? prev.enabledModules.filter((module) => module !== "CBAM") : prev.enabledModules;

                              return {
                                ...prev,
                                industry: selectedIndustry,
                                enabledModules: nextModules,
                              };
                            });
                          }}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          required
                        >
                          <option value="">Select industry</option>
                          {industries.map((ind) => (
                            <option key={ind} value={ind}>
                              {ind}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">Contact Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          placeholder="contact@organization.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          placeholder="Street address, City, State"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Compliance Settings */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">Compliance Settings</h3>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Enabled Modules <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {enabledModulesOptions.map((module) => (
                            <label
                              key={module}
                              className={`flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg border border-gray-200 transition-colors ${
                                module === "CBAM" && !isCbamEligibleIndustry(formData.industry) ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-100 cursor-pointer"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.enabledModules.includes(module)}
                                onChange={() => toggleListValue("enabledModules", module)}
                                disabled={module === "CBAM" && !isCbamEligibleIndustry(formData.industry)}
                                className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500/20"
                              />
                              <span className="text-sm text-gray-700 font-medium">{module}</span>
                            </label>
                          ))}
                        </div>
                        {!isCbamEligibleIndustry(formData.industry) && <p className="mt-2 text-xs text-amber-700">CBAM is only available for Iron and Steel, Aluminum, and Cement industries.</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">GHG Protocol Version</label>
                        <select
                          value={formData.GHGProtocolVersion}
                          onChange={(e) => setFormData({ ...formData, GHGProtocolVersion: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                        >
                          {GHGProtocolVersions.map((version) => (
                            <option key={version} value={version}>
                              {version}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Organizational Boundaries</label>
                        <div className="grid grid-cols-1 gap-2.5">
                          {boundaryMethods.map((method) => (
                            <label key={method} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.allowedBoundaryMethods.includes(method)}
                                onChange={() => toggleListValue("allowedBoundaryMethods", method)}
                                className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500/20"
                              />
                              <span className="text-sm text-gray-700">{method}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Reporting Scopes</label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {reportingScopes.map((scope) => (
                            <label key={scope} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.allowedReportingScopes.includes(scope)}
                                onChange={() => toggleListValue("allowedReportingScopes", scope)}
                                className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500/20"
                              />
                              <span className="text-sm text-gray-700">{scope}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">System Boundaries</label>
                        <div className="grid grid-cols-1 gap-2.5">
                          {systemBoundaries.map((boundary) => (
                            <label key={boundary} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.allowedSystemBoundaries.includes(boundary)}
                                onChange={() => toggleListValue("allowedSystemBoundaries", boundary)}
                                className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500/20"
                              />
                              <span className="text-sm text-gray-700">{boundary}</span>
                            </label>
                          ))}
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
                form="organization-form"
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-200 transition-all active:scale-95"
              >
                {editingOrg ? "Update Organization" : "Create Organization"}
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
            <p className="text-gray-600 mb-6">Are you sure you want to delete this organization? This action cannot be undone.</p>
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

export default ManageOrganizations;
