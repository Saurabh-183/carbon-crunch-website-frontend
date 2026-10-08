import React from "react";
import { Search, Command, Zap, Database } from "lucide-react";

const DataEntryQuickSearch = ({ quickSearch, setQuickSearch, quickSearchResults, applyQuickSearchResult }) => (
  <div className="relative max-w-[520px] group">
    {/* Label with Scientific Theme Header */}
    <div className="flex items-center justify-between mb-1.5 px-1">
      <label className="flex items-center gap-1.5 text-[14px] font-bold text-slate-600 uppercase tracking-widest">
        <Zap size={12} className="text-emerald-500 fill-emerald-500/20" />
         Quick Search
      </label>
      
    </div>

    {/* Input Wrapper */}
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
      </div>
      <input
        type="text"
        value={quickSearch}
        onChange={(e) => setQuickSearch(e.target.value)}
        placeholder="Search activity, group, or source (e.g., 'coal')"
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
      />
    </div>

    {/* Search Results Dropdown */}
    {quickSearchResults.length > 0 && (
      <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
          <Database size={12} className="text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Emission Factor Results</span>
        </div>
        
        <div className="max-h-[320px] overflow-y-auto">
          {quickSearchResults.map((result) => (
            <button
              type="button"
              key={result.id}
              onClick={() => {
                setQuickSearch(result.display);
                applyQuickSearchResult(result);
              }}
              className="w-full text-left px-4 py-3 flex flex-col gap-0.5 hover:bg-emerald-50/50 transition-colors border-b border-slate-50 last:border-none group/item"
            >
              <div className="font-bold text-slate-800 group-hover/item:text-emerald-900 transition-colors">
                {result.display}
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-tight
                  ${result.scope === "Scope 1" ? "bg-blue-100 text-blue-700" : 
                    result.scope === "Scope 2" ? "bg-purple-100 text-purple-700" : 
                    "bg-amber-100 text-amber-700"}
                `}>
                  {result.scope}
                </span>
                
                {result.scope === "Scope 3" && result.scope3Module && (
                  <>
                    <span className="text-slate-300">/</span>
                    <span className="text-[10px] font-semibold text-slate-500 italic uppercase">
                      {result.scope3Module}
                    </span>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
        
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center italic">
          Press enter to select
        </div>
      </div>
    )}
  </div>
);

export default DataEntryQuickSearch;