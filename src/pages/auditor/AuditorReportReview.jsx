import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import {
  ArrowLeft,
  FileText,
  Building2,
  Factory,
  Calendar,
  User,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Flame,
  Zap,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

const AUDIT_BADGE = {
  pending: { label: "Pending Audit", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: Clock },
  approved: { label: "Approved", bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: CheckCircle2 },
  disapproved: { label: "Disapproved", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle },
};

const VERIFICATION_BADGE = {
  pending: { label: "Pending", color: "text-yellow-700 bg-yellow-50" },
  verified: { label: "Verified", color: "text-green-700 bg-green-50" },
  flagged: { label: "Flagged", color: "text-red-700 bg-red-50" },
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const formatNum = (n) =>
  n != null ? Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—";

const AuditorReportReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/reports/generated/${id}/audit-data`);
      setData(res.data?.data || res.data);
    } catch (err) {
      console.error("Failed to fetch audit data:", err);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, [id]);

  const handleAudit = async (status) => {
    if (status === "disapproved" && !notes.trim()) {
      toast.error("Please provide notes when disapproving a report.");
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/api/reports/generated/${id}/audit`, { status, notes });
      toast.success(`Report ${status} successfully`);
      fetchAuditData();
      setNotes("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Audit action failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!data?.report) {
    return (
      <div className="p-8 text-center text-gray-400">
        <AlertTriangle className="w-12 h-12 mx-auto mb-3" />
        <p className="text-lg">Report not found or access denied.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 hover:underline text-sm">
          Go back
        </button>
      </div>
    );
  }

  const { report, scopeBreakdown, detailedRows, supportingDocuments } = data;
  const auditBadge = AUDIT_BADGE[report.auditStatus] || AUDIT_BADGE.pending;
  const AuditIcon = auditBadge.icon;
  const verBadge = VERIFICATION_BADGE[report.verificationStatus] || VERIFICATION_BADGE.pending;

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "emissions", label: `Emissions (${detailedRows?.length || 0})` },
    { key: "documents", label: `Documents (${supportingDocuments?.length || 0})` },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-7 h-7 text-orange-600" />
            {report.reportName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Audit Review</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${auditBadge.bg} ${auditBadge.text} border ${auditBadge.border}`}>
          <AuditIcon className="w-4 h-4" />
          {auditBadge.label}
        </div>
      </div>

      {/* Meta cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Building2 className="w-4 h-4" /> Organization
          </div>
          <p className="font-semibold text-gray-900">{report.organization?.companyName || "—"}</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Factory className="w-4 h-4" /> Facility
          </div>
          <p className="font-semibold text-gray-900">{report.facility?.facilityName || "All Facilities"}</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Calendar className="w-4 h-4" /> Period
          </div>
          <p className="font-semibold text-gray-900">
            {formatDate(report.period?.startDate)} – {formatDate(report.period?.endDate)}
          </p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <User className="w-4 h-4" /> Generated By
          </div>
          <p className="font-semibold text-gray-900">{report.generatedBy?.username || "—"}</p>
        </div>
      </div>

      {/* Scope Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Scope 1", value: scopeBreakdown?.scope1, icon: Flame, color: "text-red-600", bg: "bg-red-50" },
          { label: "Scope 2", value: scopeBreakdown?.scope2, icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Scope 3", value: scopeBreakdown?.scope3, icon: Truck, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Total", value: scopeBreakdown?.total ?? report.totalEmissions, icon: ShieldCheck, color: "text-gray-800", bg: "bg-gray-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <span className="text-sm text-gray-500">{s.label}</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {formatNum(s.value)} <span className="text-sm font-normal text-gray-500">tCO₂e</span>
            </p>
          </div>
        ))}
      </div>

      {/* Verification Status */}
      <div className="bg-white rounded-xl border shadow-sm p-4 mb-6 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">Verification Status:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${verBadge.color}`}>
            {verBadge.label}
          </span>
        </div>
        {report.verifiedBy && (
          <span className="text-xs text-gray-500">
            by {report.verifiedBy.username} on {formatDate(report.verifiedAt)}
          </span>
        )}
        {report.verificationNotes && (
          <span className="text-xs text-gray-400 italic">"{report.verificationNotes}"</span>
        )}
      </div>

      {/* Previous Audit Info */}
      {report.auditStatus !== "pending" && (
        <div
          className={`rounded-xl border shadow-sm p-4 mb-6 flex items-start gap-3 ${auditBadge.bg} ${auditBadge.border}`}
        >
          <AuditIcon className={`w-5 h-5 mt-0.5 ${auditBadge.text}`} />
          <div>
            <p className={`text-sm font-semibold ${auditBadge.text}`}>
              {report.auditStatus === "approved" ? "Approved by Auditor" : "Disapproved by Auditor"}
            </p>
            {report.auditedBy && (
              <p className="text-xs text-gray-600 mt-1">
                {report.auditedBy.username} &middot; {formatDate(report.auditedAt)}
              </p>
            )}
            {report.auditNotes && (
              <p className="text-xs text-gray-600 mt-1 italic">"{report.auditNotes}"</p>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b mb-6 flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === t.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Report HTML Preview */}
          {report.reportHtml && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Report Preview</h2>
              <div
                className="prose prose-sm max-w-none overflow-auto max-h-[600px] border rounded-lg p-4 bg-gray-50"
                dangerouslySetInnerHTML={{ __html: report.reportHtml }}
              />
            </div>
          )}

          {/* Product Allocations */}
          {report.productAllocations?.length > 0 && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Product Allocations</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2 text-gray-600">Product</th>
                      <th className="text-right px-4 py-2 text-gray-600">Allocation %</th>
                      <th className="text-right px-4 py-2 text-gray-600">Emissions (tCO₂e)</th>
                      <th className="text-right px-4 py-2 text-gray-600">Intensity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {report.productAllocations.map((pa, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2">{pa.productName}</td>
                        <td className="text-right px-4 py-2">{pa.allocationPercentage}%</td>
                        <td className="text-right px-4 py-2 font-mono">{formatNum(pa.allocatedEmissions)}</td>
                        <td className="text-right px-4 py-2 font-mono">
                          {formatNum(pa.emissionIntensity)} {pa.intensityUnit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "emissions" && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {detailedRows?.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <AlertTriangle className="w-10 h-10 mx-auto mb-2" />
              <p>No detailed emission breakdown available for this report.</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-gray-600">#</th>
                    <th className="text-left px-4 py-2.5 text-gray-600">Scope</th>
                    <th className="text-left px-4 py-2.5 text-gray-600">Source</th>
                    <th className="text-right px-4 py-2.5 text-gray-600">Consumption</th>
                    <th className="text-right px-4 py-2.5 text-gray-600">EF</th>
                    <th className="text-right px-4 py-2.5 text-gray-600">Emission (kgCO₂e)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {detailedRows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            row.scope?.includes("1")
                              ? "bg-red-50 text-red-700"
                              : row.scope?.includes("2")
                              ? "bg-blue-50 text-blue-700"
                              : "bg-purple-50 text-purple-700"
                          }`}
                        >
                          {row.scope}
                        </span>
                      </td>
                      <td className="px-4 py-2">{row.source}</td>
                      <td className="text-right px-4 py-2 font-mono">
                        {formatNum(row.consumption)} {row.consumptionUnit}
                      </td>
                      <td className="text-right px-4 py-2 font-mono">{row.emissionFactor ?? "—"}</td>
                      <td className="text-right px-4 py-2 font-mono font-semibold">
                        {formatNum(row.calculatedEmission)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "documents" && (
        <div className="space-y-3">
          {supportingDocuments?.length === 0 ? (
            <div className="bg-white rounded-xl border shadow-sm p-12 text-center text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>No supporting documents attached to this report's source entries.</p>
            </div>
          ) : (
            supportingDocuments.map((doc, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border shadow-sm p-4 flex items-center justify-between"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <FileText className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {doc.document.originalName || doc.document.url?.split("/").pop() || "Document"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {doc.scope} &middot; {doc.activityType} &middot; {doc.source}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Consumption: {formatNum(doc.consumption)} {doc.unit}
                    </p>
                  </div>
                </div>
                <a
                  href={doc.document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View
                </a>
              </div>
            ))
          )}
        </div>
      )}

      {/* Audit Action Section */}
      <div className="mt-8 bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-600" />
          Audit Decision
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add audit notes (required for disapproval)..."
          rows={3}
          className="w-full border rounded-lg px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none mb-4"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleAudit("approved")}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium transition"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Approve
          </button>
          <button
            onClick={() => handleAudit("disapproved")}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium transition"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Disapprove
          </button>
        </div>
      </div>

      <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <p className="text-sm text-indigo-800">
          <strong>Auditor Note:</strong> Review all emission data and supporting documentation before
          making your decision. Disapprovals require notes explaining the rationale.
        </p>
      </div>
    </div>
  );
};

export default AuditorReportReview;
