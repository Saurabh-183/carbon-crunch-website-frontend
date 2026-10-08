import React, { useEffect, useState } from "react";
import { Building2, Hash, Info, Mail, MapPin, Phone, Save, User } from "lucide-react";
import { toast } from "sonner";

import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import SectionHeader from "../../components/rf/Header";
import Loader from "../../components/rf/Loader";

const OfficeInformation = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    officeAdminName: "",
    officeAddress: "",
    icaiId: "",
    contactEmail: user?.email || "",
    contactPhone: "",
  });

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const loadOfficeInformation = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/office-information/me");
      const office = res.data?.data || {};

      setFormData({
        officeAdminName: office.officeAdminName || "",
        officeAddress: office.officeAddress || "",
        icaiId: office.icaiId || "",
        contactEmail: office.contactEmail || user?.email || "",
        contactPhone: office.contactPhone || "",
      });
    } catch (error) {
      console.error("Error fetching office information:", error);
      toast.error(error.response?.data?.message || "Failed to load office information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?._id) return;
    loadOfficeInformation();
  }, [user?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.officeAdminName.trim() || !formData.officeAddress.trim() || !formData.icaiId.trim()) {
      toast.error("Please fill Office Admin Name, Office Address and ICAI ID.");
      return;
    }

    try {
      setSaving(true);
      await api.put("/api/office-information/me", {
        officeAdminName: formData.officeAdminName,
        officeAddress: formData.officeAddress,
        icaiId: formData.icaiId,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
      });

      toast.success("Office information saved successfully.");
      await loadOfficeInformation();
    } catch (error) {
      console.error("Error saving office information:", error);
      toast.error(error.response?.data?.message || "Failed to save office information.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <SectionHeader icon={Info} title="Office Information" description="Maintain one-time office profile details for compliance and reporting." />

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-md font-bold text-gray-700 flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              Office Admin Name
            </label>
            <input
              type="text"
              value={formData.officeAdminName}
              onChange={(e) => updateField("officeAdminName", e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-md font-bold text-gray-700 flex items-center gap-2">
              <Hash className="w-3.5 h-3.5" />
              ICAI ID
            </label>
            <input
              type="text"
              value={formData.icaiId}
              onChange={(e) => updateField("icaiId", e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
              placeholder="e.g. ICAI-12345"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-600" />
            Office Address
          </h3>
          <textarea
            value={formData.officeAddress}
            onChange={(e) => updateField("officeAddress", e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all resize-none h-24"
            placeholder="Enter complete office address"
          />
        </div>

        <div className="space-y-4 pt-2 border-t border-gray-50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 pt-2">
            <Building2 className="w-4 h-4 text-green-600" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-md font-bold text-gray-500 flex items-center gap-2 ml-1">
                <Mail className="w-3.5 h-3.5" /> Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => updateField("contactEmail", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                placeholder="office.admin@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-md font-bold text-gray-500 flex items-center gap-2 ml-1">
                <Phone className="w-3.5 h-3.5" /> Phone
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => updateField("contactPhone", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                placeholder="+91..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-50">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 font-medium shadow-lg shadow-green-100 transition-all active:scale-95"
          >
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? "Saving Changes..." : "Save Details"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfficeInformation;
