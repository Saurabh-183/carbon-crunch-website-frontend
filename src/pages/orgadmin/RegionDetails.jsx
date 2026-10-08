import React, { useEffect, useState } from "react";
import { Building2, User } from "lucide-react";
import { toast } from "sonner";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/rf/Loader";
import { STATE_OPTIONS } from "../../config/constants";

const RegionDetails = () => {
  const { user } = useAuth();
  const organizationId = user?.organizationId?._id || user?.organizationId || "";
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    type: "",
    facilityArea: "",
  });
  const [error, setError] = useState("");

  const fetchRegion = async () => {
    try {
      setLoading(true);
      const regionId = user?.regionId?._id || user?.regionId;

      if (regionId) {
        const res = await api.get(`/api/regions/${regionId}`);
        const regionData = res.data?.data || null;
        setRegion(regionData);
        setFormData({
          name: regionData?.name || "",
          addressLine1: regionData?.addressLine1 || "",
          addressLine2: regionData?.addressLine2 || "",
          city: regionData?.city || "",
          state: regionData?.state || "",
          postalCode: regionData?.postalCode || "",
          country: regionData?.country || "India",
          type: regionData?.type || "",
          facilityArea: regionData?.regionArea ?? "",
        });
        return;
      }

      const listRes = await api.get(`/api/regions?organizationId=${organizationId}`);
      const regions = listRes.data?.data?.regions || listRes.data?.data || listRes.data || [];
      const fallbackRegion = Array.isArray(regions) && regions.length > 0 ? regions[0] : null;
      setRegion(fallbackRegion);
      setFormData({
        name: fallbackRegion?.name || "",
        addressLine1: fallbackRegion?.addressLine1 || "",
        addressLine2: fallbackRegion?.addressLine2 || "",
        city: fallbackRegion?.city || "",
        state: fallbackRegion?.state || "",
        postalCode: fallbackRegion?.postalCode || "",
        country: fallbackRegion?.country || "India",
        type: fallbackRegion?.type || "",
        facilityArea: fallbackRegion?.regionArea ?? "",
      });
    } catch (err) {
      console.error("Error fetching region details:", err);
      setRegion(null);
      toast.error("Failed to load region details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegion();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!region?._id) {
      setError("No region is assigned to your account");
      return;
    }

    if (!formData.name?.trim()) {
      setError("Region name is required");
      return;
    }

    if (formData.facilityArea === "") {
      setError("Region area is required");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      city: formData.city,
      postalCode: formData.postalCode,
      state: formData.state,
      country: formData.country,
      type: formData.type,
      facilityArea: formData.facilityArea,
    };

    try {
      setSaving(true);
      const loadingToast = toast.loading("Updating region details...");
      await api.put(`/api/regions/${region._id}`, payload);
      toast.dismiss(loadingToast);
      toast.success("Region details updated successfully");
      await fetchRegion();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update region details";
      toast.error(message);
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <div className="bg-gradient-to-br from-green-200 to-green-700 p-3 rounded-xl">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Region Details</h1>
          <p className="text-sm text-slate-500">View and maintain your assigned region information.</p>
        </div>
      </div>

      {!region ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center text-slate-500">No region is assigned to your account yet.</div>
      ) : (
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider ml-1 block mb-1.5">
                  Region Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider ml-1 block mb-1.5">Type</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  placeholder="Region type"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider ml-1 block mb-1.5">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => setFormData((prev) => ({ ...prev, addressLine1: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider ml-1 block mb-1.5">Address Line 2</label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => setFormData((prev) => ({ ...prev, addressLine2: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider ml-1 block mb-1.5">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider ml-1 block mb-1.5">
                  State/UT <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  required
                >
                  <option value="">Select State/UT</option>
                  {STATE_OPTIONS.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider ml-1 block mb-1.5">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, postalCode: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider ml-1 block mb-1.5">
                  Region Area <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.facilityArea}
                  onChange={(e) => setFormData((prev) => ({ ...prev, facilityArea: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider ml-1 block mb-1.5">Regional Admin</label>
                <div className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>{region.regionHeads?.[0]?.name || region.regionHeads?.[0]?.firstName || region.regionHeads?.[0]?.username || region.regionHeads?.[0]?.email || "Not assigned"}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    name: region.name || "",
                    addressLine1: region.addressLine1 || "",
                    addressLine2: region.addressLine2 || "",
                    city: region.city || "",
                    state: region.state || "",
                    postalCode: region.postalCode || "",
                    country: region.country || "India",
                    type: region.type || "",
                    facilityArea: region.regionArea ?? "",
                  })
                }
                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-800 transition-all"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Region Details"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RegionDetails;
