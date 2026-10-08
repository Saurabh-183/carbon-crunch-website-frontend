import React from "react";
import { Download, X, Calendar, Layers, Activity, FolderTree, Tag, Database, Scale, Zap, Cloud, ClipboardList, FileText, Box } from "lucide-react";
import api from "../../../utils/api";

const SubmissionDetailsModal = ({ selectedRow, onClose }) => {
  if (!selectedRow) return null;

  const handleDownloadDocument = async (entry = selectedRow) => {
    if (!entry?.submissionId) return;
    try {
      const response = await api.get(`/api/submissions/${entry.submissionId}/supporting-document`, {
        params: {
          scope: entry.scopeKey,
          sectionIndex: entry.sectionIndex ?? 0,
          activityIndex: entry.activityIndex ?? 0,
          sourceIndex: entry.sourceIndex ?? 0,
        },
        responseType: "blob",
      });

      const contentDisposition = response.headers["content-disposition"];
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || entry.supportingDocument?.originalName || "supporting-document";

      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading supporting document:", error);
      alert("Failed to download supporting document.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Submission Details</h2>
            <p className="text-xs text-gray-500 mt-0.5">Review full entry information</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {selectedRow.isBulk ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <DetailItem
                  label="Date Range"
                  icon={Calendar}
                  value={
                    selectedRow.dateRange?.start && selectedRow.dateRange?.end
                      ? `${selectedRow.dateRange.start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${selectedRow.dateRange.end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                      : "-"
                  }
                />
                <DetailItem label="Scope" icon={Layers} value={selectedRow.scope || "-"} />
                <DetailItem label="Activity Type" icon={Activity} value={`Bulk import (${selectedRow.entries?.length || 0} entries)`} />
                <DetailItem label="Activity/Source" icon={Database} value="Bulk import" />
                <DetailItem label="Unit of Measure" icon={Scale} value={selectedRow.unitSummary || "-"} />
                <DetailItem label="Total Units" icon={Zap} value={`${Number(selectedRow.totalConsumption || 0).toLocaleString()} ${selectedRow.unitSummary || ""}`} />
                <DetailItem label="Total Emissions" icon={Cloud} value={`${selectedRow.totalEmissions} tCO₂e`} highlight />
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Entries</p>
                  {selectedRow.entries?.find((entry) => entry.supportingDocument?.url || entry.supportingDocument?.downloadUrl) ? (
                    <button
                      type="button"
                      onClick={() => handleDownloadDocument(selectedRow.entries.find((entry) => entry.supportingDocument?.url || entry.supportingDocument?.downloadUrl))}
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
                        <th className="px-3 py-2 text-left">Activity/Source</th>
                        <th className="px-3 py-2 text-left">Unit</th>
                        <th className="px-3 py-2 text-left">Consumption</th>
                        <th className="px-3 py-2 text-left">Emissions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedRow.entries?.map((entry) => (
                        <tr key={entry.id}>
                          <td className="px-3 py-2">{entry.date}</td>
                          <td className="px-3 py-2">
                            {entry.activityType || entry.activityCategory || "-"}
                            {` / ${entry.source || entry.activityGroup || "-"}`}
                          </td>
                          <td className="px-3 py-2">{entry.unit || "-"}</td>
                          <td className="px-3 py-2">{entry.consumption || "-"}</td>
                          <td className="px-3 py-2">{entry.emissions} tCO₂e</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <DetailItem
                label="Date"
                icon={Calendar}
                value={new Date(selectedRow.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              />
              <DetailItem label="Scope" icon={Layers} value={selectedRow.scope || "-"} />
              <DetailItem label="Activity Type" icon={Activity} value={selectedRow.activityType || "-"} />
              <DetailItem label="Group" icon={FolderTree} value={selectedRow.activityGroup || "-"} />
              <DetailItem label="Category" icon={Tag} value={selectedRow.activityCategory || "-"} />
              <DetailItem label="Source" icon={Database} value={selectedRow.source || "-"} />
              <DetailItem label="Unit of Measure" icon={Scale} value={selectedRow.unit || "-"} />
              <DetailItem label="Consumption" icon={Zap} value={selectedRow.consumption ? Number(selectedRow.consumption).toLocaleString() : "-"} />
              <DetailItem label="Emissions" icon={Cloud} value={`${selectedRow.emissions} tCO₂e`} highlight />
              <DetailItem label="Measurement Method" icon={ClipboardList} value={selectedRow.measurementMethod || "-"} />

              {selectedRow.scope === "Scope 3" && <DetailItem label="Scope 3 Module" icon={Box} value={selectedRow.scope3Module || "-"} />}

              <div className="md:col-span-2 pt-4 border-t border-gray-50 mt-2">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-gray-200 text-gray-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Supporting Document</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">
                        {selectedRow.supportingDocument?.url || selectedRow.supportingDocument?.downloadUrl
                          ? selectedRow.supportingDocument?.originalName || "Document attached"
                          : "No document attached"}
                      </p>
                    </div>
                  </div>

                  {(selectedRow.supportingDocument?.url || selectedRow.supportingDocument?.downloadUrl) && (
                    <button
                      type="button"
                      onClick={handleDownloadDocument}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-green-700 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors border border-green-200 shadow-sm hover:shadow"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  )}
                </div>
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

// Reusable Helper Component for Details
const DetailItem = ({ label, value, icon: Icon, highlight = false }) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-2 text-gray-500">
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
    </div>
    <p className={`text-sm font-medium ${highlight ? "text-green-700 bg-green-50 inline-block px-2 py-0.5 rounded-md border border-green-100" : "text-gray-900"}`}>{value}</p>
  </div>
);

export default SubmissionDetailsModal;
