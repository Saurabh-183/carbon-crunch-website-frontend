import React, { useState, useEffect, useMemo } from "react";
import { GitMerge, Plus, Pencil, Trash2, Search, X, Save, Loader2, Link as LinkIcon, Factory, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cbamAPI } from "../../utils/api";
import Loader from "../../components/rf/Loader";
import SectionHeader from "../../components/rf/Header";
import EmptyState from "../../components/rf/EmptyState";
import { toast } from "sonner";

// ─── CBAM Goods Hierarchy ──────────────────────────────────────────────────
const CBAM_CATEGORIES = {
    "Cement": ["Cement clinker", "Calcined clays"],
    "Cement clinker": [],
    "Calcined clays": [],
    "Aluminous cement": [],
    "Iron or steel products": ["Crude steel"],
    "Crude steel": ["Pig iron", "Direct reduced iron", "Alloys (FeMn, FeCr, FeNi)"],
    "Direct reduced iron": ["Sintered Ore", "Hydrogen"],
    "Pig iron": ["Sintered Ore", "Alloys (FeMn, FeCr, FeNi)"],
    "Alloys (FeMn, FeCr, FeNi)": ["Sintered Ore"],
    "Sintered Ore": [],
    "Hydrogen": [],
    "Ammonia": ["Hydrogen"],
    "Nitric acid": ["Ammonia"],
    "Urea": ["Ammonia"],
    "Mixed fertilisers": ["Ammonia", "Nitric acid", "Urea"],
    "Aluminium products": ["Unwrought aluminium"],
    "Unwrought aluminium": [],
    "Electricity (export to EU)": []
};

// ─── Production routes from CBAM Excel Template ──────────────────────────
const ALL_PRODUCTION_ROUTES = [
  "All production routes",
  "n.a.",
  "Basic oxygen steelmaking",
  "Electric arc furnace",
  "Other production routes",
  "Unknown production routes",
  "Blast furnace route",
  "Smelting reduction",
  "Steam reforming and partial oxidation",
  "Electrolysis of water",
  "Chlor-Alkali electrolysis and production of chlorates",
  "Haber-Bosch process with steam reforming of natural gas or biogas",
  "Haber-Bosch process with gasification of coal or other fuels",
  "Primary (electrolytic) smelting",
  "Secondary melting (recycling)"
];

// ─── Empty form state ────────────────────────────────────────────────────
const emptyForm = {
    processName: "",
    aggregatedCategory: "Cement",
    productionRoute: "",
    description: "",
    includedGoods: [],
};

const CbamProductionProcesses = () => {
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
    const [processes, setProcesses] = useState([]);
    const [cbamProducts, setCbamProducts] = useState([]);
    // UI
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    // ─── Fetch on mount ────────────────────────────────────────────────
    useEffect(() => {
        Promise.all([fetchProcesses(), fetchProducts()]).finally(() => setLoading(false));
    }, [facilityId]);

    const fetchProcesses = async () => {
        try {
            const res = await cbamAPI.getProductionProcesses(facilityId ? { facilityId } : undefined);
            setProcesses(res.data?.data || []);
        } catch (err) {
            console.error("Failed to load production processes", err);
            toast.error("Could not load processes");
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await cbamAPI.getProducts(facilityId ? { facilityId } : undefined);
            setCbamProducts(res.data?.data?.products || res.data?.data || []);
        } catch (err) {
            console.error("Failed to load CBAM products", err);
        }
    };
    const filteredProcesses = useMemo(() => {
        if (!searchQuery) return processes;
        const q = searchQuery.toLowerCase();
        return processes.filter(
            (p) => p.processName?.toLowerCase().includes(q) || p.aggregatedCategory?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q),
        );
    }, [processes, searchQuery]);

    // ─── Form handlers ────────────────────────────────────────────────
    const openCreate = () => {
        setEditingId(null);
        setForm({ ...emptyForm });
        setShowForm(true);
    };

    const openEdit = (proc) => {
        setEditingId(proc._id);
        setForm({
            processName: proc.processName || "",
            aggregatedCategory: proc.aggregatedCategory || "Cement",
            productionRoute: proc.productionRoute || "",
            description: proc.description || "",
            includedGoods: proc.includedGoods || [],
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm({ ...emptyForm });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleIncludedGoodsToggle = (goodName) => {
        setForm((prev) => {
            if (goodName === "Only direct production") {
                // If checking "Only direct production", clear everything else. If unchecking it, empty.
                const isSelected = prev.includedGoods.includes("Only direct production");
                return { ...prev, includedGoods: isSelected ? [] : ["Only direct production"] };
            }

            // Normal toggle for the others
            let list = prev.includedGoods.includes(goodName)
                ? prev.includedGoods.filter((g) => g !== goodName)
                : [...prev.includedGoods, goodName];

            // Ensure "Only direct production" is removed if checking something else
            list = list.filter(g => g !== "Only direct production");

            return { ...prev, includedGoods: list };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.processName) {
            toast.error("Process name is required");
            return;
        }
        if (!facilityId) {
            toast.error("No facility assigned for this user");
            return;
        }
        if (form.includedGoods.length === 0) {
            toast.error("Please select at least one Included Good option.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                processName: form.processName.trim(),
                aggregatedCategory: form.aggregatedCategory,
                productionRoute: form.productionRoute,
                description: form.description.trim(),
                includedGoods: form.includedGoods,
                facilityId,
            };

            if (editingId) {
                await cbamAPI.updateProductionProcess(editingId, payload);
                toast.success("Process updated");
            } else {
                await cbamAPI.createProductionProcess(payload);
                toast.success("Process created");
            }
            await fetchProcesses();
            closeForm();
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await cbamAPI.deleteProductionProcess(id);
            toast.success("Process deleted");
            setDeleteConfirmId(null);
            await fetchProcesses();
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };


    if (loading) return <Loader />;

    return (
        <div className="animate-in fade-in duration-500">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search processes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>

                <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Add Process
                </button>
            </div>

            {/* ─── Form Modal ───────────────────────────────────────────── */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">{editingId ? "Edit Process" : "Define New Process"}</h2>
                            <button onClick={closeForm} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Process Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="processName"
                                        value={form.processName}
                                        onChange={handleChange}
                                        placeholder="e.g. Sintering Line 1"
                                        required
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Aggregated Goods Category</label>
                                    <div className="relative">
                                        <select
                                            name="aggregatedCategory"
                                            value={form.aggregatedCategory}
                                            onChange={(e) => {
                                                const newCategory = e.target.value;
                                                // Reset included goods and production route if parent category changes
                                                setForm(prev => ({ ...prev, aggregatedCategory: newCategory, includedGoods: [], productionRoute: "" }));
                                            }}
                                            className="w-full appearance-none px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                        >
                                            <option value="">Select an Aggregated Category...</option>
                                            {[...new Set(cbamProducts.map(p => p.aggregatedCategory).filter(Boolean))].map((cat) => (
                                                <option key={cat} value={cat}>
                                                    {cat}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Production Route</label>
                                    <div className="relative">
                                        <select
                                            name="productionRoute"
                                            value={form.productionRoute}
                                            onChange={handleChange}
                                            className="w-full appearance-none px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                        >
                                            <option value="">Select a Route...</option>
                                            {ALL_PRODUCTION_ROUTES.map((route) => (
                                                <option key={route} value={route}>
                                                    {route}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="Describe the production steps..."
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Included Goods Categories</label>
                                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3 space-y-2">
                                    {(() => {
                                        let otherCategories = [...new Set(cbamProducts.map(p => p.aggregatedCategory).filter(Boolean))]
                                            .filter(cat => cat !== form.aggregatedCategory);

                                        // Prepend "Only direct production" as an explicit option
                                        otherCategories = ["Only direct production", ...otherCategories];

                                        if (otherCategories.length > 0) {
                                            return otherCategories.map((good) => (
                                                <label key={good} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded px-2 py-1 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.includedGoods.includes(good)}
                                                        onChange={() => handleIncludedGoodsToggle(good)}
                                                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                    <span className="text-sm text-slate-700 flex items-center gap-1.5">
                                                        <Factory className="w-3.5 h-3.5 text-slate-400" />
                                                        {good}
                                                    </span>
                                                </label>
                                            ));
                                        }
                                        return <p className="text-sm text-slate-500">Only direct production.</p>;
                                    })()}
                                </div>
                                <p className="mt-1 text-xs text-slate-400 italic">Select additional goods covered by this process's boundary (max 6 according to CBAM rules).</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={closeForm} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editingId ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Delete Confirm Modal ─────────────────────────────────── */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Process?</h3>
                        <p className="text-sm text-slate-500 mb-6">This will remove the logical mapping definition.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(deleteConfirmId)} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Processes Cards ──────────────────────────────────── */}
            {filteredProcesses.length === 0 ? (
                <EmptyState
                    icon={GitMerge}
                    title="No Production Processes Defined"
                    description={processes.length === 0 ? "Define a logic flow combining multiple physical installations." : "No processes match your search."}
                    action={
                        processes.length === 0 && (
                            <button
                                onClick={openCreate}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                                <Plus className="w-4 h-4" /> Define Process
                            </button>
                        )
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredProcesses.map((proc) => (
                        <div key={proc._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-orange-50">
                                        <GitMerge className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">{proc.processName}</h3>
                                        <div className="flex gap-2 flex-wrap items-center mt-0.5">
                                            <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                                                {proc.aggregatedCategory}
                                            </span>
                                            {proc.productionRoute && (
                                                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    {proc.productionRoute}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => openEdit(proc)} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Edit">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setDeleteConfirmId(proc._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {proc.description && (
                                <p className="text-xs text-slate-500 mb-4 line-clamp-2 mt-1">{proc.description}</p>
                            )}

                            <div className="mt-auto pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <LinkIcon className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-xs font-bold text-slate-700">Included Core Goods</span>
                                </div>
                                {proc.includedGoods?.length > 0 ? (
                                    <ul className="space-y-1.5">
                                        {proc.includedGoods.map((good, i) => (
                                            <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                {good}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">Only direct production logic applies.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CbamProductionProcesses;
