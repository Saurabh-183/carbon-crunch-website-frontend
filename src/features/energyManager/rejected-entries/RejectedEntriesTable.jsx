import React from "react";
import { 
  ChevronRight, 
  ChevronDown, 
  Download, 
  Edit3, 
  Trash2, 
  Send, 
  AlertCircle,
  FileStack,
  CornerDownRight
} from "lucide-react";

const RejectedEntriesTable = ({ 
  groupedRows, 
  expandedBulkKeys, 
  toggleBulkKey, 
  handleSubmitBulkGroup, 
  handleDownloadDocument, 
  handleEditEntry, 
  handleDeleteEntry, 
  handleSubmitEntry, 
  saving 
}) => {

  const StatusBadge = ({ reason }) => (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wider border border-red-100 w-fit">
        <AlertCircle size={10} /> Rejected
      </span>
      <p className="text-xs text-slate-500 italic line-clamp-2 max-w-[200px]" title={reason}>
        {reason || "No comments provided"}
      </p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto max-h-[600px]">
        <table className="min-w-[1800px] w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-md">
            <tr>
              <th className="px-4 py-4 text-left w-12 border-b border-slate-200"></th>
              <th className="px-4 py-4 text-left text-[10px] font-bold text-slate-200 uppercase tracking-widest border-b border-slate-200">Date</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold text-slate-200 uppercase tracking-widest border-b border-slate-200">Activity & Scope</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold text-slate-200 uppercase tracking-widest border-b border-slate-200">Classification</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold text-slate-200 uppercase tracking-widest border-b border-slate-200">Source</th>
              <th className="px-4 py-4 text-right text-[10px] font-bold text-slate-200 uppercase tracking-widest border-b border-slate-200">Consumption</th>
              <th className="px-4 py-4 text-right text-[10px] font-bold text-slate-200 uppercase tracking-widest border-b border-slate-200">Emissions</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold text-slate-200 uppercase tracking-widest border-b border-slate-200">Reason for Rejection</th>
              <th className="px-4 py-4 text-center text-[10px] font-bold text-slate-200 uppercase tracking-widest border-b border-slate-200">Document</th>
              <th className="px-4 py-4 text-right text-[10px] font-bold text-slate-200 uppercase tracking-widest border-b border-slate-200">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {groupedRows.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                      <AlertCircle size={32} />
                    </div>
                    <p className="text-slate-500 font-medium">No rejected entries found for this scope.</p>
                  </div>
                </td>
              </tr>
            ) : (
              groupedRows.map((row, index) => {
                if (row.type === "bulk") {
                  const isExpanded = expandedBulkKeys.has(row.bulkKey);
                  return (
                    <React.Fragment key={`bulk-${row.bulkKey}`}>
                      <tr className={`group transition-colors ${isExpanded ? 'bg-emerald-50/30' : 'bg-slate-50/50 hover:bg-slate-50'}`}>
                        <td className="px-4 py-4 text-center">
                          <button 
                            type="button" 
                            onClick={() => toggleBulkKey(row.bulkKey)} 
                            className="p-1 hover:bg-white rounded shadow-sm transition-all"
                          >
                            {isExpanded ? <ChevronDown size={16} className="text-emerald-600" /> : <ChevronRight size={16} className="text-slate-400" />}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-slate-700">{row.dateLabel}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <FileStack size={16} className="text-emerald-600" />
                            <span className="text-sm font-semibold text-slate-900">Bulk Import ({row.entries.length} items)</span>
                          </div>
                        </td>
                        <td colSpan={2} className="px-4 py-4 text-xs text-slate-400 italic">Aggregated view</td>
                        <td className="px-4 py-4 text-right font-mono text-sm font-bold text-slate-700">
                          {Number(row.totalConsumption || 0).toLocaleString()} <span className="text-[10px] text-slate-400">{row.unitLabel}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="px-2 py-1 bg-slate-900 text-white rounded font-mono text-xs font-bold">
                            {row.totalEmissions} tCO₂e
                          </span>
                        </td>
                        <td className="px-4 py-4 italic text-xs text-slate-400">Multiple reasons possible</td>
                        <td className="px-4 py-4 text-center">—</td>
                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleSubmitBulkGroup(row)}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
                          >
                            <Send size={12} /> Submit Group
                          </button>
                        </td>
                      </tr>
                      {isExpanded &&
                        row.entries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-white transition-colors">
                            <td className="px-4 py-4 flex justify-end pr-2 pt-5">
                              <CornerDownRight size={14} className="text-slate-300" />
                            </td>
                            <td className="px-4 py-4 text-xs font-medium text-slate-500">
                              {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-sm font-semibold text-slate-800">{entry.activityType}</span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-slate-600">{entry.activityGroup || "—"}</span>
                                <span className="text-[10px] text-slate-400">{entry.activityCategory || "—"}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-600">{entry.source}</td>
                            <td className="px-4 py-4 text-right font-mono text-xs font-semibold text-slate-600">
                              {parseFloat(entry.consumption).toLocaleString()} <span className="text-slate-400 uppercase text-[10px]">{entry.unit}</span>
                            </td>
                            <td className="px-4 py-4 text-right font-mono text-xs font-bold text-slate-900">
                              {entry.emissions} tCO₂e
                            </td>
                            <td className="px-4 py-4">
                              <StatusBadge reason={entry.rejectionReason} />
                            </td>
                            <td className="px-4 py-4 text-center">
                              {entry.supportingDocument?.url || entry.supportingDocument?.downloadUrl ? (
                                <button onClick={() => handleDownloadDocument(entry)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                  <Download size={16} />
                                </button>
                              ) : <span className="text-slate-300">—</span>}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => handleEditEntry(entry)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={14} /></button>
                                <button onClick={() => handleDeleteEntry(entry)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                }

                const entry = row.entry;
                return (
                  <tr key={entry.id || index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4"></td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-700">
                      {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-900 text-sm">{entry.activityType}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-600">{entry.activityGroup || "—"}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{entry.activityCategory || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{entry.source}</td>
                    <td className="px-4 py-4 text-right font-mono text-sm font-semibold text-slate-700">
                      {parseFloat(entry.consumption).toLocaleString()} <span className="text-slate-400 text-[10px] uppercase">{entry.unit}</span>
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-sm font-bold text-slate-900">
                      {entry.emissions} tCO₂e
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge reason={entry.rejectionReason} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      {entry.supportingDocument?.url || entry.supportingDocument?.downloadUrl ? (
                        <button onClick={() => handleDownloadDocument(entry)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Download size={18} />
                        </button>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSubmitEntry(entry)}
                          disabled={saving}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm"
                        >
                          Submit
                        </button>
                        <button onClick={() => handleEditEntry(entry)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={16} /></button>
                        <button onClick={() => handleDeleteEntry(entry)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RejectedEntriesTable;