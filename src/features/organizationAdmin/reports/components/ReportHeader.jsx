import React from "react";
import { FileText, Plus } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { getSiteUnitLabel } from "../../../../utils/uiTerminology";

/**
 * ReportHeader component displays the page header with generate button
 * @param {Object} props - Component props
 * @param {Function} props.onGenerateClick - Handler for generate button click
 */
const ReportHeader = ({ onGenerateClick, industry: industryProp = "" }) => {
  const { user } = useAuth();
  const industry = industryProp || user?.organizationId?.industry || user?.organizationIndustry || "";
  const siteUnitLabel = getSiteUnitLabel(industry, "singular");

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-green-200 to-green-700 p-3 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Generate Report</h1>
              <p className="text-md text-gray-500">
                Create consolidated organization reports from approved {siteUnitLabel.toLowerCase()}
                data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onGenerateClick}
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-200"
            >
              <Plus className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;
