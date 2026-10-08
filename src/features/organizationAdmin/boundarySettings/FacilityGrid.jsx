import React from "react";
import FacilityCard from "./FacilityCard";

const FacilityGrid = ({ facilities, selectedFacility, onFacilitySelect, siteUnitPluralLabel = "Facilities" }) => {
  if (facilities.length === 0) {
    return <div className="text-sm text-gray-500">No {siteUnitPluralLabel.toLowerCase()} available.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 hover:scale-098 transition-transform">
      {facilities.map((facility) => (
        <FacilityCard key={facility._id} facility={facility} isSelected={selectedFacility === facility._id} onClick={onFacilitySelect} />
      ))}
    </div>
  );
};

export default FacilityGrid;
