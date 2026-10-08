import React from "react";
import { Building2, MapPin } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { getSiteUnitLabel } from "../../../utils/uiTerminology";

const FacilityCard = ({ facility, isSelected, onClick }) => {
  const { user } = useAuth();
  const industry = user?.organizationId?.industry || user?.organizationIndustry || "";
  const siteUnitLabel = getSiteUnitLabel(industry, "singular");

  const boundaryConfigured = (facility) => {
    const boundary = facility?.boundarySettings;
    return Boolean(boundary && (boundary.operationalControl || boundary.financialControl || (boundary.equityShare ?? 0) > 0));
  };

  return (
    <button
      type="button"
      onClick={() => onClick(facility._id)}
      className={`text-left bg-white rounded-lg shadow-md p-6 transition-shadow hover:shadow-lg border ${isSelected ? "hover:border-green-500 ring-2 hover:ring-green-200" : "border-white"}`}
    >
      <div className="flex items-start justify-between">
        <div className="bg-gradient-to-br from-green-200 to-green-700 p-2 rounded-xl text-white">
          <Building2 />
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold uppercase tracking-wider">{facility.type || siteUnitLabel}</span>
          {isSelected && <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">Selected</span>}
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mt-4">{facility.facilityName || facility.name}</h3>

      {(facility.facilityLocation || facility.location) && (
        <div className="flex items-center gap-1.5 text-gray-500">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-blue-600" />
          <span className="text-sm truncate">{facility.facilityLocation || facility.location}</span>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Status</p>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${boundaryConfigured(facility) ? "bg-[#22c55e]" : "bg-orange-400"} animate-pulse`} />
            <span className={`text-sm font-semibold ${boundaryConfigured(facility) ? "text-green-700" : "text-orange-700"}`}>{boundaryConfigured(facility) ? "Configured" : "Action Required"}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Area</p>
          <p className="text-sm font-bold text-gray-900">
            {facility.facilityArea ?? "0"} <span className="text-gray-500 font-normal text-xs uppercase">sq.m</span>
          </p>
        </div>
      </div>
    </button>
  );
};

export default FacilityCard;
