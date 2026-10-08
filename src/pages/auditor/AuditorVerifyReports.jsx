import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckSquare, Search, RefreshCcw, Eye, Clock, CheckCircle2, XCircle } from "lucide-react";
import api from "../../utils/api";

const STATUS = {
  pending: { label: "Pending Audit", cls: "bg-yellow-50 text-yellow-700", icon: Clock },
  approved: { label: "Approved", cls: "bg-green-50 text-green-700", icon: CheckCircle2 },
  disapproved: { label: "Disapproved", cls: "bg-red-50 text-red-700", icon: XCircle },
};

const AuditorVerifyReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/reports");
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : data.reports || [];
      setReports(list);
    } catch (error) {
      console.error("Failed to fetch reports for verification:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return reports;

    return reports.filter((report) => {
      const reportName = String(report.reportName || report.name || "").toLowerCase();
      const orgName = String(report.organizationId?.companyName || "").toLowerCase();
      const facilityName = String(report.facilityId?.facilityName || "").toLowerCase();
      return reportName.includes(term) || orgName.includes(term) || facilityName.includes(term);
    });
  }, [reports, search]);

  const pendingCount = filteredReports.filter((report) => !report.auditStatus || report.auditStatus === "pending").length;

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <CheckSquare className="w-7 h-7 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-900">Verify Reports</h1>
          </div>
          <p className="text-sm text-gray-500">
            Auditor workbench for report verification and sign-off.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
        >
          <RefreshCcw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">Reports in Queue</p>
          <p className="text-2xl font-bold text-indigo-700">{loading ? "..." : filteredReports.length}</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">Pending Verification</p>
          <p className="text-2xl font-bold text-yellow-700">{loading ? "..." : pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">Completed Audits</p>
          <p className="text-2xl font-bold text-green-700">{loading ? "..." : filteredReports.length - pendingCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports by name, organization, or facility"
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-xl border shadow-sm p-10 text-center text-gray-400">
          No reports available for verification.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const auditStatus = report.auditStatus || "pending";
            const status = STATUS[auditStatus] || STATUS.pending;
            const StatusIcon = status.icon;

            return (
              <div key={report._id} className="bg-white rounded-xl border shadow-sm p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {report.reportName || report.name || `Report #${report._id?.slice(-6)}`}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Org: {report.organizationId?.companyName || "N/A"}
                      {" · "}
                      Facility: {report.facilityId?.facilityName || "N/A"}
                      {" · "}
                      Generated: {formatDate(report.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.cls}`}>
                      <StatusIcon className="w-3.5 h-3.5" /> {status.label}
                    </span>
                    <button
                      onClick={() => navigate(`/auditor/reports/${report._id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
                    >
                      <Eye className="w-3.5 h-3.5" /> Open
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AuditorVerifyReports;
