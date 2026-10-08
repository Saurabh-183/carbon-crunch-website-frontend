import React from "react";
import { Factory, MapPin, Edit, Trash2, Building } from "lucide-react";

const FacilityCard = ({ facility, onEdit, onDelete, siteUnitLabel = "Facility" }) => {
  const normalizeRegionText = (value = "") =>
    String(value)
      .replace(/\bBranches\b/g, "Regions")
      .replace(/\bBranch\b/g, "Region")
      .replace(/\bFacilities\b/g, "Regions")
      .replace(/\bFacility\b/g, "Region");

  const displayType = siteUnitLabel === "Region" ? normalizeRegionText(facility.type || siteUnitLabel) : facility.type || siteUnitLabel;
  const rawDisplayName = facility.facilityName || facility.name;
  const displayName = siteUnitLabel === "Region" ? normalizeRegionText(rawDisplayName || "") : rawDisplayName;

  const boundaryConfigured = (facility) => {
    const boundary = facility.boundarySettings;
    return Boolean(boundary && (boundary.operationalControl || boundary.financialControl || (boundary.equityShare ?? 0) > 0));
  };

  const handleCardClick = () => {
    onEdit?.(facility);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      className="text-left bg-white rounded-2xl shadow-md p-6 transition-shadow hover:shadow-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between">
        <div className="bg-gradient-to-br from-green-200 to-green-700 p-2 rounded-xl text-white">
          <Building />
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold uppercase tracking-wider">{displayType}</span>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onEdit?.(facility);
            }}
            className="text-blue-600 hover:text-blue-800"
            aria-label={`Edit ${displayName}`}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.(facility._id);
            }}
            className="text-red-600 hover:text-red-800"
            aria-label={`Delete ${displayName}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mt-4">{displayName}</h3>

      {(facility.facilityAddress || facility.address || facility.facilityLocation || facility.location) && (
        <div className="flex items-center gap-2 mt-2 text-gray-500">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-blue-600" />
          <span className="text-sm truncate">
            {facility.facilityAddress || facility.address || "-"}
            {facility.facilityLocation || facility.location ? `, ${facility.facilityLocation || facility.location}` : ""}
          </span>
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
    </div>
  );
};

export default FacilityCard;
