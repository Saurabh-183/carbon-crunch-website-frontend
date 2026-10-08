import React, { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import {
  Search,
  Filter,
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const STATUS_BADGE = {
  submitted: { label: "Pending", bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
  approved: { label: "Approved", bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
  rejected: { label: "Rejected", bg: "bg-red-100", text: "text-red-800", icon: XCircle },
  draft: { label: "Draft", bg: "bg-gray-100", text: "text-gray-600", icon: Eye },
};

const AuditorSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/submissions");
        const data = res.data?.data || res.data || [];
        setSubmissions(Array.isArray(data) ? data : data.submissions || []);
      } catch (err) {
        console.error("Failed to load submissions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      const matchStatus = filterStatus === "all" || s.status === filterStatus;
      const matchSearch =
        !searchTerm ||
        (s.scope || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.facilityId?.facilityName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.data?.level1 || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [submissions, filterStatus, searchTerm]);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-2">
        <ClipboardList className="w-7 h-7 text-purple-600" />
        <h1 className="text-2xl font-bold text-gray-900">All Submissions</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Read-only view of all emission data submissions. {!loading && `${filtered.length} entries shown.`}
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search scope, facility, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          {["all", "submitted", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition ${
                filterStatus === s
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border shadow-sm p-12 text-center text-gray-400">
          <p>No submissions match your filters.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((sub) => {
            const badge = STATUS_BADGE[sub.status] || STATUS_BADGE.draft;
            const BadgeIcon = badge.icon;
            const isExpanded = expandedId === sub._id;

            return (
              <div key={sub._id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(isExpanded ? null : sub._id)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
                    >
                      <BadgeIcon className="w-3 h-3" />
                      {badge.label}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {sub.scope || "N/A"} — {sub.data?.level1 || sub.data?.category || "Uncategorized"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Facility: {sub.facilityId?.facilityName || "—"} · {formatDate(sub.createdAt)}
                      </p>
                    </div>
                    {sub.data?.quantity != null && (
                      <span className="text-sm font-mono text-gray-600">
                        {sub.data.quantity} {sub.data?.unit || ""}
                      </span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 ml-3" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 ml-3" />
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t px-4 py-4 bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(sub.data || {}).map(([key, val]) => (
                        <div key={key}>
                          <p className="text-xs text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                          <p className="text-sm font-medium text-gray-800">
                            {typeof val === "object" ? JSON.stringify(val) : String(val ?? "—")}
                          </p>
                        </div>
                      ))}
                    </div>
                    {sub.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-600 font-medium">Rejection Reason</p>
                        <p className="text-sm text-red-800">{sub.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AuditorSubmissions;
