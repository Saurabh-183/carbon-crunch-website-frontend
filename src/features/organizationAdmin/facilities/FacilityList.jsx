import React from "react";
import FacilityCard from "./FacilityCard";
import FacilityEmptyState from "./FacilityEmptyState";

const FacilityList = ({ facilities, onEdit, onDelete, siteUnitLabel = "Facility" }) => {
  if (facilities.length === 0) {
    return <FacilityEmptyState siteUnitLabel={siteUnitLabel} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {facilities.map((facility) => (
        <FacilityCard key={facility._id} facility={facility} onEdit={onEdit} onDelete={onDelete} siteUnitLabel={siteUnitLabel} />
      ))}
    </div>
  );
};

export default FacilityList;
