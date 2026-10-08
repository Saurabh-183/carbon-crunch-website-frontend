import React, { useState } from "react";
import { Trash2, Loader2, Edit2, Save, X, FileText, ChevronDown, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BulkImportImportedDrafts = ({
  importedLoading,
  importedBatches,
  selectedImportedRowIds,
  deleteSelectedImportedRows,
  submitImportedBatch,
  deleteImportedBatch,
  toggleImportedRowSelection,
  editingImportedRowId,
  updateImportedRowField,
  startEditImportedRow,
  saveEditImportedRow,
  cancelEditImportedRow,
  deleteImportedRow,
  calculateEmissions,
}) => {
  const [expandedBatch, setExpandedBatch] = useState(null);

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || "draft";
    if (s === "rejected") return "bg-red-50 text-red-700 border-red-100";
    if (s === "submitted") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (s === "approved") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header Section */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Imported Data</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and review your batch uploads before final submission.</p>
        </div>
        <button
          type="button"
          disabled={selectedImportedRowIds.size === 0}
          onClick={deleteSelectedImportedRows}
          className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-50 transition-all disabled:opacity-40 shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
          Delete Selected ({selectedImportedRowIds.size})
        </button>
      </div>

      {importedLoading ? (
        <div className="p-12 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
          <p className="text-sm font-medium">Fetching batches...</p>
        </div>
      ) : importedBatches.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium">No imported drafts found.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {importedBatches.map((batch) => {
            const isExpanded = expandedBatch === batch.batchId;
            const hasSubmittableRows = batch.entries.some(e => ["draft", "rejected"].includes(e.status || "draft"));
            const allSubmitted = batch.entries.every(e => ["submitted", "approved"].includes(e.status || "draft"));

            return (
              <div key={batch.batchId} className="group transition-colors">
                {/* Batch Row */}
                <div className={`p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 ${isExpanded ? 'bg-slate-50/80' : ''}`}
                     onClick={() => setExpandedBatch(isExpanded ? null : batch.batchId)}>
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                      <FileText className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{batch.fileName}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md font-medium">{batch.scope}</span>
                        <span className="text-xs text-slate-400">• {batch.entries.length} items</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasSubmittableRows && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); submitImportedBatch(batch); }}
                        className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        Submit Batch
                      </button>
                    )}
                    {!allSubmitted && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteImportedBatch(batch); }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded Table Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-white"
                    >
                      <div className="p-4 pt-0">
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-50/30">
                          <div className="max-h-[400px] overflow-auto overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-sm text-slate-600 z-10">
                                <tr>
                                  <th className="p-3 w-10">
                                    <div className="flex items-center justify-center">
                                      <div className="w-4 h-4 border-2 border-slate-300 rounded" />
                                    </div>
                                  </th>
                                  <th className="p-3 font-bold uppercase tracking-wider">Date</th>
                                  <th className="p-3 font-bold uppercase tracking-wider">Activity/Source</th>
                                  <th className="p-3 font-bold uppercase tracking-wider text-right">Consumption</th>
                                  <th className="p-3 font-bold uppercase tracking-wider text-right">Emissions</th>
                                  <th className="p-3 font-bold uppercase tracking-wider text-center">Status</th>
                                  <th className="p-3 font-bold uppercase tracking-wider text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {batch.entries.map((entry, idx) => {
                                  const isEditing = editingImportedRowId === entry._rowId;
                                  const rowStatus = entry.status || "draft";
                                  const isSubmitted = ["submitted", "approved"].includes(rowStatus);
                                  
                                  return (
                                    <tr key={entry._rowId} className={`hover:bg-white transition-colors ${isEditing ? 'bg-emerald-50/50' : 'bg-transparent'}`}>
                                      <td className="p-3 text-center">
                                        {!isSubmitted ? (
                                          <input
                                            type="checkbox"
                                            className="accent-emerald-600 rounded"
                                            checked={selectedImportedRowIds.has(entry._rowId)}
                                            onChange={() => toggleImportedRowSelection(entry._rowId)}
                                          />
                                        ) : (
                                          <div className="w-4 h-4" />
                                        )}
                                      </td>
                                      <td className="p-3 whitespace-nowrap font-medium text-slate-700">
                                        {isEditing ? (
                                          <input 
                                            type="date" 
                                            className="p-1 border rounded w-32 border-emerald-200 focus:ring-1 focus:ring-emerald-500" 
                                            value={entry.date || ""}
                                            onChange={(e) => updateImportedRowField(entry._rowId, "date", e.target.value)}
                                          />
                                        ) : entry.date ? new Date(entry.date).toLocaleDateString() : "-"}
                                      </td>
                                      <td className="p-3">
                                        {isEditing ? (
                                          <div className="flex flex-col gap-1">
                                            <input 
                                              type="text" 
                                              className="p-1 border rounded w-full border-emerald-200 focus:ring-1 focus:ring-emerald-500 text-xs" 
                                              value={entry.activityType || ""}
                                              onChange={(e) => updateImportedRowField(entry._rowId, "activityType", e.target.value)}
                                              placeholder="Activity Type"
                                            />
                                            <input 
                                              type="text" 
                                              className="p-1 border rounded w-full border-emerald-200 focus:ring-1 focus:ring-emerald-500 text-[10px]" 
                                              value={entry.source || ""}
                                              onChange={(e) => updateImportedRowField(entry._rowId, "source", e.target.value)}
                                              placeholder="Source"
                                            />
                                          </div>
                                        ) : (
                                          <div className="flex flex-col">
                                            <span className="text-slate-900 font-semibold">{entry.activityType || "Unknown"}</span>
                                            <span className="text-slate-400 text-[10px]">{entry.source || "No Source"}</span>
                                          </div>
                                        )}
                                      </td>
                                      <td className="p-3 text-right">
                                        {isEditing ? (
                                          <div className="flex flex-col gap-1">
                                            <input 
                                              type="number" 
                                              className="p-1 border rounded w-24 border-emerald-200 focus:ring-1 focus:ring-emerald-500 text-xs text-right" 
                                              value={entry.consumption || ""}
                                              onChange={(e) => updateImportedRowField(entry._rowId, "consumption", e.target.value)}
                                              placeholder="Consumption"
                                            />
                                            <input 
                                              type="text" 
                                              className="p-1 border rounded w-24 border-emerald-200 focus:ring-1 focus:ring-emerald-500 text-xs" 
                                              value={entry.unit || ""}
                                              onChange={(e) => updateImportedRowField(entry._rowId, "unit", e.target.value)}
                                              placeholder="Unit"
                                            />
                                          </div>
                                        ) : (
                                          <>
                                            <span className="font-mono font-bold text-slate-700">{entry.consumption || 0}</span>
                                            <span className="ml-1 text-slate-400 font-medium">{entry.unit}</span>
                                          </>
                                        )}
                                      </td>
                                      <td className="p-3 text-right">
                                        <div className="bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-bold inline-block">
                                          {calculateEmissions(entry.consumption, entry.unit, entry.source, entry.scope, entry.activityType)} tCO₂e
                                        </div>
                                      </td>
                                      <td className="p-3 text-center">
                                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-tighter ${getStatusStyle(rowStatus)}`}>
                                          {rowStatus}
                                        </span>
                                      </td>
                                      <td className="p-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                          {isEditing ? (
                                            <>
                                              <button onClick={() => saveEditImportedRow(entry._rowId)} className="p-1 text-emerald-600 hover:bg-emerald-100 rounded-md"><Save size={14}/></button>
                                              <button onClick={() => cancelEditImportedRow(entry._rowId)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-md"><X size={14}/></button>
                                            </>
                                          ) : !isSubmitted ? (
                                            <>
                                              <button onClick={() => startEditImportedRow(entry)} className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md"><Edit2 size={14}/></button>
                                              <button onClick={() => deleteImportedRow(entry)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={14}/></button>
                                            </>
                                          ) : (
                                            <span className="text-xs text-slate-400">Locked</span>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BulkImportImportedDrafts;