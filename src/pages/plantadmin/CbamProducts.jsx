import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Globe, Plus, Pencil, Trash2, Search, X, Save, Loader2, ChevronDown, Package, Send, Mail, PieChart } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api, { cbamAPI } from "../../utils/api";
import Loader from "../../components/rf/Loader";
import SectionHeader from "../../components/rf/Header";
import EmptyState from "../../components/rf/EmptyState";
import { toast } from "sonner";

// ─── CBAM Sector categories ──────────────────────────────────────────────
const CBAM_SECTORS = ["Cement", "Iron and steel", "Aluminium", "Fertilisers", "Chemicals (hydrogen)", "Electricity"];

// ─── Production unit options ─────────────────────────────────────────────
const PRODUCTION_UNITS = ["Tonnes", "MWh", "kg", "m³"];

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
  productName: "",
  cnCode: "",
  mainCategory: "",
  aggregatedCategory: "",
  goodsDescription: "",
  productionRoute: "",
  productionUnit: "Tonnes",
  precursors: [],
  isExported: false,
  suppliers: [],
};

const CbamProducts = () => {
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
  const [products, setProducts] = useState([]);
  const [facility, setFacility] = useState(null);

  // CN Code search
  const [cnCodeSearch, setCnCodeSearch] = useState("");
  const [cnCodeResults, setCnCodeResults] = useState([]);
  const [cnCodeLoading, setCnCodeLoading] = useState(false);
  const [showCnDropdown, setShowCnDropdown] = useState(false);
  const [selectedCnCode, setSelectedCnCode] = useState(null);

  // UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // ─── Fetch products ──────────────────────────────────────────────
  useEffect(() => {
    fetchProducts().finally(() => setLoading(false));
  }, [facilityId]);

  const fetchProducts = async () => {
    try {
      const res = await cbamAPI.getProducts(facilityId ? { facilityId } : undefined);
      setProducts(res.data?.data?.products || res.data?.data || []);

      if (facilityId) {
        const facRes = await api.get(`/api/facilities/${facilityId}`);
        setFacility(facRes.data?.data || facRes.data);
      }
    } catch (err) {
      console.error("Failed to load CBAM products or facility", err);
      toast.error("Could not load CBAM products");
    }
  };

  // ─── CN Code search with debounce ─────────────────────────────────
  useEffect(() => {
    if (!cnCodeSearch || cnCodeSearch.length < 2) {
      setCnCodeResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setCnCodeLoading(true);
      try {
        const res = await cbamAPI.searchCnCodes({
          search: cnCodeSearch,
          limit: 20,
        });
        setCnCodeResults(res.data?.data?.cnCodes || res.data?.data || []);
        setShowCnDropdown(true);
      } catch {
        setCnCodeResults([]);
      } finally {
        setCnCodeLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [cnCodeSearch]);

  // ─── Select a CN code from dropdown ──────────────────────────────
  const handleSelectCnCode = (cnItem) => {
    setSelectedCnCode(cnItem);
    setForm((prev) => ({
      ...prev,
      cnCode: cnItem.cnCode,
      mainCategory: cnItem.mainCategory,
      aggregatedCategory: cnItem.aggregatedCategory || "",
      goodsDescription: cnItem.goodsDescription || "",
      productionRoute: cnItem.productionRoutes?.length === 1 ? cnItem.productionRoutes[0] : prev.productionRoute,
      precursors: (cnItem.precursors || []).map(cat => ({ precursorCategory: cat, precursorName: "" })),
    }));
    setCnCodeSearch(cnItem.cnCode + " — " + cnItem.goodsDescription);
    setShowCnDropdown(false);
  };

  // ─── Filter ────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let list = products;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) => p.productName?.toLowerCase().includes(q) || p.cnCode?.toLowerCase().includes(q) || p.mainCategory?.toLowerCase().includes(q) || p.goodsDescription?.toLowerCase().includes(q),
      );
    }
    if (filterCategory) {
      list = list.filter((p) => p.mainCategory === filterCategory);
    }
    return list;
  }, [products, searchQuery, filterCategory]);

  // ─── Form handlers ────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setCnCodeSearch("");
    setSelectedCnCode(null);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditingId(product._id);
    setForm({
      productName: product.productName || "",
      cnCode: product.cnCode || "",
      mainCategory: product.mainCategory || "",
      aggregatedCategory: product.aggregatedCategory || "",
      goodsDescription: product.goodsDescription || "",
      productionRoute: product.productionRoute || "",
      productionUnit: product.productionUnit || "Tonnes",
      precursors: product.precursors?.map(p => typeof p === 'string' ? { precursorCategory: p, precursorName: p } : { precursorCategory: p.precursorCategory || "", precursorName: p.precursorName || "" }) || [],
      isExported: product.isExported || false,
      suppliers: product.suppliers || [],
    });
    setCnCodeSearch(product.cnCode + " — " + (product.goodsDescription || ""));
    setSelectedCnCode(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setCnCodeSearch("");
    setSelectedCnCode(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productName || !form.cnCode || !form.mainCategory) {
      toast.error("Product Name, CN Code, and Sector are required");
      return;
    }
    if (!facilityId) {
      toast.error("No facility assigned for this user");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        productName: form.productName.trim(),
        cnCode: form.cnCode.trim(),
        mainCategory: form.mainCategory,
        aggregatedCategory: form.aggregatedCategory.trim(),
        goodsDescription: form.goodsDescription.trim(),
        productionRoute: form.productionRoute.trim(),
        productionUnit: form.productionUnit,
        precursors: form.precursors,
        isExported: form.isExported,
        suppliers: form.suppliers,
        facilityId,
      };

      if (editingId) {
        await cbamAPI.updateProduct(editingId, payload);
        toast.success("CBAM product updated");
      } else {
        await cbamAPI.createProduct(payload);
        toast.success("CBAM product created");
      }
      await fetchProducts();
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
      await cbamAPI.deleteProduct(id);
      toast.success("CBAM product deleted");
      setDeleteConfirmId(null);
      await fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleSendMail = async (productId, supplierId) => {
    try {
      await cbamAPI.sendSupplierMail(productId, supplierId);
      toast.success("Email request sent to supplier!");
      await fetchProducts();
      // If the form is currently open and we are editing this product, update its local state too
      if (showForm && editingId === productId) {
        try {
          const updatedProductRes = await cbamAPI.getProducts({ facilityId });
          const updatedProduct = (updatedProductRes.data?.data?.products || updatedProductRes.data?.data || []).find(p => p._id === productId);
          if (updatedProduct) {
            setForm(prev => ({ ...prev, suppliers: updatedProduct.suppliers }));
          }
        } catch { } // ignore
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send email");
    }
  };

  // ─── Loading state ─────────────────────────────────────────────────
  if (loading) return <Loader />;

  const usedCategories = [...new Set(products.map((p) => p.mainCategory))].sort();

  return (
    <div className="animate-in fade-in duration-500">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          {/* Sector filter */}
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">All Sectors</option>
              {(usedCategories.length > 0 ? usedCategories : CBAM_SECTORS).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* ─── Form Modal ───────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{editingId ? "Edit CBAM Product" : "Add New CBAM Product"}</h2>
              <button onClick={closeForm} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Product Name (Dropdown locked to Org Admin boundaries) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="productName"
                    value={form.productName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                  >
                    <option value="">Select a facility product...</option>
                    {(facility?.systemBoundaryProducts || []).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* CN Code Search */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  CN Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={cnCodeSearch}
                    onChange={(e) => {
                      setCnCodeSearch(e.target.value);
                      setShowCnDropdown(true);
                    }}
                    onFocus={() => cnCodeResults.length > 0 && setShowCnDropdown(true)}
                    placeholder="Search by CN code or description..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {cnCodeLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />}
                </div>
                {/* Dropdown */}
                {showCnDropdown && cnCodeResults.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {cnCodeResults.map((cn) => (
                      <button
                        key={cn.cnCode}
                        type="button"
                        onClick={() => handleSelectCnCode(cn)}
                        className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 border-b border-slate-50 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-semibold text-emerald-700">{cn.cnCode}</span>
                          <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">{cn.mainCategory}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{cn.goodsDescription}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Auto-filled fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    CBAM Sector <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="mainCategory"
                    value={form.mainCategory}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">Select sector</option>
                    {CBAM_SECTORS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Aggregated Category</label>
                  <input
                    name="aggregatedCategory"
                    value={form.aggregatedCategory}
                    onChange={handleChange}
                    placeholder="Auto-filled from CN code"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Goods Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Goods Description</label>
                <textarea
                  name="goodsDescription"
                  value={form.goodsDescription}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Auto-filled from CN code"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="isExported"
                  name="isExported"
                  checked={form.isExported}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isExported" className="text-sm font-medium text-slate-700 mt-0.5">
                  Product is Exported <span className="text-xs text-slate-500 font-normal">(falling fully under CBAM reporting)</span>
                </label>
              </div>

              {/* Production Route + Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Production Route</label>
                  {selectedCnCode?.productionRoutes?.length > 0 ? (
                    <select
                      name="productionRoute"
                      value={form.productionRoute}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="">Select route</option>
                      {selectedCnCode.productionRoutes.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      name="productionRoute"
                      value={form.productionRoute}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="">Select route</option>
                      {ALL_PRODUCTION_ROUTES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Production Unit</label>
                  <select
                    name="productionUnit"
                    value={form.productionUnit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {PRODUCTION_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Precursors (Editable Objects) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Required Precursors
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        precursors: [
                          ...(prev.precursors || []),
                          { precursorCategory: selectedCnCode?.precursors?.[0] || "Other", precursorName: "" },
                        ],
                      }))
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 focus:outline-none"
                  >
                    <Plus className="w-3 h-3" /> Add Precursor
                  </button>
                </div>

                {form.precursors?.length === 0 ? (
                  <div className="text-sm text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-slate-100">
                    No precursors defined. Add upstream requirements manually.
                  </div>
                ) : (
                  <div className="space-y-2 border border-slate-200 p-2 rounded-lg bg-slate-50">
                    {form.precursors.map((p, i) => (
                      <div key={i} className="flex gap-2 items-start bg-white p-2 border border-slate-100 rounded-md">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                          <select
                            value={p.precursorCategory || ""}
                            onChange={(e) => {
                              const newP = [...form.precursors];
                              newP[i].precursorCategory = e.target.value;
                              setForm((prev) => ({ ...prev, precursors: newP }));
                            }}
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            {selectedCnCode?.precursors?.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                            {!selectedCnCode?.precursors?.includes(p.precursorCategory) && p.precursorCategory && (
                              <option value={p.precursorCategory}>{p.precursorCategory}</option>
                            )}
                            <option value="Other">Other Category</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Specific Name</label>
                          <input
                            placeholder="e.g. Clinker XYZ"
                            value={p.precursorName || ""}
                            onChange={(e) => {
                              const newP = [...form.precursors];
                              newP[i].precursorName = e.target.value;
                              setForm((prev) => ({ ...prev, precursors: newP }));
                            }}
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="flex flex-col justify-end h-full pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              const newPrecursors = form.precursors.filter((_, idx) => idx !== i);
                              setForm((prev) => ({ ...prev, precursors: newPrecursors }));
                              // Remove any suppliers for this precursor too
                              const newSuppliers = form.suppliers.filter((s) => s.precursorName !== p.precursorName);
                              setForm((prev) => ({ ...prev, suppliers: newSuppliers }));
                            }}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 focus:outline-none transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Supply Chain / Suppliers */}
              {form.precursors?.length > 0 && (
                <div className="pt-4 border-t border-slate-100 mt-2">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-emerald-600" />
                      Supply Chain
                    </label>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, suppliers: [...prev.suppliers, { precursorName: form.precursors[0]?.precursorName || "", supplierName: "", supplierEmail: "" }] }))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Add Supplier
                    </button>
                  </div>

                  {form.suppliers.length === 0 ? (
                    <div className="text-sm text-slate-500 italic px-3 py-3 bg-slate-50 rounded-lg border border-slate-100">No suppliers listed. You must track your upstream emissions.</div>
                  ) : (
                    <div className="space-y-3">
                      {form.suppliers.map((sup, idx) => (
                        <div key={sup._id || idx} className="grid grid-cols-12 gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <div className="col-span-3">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Precursor</label>
                            <select
                              value={sup.precursorName}
                              onChange={(e) => {
                                const newSuppliers = [...form.suppliers];
                                newSuppliers[idx].precursorName = e.target.value;
                                setForm(prev => ({ ...prev, suppliers: newSuppliers }));
                              }}
                              className="w-full px-2 py-1.5 text-xs font-medium border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                            >
                              {form.precursors.map(p => <option key={p.precursorName} value={p.precursorName}>{p.precursorName || "Unnamed"}</option>)}
                            </select>
                          </div>
                          <div className="col-span-3">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Supplier Name</label>
                            <input
                              placeholder="Supplier Ltd."
                              value={sup.supplierName}
                              onChange={(e) => {
                                const newSuppliers = [...form.suppliers];
                                newSuppliers[idx].supplierName = e.target.value;
                                setForm(prev => ({ ...prev, suppliers: newSuppliers }));
                              }}
                              className="w-full px-2 py-1.5 text-xs font-medium border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                          <div className="col-span-3">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                            <input
                              placeholder="contact@supplier.com"
                              type="email"
                              value={sup.supplierEmail}
                              onChange={(e) => {
                                const newSuppliers = [...form.suppliers];
                                newSuppliers[idx].supplierEmail = e.target.value;
                                setForm(prev => ({ ...prev, suppliers: newSuppliers }));
                              }}
                              className="w-full px-2 py-1.5 text-xs font-medium border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                          <div className="col-span-2 flex flex-col justify-end h-full">
                            {sup._id && editingId ? (
                              <button
                                type="button"
                                onClick={() => handleSendMail(editingId, sup._id)}
                                className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 text-[11px] font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                              >
                                <Send className="w-3 h-3" /> Request Data
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic mb-1.5 text-center">Save product to mail</span>
                            )}
                            {sup.status && sup.status !== "pending" && <span className="text-[10px] mt-1 text-center font-bold text-blue-600 bg-blue-50 py-0.5 rounded uppercase tracking-wide">{sup.status}</span>}
                          </div>
                          <div className="col-span-1 flex flex-col justify-end items-end h-full mb-1">
                            <button
                              type="button"
                              onClick={() => {
                                const newSuppliers = form.suppliers.filter((_, i) => i !== idx);
                                setForm(prev => ({ ...prev, suppliers: newSuppliers }));
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Submit */}
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
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Product?</h3>
            <p className="text-sm text-slate-500 mb-6">This will remove the CBAM product definition. Associated production records may be affected.</p>
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

      {/* ─── Products Table ───────────────────────────────────────── */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No CBAM Products"
          description={products.length === 0 ? "Define your first CBAM product by mapping it to a CN code." : "No products match your current filters."}
          action={
            products.length === 0 && (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Your First Product
              </button>
            )
          }
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Products <span className="text-sm font-normal text-slate-400 ml-2">({filteredProducts.length})</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-5 py-3">Product Name</th>
                  <th className="px-5 py-3">CN Code</th>
                  <th className="px-5 py-3">CBAM Sector</th>
                  <th className="px-5 py-3">Exported?</th>
                  <th className="px-5 py-3">Suppliers</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">{product.productName}</td>
                    <td className="px-5 py-4 text-sm text-slate-600 font-mono">{product.cnCode}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">{product.mainCategory}</span>
                    </td>
                    <td className="px-5 py-4">
                      {product.isExported ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider rounded">Yes</span>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {product.suppliers?.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold">{product.suppliers.length}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirmId(product._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
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

export default CbamProducts;
