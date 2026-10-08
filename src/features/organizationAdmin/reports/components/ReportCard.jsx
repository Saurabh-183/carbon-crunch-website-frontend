import React, { useMemo, useState } from "react";
import { Download, FileText, Calendar, Eye, ChevronDown, FileSpreadsheet } from "lucide-react";

/**
 * ReportCard component displays an individual report with download actions
 * @param {Object} props - Component props
 * @param {Object} props.report - Report data object
 * @param {Function} props.onDownloadHtml - Handler for HTML download
 * @param {Function} props.onDownloadPdf - Handler for PDF download
 * @param {Function} props.onDownloadExcel - Handler for Excel download
 * @param {Function} props.onPreview - Handler to open the in-browser A4 preview
 */
const ReportCard = ({ report, onDownloadHtml, onDownloadPdf, onDownloadExcel, onPreview, onDownloadCbamExcel }) => {
  const isRCO = report.reportData?.reportType === "RCO";
  const isCBAM = report.reportData?.reportType === "CBAM";
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const downloadOptions = useMemo(() => {
    const options = [];
    if (onDownloadPdf) {
      options.push({
        key: "pdf",
        label: "PDF",
        icon: <FileText className="w-4 h-4" />,
        onClick: () => onDownloadPdf(report),
      });
    }

    if (isRCO && onDownloadExcel) {
      options.push({
        key: "rco-excel",
        label: "Excel",
        icon: <FileSpreadsheet className="w-4 h-4" />,
        onClick: () => onDownloadExcel(report),
      });
    }

    if (isCBAM && onDownloadCbamExcel) {
      options.push({
        key: "cbam-excel",
        label: "Excel",
        icon: <FileSpreadsheet className="w-4 h-4" />,
        onClick: () => onDownloadCbamExcel(report),
      });
    }

    if (!isRCO && onDownloadHtml) {
      options.push({
        key: "html",
        label: "HTML",
        icon: <FileText className="w-4 h-4" />,
        onClick: () => onDownloadHtml(report),
      });
    }

    return options;
  }, [isRCO, isCBAM, onDownloadPdf, onDownloadExcel, onDownloadCbamExcel, onDownloadHtml, report]);

  const accentClass = isCBAM
    ? "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 text-amber-600 group-hover:from-amber-100 group-hover:to-amber-200 group-hover:text-amber-700"
    : isRCO
      ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-600 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-700"
      : "bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-600 group-hover:from-green-100 group-hover:to-green-200 group-hover:text-green-700";

  const badgeClass = isCBAM ? "bg-amber-100 text-amber-700" : isRCO ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700";
  const badgeLabel = isCBAM ? "🏭 CBAM" : isRCO ? "⚡ RCO" : "🌿 GHG";

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 p-1 flex flex-col hover:border-slate-300 hover:shadow-lg transition-all duration-300">
      {/* Main Content Container */}
      <div className="flex-1 p-5 pb-2">
        {/* Header: Icon + Title */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex gap-4">
            <div className={`p-2.5 rounded-xl border transition-all ${accentClass}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg leading-tight line-clamp-1 mb-1">{report.reportName || report.name}</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold ${badgeClass}`}>{badgeLabel}</span>
                <span className="flex items-center gap-1 font-medium text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(report.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metric: Emissions */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1">Total Emissions</p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent tracking-tight">
              {(report.totalEmissions || report.organizationEmissions || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </p>
            <span className="text-sm font-medium text-green-600">tCO₂e</span>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-2 flex gap-2 mt-auto">
        {onPreview && (
          <button
            onClick={() => onPreview(report)}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-2.5 rounded-xl border border-transparent hover:from-teal-600 hover:to-teal-700 hover:shadow-md transition-all duration-200 text-sm font-semibold active:scale-[0.98]"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        )}
        {downloadOptions.length > 0 && (
          <div className="relative flex-1">
            <button
              onClick={() => setShowDownloadMenu((prev) => !prev)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2.5 rounded-xl border border-transparent hover:from-green-600 hover:to-green-700 hover:shadow-md transition-all duration-200 text-sm font-semibold active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              Download
              <ChevronDown className="w-4 h-4" />
            </button>

            {showDownloadMenu && (
              <div className="absolute z-20 right-0 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl p-1">
                {downloadOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => {
                      option.onClick();
                      setShowDownloadMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50"
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
