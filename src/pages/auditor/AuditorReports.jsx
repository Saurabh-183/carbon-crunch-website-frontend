import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { FileText, Download, Eye, RefreshCcw, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";

const AuditorReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/reports");
      const data = res.data?.data || res.data || [];
      setReports(Array.isArray(data) ? data : data.reports || []);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-7 h-7 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">Generated Reports</h1>
          </div>
          <p className="text-sm text-gray-500">
            Read-only access to all generated emission reports.
            {!loading && ` ${reports.length} report${reports.length !== 1 ? "s" : ""} available.`}
          </p>
        </div>
        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
        >
          <RefreshCcw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-xl border shadow-sm p-12 text-center text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg">No reports available yet.</p>
          <p className="text-sm mt-1">Reports will appear here once organizations generate them.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report._id} className="bg-white rounded-xl border shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2.5 bg-orange-50 rounded-lg">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {report.reportName || report.name || report.title || `Report #${report._id?.slice(-6)}`}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                      {report.organizationId?.companyName && (
                        <span>Org: {report.organizationId.companyName}</span>
                      )}
                      {report.facilityId?.facilityName && (
                        <span>Facility: {report.facilityId.facilityName}</span>
                      )}
                      {report.scope && <span>Scope: {report.scope}</span>}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(report.createdAt)}
                      </span>
                    </div>
                    {report.totalEmission != null && (
                      <p className="mt-2 text-sm">
                        Total Emissions:{" "}
                        <span className="font-mono font-semibold text-gray-900">
                          {Number(report.totalEmission).toLocaleString()} tCO₂e
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {report.downloadUrl && (
                    <a
                      href={report.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  )}
                  <button
                    onClick={() => navigate(`/auditor/reports/${report._id}`)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Review
                  </button>
                  {(() => {
                    const auditStatus = report.auditStatus || "pending";
                    const cfg = {
                      pending: { label: "Pending Audit", icon: Clock, cls: "bg-yellow-50 text-yellow-700" },
                      approved: { label: "Approved", icon: CheckCircle2, cls: "bg-green-50 text-green-700" },
                      disapproved: { label: "Disapproved", icon: XCircle, cls: "bg-red-50 text-red-700" },
                    }[auditStatus];
                    const Icon = cfg.icon;
                    return (
                      <span className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${cfg.cls}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <p className="text-sm text-indigo-800">
          <strong>Note:</strong> Click <strong>Review</strong> to view full report data, supporting
          documents, and to approve or disapprove the report.
        </p>
      </div>
    </div>
  );
};

export default AuditorReports;
