import React from "react";
import { useAuth } from "../../../../context/AuthContext";
import { getSiteUnitLabel } from "../../../../utils/uiTerminology";

const REPORT_TYPES = [
  {
    id: "GHG",
    label: "GHG Report",
    description: "Greenhouse Gas Inventory Report (Scope 1, 2 & 3)",
    icon: "🌿",
  },
  {
    id: "RCO",
    label: "RCO Report",
    description: "Renewable Certificate Obligation — FormA CPP/OA",
    icon: "⚡",
  },
  {
    id: "CBAM",
    label: "CBAM Report",
    description: "EU CBAM Installation Communication Report",
    icon: "🏭",
  },
];

/**
 * GenerateReportModal component for creating new reports
 */
const GenerateReportModal = ({
  isOpen,
  onClose,
  reportName,
  setReportName,
  reportPeriod,
  setReportPeriod,
  message,
  generating,
  onGenerate,
  facilitySummaries,
  reportType,
  setReportType,
  enabledModules,
  industry: industryProp = "",
}) => {
  const { user } = useAuth();
  const industry = industryProp || user?.organizationId?.industry || user?.organizationIndustry || "";
  const siteUnitLabel = getSiteUnitLabel(industry, "singular");

  if (!isOpen) return null;

  // Filter report types based on org-level enabled modules
  const availableTypes = Array.isArray(enabledModules) && enabledModules.length > 0 ? REPORT_TYPES.filter((t) => enabledModules.includes(t.id)) : REPORT_TYPES;

  const selectedType = reportType || availableTypes[0]?.id || "GHG";
  const gridCols = availableTypes.length <= 2 ? `grid-cols-${availableTypes.length}` : "grid-cols-3";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Generate New Report</h2>

        {message.text && <div className={`mb-4 p-3 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{message.text}</div>}

        <div className="space-y-4">
          {/* Report Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <div className={`grid ${gridCols} gap-3`}>
              {availableTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setReportType(type.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                    selectedType === type.id ? "border-green-500 bg-green-50 ring-1 ring-green-200" : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <span className="text-xl mt-0.5">{type.icon}</span>
                  <div>
                    <p className={`text-sm font-semibold ${selectedType === type.id ? "text-green-700" : "text-gray-800"}`}>{type.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{type.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Name</label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder={selectedType === "RCO" ? "e.g., RCO Compliance Report Q1 FY25" : selectedType === "CBAM" ? "e.g., CBAM Installation Q1 2025" : "e.g., Consolidated Emissions Report"}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={reportPeriod.startDate}
                onChange={(e) =>
                  setReportPeriod((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={reportPeriod.endDate}
                onChange={(e) =>
                  setReportPeriod((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* GHG-specific: facility summaries */}
          {selectedType === "GHG" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{siteUnitLabel} Reports Included</label>
              {facilitySummaries.length === 0 ? (
                <p className="text-sm text-gray-500">No approved data available for this period.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {facilitySummaries.map((summary) => (
                    <div key={summary.facilityId} className="text-sm text-gray-700">
                      {summary.facility?.facilityName || summary.facility?.name || siteUnitLabel} — {summary.facilityTotal.toFixed(2)} tCO2e
                      {summary.boundaryApproach === "Equity Share" ? ` (${summary.equityShare}% share)` : ""}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RCO-specific: info note */}
          {selectedType === "RCO" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700 font-medium mb-1">RCO Report — FormA CPP/OA</p>
              <p className="text-xs text-blue-600">
                Generates the Renewable Certificate Obligation report with quarterly fossil/renewable energy split, electricity generation &amp; consumption breakdown, and the FormA CPP/OA cell
                mapping. Data is aggregated from approved submissions for the selected period.
              </p>
            </div>
          )}

          {/* CBAM-specific: info note */}
          {selectedType === "CBAM" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-700 font-medium mb-1">CBAM Installation Communication Report</p>
              <p className="text-xs text-amber-600">
                Generates the EU CBAM report per Regulation 2023/956. Data is pulled from your CBAM products, production records, direct &amp; indirect emissions, and precursor consumption. Available
                as a web preview and as the official EU Excel template.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button type="button" onClick={onGenerate} disabled={generating} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {generating ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateReportModal;
