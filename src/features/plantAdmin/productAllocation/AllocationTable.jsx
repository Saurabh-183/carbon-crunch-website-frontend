import React from "react";
import { AlertCircle, CheckCircle2, Package, Percent } from "lucide-react";

const AllocationTable = ({
  allocations,
  onPercentageChange,
  totalAllocation,
  isTotalValid,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-4">
          {/* <div className="bg-gradient-to-br from-green-200 to-green-700 p-3 rounded-xl shadow-sm">
        <Package className="w-5 h-5 text-white" />
      </div> */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Product Share</h2>
            <p className="text-sm text-gray-500">Allocate production percentages</p>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${isTotalValid
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-red-50 border-red-200 text-red-700"
            }`}
        >
          {isTotalValid ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4 animate-pulse" />
          )}
          <span className="text-sm font-bold tabular-nums">
            Total: {totalAllocation.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100">
                Product Name
              </th>
              <th className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100 w-[200px]">
                Allocation Share
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {allocations.map((item, index) => (
              <tr
                key={item.product}
                className="hover:bg-gray-50/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 border border-gray-200">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {item.product}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="relative group/input">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.percentage}
                      onChange={(e) => onPercentageChange(index, e.target.value)}
                      className="w-full pl-4 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-gray-400"
                      placeholder="0.00"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Percent className="w-3.5 h-3.5 text-gray-400 group-focus-within/input:text-green-600 transition-colors" />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Warning - Only visible when invalid */}
      {!isTotalValid && (
        <div className="px-6 py-3 bg-red-50/50 border-t border-red-100">
          <div className="flex items-center justify-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <p className="text-xs font-medium">
              Total allocation must equal exactly 100.00%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllocationTable;