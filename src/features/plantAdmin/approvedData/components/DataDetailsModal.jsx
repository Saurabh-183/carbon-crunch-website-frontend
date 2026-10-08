import React from "react";
import { X, Calendar, Layers, Activity, FolderTree, Tag, Database, Scale, Zap, Cloud, ClipboardList, FileText, Download } from "lucide-react";
import DetailItem from "./DetailItem";

/**
 * DataDetailsModal component displays detailed information about a selected data entry
 * @param {Object} props - Component props
 * @param {Object} props.selectedRow - The selected row data
 * @param {Function} props.onClose - Handler to close the modal
 * @param {Function} props.onDownloadDocument - Handler to download supporting document
 */
const DataDetailsModal = ({ selectedRow, onClose, onDownloadDocument }) => {
  if (!selectedRow) return null;

  const isBulk = selectedRow.isBulk;
  const formatDateRange = (range) => {
    if (!range?.start || !range?.end) return "-";
    const startLabel = range.start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const endLabel = range.end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Approved Data Details</h2>
            <p className="text-xs text-gray-500 mt-0.5">Verified submission record</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <DetailItem
              label="Date"
              icon={Calendar}
              value={
                isBulk
                  ? formatDateRange(selectedRow.dateRange)
                  : new Date(selectedRow.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
              }
            />
            <DetailItem label="Module" icon={Layers} value={selectedRow.moduleLabel || selectedRow.module || "-"} />
            <DetailItem label="Activity Type" icon={Activity} value={isBulk ? `Bulk import (${selectedRow.entries?.length || 0} entries)` : selectedRow.activityType || "-"} />
            <DetailItem label="Group" icon={FolderTree} value={isBulk ? "-" : selectedRow.activityGroup || "-"} />
            <DetailItem label="Category" icon={Tag} value={isBulk ? "-" : selectedRow.activityCategory || "-"} />
            <DetailItem label="Source" icon={Database} value={isBulk ? "Bulk import" : selectedRow.source || "-"} />
            <DetailItem label="Unit of Measure" icon={Scale} value={isBulk ? selectedRow.unitSummary || "-" : selectedRow.unit || "-"} />
            <DetailItem
              label="Consumption"
              icon={Zap}
              value={isBulk ? Number(selectedRow.totalConsumption || 0).toLocaleString() : selectedRow.consumption ? Number(selectedRow.consumption).toLocaleString() : "-"}
            />
            <DetailItem label="Emissions" icon={Cloud} value={`${isBulk ? selectedRow.totalEmissions : selectedRow.emissions} tCO₂e`} highlight />
            <DetailItem label="Measurement Method" icon={ClipboardList} value={isBulk ? "-" : selectedRow.measurementMethod || "-"} />

            {/* Document Section */}
            <div className="md:col-span-2 pt-4 border-t border-gray-50 mt-2">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-gray-200 text-gray-500">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Supporting Document</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                      {isBulk ? "Multiple entries" : selectedRow.supportingDocument?.url || selectedRow.supportingDocument?.downloadUrl ? "Document attached" : "No document attached"}
                    </p>
                  </div>
                </div>

                {!isBulk && (selectedRow.supportingDocument?.url || selectedRow.supportingDocument?.downloadUrl) && (
                  <button
                    type="button"
                    onClick={() => onDownloadDocument(selectedRow)}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-green-700 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors border border-green-200 shadow-sm hover:shadow"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                )}
              </div>
            </div>
          </div>

          {isBulk && (
            <div className="border-t pt-4 mt-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Entries</p>
                {selectedRow.entries?.find((entry) => entry.supportingDocument?.url || entry.supportingDocument?.downloadUrl) ? (
                  <button
                    type="button"
                    onClick={() => onDownloadDocument(selectedRow.entries.find((entry) => entry.supportingDocument?.url || entry.supportingDocument?.downloadUrl))}
                    className="inline-flex items-center gap-1 text-green-700 hover:text-green-800 text-xs"
                  >
                    <Download className="w-3 h-3" />
                    Download document
                  </button>
                ) : (
                  <span className="text-xs text-gray-400">No document</span>
                )}
              </div>
              <div className="max-h-64 overflow-auto border rounded-lg">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Source</th>
                      <th className="px-3 py-2 text-left">Unit</th>
                      <th className="px-3 py-2 text-left">Consumption</th>
                      <th className="px-3 py-2 text-left">Emissions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedRow.entries?.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-3 py-2">{entry.date}</td>
                        <td className="px-3 py-2">{entry.source || "-"}</td>
                        <td className="px-3 py-2">{entry.unit || "-"}</td>
                        <td className="px-3 py-2">{entry.consumption || "-"}</td>
                        <td className="px-3 py-2">{entry.emissions} tCO₂e</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button type="button" onClick={onClose} className="px-5 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataDetailsModal;
