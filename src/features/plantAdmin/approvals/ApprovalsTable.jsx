import React from "react";
import { Clock, Info, Check, X, Loader2 } from "lucide-react";
import { TABLE_COLUMNS } from "../../../config/constants";

const ApprovalsTable = ({ rows, processingId, onApprove, onReject, onViewDetails }) => {
  const formatDateRange = (range) => {
    if (!range?.start || !range?.end) return "-";
    const startLabel = range.start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const endLabel = range.end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
  };
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 p-16 text-center">
        <div className="bg-gray-50 p-3 rounded-full mb-3">
          <Clock className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
        <p className="text-sm text-gray-400 mt-1">No pending data for approval.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="max-h-[520px] overflow-auto custom-scrollbar">
        <table className="min-w-[1000px] w-full border-collapse">
          <thead className="bg-gray-50/80 sticky top-0 z-20 backdrop-blur-sm">
            <tr>
              {TABLE_COLUMNS.map((col) => (
                <th key={col.key} className="px-6 py-4 text-[13px] font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100" style={{ minWidth: col.minWidth }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => {
              const isProcessing = processingId === row.submissionId;

              return (
                <tr key={row.id} className="group text-center hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-600">
                      {row.isBulk
                        ? formatDateRange(row.dateRange)
                        : new Date(row.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[13px] font-bold text-gray-800 text-center">
                        {row.isBulk ? "Bulk Import" : (row.activityGroup || row.activityCategory || row.activityType || "Entry Data")}
                      </span>

                      {row.activityGroup && row.activityType && (
                        <span className="text-[11px] font-medium text-gray-500 text-center max-w-[180px] truncate leading-tight" title={row.activityType}>
                          {row.activityType}
                        </span>
                      )}

                      {row.source && row.source !== "-" && (
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase max-w-[150px] truncate text-center mt-0.5" title={row.source}>
                          {row.isBulk ? `${row.entries?.length || 0} entries` : row.source}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-600 font-medium">{row.isBulk ? row.unitSummary || "-" : row.unit || "-"}</td>

                  <td className="px-4 py-3 text-sm font-medium text-gray-600">
                    {row.isBulk ? (row.totalConsumption ? Number(row.totalConsumption).toLocaleString() : "0") : row.consumption ? Number(row.consumption).toLocaleString() : "0"}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-medium text-center text-gray-600">{row.isBulk ? row.totalEmissions : row.emissions}</span>
                  </td>

                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onApprove(row.submissionId)}
                        disabled={isProcessing}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm shadow-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                      >
                        {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Approve
                      </button>

                      <button
                        type="button"
                        onClick={() => onReject(row.submissionId)}
                        disabled={isProcessing}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onViewDetails(row)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all border border-transparent hover:border-green-100"
                    >
                      <Info className="w-4 h-4 text-center items-center" />
                    </button>
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

export default ApprovalsTable;
