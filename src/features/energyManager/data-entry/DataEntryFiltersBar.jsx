import React from "react";
import { Download, Filter, Building2, ChevronDown } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { getSiteUnitLabel } from "../../../utils/uiTerminology";

const DataEntryFiltersBar = ({ selectedFacility, reportingPeriodStart, reportingPeriodEnd }) => {
  const { user } = useAuth();
  const userIndustry = user?.organizationId?.industry || user?.organizationIndustry || "";
  const siteUnitLabel = getSiteUnitLabel(userIndustry);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex flex-wrap items-center gap-6">
        {/* Site Unit Display - Read Only */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            <Building2 size={12} className="text-emerald-500" />
            Active {siteUnitLabel}
          </label>
          <div className="flex items-center justify-between min-w-[220px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 cursor-not-allowed">
            <span>{selectedFacility?.facilityName || selectedFacility?.name || `Global ${siteUnitLabel}`}</span>
            <ChevronDown size={14} className="text-slate-300" />
          </div>
        </div>

        {/* Vertical Divider for Desktop */}
        <div className="hidden lg:block w-px h-10 bg-slate-100" />

        {/* Reporting timeline display - read only */}
        <div className="space-y-1.5">
          <div className="flex items-center px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 cursor-not-allowed">
            {reportingPeriodStart && reportingPeriodEnd ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-900 font-bold">{reportingPeriodStart.toLocaleDateString()}</span>
                <span className="text-slate-300">—</span>
                <span className="text-slate-900 font-bold">{reportingPeriodEnd.toLocaleDateString()}</span>
              </div>
            ) : (
              <span className="text-slate-400 italic">Timeline not configured</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {/* <div className="flex items-center gap-3 ml-auto">
      <button 
        type="button"
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 shadow-sm"
      >
        <Filter className="w-4 h-4 text-emerald-500" />
        Advanced Filters
      </button>
      
      <button 
        type="button"
        className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-slate-200"
      >
        <Download className="w-4 h-4" />
        Export CSV
      </button>
    </div> */}
    </div>
  );
};

export default DataEntryFiltersBar;
