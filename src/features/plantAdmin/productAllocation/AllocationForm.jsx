import React from "react";
import { Save, Calendar, Plus, History, ArrowRight } from "lucide-react";

const AllocationForm = ({
  facility,
  rangeStart,
  rangeEnd,
  selectedRangeKey,
  rangeOptions,
  onRangeStartChange,
  onRangeEndChange,
  onRangeSelect,
  onNewRange,
  onSave,
  saving,
  isTotalValid,
}) => {
  const canSave = !saving && isTotalValid && rangeStart && rangeEnd;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 p-5">
  <div className="flex flex-col lg:flex-row lg:items-end gap-5">
    
    {/* History Select */}
    <div className="space-y-1.5 flex-1 lg:max-w-[280px]">
      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
        <History className="w-3.5 h-3.5" />
        History
      </label>
      <div className="relative">
        <select
          value={selectedRangeKey}
          onChange={(e) => onRangeSelect(e.target.value)}
          className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all cursor-pointer"
        >
          <option value="">Select Saved Range</option>
          {rangeOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.startDate} — {option.endDate}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>

    {/* Duration Date Picker */}
    <div className="space-y-1.5 flex-1 lg:max-w-[400px]">
      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5" />
        Duration
      </label>
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500 transition-all">
        <input
          type="date"
          value={rangeStart}
          min={facility?.reportingPeriod?.startDate?.split("T")[0] || undefined}
          max={facility?.reportingPeriod?.endDate?.split("T")[0] || undefined}
          onChange={(e) => onRangeStartChange(e.target.value)}
          className="flex-1 bg-transparent border-none text-sm font-medium text-gray-700 outline-none px-2 py-1 cursor-pointer"
        />
        <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
        <input
          type="date"
          value={rangeEnd}
          min={facility?.reportingPeriod?.startDate?.split("T")[0] || undefined}
          max={facility?.reportingPeriod?.endDate?.split("T")[0] || undefined}
          onChange={(e) => onRangeEndChange(e.target.value)}
          className="flex-1 bg-transparent border-none text-sm font-medium text-gray-700 outline-none px-2 py-1 cursor-pointer text-right"
        />
      </div>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-3 pt-2 lg:pt-0 lg:ml-auto">
      <button
        type="button"
        onClick={onNewRange}
        className="h-[42px] flex items-center gap-2 px-5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all active:scale-95"
      >
        <Plus className="w-4 h-4" />
        Reset
      </button>

      <button
        type="button"
        onClick={onSave}
        disabled={!canSave}
        className={`h-[42px] flex items-center gap-2 px-6 rounded-xl text-sm font-semibold text-white shadow-lg transition-all active:scale-95 ${
          canSave
            ? "bg-green-600 hover:bg-green-700 shadow-green-100 hover:shadow-green-200"
            : "bg-gray-300 shadow-none cursor-not-allowed opacity-70"
        }`}
      >
        {saving ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {saving ? "Saving..." : "Save Data"}
      </button>
    </div>
  </div>
</div>
  );
};

export default AllocationForm;