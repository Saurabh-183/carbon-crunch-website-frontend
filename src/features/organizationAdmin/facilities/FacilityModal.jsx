import React from "react";
import FacilityForm from "./FacilityForm";

const FacilityModal = ({ showModal, editingFacility, formData, setFormData, error, onSubmit, onClose, siteUnitLabel = "Facility" }) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{editingFacility ? `Edit ${siteUnitLabel}` : `Add ${siteUnitLabel}`}</h2>

        <FacilityForm formData={formData} setFormData={setFormData} error={error} onSubmit={onSubmit} onCancel={onClose} editingFacility={editingFacility} siteUnitLabel={siteUnitLabel} />
      </div>
    </div>
  );
};

export default FacilityModal;
