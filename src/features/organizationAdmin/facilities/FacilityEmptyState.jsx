import React from "react";
import { Factory } from "lucide-react";

const FacilityEmptyState = ({ siteUnitLabel = "Facility" }) => {
  const siteUnitPlural = siteUnitLabel === "Branch" ? "Branches" : siteUnitLabel === "Region" ? "Regions" : "Facilities";

  return (
    <div className="bg-white rounded-lg shadow-md p-12 text-center">
      <Factory className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <p className="text-gray-500 text-lg">No {siteUnitPlural.toLowerCase()} found</p>
      <p className="text-gray-400 mt-2">Use "Add {siteUnitLabel}" to create one</p>
    </div>
  );
};

export default FacilityEmptyState;
