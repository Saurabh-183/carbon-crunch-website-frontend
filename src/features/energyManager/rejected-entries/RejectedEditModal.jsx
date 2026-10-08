import React from "react";

const RejectedEditModal = ({ editingEntry, onClose, handleEditChange, handleEditFileChange, handleSaveEdit, saving }) => {
  if (!editingEntry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Edit Rejected Entry</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={editingEntry.date || ""} onChange={(e) => handleEditChange("date", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
            <input
              type="text"
              value={editingEntry.activityType || ""}
              onChange={(e) => handleEditChange("activityType", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
            <input
              type="text"
              value={editingEntry.activityGroup || ""}
              onChange={(e) => handleEditChange("activityGroup", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={editingEntry.activityCategory || ""}
              onChange={(e) => handleEditChange("activityCategory", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <input type="text" value={editingEntry.source || ""} onChange={(e) => handleEditChange("source", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <input type="text" value={editingEntry.unit || ""} onChange={(e) => handleEditChange("unit", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Consumption</label>
            <input
              type="number"
              step="0.01"
              value={editingEntry.consumption || ""}
              onChange={(e) => handleEditChange("consumption", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Measurement Method</label>
            <input
              type="text"
              value={editingEntry.measurementMethod || ""}
              onChange={(e) => handleEditChange("measurementMethod", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Document</label>
            <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => handleEditFileChange(e.target.files?.[0])} className="w-full text-sm" />
            {editingEntry.supportingDocument && !(editingEntry.supportingDocument instanceof File) && <p className="text-xs text-gray-500 mt-1">Current document attached.</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button type="button" onClick={handleSaveEdit} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectedEditModal;
