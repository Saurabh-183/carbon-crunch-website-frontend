import React from "react";
import { Info } from "lucide-react";

const tableHeaders = [
  { label: "Date", minWidth: "min-w-[140px]" },
  { label: "Source", minWidth: "min-w-[180px]" },
  { label: "Unit of Measure", minWidth: "min-w-[170px]" },
  { label: "Consumption", minWidth: "min-w-[160px]" },
  { label: "Emissions", minWidth: "min-w-[140px]" },
  { label: "Details", minWidth: "min-w-[120px]", align: "right" },
];

/**
 * ApprovedDataTable component displays approved emissions data in a table
 * @param {Object} props - Component props
 * @param {Array} props.rows - Array of data rows to display
 * @param {Function} props.onRowSelect - Handler for row selection (view details)
 * @param {Function} props.getUnitColorClass - Function to get color class for units
 * @param {Function} props.getEmissionsColorClass - Function to get color class for emissions
 * @param {string} props.activeScope - Currently active scope filter for empty state
 */
const ApprovedDataTable = ({ rows, onRowSelect, getUnitColorClass, getEmissionsColorClass, activeScope }) => {
  const formatDateRange = (range) => {
    if (!range?.start || !range?.end) return "-";
    const startLabel = range.start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const endLabel = range.end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full text-left border-collapse">
          <thead className="bg-gray-50/50">
            <tr>
              {tableHeaders.map((header) => (
                <th
                  key={header.label}
                  className={`
                    px-6 py-4
                    text-[13px] font-semibold text-gray-800 uppercase tracking-wider
                    border-b border-gray-100
                    ${header.minWidth}
                    ${header.align === "right" ? "text-right" : "text-left"}
                  `}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                      <Info className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-md font-medium text-gray-900">No approved entries</h3>
                    <p className="text-sm text-gray-400 mt-1">No data available for {activeScope}</p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-100/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {row.isBulk
                      ? formatDateRange(row.dateRange)
                      : new Date(row.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-[13px] font-bold text-gray-800 text-left">
                        {row.isBulk ? "Bulk Import" : (row.activityGroup || row.activityCategory || row.activityType || "Entry Data")}
                      </span>

                      {row.activityGroup && row.activityType && (
                        <span className="text-[11px] font-medium text-gray-500 text-left max-w-[180px] truncate leading-tight" title={row.activityType}>
                          {row.activityType}
                        </span>
                      )}

                      {row.source && row.source !== "-" && (
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase max-w-[150px] truncate text-left mt-0.5" title={row.source}>
                          {row.isBulk ? `${row.entries?.length || 0} entries` : row.source}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getUnitColorClass(row.isBulk ? row.unitSummary : row.unit)}`}>
                      {row.isBulk ? row.unitSummary || "-" : row.unit || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {row.isBulk ? (row.totalConsumption ? Number(row.totalConsumption).toLocaleString() : "0") : row.consumption ? Number(row.consumption).toLocaleString() : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-sm font-medium border ${getEmissionsColorClass(row.isBulk ? row.totalEmissions : row.emissions)}`}>
                      {row.isBulk ? row.totalEmissions : row.emissions} tCO₂e
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button type="button" onClick={() => onRowSelect(row)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" aria-label="View details">
                      <Info className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApprovedDataTable;
