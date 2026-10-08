import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Plus, Pencil, Trash2, Save, X, ChevronDown, ChevronLeft, ChevronRight, Filter, Database, Loader2, Download, Upload } from "lucide-react";
import api from "../../utils/api";
import Loader from "../../components/rf/Loader";
import { toast } from "sonner";
import { Select, MenuItem, FormControl } from "@mui/material";

const SCOPES = ["Scope 1", "Scope 2", "Scope 3"];
const ITEMS_PER_PAGE = 25;
const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.75;
const MAX_ZOOM = 1.4;

const MOCK_EMISSION_FACTORS = [
  // --- Electricity ---
  { item: "Electricity", subItem: "Grid Electricity", subSubItem: "India (Average)", unit: "kWh", scope: "Scope 2", density: "", efValue: "0.716", unitInIPCC: "kg CO2e/kWh", link: "CEA Database", remarks: "National grid average", bgColor: "bg-[#e3f2fd]" },
  { item: "Electricity", subItem: "Grid Electricity", subSubItem: "UK (DEFRA)", unit: "kWh", scope: "Scope 2", density: "", efValue: "0.207", unitInIPCC: "kg CO2e/kWh", link: "DEFRA 2024", remarks: "", bgColor: "bg-[#e3f2fd]" },
  { item: "Electricity", subItem: "Grid Electricity", subSubItem: "US (EPA eGRID)", unit: "kWh", scope: "Scope 2", density: "", efValue: "0.380", unitInIPCC: "kg CO2e/kWh", link: "EPA eGRID 2024", remarks: "", bgColor: "bg-[#e3f2fd]" },
  { item: "Electricity", subItem: "Renewable Energy", subSubItem: "Solar (On-site)", unit: "kWh", scope: "Scope 2", density: "", efValue: "0", unitInIPCC: "kg CO2e/kWh", link: "GHG Protocol", remarks: "Zero emissions for on-site solar generation", bgColor: "bg-[#e3f2fd]" },
  { item: "Electricity", subItem: "Renewable Energy", subSubItem: "Wind (On-site)", unit: "kWh", scope: "Scope 2", density: "", efValue: "0", unitInIPCC: "kg CO2e/kWh", link: "GHG Protocol", remarks: "Zero emissions for on-site wind generation", bgColor: "bg-[#e3f2fd]" },
  
  // --- Travel ---
  { item: "Travel", subItem: "Roadway Travel", subSubItem: "Company Vehicle (Petrol)", unit: "km", scope: "Scope 1", density: "", efValue: "0.170", unitInIPCC: "kg CO2e/km", link: "DEFRA 2024", remarks: "Average car", bgColor: "bg-[#fce4ec]" },
  { item: "Travel", subItem: "Roadway Travel", subSubItem: "Company Vehicle (Diesel)", unit: "km", scope: "Scope 1", density: "", efValue: "0.168", unitInIPCC: "kg CO2e/km", link: "DEFRA 2024", remarks: "Average car", bgColor: "bg-[#fce4ec]" },
  { item: "Travel", subItem: "Roadway Travel", subSubItem: "Electric Vehicle (EV)", unit: "km", scope: "Scope 3", density: "", efValue: "0.050", unitInIPCC: "kg CO2e/km", link: "DEFRA 2024", remarks: "Includes grid emissions for charging", bgColor: "bg-[#fce4ec]" },
  { item: "Travel", subItem: "Air Travel", subSubItem: "Domestic", unit: "passenger-km", scope: "Scope 3", density: "", efValue: "0.246", unitInIPCC: "kg CO2e/passenger-km", link: "DEFRA 2024", remarks: "Includes radiative forcing", bgColor: "bg-[#fce4ec]" },
  { item: "Travel", subItem: "Air Travel", subSubItem: "Short-haul International", unit: "passenger-km", scope: "Scope 3", density: "", efValue: "0.153", unitInIPCC: "kg CO2e/passenger-km", link: "DEFRA 2024", remarks: "Includes radiative forcing", bgColor: "bg-[#fce4ec]" },
  { item: "Travel", subItem: "Air Travel", subSubItem: "Long-haul International", unit: "passenger-km", scope: "Scope 3", density: "", efValue: "0.193", unitInIPCC: "kg CO2e/passenger-km", link: "DEFRA 2024", remarks: "Includes radiative forcing", bgColor: "bg-[#fce4ec]" },
  { item: "Travel", subItem: "Train Travel", subSubItem: "National Rail", unit: "passenger-km", scope: "Scope 3", density: "", efValue: "0.035", unitInIPCC: "kg CO2e/passenger-km", link: "DEFRA 2024", remarks: "", bgColor: "bg-[#fce4ec]" },
  { item: "Travel", subItem: "Hotel Stay", subSubItem: "India (5 Star)", unit: "room-night", scope: "Scope 3", density: "", efValue: "96.0", unitInIPCC: "kg CO2e/room-night", link: "Cornell Benchmarking", remarks: "", bgColor: "bg-[#fce4ec]" },

  // --- Utility Losses ---
  { item: "Utility Losses", subItem: "Water Usage", subSubItem: "Water Supply", unit: "m3", scope: "Scope 3", density: "", efValue: "0.149", unitInIPCC: "kg CO2e/m3", link: "DEFRA 2024", remarks: "Mains water supply", bgColor: "bg-[#e8eaf6]" },
  { item: "Utility Losses", subItem: "Water Usage", subSubItem: "Water Treatment", unit: "m3", scope: "Scope 3", density: "", efValue: "0.272", unitInIPCC: "kg CO2e/m3", link: "DEFRA 2024", remarks: "Wastewater treatment", bgColor: "bg-[#e8eaf6]" },
  { item: "Utility Losses", subItem: "T&D Losses", subSubItem: "Electricity (India)", unit: "kWh", scope: "Scope 3", density: "", efValue: "0.130", unitInIPCC: "kg CO2e/kWh", link: "CEA", remarks: "Transmission & Distribution losses", bgColor: "bg-[#e8eaf6]" },
  { item: "Utility Losses", subItem: "T&D Losses", subSubItem: "Electricity (UK)", unit: "kWh", scope: "Scope 3", density: "", efValue: "0.018", unitInIPCC: "kg CO2e/kWh", link: "DEFRA 2024", remarks: "Transmission & Distribution losses", bgColor: "bg-[#e8eaf6]" },
  { item: "Utility Losses", subItem: "T&D Losses", subSubItem: "Heat/Steam", unit: "kWh", scope: "Scope 3", density: "", efValue: "0.050", unitInIPCC: "kg CO2e/kWh", link: "EPA", remarks: "District heating losses", bgColor: "bg-[#e8eaf6]" },

  // --- Professional Services ---
  { item: "Professional Services", subItem: "Accounting & Auditing", subSubItem: "Spend-based", unit: "₹", scope: "Scope 3", density: "", efValue: "0.0015", unitInIPCC: "kg CO2e/₹", link: "EPA Supply Chain", remarks: "Converted to INR base", bgColor: "bg-[#f3e5f5]" },
  { item: "Professional Services", subItem: "Legal Services", subSubItem: "Spend-based", unit: "₹", scope: "Scope 3", density: "", efValue: "0.0012", unitInIPCC: "kg CO2e/₹", link: "EPA Supply Chain", remarks: "Converted to INR base", bgColor: "bg-[#f3e5f5]" },
  { item: "Professional Services", subItem: "IT Consulting", subSubItem: "Spend-based", unit: "₹", scope: "Scope 3", density: "", efValue: "0.0018", unitInIPCC: "kg CO2e/₹", link: "EPA Supply Chain", remarks: "Converted to INR base", bgColor: "bg-[#f3e5f5]" },
  { item: "Professional Services", subItem: "Marketing & Advertising", subSubItem: "Spend-based", unit: "₹", scope: "Scope 3", density: "", efValue: "0.0014", unitInIPCC: "kg CO2e/₹", link: "EPA Supply Chain", remarks: "Converted to INR base", bgColor: "bg-[#f3e5f5]" },
  { item: "Professional Services", subItem: "Financial Services", subSubItem: "Spend-based", unit: "₹", scope: "Scope 3", density: "", efValue: "0.0010", unitInIPCC: "kg CO2e/₹", link: "EPA Supply Chain", remarks: "Converted to INR base", bgColor: "bg-[#f3e5f5]" },

  // --- Gas & Fuel ---
  { item: "Gas & Fuel", subItem: "Cooking Fuel", subSubItem: "LPG", unit: "kg", scope: "Scope 1", density: "", efValue: "2.93", unitInIPCC: "kg CO2e/kg", link: "DEFRA 2024", remarks: "Stationary combustion", bgColor: "bg-[#fff3e0]" },
  { item: "Gas & Fuel", subItem: "Cooking Fuel", subSubItem: "PNG", unit: "kg", scope: "Scope 1", density: "", efValue: "2.54", unitInIPCC: "kg CO2e/kg", link: "DEFRA 2024", remarks: "Piped Natural Gas", bgColor: "bg-[#fff3e0]" },
  { item: "Gas & Fuel", subItem: "Cooking Fuel", subSubItem: "Biogas", unit: "kg", scope: "Scope 1", density: "", efValue: "0.05", unitInIPCC: "kg CO2e/kg", link: "DEFRA 2024", remarks: "Outside of Scopes (Biogenic CO2)", bgColor: "bg-[#fff3e0]" },
  { item: "Gas & Fuel", subItem: "Stationary Combustion", subSubItem: "Natural Gas", unit: "m3", scope: "Scope 1", density: "", efValue: "2.02", unitInIPCC: "kg CO2e/m3", link: "DEFRA 2024", remarks: "For heating/boilers", bgColor: "bg-[#fff3e0]" },
  { item: "Gas & Fuel", subItem: "Stationary Combustion", subSubItem: "Coal (Industrial)", unit: "tonne", scope: "Scope 1", density: "", efValue: "2400.0", unitInIPCC: "kg CO2e/tonne", link: "DEFRA 2024", remarks: "", bgColor: "bg-[#fff3e0]" },
  { item: "Gas & Fuel", subItem: "Refrigerants (HVAC)", subSubItem: "R32", unit: "kg", scope: "Scope 1", density: "", efValue: "675.0", unitInIPCC: "kg CO2e/kg", link: "IPCC AR5", remarks: "Fugitive emissions", bgColor: "bg-[#fff3e0]" },
  { item: "Gas & Fuel", subItem: "Refrigerants (HVAC)", subSubItem: "R410A", unit: "kg", scope: "Scope 1", density: "", efValue: "2088.0", unitInIPCC: "kg CO2e/kg", link: "IPCC AR5", remarks: "Fugitive emissions", bgColor: "bg-[#fff3e0]" },

  // --- Waste ---
  { item: "Waste", subItem: "Paper Waste", subSubItem: "Recycling", unit: "tonne", scope: "Scope 3", density: "", efValue: "21.29", unitInIPCC: "kg CO2e/tonne", link: "DEFRA 2024", remarks: "Closed-loop recycling", bgColor: "bg-[#e8f5e9]" },
  { item: "Waste", subItem: "Paper Waste", subSubItem: "Landfill", unit: "tonne", scope: "Scope 3", density: "", efValue: "1041.0", unitInIPCC: "kg CO2e/tonne", link: "DEFRA 2024", remarks: "", bgColor: "bg-[#e8f5e9]" },
  { item: "Waste", subItem: "Food Waste", subSubItem: "Composting", unit: "tonne", scope: "Scope 3", density: "", efValue: "9.00", unitInIPCC: "kg CO2e/tonne", link: "DEFRA 2024", remarks: "", bgColor: "bg-[#e8f5e9]" },
  { item: "Waste", subItem: "Food Waste", subSubItem: "Landfill", unit: "tonne", scope: "Scope 3", density: "", efValue: "700.33", unitInIPCC: "kg CO2e/tonne", link: "DEFRA 2024", remarks: "", bgColor: "bg-[#e8f5e9]" },
  { item: "Waste", subItem: "E-Waste", subSubItem: "Recycling", unit: "tonne", scope: "Scope 3", density: "", efValue: "21.29", unitInIPCC: "kg CO2e/tonne", link: "DEFRA 2024", remarks: "WEEE Recycling", bgColor: "bg-[#e8f5e9]" },
  { item: "Waste", subItem: "E-Waste", subSubItem: "Landfill", unit: "tonne", scope: "Scope 3", density: "", efValue: "95.0", unitInIPCC: "kg CO2e/tonne", link: "DEFRA 2024", remarks: "", bgColor: "bg-[#e8f5e9]" },
];

const ManageEmissionFactors = () => {
  // ─── State ───
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [viewMode, setViewMode] = useState("mock");
  const [zoomLevel, setZoomLevel] = useState(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [scopeFilter, setScopeFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Dropdown options
  const [typeOptions, setTypeOptions] = useState([]);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingFactor, setEditingFactor] = useState(null);
  const [formData, setFormData] = useState({
    scope: "Scope 1",
    type: "",
    group: "",
    groupLabel: "",
    category: "",
    source: "",
    unit: "",
    value: "",
    displayUnit: "",
    region: "Global",
    year: new Date().getFullYear(),
    dataSource: "",
    notes: "",
  });

  // ─── Data Fetching ───
  const fetchFactors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page);
      params.set("limit", ITEMS_PER_PAGE);
      params.set("sortBy", "source");
      params.set("sortOrder", "asc");

      if (searchTerm) params.set("search", searchTerm);
      if (scopeFilter) params.set("scope", scopeFilter);
      if (typeFilter) params.set("type", typeFilter);

      const res = await api.get(`/api/emission-factors?${params.toString()}`);
      const data = res.data?.data || res.data;
      setFactors(data.factors || []);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      }));
    } catch (err) {
      toast.error("Failed to load emission factors");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, searchTerm, scopeFilter, typeFilter]);

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/emission-factors/stats");
      setStats(res.data?.data || res.data);
    } catch {
      // Non-critical
    }
  };

  const fetchTypeOptions = async (scope) => {
    try {
      const params = scope ? `?scope=${encodeURIComponent(scope)}` : "";
      const res = await api.get(`/api/emission-factors/distinct/type${params}`);
      setTypeOptions(res.data?.data || res.data || []);
    } catch {
      setTypeOptions([]);
    }
  };

  useEffect(() => {
    fetchFactors();
  }, [fetchFactors]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTypeOptions(scopeFilter);
  }, [scopeFilter]);

  // ─── Handlers ───
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleScopeFilter = (scope) => {
    setScopeFilter(scope);
    setTypeFilter("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const openCreateModal = () => {
    setEditingFactor(null);
    setFormData({
      scope: scopeFilter || "Scope 1",
      type: typeFilter || "",
      group: "",
      groupLabel: "",
      category: "",
      source: "",
      unit: "",
      value: "",
      displayUnit: "",
      region: "Global",
      year: new Date().getFullYear(),
      dataSource: "",
      notes: "",
    });
    setShowModal(true);
  };

  const openEditModal = (factor) => {
    setEditingFactor(factor);
    setFormData({
      scope: factor.scope,
      type: factor.type,
      group: factor.group,
      groupLabel: factor.groupLabel || "",
      category: factor.category,
      source: factor.source,
      unit: factor.unit,
      value: factor.value,
      displayUnit: factor.displayUnit || "",
      region: factor.region || "Global",
      year: factor.year || new Date().getFullYear(),
      dataSource: factor.dataSource || "",
      notes: factor.notes || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.scope || !formData.type || !formData.group || !formData.category || !formData.source || !formData.unit || formData.value === "") {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      if (editingFactor) {
        await api.put(`/api/emission-factors/${editingFactor._id}`, formData);
        toast.success("Emission factor updated");
      } else {
        await api.post("/api/emission-factors", formData);
        toast.success("Emission factor created");
      }
      setShowModal(false);
      fetchFactors();
      fetchStats();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (factor) => {
    if (!window.confirm(`Delete emission factor "${factor.source} (${factor.unit})"?`)) return;

    try {
      await api.delete(`/api/emission-factors/${factor._id}`);
      toast.success("Emission factor deleted");
      fetchFactors();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleToggleActive = async (factor) => {
    try {
      await api.put(`/api/emission-factors/${factor._id}`, {
        isActive: !factor.isActive,
      });
      toast.success(factor.isActive ? "Deactivated" : "Activated");
      fetchFactors();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const zoomOut = () => setZoomLevel((prev) => Math.max(MIN_ZOOM, Number((prev - ZOOM_STEP).toFixed(2))));
  const zoomIn = () => setZoomLevel((prev) => Math.min(MAX_ZOOM, Number((prev + ZOOM_STEP).toFixed(2))));

  const mockTypeOptions = useMemo(() => {
    const types = new Set();
    MOCK_EMISSION_FACTORS.forEach((f) => {
      if (f.item) types.add(f.item);
    });
    return Array.from(types).sort();
  }, []);

  const currentTypeOptions = viewMode === "mock" ? mockTypeOptions : typeOptions;

  const displayFactors = useMemo(() => {
    if (viewMode === "live") return factors;
    
    return MOCK_EMISSION_FACTORS.filter((f) => {
      if (scopeFilter && f.scope !== scopeFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const text = `${f.item || ""} ${f.subItem || ""} ${f.subSubItem || ""} ${f.remarks || ""}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      if (typeFilter && f.item !== typeFilter) return false;
      return true;
    });
  }, [viewMode, factors, scopeFilter, searchTerm, typeFilter]);

  // ─── Render ───
  if (viewMode === "live" && loading && factors.length === 0) return <Loader text="Loading emission factors..." />;

  const showPagination = viewMode === "live" && pagination.totalPages > 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Database className="w-6 h-6 text-indigo-600" />
              Emission Factors
            </h1>
            <p className="text-sm text-slate-500 mt-1">Emission factors in a spreadsheet-style</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: "mock", label: "Spreadsheet View" },
              { id: "live", label: "Live Factors" },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === mode.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
              >
                {mode.label}
              </button>
            ))}
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <button onClick={zoomOut} disabled={zoomLevel <= MIN_ZOOM} className="w-8 h-8 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                –
              </button>
              <span className="text-sm font-semibold">{Math.round(zoomLevel * 100)}%</span>
              <button onClick={zoomIn} disabled={zoomLevel >= MAX_ZOOM} className="w-8 h-8 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Factors" value={stats.total} color="indigo" />
          <StatCard label="Scope 1" value={stats.byScope?.["Scope 1"]?.total || 0} color="emerald" />
          <StatCard label="Scope 2" value={stats.byScope?.["Scope 2"]?.total || 0} color="blue" />
          <StatCard label="Scope 3" value={stats.byScope?.["Scope 3"]?.total || 0} color="purple" />
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by source, type, category..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Scope Filter Tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => handleScopeFilter("")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${!scopeFilter ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
            >
              All
            </button>
            {SCOPES.map((s) => (
              <button
                key={s}
                onClick={() => handleScopeFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${scopeFilter === s ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
              >
                {s.replace("Scope ", "S")}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          {currentTypeOptions.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                displayEmpty
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                sx={{
                  borderRadius: "0.5rem",
                  backgroundColor: "white",
                  fontSize: "0.875rem",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#818cf8" }
                }}
              >
                <MenuItem value="" sx={{ fontSize: "0.875rem" }}>All Types</MenuItem>
                {currentTypeOptions.map((t) => (
                  <MenuItem key={t} value={t} sx={{ fontSize: "0.875rem" }}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{viewMode === "mock" ? "Emission Factor Spreadsheet" : "Emission Factors"}</h2>
              <p className="text-sm text-slate-500">{viewMode === "mock" ? "Read-only data styled like a spreadsheet" : "Manage live emission factor records."}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-medium">Zoom:</span>
              <div className="flex items-center gap-1">
                <button onClick={zoomOut} disabled={zoomLevel <= MIN_ZOOM} className="w-8 h-8 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                  –
                </button>
                <span className="w-14 text-center">{Math.round(zoomLevel * 100)}%</span>
                <button onClick={zoomIn} disabled={zoomLevel >= MAX_ZOOM} className="w-8 h-8 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-auto" style={{ minHeight: 320 }}>
          <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: "0 0" }}>
            <table className={`min-w-[1200px] ${viewMode === "mock" ? "border-collapse" : "border-separate border-spacing-0"} text-sm`} style={{ fontFamily: viewMode === "mock" ? "Calibri, Arial, sans-serif" : "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
              <thead>
                <tr className={viewMode === "mock" ? "bg-white text-black font-bold" : "bg-slate-100 text-slate-700"}>
                  <th className={`border ${viewMode === "mock" ? "border-slate-300 px-2 py-1 text-xs" : "border-slate-200 px-4 py-3"} text-left font-semibold`}>Item</th>
                  <th className={`border ${viewMode === "mock" ? "border-slate-300 px-2 py-1 text-xs" : "border-slate-200 px-4 py-3"} text-left font-semibold`}>Sub-item</th>
                  <th className={`border ${viewMode === "mock" ? "border-slate-300 px-2 py-1 text-xs" : "border-slate-200 px-4 py-3"} text-left font-semibold`}>Sub-Sub Items</th>
                  <th className={`border ${viewMode === "mock" ? "border-slate-300 px-2 py-1 text-xs" : "border-slate-200 px-4 py-3"} text-left font-semibold`}>Unit</th>
                  <th className={`border ${viewMode === "mock" ? "border-slate-300 px-2 py-1 text-xs" : "border-slate-200 px-4 py-3"} text-left font-semibold`}>Scope</th>
                  {viewMode === "mock" && <th className="border border-slate-300 px-2 py-1 text-left font-bold text-xs">Density</th>}
                  <th className={`border ${viewMode === "mock" ? "border-slate-300 px-2 py-1 text-xs" : "border-slate-200 px-4 py-3"} text-right font-semibold`}>EF</th>
                  <th className={`border ${viewMode === "mock" ? "border-slate-300 px-2 py-1 text-xs" : "border-slate-200 px-4 py-3"} text-left font-semibold`}>Unit in IPCC</th>
                  <th className={`border ${viewMode === "mock" ? "border-slate-300 px-2 py-1 text-xs" : "border-slate-200 px-4 py-3"} text-left font-semibold`}>Link</th>
                  <th className={`border ${viewMode === "mock" ? "border-slate-300 px-2 py-1 text-xs" : "border-slate-200 px-4 py-3"} text-left font-semibold`}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {displayFactors.length === 0 ? (
                  <tr>
                    <td colSpan={viewMode === "mock" ? 10 : 9} className="border border-slate-200 px-4 py-10 text-center text-slate-400">
                      {loading ? "Loading..." : "No emission factors found."}
                    </td>
                  </tr>
                ) : (
                  displayFactors.map((row, index) => {
                    const trClass = viewMode === "mock" 
                      ? (row.bgColor || "bg-white text-black") 
                      : (index % 2 === 0 ? "bg-white" : "bg-slate-50");
                    const tdClass = viewMode === "mock"
                      ? "border border-slate-300 px-2 py-1 text-xs whitespace-nowrap"
                      : "border border-slate-200 px-4 py-3 text-slate-700 whitespace-nowrap";
                    
                    return (
                      <tr key={`${row.item}-${index}`} className={trClass}>
                        <td className={tdClass}>{row.item}</td>
                        <td className={tdClass}>{row.subItem}</td>
                        <td className={tdClass}>{row.subSubItem || (viewMode === "mock" ? "" : "-")}</td>
                        <td className={tdClass}>{row.unit}</td>
                        <td className={tdClass}>{row.scope}</td>
                        {viewMode === "mock" && <td className={tdClass}>{row.density || ""}</td>}
                        <td className={`${tdClass} text-right ${viewMode === "mock" ? "" : "text-slate-800 font-mono"}`}>{row.efValue}</td>
                        <td className={tdClass}>{row.unitInIPCC}</td>
                        <td className={tdClass}>
                          {row.link ? (
                            <a href={row.link} target="_blank" rel="noreferrer" className={viewMode === "mock" ? "text-blue-600 hover:underline" : "text-indigo-600 hover:underline"}>
                              {viewMode === "mock" ? row.link : "Link"}
                            </a>
                          ) : null}
                        </td>
                        <td className={tdClass}>{row.remarks}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        {showPagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <span className="text-sm text-slate-500">
              Showing {(pagination.page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(pagination.page * ITEMS_PER_PAGE, pagination.total)} of {pagination.total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-slate-700">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Create/Edit Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">{editingFactor ? "Edit Emission Factor" : "Add New Emission Factor"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Scope *">
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.scope}
                      onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                      sx={{
                        borderRadius: "0.5rem",
                        backgroundColor: "white",
                        fontSize: "0.875rem",
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#818cf8", borderWidth: "2px" }
                      }}
                    >
                      {SCOPES.map((s) => (
                        <MenuItem key={s} value={s} sx={{ fontSize: "0.875rem" }}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FormField>

                <FormField label="Type *" hint="e.g. Stationary, Purchased Electricity">
                  <input type="text" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} placeholder="e.g. Stationary" className="input-field" />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Group Key *" hint="e.g. fuels, uk_electricity">
                  <input type="text" value={formData.group} onChange={(e) => setFormData({ ...formData, group: e.target.value })} placeholder="e.g. fuels" className="input-field" />
                </FormField>
                <FormField label="Group Label" hint="Human-readable name">
                  <input type="text" value={formData.groupLabel} onChange={(e) => setFormData({ ...formData, groupLabel: e.target.value })} placeholder="e.g. Fuels" className="input-field" />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Category *" hint="e.g. gaseous_fuels, electricity_generated">
                  <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. gaseous_fuels" className="input-field" />
                </FormField>
                <FormField label="Source Name *" hint="e.g. Diesel, Natural Gas">
                  <input type="text" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} placeholder="e.g. Natural Gas" className="input-field" />
                </FormField>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField label="Unit *" hint="e.g. kWh, tonnes, litres">
                  <input type="text" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="e.g. kWh" className="input-field" />
                </FormField>
                <FormField label="EF Value *" hint="Numeric factor">
                  <input type="number" step="any" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} placeholder="e.g. 0.00122" className="input-field" />
                </FormField>
                <FormField label="Display Unit" hint="e.g. kgCO2e/kWh">
                  <input
                    type="text"
                    value={formData.displayUnit}
                    onChange={(e) => setFormData({ ...formData, displayUnit: e.target.value })}
                    placeholder="Auto-generated if blank"
                    className="input-field"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField label="Region">
                  <input type="text" value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} placeholder="Global" className="input-field" />
                </FormField>
                <FormField label="Year">
                  <input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="input-field" />
                </FormField>
                <FormField label="Data Source">
                  <input type="text" value={formData.dataSource} onChange={(e) => setFormData({ ...formData, dataSource: e.target.value })} placeholder="e.g. DEFRA 2024" className="input-field" />
                </FormField>
              </div>

              <FormField label="Notes">
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes about this emission factor"
                  rows={2}
                  className="input-field resize-none"
                />
              </FormField>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingFactor ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline input styles */}
      <style>{`
        .input-field {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          outline: none;
          transition: box-shadow 0.15s, border-color 0.15s;
        }
        .input-field:focus {
          border-color: #818cf8;
          box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.2);
        }
      `}</style>
    </div>
  );
};

// ─── Sub-components ───

const StatCard = ({ label, value, color }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color] || colors.indigo}`}>
      <div className="text-2xl font-bold">{value?.toLocaleString() || 0}</div>
      <div className="text-xs font-medium mt-1 opacity-80">{label}</div>
    </div>
  );
};

const ScopeBadge = ({ scope }) => {
  const colors = {
    "Scope 1": "bg-emerald-100 text-emerald-700",
    "Scope 2": "bg-blue-100 text-blue-700",
    "Scope 3": "bg-purple-100 text-purple-700",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[scope] || "bg-slate-100 text-slate-600"}`}>{scope?.replace("Scope ", "S") || "-"}</span>;
};

const FormField = ({ label, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    {children}
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

export default ManageEmissionFactors;
