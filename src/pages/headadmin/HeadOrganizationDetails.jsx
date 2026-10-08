import React, { useEffect, useState } from "react";
import { Info, Save, Scale, FileBadge, MapPin, Navigation, Flag, Hash, User, Briefcase, Globe, Mail, Phone, Building2, Calendar } from "lucide-react";
import { toast } from "sonner";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import SectionHeader from "../../components/rf/Header";
import { STATE_OPTIONS } from "../../config/constants";
import Loader from "../../components/rf/Loader";

const HeadOrganizationDetails = () => {
  const { user } = useAuth();
  const organizationId = user?.organizationId?._id || user?.organizationId || "";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    legalEntityType: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    cinOrRegistrationId: "",
    primaryContactName: "",
    primaryContactRole: "",
    contactEmail: "",
    contactPhone: "",
    websiteUrl: "",
    baselineYear: "",
    corporateOfficeAddress: "",
    boardOfDirectors: [],
  });

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await api.get(`/api/organizations/${organizationId}`);
        const org = res.data?.data || res.data;
        setFormData({
          name: org?.name || "",
          legalEntityType: org?.legalEntityType || "",
          addressLine1: org?.address?.line1 || org?.contact?.address?.line1 || org?.address?.street || org?.contact?.address?.street || org?.address?.addressLine1 || "",
          addressLine2: org?.address?.line2 || org?.contact?.address?.line2 || org?.address?.addressLine2 || org?.contact?.address?.addressLine2 || org?.addressLine2 || "",
          city: org?.address?.city || org?.contact?.address?.city || "",
          state: org?.address?.state || org?.contact?.address?.state || "",
          postalCode: org?.address?.postalCode || org?.contact?.address?.postalCode || org?.address?.zipCode || org?.contact?.address?.zipCode || org?.postalCode || org?.zipCode || "",
          country: "India",
          cinOrRegistrationId: org?.cinOrRegistrationId || org?.cin || "",
          primaryContactName: org?.primaryContact?.name || "",
          primaryContactRole: org?.primaryContact?.role || "",
          contactEmail: org?.contactInfo?.email || org?.contact?.email || "",
          contactPhone: org?.contactInfo?.phone || org?.contact?.phone || "",
          websiteUrl: org?.websiteUrl || org?.contactInfo?.website || "",
          baselineYear: org?.baselineYear || "",
          corporateOfficeAddress: org?.corporateOfficeAddress || "",
          boardOfDirectors: org?.boardOfDirectors || [],
        });
      } catch (error) {
        console.error("Error fetching organization details:", error);
        toast.error("Failed to load organization details.");
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      fetchOrg();
    }
  }, [organizationId]);

  const handleAddDirector = () => {
    setFormData((prev) => ({
      ...prev,
      boardOfDirectors: [...prev.boardOfDirectors, { name: "", role: "" }],
    }));
  };

  const handleRemoveDirector = (index) => {
    setFormData((prev) => ({
      ...prev,
      boardOfDirectors: prev.boardOfDirectors.filter((_, i) => i !== index),
    }));
  };

  const handleDirectorChange = (index, field, value) => {
    setFormData((prev) => {
      const newBoard = [...prev.boardOfDirectors];
      newBoard[index][field] = value;
      return { ...prev, boardOfDirectors: newBoard };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.patch(`/api/organizations/${organizationId}`, {
        legalEntityType: formData.legalEntityType,
        cinOrRegistrationId: formData.cinOrRegistrationId,
        addressLine2: formData.addressLine2,
        postalCode: formData.postalCode,
        zipCode: formData.postalCode,
        primaryContact: {
          name: formData.primaryContactName,
          role: formData.primaryContactRole,
        },
        baselineYear: formData.baselineYear,
        websiteUrl: formData.websiteUrl,
        corporateOfficeAddress: formData.corporateOfficeAddress,
        boardOfDirectors: formData.boardOfDirectors,
        address: {
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode,
          zipCode: formData.postalCode,
        },
        contactInfo: {
          email: formData.contactEmail,
          phone: formData.contactPhone,
          website: formData.websiteUrl,
        },
        contact: {
          email: formData.contactEmail,
          phone: formData.contactPhone,
          address: {
            line1: formData.addressLine1,
            line2: formData.addressLine2,
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            postalCode: formData.postalCode,
            zipCode: formData.postalCode,
          },
        },
      });
      toast.success("Organization details updated successfully.");
    } catch (error) {
      console.error("Error updating organization details:", error);
      toast.error(error.response?.data?.message || "Failed to update details.");
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
      <SectionHeader icon={Info} title="Organization Details" description="Maintain official organization information for reporting." />

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-8">
        {/* Section 1: Identity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-full space-y-1.5">
            <label className="text-md font-bold text-gray-700 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" />
              Company/Organization Name
            </label>
            <input type="text" value={formData.name} disabled className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed font-medium" />
          </div>

          <div className="space-y-1.5">
            <label className="text-md font-bold text-gray-700 flex items-center gap-2">
              <Scale className="w-3.5 h-3.5" />
              Legal Entity Type
            </label>
            <input
              type="text"
              value={formData.legalEntityType}
              onChange={(e) => setFormData({ ...formData, legalEntityType: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="e.g. Pvt Ltd, LLC"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-md font-bold text-gray-700 flex items-center gap-2">
              <FileBadge className="w-3.5 h-3.5" />
              CIN / Registration ID
            </label>
            <input
              type="text"
              value={formData.cinOrRegistrationId}
              onChange={(e) => setFormData({ ...formData, cinOrRegistrationId: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="Registration Number"
            />
          </div>
        </div>

        {/* Section 2: Address */}
        <div className="space-y-4 pt-2">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-600" />
            Head Office Address
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Address Line 1"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
            />
            <input
              type="text"
              placeholder="Address Line 2"
              value={formData.addressLine2}
              onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-md font-bold text-gray-500 flex items-center gap-2 ml-1">City</label>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-md font-bold text-gray-500 flex items-center gap-2 ml-1">State</label>
              <div className="relative">
                <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all appearance-none cursor-pointer text-gray-700"
                >
                  <option value="">Select State</option>
                  {STATE_OPTIONS.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-md font-bold text-gray-500 flex items-center gap-2 ml-1">Postal Code</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="PIN"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-md font-bold text-gray-500 flex items-center gap-2 ml-1">Country</label>
              <input type="text" value={formData.country} disabled className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Section 3: Contact Person */}
        <div className="space-y-4 pt-2 border-t border-gray-50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 pt-2">
            <User className="w-4 h-4 text-green-600" />
            Primary Contact Person
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-md font-bold text-gray-500 flex items-center gap-2 ml-1">Full Name</label>
              <input
                type="text"
                placeholder="Name"
                value={formData.primaryContactName}
                onChange={(e) => setFormData({ ...formData, primaryContactName: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-md font-bold text-gray-500 flex items-center gap-2 ml-1">
                <Briefcase className="w-3 h-3" /> Role / Designation
              </label>
              <input
                type="text"
                placeholder="Role"
                value={formData.primaryContactRole}
                onChange={(e) => setFormData({ ...formData, primaryContactRole: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 4: General Contact Info */}
        <div className="space-y-4 pt-2 border-t border-gray-50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 pt-2">
            <Globe className="w-4 h-4 text-green-600" />
            Contact & Web
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-md font-bold text-gray-500 flex items-center gap-2 ml-1">
                <Mail className="w-3.5 h-3.5" /> Email
              </label>
              <input
                type="email"
                placeholder="contact@company.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-md font-bold text-gray-500 flex items-center gap-2 ml-1">
                <Phone className="w-3.5 h-3.5" /> Phone
              </label>
              <input
                type="text"
                placeholder="+91..."
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-md font-bold text-gray-500 flex items-center gap-2 ml-1">Website URL</label>
              <input
                type="text"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-md font-bold text-gray-500 flex items-center gap-2 ml-1 ">
                <Calendar className="w-3.5 h-3.5" /> Baseline Year
              </label>
              <input
                type="text"
                value={formData.baselineYear}
                onChange={(e) => setFormData({ ...formData, baselineYear: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                placeholder="e.g. 2023-2024"
              />
            </div>
          </div>
        </div>

        {/* Section 5: RCO Corporate Details */}
        <div className="space-y-4 pt-2 border-t border-gray-50">
          {/* <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 pt-2">
            <Building2 className="w-4 h-4 text-green-600" />
            RCO Corporate Details
          </h3> */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1.5">
              <label className="text-md font-bold text-gray-500 flex items-center gap-2 ml-1">Corporate Office Address</label>
              <textarea
                placeholder="Full corporate office address"
                value={formData.corporateOfficeAddress}
                onChange={(e) => setFormData({ ...formData, corporateOfficeAddress: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all resize-none h-24"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-md font-bold text-gray-500 flex items-center gap-2 ml-1">Board of Directors</label>
                <button type="button" onClick={handleAddDirector} className="text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100 transition-colors">
                  + Add Director
                </button>
              </div>

              <div className="space-y-3">
                {formData.boardOfDirectors.map((director, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Director Name"
                        value={director.name}
                        onChange={(e) => handleDirectorChange(idx, "name", e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Role (e.g. Managing Director)"
                        value={director.role}
                        onChange={(e) => handleDirectorChange(idx, "role", e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDirector(idx)}
                      className="text-red-500 p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors shrink-0 mt-0.5"
                      title="Remove Director"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                {formData.boardOfDirectors.length === 0 && <div className="text-sm text-gray-400 italic py-2">No board of directors added yet.</div>}
              </div>
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

export default HeadOrganizationDetails;
