import React, { useState, useEffect } from "react";
import { Plus, Building2, Edit, Trash2, MapPin, User, Ruler } from "lucide-react";
import { toast } from "sonner";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "../../components/modals/ConfirmModal";
import Loader from "../../components/rf/Loader";
import FacilityModal from "../../features/organizationAdmin/facilities/FacilityModal";
import { DEFAULT_FACILITY_FORM } from "../../config/constants";

const HeadRegions = () => {
  const { user } = useAuth();
  const organizationId = user?.organizationId?._id || user?.organizationId || "";
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FACILITY_FORM);
  const [error, setError] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [regionToDelete, setRegionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchRegions();
  }, [organizationId]);

  const fetchRegions = async () => {
    try {
      if (!organizationId) {
        setRegions([]);
        return;
      }

      const res = await api.get(`/api/regions?organizationId=${organizationId}`);
      const regionsData = res.data?.data?.regions || res.data?.data || res.data || [];
      setRegions(Array.isArray(regionsData) ? regionsData : []);
    } catch (err) {
      console.error("Error fetching regions:", err);
      setRegions([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (region = null) => {
    if (region) {
      setEditingRegion(region);
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
        facilityHeads: region.regionHeads?.length ? [region.regionHeads[0]] : [{ name: "", email: "" }],
      });
    } else {
      setEditingRegion(null);
      setFormData(DEFAULT_FACILITY_FORM);
    }
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRegion(null);
    setFormData(DEFAULT_FACILITY_FORM);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Region name is required");
      return;
    }

    if (formData.facilityArea === "") {
      setError("Region area is required");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      address: formData.addressLine1,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      city: formData.city,
      postalCode: formData.postalCode,
      state: formData.state,
      type: formData.type,
      facilityArea: formData.facilityArea,
      facilityHeads: formData.facilityHeads.filter((head) => head.name || head.email),
      organizationId,
    };

    try {
      const loadingToast = toast.loading(editingRegion ? "Updating region..." : "Creating region...");
      if (editingRegion) {
        await api.put(`/api/regions/${editingRegion._id}`, payload);
        toast.dismiss(loadingToast);
        toast.success("Region updated successfully!");
      } else {
        await api.post("/api/regions", payload);
        toast.dismiss(loadingToast);
        toast.success("Region created successfully!");
      }
      await fetchRegions();
      closeModal();
    } catch (err) {
      const message = err.response?.data?.message || "Operation failed";
      toast.error(message);
      setError(message);
    }
  };

  const handleDelete = (id) => {
    setRegionToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/api/regions/${regionToDelete}`);
      toast.success("Region deleted successfully!");
      await fetchRegions();
      setDeleteModalOpen(false);
      setRegionToDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

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
            <h1 className="text-xl font-semibold text-gray-900">Regions</h1>
            <p className="text-md text-gray-500">Manage regions in your organization</p>
          </div>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-200"
        >
          <Plus className="w-4 h-4" />
          Add Region
        </button>
      </div>

      {regions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-500">No regions found. Add your first region.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regions.map((region) => (
            <div key={region._id} className="group text-left bg-white rounded-2xl shadow-sm p-6 transition-all hover:shadow-xl border border-slate-200 hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-3">
                <div className="bg-gradient-to-br from-emerald-200 to-emerald-700 p-2.5 rounded-xl text-white shadow-sm shadow-emerald-100">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-bold uppercase tracking-wider">Region</span>
                  <button onClick={() => openModal(region)} className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(region._id)}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mt-4 line-clamp-1">{region.name}</h3>

              {(region.addressLine1 || region.city || region.state) && (
                <div className="flex items-start gap-2 mt-2 text-gray-500 min-h-[40px]">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-blue-600 mt-0.5" />
                  <span className="text-sm line-clamp-2">{[region.addressLine1, region.city, region.state, region.postalCode].filter(Boolean).join(", ")}</span>
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Area</p>
                  <div className="flex items-center gap-1.5 text-slate-900">
                    <Ruler className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-sm font-bold">{region.regionArea ?? 0}</span>
                    <span className="text-[11px] uppercase text-slate-500">sq.m</span>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Regional Admin</p>
                  {region.regionHeads?.[0] ? (
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span
                        className="text-xs font-semibold truncate"
                        title={region.regionHeads[0].name || region.regionHeads[0].firstName || region.regionHeads[0].username || region.regionHeads[0].email}
                      >
                        {region.regionHeads[0].name || region.regionHeads[0].firstName || region.regionHeads[0].username || region.regionHeads[0].email}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs italic text-slate-400">Not assigned</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <FacilityModal
        showModal={showModal}
        editingFacility={editingRegion}
        formData={formData}
        setFormData={setFormData}
        error={error}
        onSubmit={handleSubmit}
        onClose={closeModal}
        siteUnitLabel="Region"
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        processing={deleting}
        title="Delete Region"
        description="Are you sure you want to delete this region? This action cannot be undone."
        confirmText="Delete"
        isDangerous
      />
    </div>
  );
};

export default HeadRegions;
