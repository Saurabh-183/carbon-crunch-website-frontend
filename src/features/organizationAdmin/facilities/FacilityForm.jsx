import React from "react";
import { STATE_OPTIONS } from "../../../config/constants";
import { AlertCircle, Building2, Flag, LayoutGrid, Mail, Maximize, Navigation, User, MapPin } from "lucide-react";

const FacilityForm = ({ formData, setFormData, error, onSubmit, onCancel, editingFacility, siteUnitLabel = "Facility" }) => {
  const updateHead = (index, key, value) => {
    setFormData((prev) => {
      const heads = [...prev.facilityHeads];
      heads[index] = { ...heads[index], [key]: value };
      return { ...prev, facilityHeads: heads };
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="space-y-5">
        {/* Name Field */}
        <div className="space-y-1.5 tour-facility-identity">
          <label className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider ml-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            {siteUnitLabel} Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:text-gray-400"
            placeholder={`Enter ${siteUnitLabel.toLowerCase()} name`}
            required
          />
        </div>

        {/* Address Group */}
        <div className="space-y-4 tour-facility-address">
          {/* Address Section */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider ml-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Address Details <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-800 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:text-gray-400 mb-3"
              placeholder="Address Line 1 (Building / Street)"
              required
            />
            <input
              type="text"
              value={formData.addressLine2}
              onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-800 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="Address Line 2 (Area / Landmark)"
            />
          </div>
        </div>

        {/* Country & State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider ml-1">Country</label>
            <input type="text" value={formData.country} disabled className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed select-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider ml-1 flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5" />
              State/UT <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all appearance-none cursor-pointer text-gray-700"
              >
                <option value="">Select State/UT</option>
                {STATE_OPTIONS.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* City & Postal Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider ml-1 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="City"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider ml-1">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="PIN Code"
              required
            />
          </div>
        </div>
        </div>

        {/* Type & Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 tour-facility-details">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider ml-1 flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5" />
              Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all appearance-none cursor-pointer text-gray-700"
              >
                <option value="">Select {siteUnitLabel} Type</option>
                {[`Manufacturing ${siteUnitLabel}`, "Office Building", "Warehouse / Distribution Center", "Research & Development", "Data Center", "Retail Store", "Mixed Use", "Other"].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider ml-1 flex items-center gap-1.5">
              <Maximize className="w-3.5 h-3.5" />
              {siteUnitLabel} Area <span className="text-gray-400 normal-case">(sqft)</span> <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.facilityArea}
              onChange={(e) => setFormData({ ...formData, facilityArea: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:text-gray-400"
              required
            />
          </div>
        </div>

        {/* Department / Site Unit Head */}
        <div className="pt-2 tour-facility-head">
          <label className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider ml-1 mb-2 block">
            Department / {siteUnitLabel} Head <span className="text-red-500">*</span>
          </label>
          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            {formData.facilityHeads.slice(0, 1).map((head, index) => (
              <div key={`head-${index}`} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-800 group-focus-within:text-green-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Head Name"
                    value={head.name}
                    onChange={(e) => updateHead(index, "name", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-800 group-focus-within:text-green-500 transition-colors" />
                  <input
                    type="email"
                    placeholder="Head Email"
                    value={head.email}
                    onChange={(e) => updateHead(index, "email", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-800 transition-all active:scale-95"
        >
          Cancel
        </button>
        <button type="submit" className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95 tour-facility-save">
          {editingFacility ? `Update ${siteUnitLabel}` : `Create ${siteUnitLabel}`}
        </button>
      </div>
    </form>
  );
};

export default FacilityForm;
