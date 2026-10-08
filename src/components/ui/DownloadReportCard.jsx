import React, { useState, useMemo } from "react";
import { AlertCircle, Clock, FileText, FileSpreadsheet, Download, Upload, MoreHorizontal, Factory, CheckCircle2 } from "lucide-react";
import { COMPLIANCE_COLORS } from "./ComplianceBadge";
import { useAuth } from "../../context/AuthContext";
import { getSiteUnitLabel } from "../../utils/uiTerminology";

const COMPLIANCE_STATUS_MAP = {
  completed: { icon: CheckCircle2, color: "text-green-600", label: "Completed", bg: "bg-green-50 border-green-200" },
  "in-progress": { icon: Clock, color: "text-amber-600", label: "In Progress", bg: "bg-amber-50 border-amber-200" },
  "at-risk": { icon: AlertCircle, color: "text-red-600", label: "At Risk", bg: "bg-red-50 border-red-200" },
};

const DownloadReportCard = ({ type, status, facilities = [], mode = "all" }) => {
  const { user } = useAuth();
  const industry = user?.organizationId?.industry || user?.organizationIndustry || "";
  const siteUnitPluralLabel = getSiteUnitLabel(industry, "plural");

  const colors = COMPLIANCE_COLORS[type] ?? COMPLIANCE_COLORS.RCO;
  const statusCfg = COMPLIANCE_STATUS_MAP[status] ?? COMPLIANCE_STATUS_MAP["in-progress"];
  const StatusIcon = statusCfg.icon;
  const [downloadFormat, setDownloadFormat] = useState(null);

  const downloadFiles = useMemo(() => {
    if (!downloadFormat) return [];
    const ext = downloadFormat === "pdf" ? "pdf" : "xlsx";
    return [`${type}_Consolidated_Report_2026.${ext}`, `${type}_Facility_Breakdown_2026.${ext}`, `${type}_Audit_Trail_2026.${ext}`];
  }, [downloadFormat, type]);

  const handleUpload = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      alert(`Uploading "${f.name}" for ${type}`);
      e.target.value = "";
    }
  };

  const showUpload = mode === "all" || mode === "upload";
  const showDownload = mode === "all" || mode === "download";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 ${colors.soft} rounded-xl ring-1 ${colors.ring} shrink-0 flex items-center justify-center`}>
            <span className={`text-[11px] font-extrabold ${colors.badge.split(" ")[1]}`}>{type}</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{type} Compliance</h3>
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md border mt-0.5 ${statusCfg.bg} ${statusCfg.color}`}>
              <StatusIcon size={10} /> {statusCfg.label}
            </span>
          </div>
        </div>
        <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <MoreHorizontal size={14} className="text-gray-400" />
        </button>
      </div>

      {/* Site Units */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{siteUnitPluralLabel}</p>
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${colors.soft} ${colors.badge.split(" ")[1]}`}>
            <Factory size={10} /> {facilities.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {facilities.map((f) => (
            <span key={f.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-gray-50 border border-gray-200 text-gray-600 cursor-default">
              <Factory size={10} className="text-gray-400 shrink-0" />
              {f.name}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {showUpload && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Upload</p>
          <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl gap-3">
            <span className="text-xs text-gray-600">
              <button
                type="button"
                onClick={() => alert(`Downloading Form D template for ${type}`)}
                className="text-indigo-600 font-semibold underline underline-offset-2 hover:text-indigo-700 transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs"
              >
                Download Form D
              </button>
            </span>
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-[11px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer shrink-0 shadow-sm">
              <Upload size={11} /> Upload PDF
              <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
            </label>
          </div>
        </div>
      )}

      {showDownload && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Download Report</p>
          <div className="flex items-center gap-2">
            {[
              { fmt: "pdf", Icon: FileText, label: "PDF" },
              { fmt: "excel", Icon: FileSpreadsheet, label: "Excel" },
            ].map(({ fmt, Icon, label }) => (
              <button
                key={fmt}
                onClick={() => setDownloadFormat((p) => (p === fmt ? null : fmt))}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer
                                    ${
                                      downloadFormat === fmt
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                        : "bg-gray-50 text-gray-600 border-gray-200 hover:text-gray-900 hover:border-gray-300"
                                    }`}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
          {downloadFiles.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-0.5">
              {downloadFiles.map((filename) => (
                <button
                  key={filename}
                  onClick={() => alert(`Downloading: ${filename}`)}
                  className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-xl text-[11px] font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer group/dl"
                >
                  <span className="flex items-center gap-2 truncate">
                    {downloadFormat === "pdf" ? <FileText size={11} className="text-red-400 shrink-0" /> : <FileSpreadsheet size={11} className="text-green-500 shrink-0" />}
                    <span className="truncate">{filename}</span>
                  </span>
                  <Download size={11} className="text-gray-400 group-hover/dl:text-indigo-600 transition-colors shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DownloadReportCard;
