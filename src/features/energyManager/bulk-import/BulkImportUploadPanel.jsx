import React from "react";
import { FileUp, CheckCircle, Loader2, Trash2, Save, X, Edit2, AlertTriangle } from "lucide-react";

const getStatusClass = (status) => {
  const s = (status || "draft").toLowerCase();
  if (s === "submitted") return "text-emerald-700 bg-emerald-50 border-emerald-100";
  if (s === "approved") return "text-emerald-700 bg-emerald-50 border-emerald-100";
  if (s === "rejected") return "text-red-700 bg-red-50 border-red-100";
  return "text-slate-600 bg-slate-100 border-slate-200";
};

const BulkImportUploadPanel = ({
  fileInputRef,
  handleBulkFilesSelected,
  resetBulkImport,
  scope3Module,
  setScope3Module,
  previewLoading,
  bulkPreview,
  previewSummary,
  selectedRowIds,
  deleteSelectedRows,
  updatePreviewBatchFields,
  updatePreviewBatchField,
  getActivityTypeOptionsFromEf,
  getGroupOptions,
  getCategoryOptions,
  getSourceOptions,
  getUnitOptions,
  calculateEmissions,
  editingRowId,
  updateRowField,
  toggleRowSelection,
  startEditRow,
  saveEditRow,
  cancelEditRow,
  deleteRow,
  bulkImporting,
  handleBulkImport,
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Upload files</h2>
        <p className="text-md text-gray-500">We auto-classify scope from file names and headers.</p>
      </div>
      <div className="flex items-center gap-3">
        <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
          <FileUp className="w-4 h-4" />
          <span className="text-sm">Select Excel files</span>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" multiple className="hidden" onChange={(e) => handleBulkFilesSelected(Array.from(e.target.files || []))} />
        </label>
        <button type="button" onClick={resetBulkImport} className="text-sm text-gray-500 hover:text-gray-700">
          Clear
        </button>
      </div>
    </div>

    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
      <p className="font-medium text-gray-700 mb-2">Naming tips</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>DG/diesel/coal → Scope 1</li>
        <li>electricity/steam/heat → Scope 2</li>
        <li>Scope 3 rows are detected via mapping + sheet contents.</li>
      </ul>
    </div>

    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700">Scope 3 module for imports</label>
      <select value={scope3Module} onChange={(e) => setScope3Module(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
        <option value="Upstream">Upstream</option>
        <option value="Downstream">Downstream</option>
      </select>
    </div>

    {previewLoading && (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        Parsing files…
      </div>
    )}

    {bulkPreview.length > 0 && (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-xs text-green-700">Files</p>
            <p className="text-2xl font-semibold text-green-900">{previewSummary.totalFiles}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-blue-700">Rows</p>
            <p className="text-2xl font-semibold text-blue-900">{previewSummary.totalRows}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-xs text-amber-700">Warnings</p>
            <p className="text-2xl font-semibold text-amber-900">{previewSummary.totalWarnings}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-500">Selected rows: {selectedRowIds.size}</div>
          <button
            type="button"
            disabled={selectedRowIds.size === 0}
            onClick={deleteSelectedRows}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete selected
          </button>
        </div>

        <div className="border rounded-lg divide-y">
          {bulkPreview.map((item) => (
            <div key={item.fileName} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.fileName}</p>
                  <p className="text-xs text-gray-500">
                    {item.scope || "Scope 1"} • Source: {item.sourceTerm}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  {item.imported && <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">Imported</span>}
                  <span>{item.entries.length} rows</span>
                </div>
              </div>
              {item.warnings?.length ? (
                <ul className="mt-2 text-xs text-orange-600 list-disc pl-5">
                  {item.warnings.map((warning, idx) => (
                    <li key={`${item.fileName}-warn-${idx}`}>{warning}</li>
                  ))}
                </ul>
              ) : (
                <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  No issues detected
                </div>
              )}

              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700">View rows</summary>
                <div className="mt-3 border rounded-lg overflow-hidden">
                  {item.entries.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">No rows available for preview.</div>
                  ) : (
                    <div className="max-h-[320px] overflow-auto">
                      <table className="min-w-[1200px] w-full text-sm">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                          <tr>
                            <th className="px-3 py-2 text-left"></th>
                            <th className="px-3 py-2 text-left">Date</th>
                            <th className="px-3 py-2 text-left">Activity Type</th>
                            <th className="px-3 py-2 text-left">Group</th>
                            <th className="px-3 py-2 text-left">Category</th>
                            <th className="px-3 py-2 text-left">Source</th>
                            <th className="px-3 py-2 text-left">Unit</th>
                            <th className="px-3 py-2 text-left">Consumption</th>
                            <th className="px-3 py-2 text-left">Measurement Method</th>
                            <th className="px-3 py-2 text-left">Scope</th>
                            <th className="px-3 py-2 text-left">Emissions</th>
                            <th className="px-3 py-2 text-left">Status</th>
                            <th className="px-3 py-2 text-left">Supporting Doc</th>
                            <th className="px-3 py-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {item.entries.map((entry, idx) => {
                            const rowStatus = entry.status || "draft";
                            const isLocked = rowStatus === "submitted" || rowStatus === "approved";
                            const rowScope = entry.scope || item.scope || "Scope 1";
                            const rowScope3Module = rowScope === "Scope 3" ? scope3Module : null;
                            const activityOptions = getActivityTypeOptionsFromEf(rowScope, rowScope3Module);
                            const groupOptions = getGroupOptions(entry.activityType, rowScope, rowScope3Module);
                            const categoryOptions = getCategoryOptions(entry.activityType, rowScope, entry.activityGroup, rowScope3Module);
                            const sourceOptions = getSourceOptions(entry.activityType, rowScope, entry.activityGroup, entry.activityCategory, rowScope3Module);
                            const unitOptions = getUnitOptions(entry.activityType, rowScope, entry.activityGroup, entry.activityCategory, entry.source, rowScope3Module);
                            return (
                              <tr key={`${item.fileName}-row-${idx}`} className="bg-white">
                                <td className="px-3 py-2">
                                  <input type="checkbox" className="rounded" checked={selectedRowIds.has(entry._rowId)} onChange={() => toggleRowSelection(entry._rowId)} disabled={isLocked} />
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                  {editingRowId === entry._rowId ? (
                                    <input
                                      type="date"
                                      value={entry.date || ""}
                                      onChange={(e) => updateRowField(entry._rowId, "date", e.target.value)}
                                      className="w-full min-w-[140px] px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                  ) : entry.date ? (
                                    new Date(entry.date).toLocaleDateString()
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  {editingRowId === entry._rowId ? (
                                    <select
                                      value={entry.activityType || ""}
                                      onChange={(e) => updateRowField(entry._rowId, "activityType", e.target.value)}
                                      className="w-full min-w-[160px] px-2 py-1 border border-gray-300 rounded text-sm"
                                    >
                                      <option value="">Select activity</option>
                                      {activityOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    entry.activityType || "-"
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  {editingRowId === entry._rowId ? (
                                    <select
                                      value={entry.activityGroup || ""}
                                      onChange={(e) => updateRowField(entry._rowId, "activityGroup", e.target.value)}
                                      className="w-full min-w-[140px] px-2 py-1 border border-gray-300 rounded text-sm"
                                    >
                                      <option value="">Select group</option>
                                      {groupOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    entry.activityGroup || "-"
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  {editingRowId === entry._rowId ? (
                                    <select
                                      value={entry.activityCategory || ""}
                                      onChange={(e) => updateRowField(entry._rowId, "activityCategory", e.target.value)}
                                      className="w-full min-w-[140px] px-2 py-1 border border-gray-300 rounded text-sm"
                                    >
                                      <option value="">Select category</option>
                                      {categoryOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    entry.activityCategory || "-"
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  {editingRowId === entry._rowId ? (
                                    <select
                                      value={entry.source || ""}
                                      onChange={(e) => updateRowField(entry._rowId, "source", e.target.value)}
                                      className="w-full min-w-[140px] px-2 py-1 border border-gray-300 rounded text-sm"
                                    >
                                      <option value="">Select source</option>
                                      {sourceOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    entry.source || "-"
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  {editingRowId === entry._rowId ? (
                                    <select
                                      value={entry.unit || ""}
                                      onChange={(e) => updateRowField(entry._rowId, "unit", e.target.value)}
                                      className="w-full min-w-[120px] px-2 py-1 border border-gray-300 rounded text-sm"
                                    >
                                      <option value="">Select unit</option>
                                      {unitOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    entry.unit || "-"
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  {editingRowId === entry._rowId ? (
                                    <input
                                      type="number"
                                      value={entry.consumption || ""}
                                      onChange={(e) => updateRowField(entry._rowId, "consumption", e.target.value)}
                                      className="w-full min-w-[120px] px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                  ) : (
                                    entry.consumption || "-"
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  {editingRowId === entry._rowId ? (
                                    <input
                                      type="text"
                                      value={entry.measurementMethod || ""}
                                      onChange={(e) => updateRowField(entry._rowId, "measurementMethod", e.target.value)}
                                      className="w-full min-w-[140px] px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                  ) : (
                                    entry.measurementMethod || "-"
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  {editingRowId === entry._rowId ? (
                                    <input
                                      type="text"
                                      value={entry.scope || item.scope || ""}
                                      onChange={(e) => updateRowField(entry._rowId, "scope", e.target.value)}
                                      className="w-full min-w-[120px] px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                  ) : (
                                    entry.scope || item.scope || "-"
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  {calculateEmissions(entry.consumption, entry.unit, entry.source, entry.scope || item.scope, entry.activityType, entry.scope === "Scope 3" ? scope3Module : null)}{" "}
                                  tCO₂e
                                </td>
                                <td className="px-3 py-2">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full border capitalize text-[11px] font-semibold ${getStatusClass(rowStatus)}`}>
                                    {rowStatus}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-600">{entry.supportingDocument?.name || entry.supportingDocument?.originalName || "-"}</td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    {isLocked ? (
                                      <span className="text-xs text-gray-400">Locked</span>
                                    ) : editingRowId === entry._rowId ? (
                                      <>
                                        <button type="button" onClick={() => saveEditRow(entry._rowId)} className="p-1 text-green-600 hover:text-green-700" title="Save">
                                          <Save className="w-4 h-4" />
                                        </button>
                                        <button type="button" onClick={() => cancelEditRow(entry._rowId)} className="p-1 text-gray-500 hover:text-gray-700" title="Cancel">
                                          <X className="w-4 h-4" />
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button type="button" onClick={() => startEditRow(entry)} className="p-1 text-blue-600 hover:text-blue-700" title="Edit">
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button type="button" onClick={() => deleteRow(entry._rowId)} className="p-1 text-red-600 hover:text-red-700" title="Delete">
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
    )}

    <div className="flex flex-wrap items-center justify-end gap-3">
      <button
        type="button"
        disabled={bulkImporting || bulkPreview.length === 0}
        onClick={handleBulkImport}
        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {bulkImporting ? "Importing…" : "Import drafts"}
      </button>
    </div>
  </div>
);

export default BulkImportUploadPanel;
