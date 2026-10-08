import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronDown,
  Save,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { assetAPI } from "../../utils/api";
import Loader from "../../components/rf/Loader";
import SectionHeader from "../../components/rf/Header";
import EmptyState from "../../components/rf/EmptyState";
import { toast } from "sonner";

// ─── Default category / unit lists (loaded from backend, fallback here) ───
const DEFAULT_CATEGORIES = [
  "Boiler", "Furnace", "Kiln", "Oven", "Heater", "Turbine (Gas)", "Generator (Diesel)",
  "Generator (Gas)", "Incinerator", "Flare Stack", "Vehicle", "Forklift", "Crane",
  "Tractor", "Truck", "Ship / Vessel", "Refrigeration Unit", "HVAC System",
  "Air Conditioning Unit", "Compressor", "Transformer", "Switchgear", "Electric Motor",
  "Pump", "Conveyor", "Lighting System", "Cooling Tower", "Chiller", "Steam Turbine",
  "Building", "Warehouse", "Pipeline", "Storage Tank", "Solar Panel Array", "Wind Turbine",
  "Battery Storage", "Water Treatment Plant", "Effluent Treatment Plant", "Other",
];

const DEFAULT_UNITS = [
  "kW", "MW", "HP", "BTU/hr", "tons (refrigeration)", "TPH", "TPD", "litres", "m³",
  "m³/hr", "kg/hr", "kVA", "sqft", "sqm", "units", "Other",
];

// ─── Auto-generate short Asset ID ──────────────────────────────────────────
function generateAssetId(name) {
  if (!name) return "";
  const words = name.replace(/[^a-zA-Z0-9\s\-_#]/g, "").split(/[\s\-_]+/).filter(Boolean);
  if (words.length === 0) return "";
  return words
    .map((w) => {
      const m = w.match(/^([a-zA-Z])?(\d+)?/);
      return (m[1] || "").toUpperCase() + (m[2] || "");
    })
    .join("") || name.substring(0, 4).toUpperCase();
}

// ─── Blank form state ──────────────────────────────────────────────────────
const emptyForm = {
  assetName: "",
  assetId: "",
  category: "",
  fuelSources: "",
  capacity: "",
  capacityUnit: "",
  dateOfCommission: "",
  description: "",
  facilityId: "",
};

const PlantAssets = () => {
  const { user } = useAuth();
  const facilityId =
    user?.facilities?.[0]?.facilityId?._id ||
    user?.facilities?.[0]?.facilityId ||
    user?.facilityAssignments?.[0]?.facilityId?._id ||
    user?.facilityAssignments?.[0]?.facilityId ||
    user?.facilityId?._id ||
    user?.facilityId ||
    null;

  // Data
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [capacityUnits, setCapacityUnits] = useState(DEFAULT_UNITS);

  // UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // ─── Fetch on mount ────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([fetchAssets(), fetchMeta()]).finally(() =>
      setLoading(false)
    );
  }, [facilityId]);

  const fetchAssets = async () => {
    try {
      const res = await assetAPI.getAll(facilityId ? { facilityId } : undefined);
      setAssets(res.data?.data?.assets || []);
    } catch (err) {
      console.error("Failed to load assets", err);
      toast.error("Could not load assets");
    }
  };

  const fetchMeta = async () => {
    try {
      const res = await assetAPI.getMeta();
      const meta = res.data?.data;
      if (meta?.categories?.length) setCategories(meta.categories);
      if (meta?.capacityUnits?.length) setCapacityUnits(meta.capacityUnits);
    } catch {
      /* use defaults */
    }
  };

  // ─── Filter ────────────────────────────────────────────────────────
  const filteredAssets = useMemo(() => {
    let list = assets;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.assetName?.toLowerCase().includes(q) ||
          a.assetId?.toLowerCase().includes(q) ||
          a.category?.toLowerCase().includes(q)
      );
    }
    if (filterCategory) {
      list = list.filter((a) => a.category === filterCategory);
    }
    return list;
  }, [assets, searchQuery, filterCategory]);

  // ─── Form handlers ────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, facilityId: facilityId || "" });
    setShowForm(true);
  };

  const openEdit = (asset) => {
    setEditingId(asset._id);
    setForm({
      assetName: asset.assetName || "",
      assetId: asset.assetId || "",
      category: asset.category || "",
      fuelSources: (asset.fuelSources || []).join(", "),
      capacity: asset.capacity ?? "",
      capacityUnit: asset.capacityUnit || "",
      dateOfCommission: asset.dateOfCommission
        ? asset.dateOfCommission.substring(0, 10)
        : "",
      description: asset.description || "",
      facilityId: asset.facilityId?._id || asset.facilityId || facilityId || "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm, facilityId: facilityId || "" });
  };

  // ─── Auto-assign default units by category ──────────────────────────────────
  function getDefaultUnit(category) {
    if (!category) return "";
    const c = category.toLowerCase();

    if (c.includes("turbine") || c.includes("wind")) return "MW";
    if (c.includes("generator") || c.includes("transformer") || c.includes("switchgear")) return "kVA";
    if (c.includes("boiler") || c.includes("furnace") || c.includes("kiln") || c.includes("conveyor")) return "TPH";
    if (c.includes("incinerator") || c.includes("flare")) return "kg/hr";
    if (c.includes("refrigeration") || c.includes("hvac") || c.includes("air conditioning") || c.includes("cooling tower") || c.includes("chiller")) return "tons (refrigeration)";
    if (c.includes("building") || c.includes("warehouse")) return "sqft";
    if (c.includes("tank")) return "litres";
    if (c.includes("treatment") || c.includes("water")) return "m³/hr";
    if (c.includes("pipeline")) return "m³";
    if (c.includes("pump") || c.includes("motor") || c.includes("compressor") || c.includes("lighting") || c.includes("solar") || c.includes("battery") || c.includes("heater") || c.includes("oven")) return "kW";
    if (c.includes("tractor")) return "HP";
    if (c.includes("vehicle") || c.includes("forklift") || c.includes("ship") || c.includes("crane") || c.includes("truck")) return "units";

    return "";
  }

  // ─── Filter allowed units by category ───────────────────────────────────────
  function getAllowedUnits(category, allUnits) {
    if (!category) return allUnits;
    const c = category.toLowerCase();

    let validUnits = [];
    if (c.includes("turbine") || c.includes("wind")) validUnits = ["kW", "MW"];
    else if (c.includes("generator") || c.includes("transformer") || c.includes("switchgear")) validUnits = ["kVA", "kW", "MW"];
    else if (c.includes("boiler") || c.includes("furnace") || c.includes("kiln") || c.includes("conveyor")) validUnits = ["TPH", "TPD", "kg/hr"];
    else if (c.includes("incinerator") || c.includes("flare")) validUnits = ["kg/hr", "TPH"];
    else if (c.includes("refrigeration") || c.includes("hvac") || c.includes("air conditioning") || c.includes("cooling tower") || c.includes("chiller")) validUnits = ["tons (refrigeration)", "kW", "BTU/hr"];
    else if (c.includes("building") || c.includes("warehouse")) validUnits = ["sqft", "sqm"];
    else if (c.includes("tank")) validUnits = ["litres", "m³"];
    else if (c.includes("treatment") || c.includes("water")) validUnits = ["m³/hr", "litres", "m³"];
    else if (c.includes("pipeline")) validUnits = ["m³"];
    else if (c.includes("pump") || c.includes("motor") || c.includes("compressor") || c.includes("lighting") || c.includes("solar") || c.includes("battery") || c.includes("heater") || c.includes("oven")) validUnits = ["kW", "MW", "HP"];
    else if (c.includes("tractor")) validUnits = ["HP", "kW"];
    else if (c.includes("vehicle") || c.includes("forklift") || c.includes("ship") || c.includes("crane") || c.includes("truck")) validUnits = ["units"];
    else validUnits = allUnits;

    // Always include 'Other'
    const allowedSet = new Set([...validUnits, "Other"]);

    const filtered = allUnits.filter(u => allowedSet.has(u) || allowedSet.has(u.toLowerCase()));

    // Fallback if filtering resulted in only "Other"
    if (filtered.length <= 1) return allUnits;
    return filtered;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Auto-fill assetId when assetName changes (and not manually edited)
      if (name === "assetName") {
        next.assetId = generateAssetId(value);
      }
      // Auto-assign unit if category is changed
      if (name === "category") {
        const defaultUnit = getDefaultUnit(value);
        if (defaultUnit) {
          next.capacityUnit = defaultUnit;
        }
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.assetName || !form.category) {
      toast.error("Asset Name and Category are required");
      return;
    }
    const resolvedFacilityId = form.facilityId || facilityId;
    if (!resolvedFacilityId) {
      toast.error("No facility assigned for this user");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        assetName: form.assetName.trim(),
        assetId: form.assetId.trim() || undefined,
        category: form.category,
        fuelSources: form.fuelSources
          ? form.fuelSources.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        capacity: form.capacity ? Number(form.capacity) : null,
        capacityUnit: form.capacityUnit || null,
        dateOfCommission: form.dateOfCommission || null,
        description: form.description.trim(),
        facilityId: resolvedFacilityId,
      };

      if (editingId) {
        await assetAPI.update(editingId, payload);
        toast.success("Asset updated");
      } else {
        await assetAPI.create(payload);
        toast.success("Asset created");
      }

      await fetchAssets();
      closeForm();
    } catch (err) {
      const msg = err.response?.data?.message || "Operation failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await assetAPI.delete(id);
      toast.success("Asset deleted");
      setDeleteConfirmId(null);
      await fetchAssets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  // ─── Derived data ──────────────────────────────────────────────────
  const usedCategories = [...new Set(assets.map((a) => a.category))].sort();

  const availableUnits = useMemo(() => {
    return getAllowedUnits(form.category, capacityUnits);
  }, [form.category, capacityUnits]);

  // ─── Loading state ─────────────────────────────────────────────────
  if (loading) return <Loader />;

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-3 py-3 animate-in fade-in duration-500">
      {/* Header */}
      <SectionHeader
        icon={Box}
        title="Infrastructure & Assets"
        description="Manage your facility's equipment, vehicles, and infrastructure assets"
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          {/* Category filter */}
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">All Categories</option>
              {usedCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </div>

      {/* ─── Form Modal ─────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? "Edit Asset" : "Add New Asset"}
              </h2>
              <button onClick={closeForm} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Row 1: Name + Auto-ID */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Asset Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="assetName"
                    value={form.assetName}
                    onChange={handleChange}
                    placeholder="e.g. Diesel Generator #3"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Asset ID <span className="text-xs text-slate-400">(auto)</span>
                  </label>
                  <input
                    name="assetId"
                    value={form.assetId}
                    onChange={handleChange}
                    placeholder="Auto-generated"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Row 2: Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Fuel/Sources */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fuels / Sources
                </label>
                <input
                  name="fuelSources"
                  value={form.fuelSources}
                  onChange={handleChange}
                  placeholder="Comma-separated, e.g. Diesel, Natural Gas"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Row 4: Capacity + Unit + Commission Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Related Capacity
                  </label>
                  <input
                    name="capacity"
                    type="number"
                    min="0"
                    step="any"
                    value={form.capacity}
                    onChange={handleChange}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Unit
                  </label>
                  <select
                    name="capacityUnit"
                    value={form.capacityUnit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">Select unit</option>
                    {availableUnits.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date of Commission
                  </label>
                  <input
                    name="dateOfCommission"
                    type="date"
                    value={form.dateOfCommission}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Row 5: Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description / Notes
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Optional notes about this asset"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Modal ────────────────────────────────────── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Asset?</h3>
            <p className="text-sm text-slate-500 mb-6">
              This will remove the asset from your list. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Assets Table ────────────────────────────────────────────── */}
      {filteredAssets.length === 0 ? (
        <EmptyState
          icon={Box}
          title="No Assets Found"
          description={assets.length === 0
            ? "Start by adding your facility's equipment, vehicles, and infrastructure."
            : "No assets match your current filters."
          }
          action={
            assets.length === 0 && (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Your First Asset
              </button>
            )
          }
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Assets <span className="text-sm font-normal text-slate-400 ml-2">({filteredAssets.length})</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-5 py-3">Asset Name</th>
                  <th className="px-5 py-3">Asset ID</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Fuels / Sources</th>
                  <th className="px-5 py-3">Capacity</th>
                  <th className="px-5 py-3">Unit</th>
                  <th className="px-5 py-3">Commission Date</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAssets.map((asset) => (
                  <tr
                    key={asset._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                      {asset.assetName}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 font-mono">
                      {asset.assetId}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {asset.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {(asset.fuelSources || []).join(", ") || "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {asset.capacity != null ? asset.capacity.toLocaleString() : "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {asset.capacityUnit || "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {asset.dateOfCommission
                        ? new Date(asset.dateOfCommission).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(asset)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(asset._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantAssets;
