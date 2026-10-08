import React from "react";
import {
  Upload, FileText, CheckCircle, Clock, Edit2, Trash2, X,
  ChevronDown, ChevronRight, CornerDownRight, Download, Send, AlertCircle, Plus
} from "lucide-react";

const DataEntryTable = ({
  newEntry, setNewEntry, reportingPeriodStart, reportingPeriodEnd,
  activityTypeOptions, groupOptions, categoryOptions, sourceOptions, unitOptions,
  handleActivityTypeChange, handleGroupChange, handleCategoryChange, handleSourceChange, handleFileChange, handleAddEntry,
  saving, editingIndex, isRejectedView, groupedRows, expandedBulkKeys, toggleBulkKey,
  handleSubmitBulkGroup, handleDownloadDocument, handleEditEntry, handleDeleteEntry, handleSubmitEntry,
  selectedEntryIds, toggleEntrySelection, calculateEmissions, getScopeFromActivityType,
  editingRowId, startEditRow, saveEditRow, cancelEditRow, updateRowField, updateRowActivityType,
  updateRowGroup, updateRowCategory, updateRowSource, getActivityTypeOptionsFromEf,
  getGroupOptions, getCategoryOptions, getSourceOptions, getUnitOptions, selectedScope3Module
}) => {

  const getStatusBadge = (status) => {
    const configs = {
      approved: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", icon: <CheckCircle size={12} /> },
      submitted: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", icon: <Clock size={12} /> },
      rejected: { bg: "bg-red-50", text: "text-red-700", border: "border-red-100", icon: <AlertCircle size={12} /> },
      draft: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", icon: <Clock size={12} /> }
    };
    const config = configs[status] || configs.draft;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-tight ${config.bg} ${config.text} ${config.border}`}>
        {config.icon} {status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="max-h-[600px] overflow-auto">
        <table className="min-w-[1700px] w-full border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-30 bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-4 w-12 border-b border-slate-200"></th>
              {[
                { label: "Date", width: "140px" },
                { label: "Activity Type", width: "180px" },
                { label: "Group", width: "160px" },
                { label: "Category", width: "170px" },
                { label: "Source", width: "180px" },
                { label: "Unit", width: "140px" },
                { label: "Consumption", width: "140px" },
                { label: "Method", width: "180px" },
                { label: "Emissions", width: "150px" },
                { label: "Status", width: "120px" },
                ...(isRejectedView ? [{ label: "Rejection Comments", width: "240px" }] : []),
                { label: "Doc", width: "100px" },
                { label: "Actions", width: "140px" }
              ].map((head) => (
                <th key={head.label} style={{ minWidth: head.width }} className="px-4 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">
                  {head.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* 1. NEW ENTRY INPUT ROW */}
            <tr className="bg-emerald-50/40 sticky top-[52px] z-20 backdrop-blur-sm border-b-2 border-emerald-100">
              <td className="px-4 py-4"></td>
              <td className="px-3 py-4">
                <input type="date" value={newEntry.date} onChange={(e) => setNewEntry(p => ({ ...p, date: e.target.value }))} className="w-full px-2 py-1.5 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
              </td>
              <td className="px-3 py-4">
                <select value={newEntry.activityType} onChange={(e) => handleActivityTypeChange(e.target.value)} className="w-full px-2 py-1.5 border border-emerald-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none">
                  <option value="">Select Type</option>
                  {activityTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </td>
              <td className="px-3 py-4">
                <select value={newEntry.activityGroup} onChange={(e) => handleGroupChange(e.target.value)} disabled={!newEntry.activityType} className="w-full px-2 py-1.5 border border-emerald-200 rounded-lg text-xs disabled:bg-slate-100 outline-none">
                  <option value="">Group</option>
                  {groupOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </td>
              <td className="px-3 py-4">
                <select value={newEntry.activityCategory} onChange={(e) => handleCategoryChange(e.target.value)} disabled={!newEntry.activityGroup} className="w-full px-2 py-1.5 border border-emerald-200 rounded-lg text-xs disabled:bg-slate-100 outline-none">
                  <option value="">Category</option>
                  {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </td>
              <td className="px-3 py-4">
                <select value={newEntry.source} onChange={(e) => handleSourceChange(e.target.value)} disabled={!newEntry.activityCategory} className="w-full px-2 py-1.5 border border-emerald-200 rounded-lg text-xs disabled:bg-slate-100 outline-none">
                  <option value="">Source</option>
                  {sourceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </td>
              <td className="px-3 py-4">
                <select value={newEntry.unit} onChange={(e) => setNewEntry(p => ({ ...p, unit: e.target.value }))} disabled={!newEntry.source} className="w-full px-2 py-1.5 border border-emerald-200 rounded-lg text-xs disabled:bg-slate-100 outline-none">
                  <option value="">Unit</option>
                  {unitOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </td>
              <td className="px-3 py-4">
                <input type="number" step="0.01" value={newEntry.consumption} onChange={(e) => setNewEntry(p => ({ ...p, consumption: e.target.value }))} placeholder="0.00" className="w-full px-2 py-1.5 border border-emerald-200 rounded-lg text-xs font-bold outline-none" />
              </td>
              <td className="px-3 py-4">
                <select value={newEntry.measurementMethod} onChange={(e) => setNewEntry(p => ({ ...p, measurementMethod: e.target.value }))} className="w-full px-2 py-1.5 border border-emerald-200 rounded-lg text-xs outline-none">
                  <option value="">Method</option>
                  <option value="Meter">Meter</option>
                  <option value="Invoice">Invoice</option>
                </select>
              </td>
              <td className="px-4 py-4">
                <span className="text-xs font-black text-emerald-700 bg-white px-2 py-1 rounded shadow-sm">
                  {newEntry.consumption && newEntry.unit && newEntry.source ?
                    `${calculateEmissions(newEntry.consumption, newEntry.unit, newEntry.source, newEntry.scope || getScopeFromActivityType(newEntry.activityType), newEntry.activityType, selectedScope3Module, newEntry.emissionFactor, newEntry.carbonContent)} tCO₂e`
                    : "0.00 tCO₂e"}
                </span>
              </td>
              <td className="px-4 py-4">{getStatusBadge("draft")}</td>
              {isRejectedView && <td className="px-4 py-4">—</td>}
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <label className="p-2 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 cursor-pointer transition-colors shadow-sm group">
                    <input type="file" onChange={handleFileChange} className="hidden" />
                    <Upload size={14} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                  </label>
                  {newEntry.supportingDocument && <FileText size={16} className="text-emerald-600 animate-bounce" />}
                </div>
              </td>
              <td className="px-4 py-4">
                <button onClick={handleAddEntry} disabled={saving || !newEntry.supportingDocument} className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-30 flex items-center justify-center gap-2">
                  {saving ? "..." : <><Plus size={14} /> {editingIndex !== null ? "Update" : "Add"}</>}
                </button>
              </td>
            </tr>

            {/* 2. DATA ROWS */}
            {groupedRows.map((row) => {
              if (row.type === "bulk") {
                const isExpanded = expandedBulkKeys.has(row.bulkKey);
                return (
                  <React.Fragment key={`bulk-${row.bulkKey}`}>
                    <tr className="bg-slate-50/80 border-l-4 border-l-blue-400 group transition-colors">
                      <td className="px-4 py-4 text-center cursor-pointer" onClick={() => toggleBulkKey(row.bulkKey)}>
                        {isExpanded ? <ChevronDown size={16} className="text-blue-600" /> : <ChevronRight size={16} className="text-slate-400" />}
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-700">{row.dateLabel}</td>
                      <td className="px-4 py-4 text-xs font-bold text-blue-700 uppercase">Bulk Upload ({row.entries.length} rows)</td>
                      <td colSpan={3}></td>
                      <td className="px-4 py-4 text-xs font-medium text-slate-400">{row.unitLabel}</td>
                      <td className="px-4 py-4 text-sm font-black text-slate-700">{Number(row.totalConsumption || 0).toLocaleString()}</td>
                      <td></td>
                      <td className="px-4 py-4 font-mono font-bold text-blue-700">{row.totalEmissions} tCO₂e</td>
                      <td className="px-4 py-4">{getStatusBadge(row.status)}</td>
                      {isRejectedView && <td></td>}
                      <td className="px-4 py-4"></td>
                      <td className="px-4 py-4 text-right">
                        {row.hasSubmittable && (
                          <button onClick={() => handleSubmitBulkGroup(row)} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-blue-700">Submit</button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && row.entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="px-4 py-4 flex justify-end pt-5"><CornerDownRight size={14} className="text-slate-300" /></td>
                        <td className="px-4 py-4 text-slate-500 font-medium">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="px-4 py-4 font-semibold text-slate-700">{entry.activityType}</td>
                        <td className="px-4 py-4 text-xs text-slate-500">{entry.activityGroup || "—"}</td>
                        <td className="px-4 py-4 text-xs text-slate-500">{entry.activityCategory || "—"}</td>
                        <td className="px-4 py-4 text-xs text-slate-500">{entry.source}</td>
                        <td className="px-4 py-4 text-xs text-slate-500 font-mono italic">{entry.unit}</td>
                        <td className="px-4 py-4 text-sm font-bold text-slate-600">{parseFloat(entry.consumption).toLocaleString()}</td>
                        <td className="px-4 py-4 text-[10px] font-bold uppercase text-slate-400">{entry.measurementMethod || "—"}</td>
                        <td className="px-4 py-4 font-mono text-xs font-bold text-slate-900">{entry.emissions} tCO₂e</td>
                        <td className="px-4 py-4">{getStatusBadge(entry.status)}</td>
                        {isRejectedView && <td className="px-4 py-4 text-xs text-red-600 font-medium italic">{entry.rejectionReason || "—"}</td>}
                        <td className="px-4 py-4 text-center">
                          {entry.supportingDocument?.url ? <button onClick={() => handleDownloadDocument(entry)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Download size={14} /></button> : "—"}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleEditEntry(entry)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={12} /></button>
                            <button onClick={() => handleDeleteEntry(entry)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              }

              const entry = row.entry;
              return (
                <tr key={entry.id || index} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 text-center">
                    <input type="checkbox" className="accent-emerald-600 rounded" checked={selectedEntryIds.has(entry.id)} onChange={() => toggleEntrySelection(entry.id)} disabled={!entry.id} />
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-700">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="px-4 py-4 font-bold text-slate-900">{entry.activityType}</td>
                  <td className="px-4 py-4 text-xs text-slate-600">{entry.activityGroup || "—"}</td>
                  <td className="px-4 py-4 text-xs text-slate-600">{entry.activityCategory || "—"}</td>
                  <td className="px-4 py-4 text-xs text-slate-600">{entry.source}</td>
                  <td className="px-4 py-4 text-xs font-mono italic text-slate-400 uppercase">{entry.unit}</td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{parseFloat(entry.consumption).toLocaleString()}</td>
                  <td className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase">{entry.measurementMethod || "—"}</td>
                  <td className="px-4 py-4 font-mono font-bold text-slate-900">{entry.emissions} tCO₂e</td>
                  <td className="px-4 py-4">{getStatusBadge(entry.status)}</td>
                  {isRejectedView && <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                      <AlertCircle size={12} /> {entry.rejectionReason || "—"}
                    </div>
                  </td>}
                  <td className="px-4 py-4 text-center">
                    {entry.supportingDocument?.url ? <button onClick={() => handleDownloadDocument(entry)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Download size={16} /></button> : "—"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(entry.status === "draft" || entry.status === "rejected") && (
                        <button onClick={() => handleSubmitEntry(entry)} className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-700 shadow-sm transition-all"> Submit</button>
                      )}
                      <button onClick={() => handleEditEntry(entry)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={14} /></button>
                      <button onClick={() => handleDeleteEntry(entry)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataEntryTable;