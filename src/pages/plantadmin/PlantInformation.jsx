import React, { useEffect, useState } from "react";
import { Save, Factory, User, MapPin } from "lucide-react";
import { toast } from "sonner";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import SectionHeader from "../../components/rf/Header";
import Loader from "../../components/rf/Loader";
import { getSiteUnitLabel } from "../../utils/uiTerminology";

const PlantInformation = () => {
  const { user } = useAuth();
  const userIndustry = user?.organizationId?.industry || user?.organizationIndustry || "";
  const [resolvedIndustry, setResolvedIndustry] = useState(userIndustry);
  const siteUnitLabel = getSiteUnitLabel(resolvedIndustry || userIndustry);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [facilityId, setFacilityId] = useState("");

  const [formData, setFormData] = useState({
    managerName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        // Assuming user.facilities[0].facilityId holds the primary facility for the plant admin
        const id = user?.facilities?.[0]?.facilityId || user?.facilities?.[0];

        if (!id) {
          toast.error(`No ${siteUnitLabel.toLowerCase()} mapped to this user.`);
          setLoading(false);
          return;
        }

        setFacilityId(id);

        const res = await api.get(`/api/facilities/${id}`);
        const facility = res.data?.data || res.data;

        setFormData({
          managerName: facility?.facilityHeads?.[0]?.name || "",
          addressLine1: facility?.facilityAddress || facility?.addressLine1 || facility?.address || "",
          addressLine2: facility?.facilityAddressLine2 || facility?.addressLine2 || "",
          city: facility?.facilityCity || facility?.city || "",
          state: facility?.facilityState || facility?.state || "",
          postalCode: facility?.facilityPostalCode || facility?.postalCode || "",
          country: facility?.country || "India",
        });
      } catch (error) {
        console.error("Error fetching facility details:", error);
        toast.error(`Failed to load ${siteUnitLabel.toLowerCase()} details.`);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchFacility();
    }
  }, [user]);

  useEffect(() => {
    const fetchOrganizationIndustry = async () => {
      const orgId = user?.organizationId?._id || user?.organizationId;
      if (!orgId) return;

      try {
        const res = await api.get(`/api/organizations/${orgId}`);
        const org = res.data?.data || res.data;
        if (org?.industry) {
          setResolvedIndustry(org.industry);
        }
      } catch (error) {
        console.error("Error fetching organization industry:", error);
      }
    };

    fetchOrganizationIndustry();
  }, [user?.organizationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!facilityId) {
      toast.error(`No ${siteUnitLabel.toLowerCase()} ID available to update`);
      return;
    }

    setSaving(true);

    try {
      await api.put(`/api/facilities/${facilityId}`, {
        facilityAddress: formData.addressLine1,
        facilityAddressLine2: formData.addressLine2,
        facilityCity: formData.city,
        facilityState: formData.state,
        facilityPostalCode: formData.postalCode,
        country: formData.country,
        facilityHeads: formData.managerName ? [{ name: formData.managerName }] : [],
      });
      toast.success(`${siteUnitLabel} profile details updated successfully.`);
    } catch (error) {
      console.error("Error updating plant details:", error);
      toast.error(error.response?.data?.message || `Failed to update ${siteUnitLabel.toLowerCase()} details.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader icon={Factory} title={`${siteUnitLabel} Information`} description={`Maintain local profile details for this ${siteUnitLabel.toLowerCase()}.`} />

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-8">
        <div className="space-y-4 pt-2">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <User className="w-4 h-4 text-green-600" />
            {siteUnitLabel} Manager Details
          </h3>
          <div className="space-y-1.5">
            <label className="text-md font-bold text-gray-700">{siteUnitLabel} Manager Name</label>
            <input
              type="text"
              value={formData.managerName}
              onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
              placeholder={`Enter ${siteUnitLabel.toLowerCase()} manager name`}
            />
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-gray-50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 pt-2">
            <MapPin className="w-4 h-4 text-green-600" />
            {siteUnitLabel} Address
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-md font-bold text-gray-700">Address Line 1</label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                placeholder="Enter address line 1"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-md font-bold text-gray-700">Address Line 2</label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                placeholder="Enter address line 2"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-md font-bold text-gray-700">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                placeholder="Enter city"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-md font-bold text-gray-700">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                placeholder="Enter state"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-md font-bold text-gray-700">Postal Code</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                placeholder="Enter postal code"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-md font-bold text-gray-700">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                placeholder="Enter country"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
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

export default PlantInformation;
