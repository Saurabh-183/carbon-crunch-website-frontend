import React from "react";
import { CheckCircle, Clock, AlertCircle, Send, Trash2, SendHorizontal } from "lucide-react";

const DataEntrySummaryActions = ({ 
  approvedCount, 
  draftCount, 
  isRejectedView, 
  saving, 
  selectedEntryIdsSize, 
  onToggleRejected, 
  onSubmitAll, 
  onSubmitSelected, 
  onDeleteSelected 
}) => (
  <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-3 rounded-2xl border border-slate-300 shadow-sm">
    
    {/* Status Metrics Group */}
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl">
        <CheckCircle className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-tight">{approvedCount} Approved</span>
      </div>
      
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl">
        <Clock className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-tight">{draftCount} Drafts</span>
      </div>

      <button
        type="button"
        onClick={onToggleRejected}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-tight border transition-all
          ${isRejectedView 
            ? "bg-red-600 text-white border-red-700 shadow-md shadow-red-100" 
            : "border-red-200 text-red-600 hover:bg-red-50 bg-red-50 hover:border-red-300"}`}
      >
        <AlertCircle className="w-4 h-4" />
        Rejected
      </button>
    </div>

    {/* Action Buttons Group */}
    <div className="flex items-center gap-2">
      <button 
        type="button" 
        onClick={onSubmitAll} 
        disabled={saving} 
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50 active:scale-95"
      >
        <Send className="w-3.5 h-3.5" />
        Submit All
      </button>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      <button
        type="button"
        onClick={onSubmitSelected}
        disabled={saving || selectedEntryIdsSize === 0}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all shadow-sm disabled:opacity-30 active:scale-95"
      >
        <SendHorizontal className="w-3.5 h-3.5 text-emerald-400" />
        Submit Selected ({selectedEntryIdsSize})
      </button>

      <button
        type="button"
        onClick={onDeleteSelected}
        disabled={saving || selectedEntryIdsSize === 0}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-50 transition-all disabled:opacity-30 active:scale-95"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </button>
    </div>
  </div>
);

export default DataEntrySummaryActions;