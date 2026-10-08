import React, { useState, useEffect, useMemo } from "react";
import { MapPin, Plus, Pencil, Trash2, Search, X, Save, Loader2, ChevronDown, Factory } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cbamAPI } from "../../utils/api";
import Loader from "../../components/rf/Loader";
import SectionHeader from "../../components/rf/Header";
import EmptyState from "../../components/rf/EmptyState";
import { toast } from "sonner";

// ─── Empty form state ────────────────────────────────────────────────────
const emptyForm = {
  installationName: "",
  unLocode: "",
  address: "",
  countryCode: "IN",
  latitude: "",
  longitude: "",
  operatorName: "",
  productIds: [],
};

const CbamInstallations = () => {
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
  const [installations, setInstallations] = useState([]);
  const [products, setProducts] = useState([]);

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
    Promise.all([fetchInstallations(), fetchProducts()]).finally(() => setLoading(false));
  }, [facilityId]);

  const fetchInstallations = async () => {
    try {
      const res = await cbamAPI.getInstallations(facilityId ? { facilityId } : undefined);
      setInstallations(res.data?.data?.installations || res.data?.data || []);
    } catch (err) {
      console.error("Failed to load installations", err);
      toast.error("Could not load installations");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await cbamAPI.getProducts(facilityId ? { facilityId } : undefined);
      setProducts(res.data?.data?.products || res.data?.data || []);
    } catch {
      /* products list is optional for display */
    }
  };

  // ─── Filter ────────────────────────────────────────────────────────
  const filteredInstallations = useMemo(() => {
    if (!searchQuery) return installations;
    const q = searchQuery.toLowerCase();
    return installations.filter(
      (inst) => inst.installationName?.toLowerCase().includes(q) || inst.unLocode?.toLowerCase().includes(q) || inst.operatorName?.toLowerCase().includes(q) || inst.address?.toLowerCase().includes(q),
    );
  }, [installations, searchQuery]);

  // ─── Form handlers ────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  const openEdit = (inst) => {
    setEditingId(inst._id);
    setForm({
      installationName: inst.installationName || "",
      unLocode: inst.unLocode || "",
      address: inst.address || "",
      countryCode: inst.countryCode || "IN",
      latitude: inst.latitude ?? "",
      longitude: inst.longitude ?? "",
      operatorName: inst.operatorName || "",
      productIds: (inst.productIds || []).map((p) => (typeof p === "object" ? p._id : p) || ""),
    });
    setShowForm(true);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          toast.success("Location fetched successfully");
        },
        (error) => {
          toast.error("Failed to get location. Please allow browser location access.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
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

  const handleProductToggle = (productId) => {
    setForm((prev) => {
      const ids = prev.productIds.includes(productId) ? prev.productIds.filter((id) => id !== productId) : [...prev.productIds, productId];
      return { ...prev, productIds: ids };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.installationName) {
      toast.error("Installation name is required");
      return;
    }
    if (!facilityId) {
      toast.error("No facility assigned for this user");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        installationName: form.installationName.trim(),
        unLocode: form.unLocode.trim(),
        address: form.address.trim(),
        countryCode: form.countryCode.trim() || "IN",
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        operatorName: form.operatorName.trim(),
        productIds: form.productIds.filter(Boolean),
        facilityId,
      };

      if (editingId) {
        await cbamAPI.updateInstallation(editingId, payload);
        toast.success("Installation updated");
      } else {
        await cbamAPI.createInstallation(payload);
        toast.success("Installation created");
      }
      await fetchInstallations();
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
      await cbamAPI.deleteInstallation(id);
      toast.success("Installation deleted");
      setDeleteConfirmId(null);
      await fetchInstallations();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  // ─── Loading state ─────────────────────────────────────────────────
  if (loading) return <Loader />;

  // Helper: resolve product name from id
  const getProductName = (id) => {
    const p = products.find((pr) => pr._id === id || pr._id === id?._id);
    return p ? `${p.productName} (${p.cnCode})` : typeof id === "object" ? id.productName || id._id : id;
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-3 py-3 animate-in fade-in duration-500">
      {/* Header */}
      <SectionHeader icon={MapPin} title="CBAM Installations" description="Manage installation details required for CBAM reporting — UN/LOCODE, coordinates, and linked products" />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search installations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Installation
        </button>
      </div>

      {/* ─── Form Modal ───────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{editingId ? "Edit Installation" : "Add New Installation"}</h2>
              <button onClick={closeForm} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Installation Name + Operator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Installation Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="installationName"
                    value={form.installationName}
                    onChange={handleChange}
                    placeholder="e.g. Steel Plant Unit-1"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Operator Name</label>
                  <input
                    name="operatorName"
                    value={form.operatorName}
                    onChange={handleChange}
                    placeholder="e.g. Tata Steel Ltd."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* UN/LOCODE + Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">UN/LOCODE</label>
                  <input
                    name="unLocode"
                    value={form.unLocode}
                    onChange={handleChange}
                    placeholder="e.g. INJAM"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">UN location code for your installation</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country Code</label>
                  <input
                    name="countryCode"
                    value={form.countryCode}
                    onChange={handleChange}
                    placeholder="IN"
                    maxLength={2}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Full address of the installation"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Coordinates */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700">Coordinates of main emission source</label>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Use current location
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      name="latitude"
                      type="number"
                      step="any"
                      value={form.latitude}
                      onChange={handleChange}
                      placeholder="Latitude (e.g. 22.8046)"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <input
                      name="longitude"
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={handleChange}
                      placeholder="Longitude (e.g. 86.2029)"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Linked Products */}
              {products.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Linked CBAM Products</label>
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3 space-y-2">
                    {products.map((p) => (
                      <label key={p._id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded px-2 py-1 transition-colors">
                        <input
                          type="checkbox"
                          checked={form.productIds.includes(p._id)}
                          onChange={() => handleProductToggle(p._id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-slate-700">
                          {p.productName} <span className="text-xs text-slate-400 font-mono">({p.cnCode})</span>
                        </span>
                      </label>
                    ))}
                  </div>
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
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Installation?</h3>
            <p className="text-sm text-slate-500 mb-6">This will remove the installation record. Production records linked to it may be affected.</p>
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

      {/* ─── Installations Cards ──────────────────────────────────── */}
      {filteredInstallations.length === 0 ? (
        <EmptyState
          icon={Factory}
          title="No Installations"
          description={installations.length === 0 ? "Add your first CBAM installation with UN/LOCODE and coordinates." : "No installations match your search."}
          action={
            installations.length === 0 && (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Your First Installation
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredInstallations.map((inst) => (
            <div key={inst._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50">
                    <Factory className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{inst.installationName}</h3>
                    {inst.operatorName && <p className="text-xs text-slate-500">{inst.operatorName}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(inst)} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirmId(inst._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {inst.unLocode && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400 w-20">UN/LOCODE</span>
                    <span className="font-mono text-slate-700">{inst.unLocode}</span>
                  </div>
                )}
                {inst.address && (
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-slate-400 w-20 shrink-0">Address</span>
                    <span className="text-slate-600 text-xs">{inst.address}</span>
                  </div>
                )}
                {(inst.latitude || inst.longitude) && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400 w-20">Coords</span>
                    <span className="text-xs text-slate-600 font-mono">
                      {inst.latitude?.toFixed(4)}, {inst.longitude?.toFixed(4)}
                    </span>
                  </div>
                )}
                {inst.countryCode && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400 w-20">Country</span>
                    <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">{inst.countryCode}</span>
                  </div>
                )}
              </div>

              {/* Linked products */}
              {inst.productIds?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-50">
                  <span className="text-xs font-medium text-slate-400">Products:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {inst.productIds.map((pid, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-100">
                        {getProductName(pid)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CbamInstallations;
