import React from "react";
import { Calendar, FileText, ArrowUpRight, History } from "lucide-react";

const SavedAllocationsDisplay = ({ allocationsByRange, onLoadPeriod }) => {
  if (allocationsByRange.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <History className="w-12 h-12 mx-auto mb-4 text-gray-200" />
        <h3 className="text-gray-900 font-bold">No saved periods</h3>
        <p className="text-sm text-gray-400 mt-1">Allocation history will appear here.</p>
      </div>
    );
  }

  return (
   <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
  {/* Header */}
  <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3 bg-white">
    <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
      <History className="w-5 h-5" />
    </div>
    <h2 className="text-lg font-semibold text-gray-900">
      Allocation History
    </h2>
  </div>

  {/* Scrollable Content */}
  <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar">
    {allocationsByRange.map((item) => {
      const startDate = item.startDate?.split("T")[0] || "";
      const endDate = item.endDate?.split("T")[0] || "";

      return (
        <div 
          key={`${startDate}-${endDate}`} 
          className="rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          {/* Period Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {startDate} — {endDate}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onLoadPeriod(startDate, endDate)}
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200/50 transition-all active:scale-95"
            >
              Load Period 
              <ArrowUpRight className="w-3 h-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Allocation Table */}
          <div className="bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-white">
                    Product Name
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right bg-white">
                    Allocation
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(item.allocations || []).length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-5 py-8 text-center">
                      <p className="text-sm text-gray-400 italic">No allocation data recorded.</p>
                    </td>
                  </tr>
                ) : (
                  (item.allocations || []).map((allocation) => (
                    <tr key={allocation.product} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-green-400 transition-colors" />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                            {allocation.product}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="inline-flex items-center justify-end px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-100 group-hover:border-green-200 group-hover:bg-green-50 group-hover:text-green-700 transition-all min-w-[60px]">
                          {Number(allocation.percentage || 0).toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    })}
  </div>
</div>
  );
};

export default SavedAllocationsDisplay;