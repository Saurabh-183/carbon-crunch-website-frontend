import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  Factory,
  LogIn,
  LogOut,
  UserPlus,
  UserMinus,
  Edit,
  Plus,
  RefreshCw,
  Calendar,
  BarChart3,
  ChevronDown,
  Loader2,
  ArrowRight,
  Eye,
  Info,
} from "lucide-react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import { getDisplayRoleLabel, toUiTerminology } from "../../utils/uiTerminology";

// ─── Human-Friendly Descriptions ────────────────────────────────────────

const ACTION_FRIENDLY = {
  USER_CREATED: { label: "New user added", icon: UserPlus, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100", emoji: "👤" },
  USER_UPDATED: { label: "User profile updated", icon: Edit, color: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-100", emoji: "✏️" },
  USER_DELETED: { label: "User removed", icon: UserMinus, color: "text-red-600", bg: "bg-red-50", ring: "ring-red-100", emoji: "🚫" },
  USER_LOGIN: { label: "User signed in", icon: LogIn, color: "text-green-600", bg: "bg-green-50", ring: "ring-green-100", emoji: "🔑" },
  USER_LOGOUT: { label: "User signed out", icon: LogOut, color: "text-slate-500", bg: "bg-slate-50", ring: "ring-slate-100", emoji: "👋" },
  PASSWORD_CHANGED: { label: "Password changed", icon: Shield, color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-100", emoji: "🔒" },
  ORG_CREATED: { label: "Organization created", icon: Building2, color: "text-purple-600", bg: "bg-purple-50", ring: "ring-purple-100", emoji: "🏢" },
  ORG_UPDATED: { label: "Organization details updated", icon: Building2, color: "text-purple-600", bg: "bg-purple-50", ring: "ring-purple-100", emoji: "🏢" },
  FACILITY_CREATED: { label: "New facility added", icon: Factory, color: "text-cyan-600", bg: "bg-cyan-50", ring: "ring-cyan-100", emoji: "🏭" },
  FACILITY_UPDATED: { label: "Facility details updated", icon: Factory, color: "text-cyan-600", bg: "bg-cyan-50", ring: "ring-cyan-100", emoji: "🏭" },
  ENERGY_DATA_ENTERED: { label: "Energy data submitted", icon: Plus, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100", emoji: "📊" },
  ENERGY_DATA_UPDATED: { label: "Energy data updated", icon: Edit, color: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-100", emoji: "📊" },
  ENERGY_DATA_APPROVED: { label: "Energy data approved", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", ring: "ring-green-100", emoji: "✅" },
  ENERGY_DATA_REJECTED: { label: "Energy data rejected", icon: XCircle, color: "text-red-600", bg: "bg-red-50", ring: "ring-red-100", emoji: "❌" },
  REPORT_GENERATED: { label: "Report generated", icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50", ring: "ring-indigo-100", emoji: "📄" },
  REPORT_SUBMITTED: { label: "Report submitted", icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50", ring: "ring-indigo-100", emoji: "📤" },
  REPORT_APPROVED: { label: "Report approved", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", ring: "ring-green-100", emoji: "✅" },
  PERMISSION_GRANTED: { label: "Permission granted", icon: Shield, color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-100", emoji: "🔓" },
  PERMISSION_REVOKED: { label: "Permission revoked", icon: Shield, color: "text-red-600", bg: "bg-red-50", ring: "ring-red-100", emoji: "🔐" },
  ROLE_ASSIGNED: { label: "Role assigned", icon: Shield, color: "text-cyan-600", bg: "bg-cyan-50", ring: "ring-cyan-100", emoji: "🎖️" },
  ROLE_REMOVED: { label: "Role removed", icon: Shield, color: "text-orange-600", bg: "bg-orange-50", ring: "ring-orange-100", emoji: "⚠️" },
};

const DEFAULT_ACTION = { label: "Activity recorded", icon: Activity, color: "text-slate-500", bg: "bg-slate-50", ring: "ring-slate-100", emoji: "📝" };

const PRIORITY_LABELS = {
  low: { label: "Routine", color: "text-slate-500", bg: "bg-slate-50", dot: "bg-slate-400" },
  medium: { label: "Normal", color: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-500" },
  high: { label: "Important", color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" },
  critical: { label: "Urgent", color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" },
};

const friendlyRole = (role, industry = "") => {
  if (!role) return "";
  const mapped = getDisplayRoleLabel(role, industry);
  if (mapped && mapped !== role) {
    return mapped;
  }
  const map = {
    PLATFORM_ADMIN: "Platform Admin",
    SUPER_ADMIN: "Super Admin",
    ORG_ADMIN: "Organization Admin",
    PLANT_ADMIN: "Facility Admin",
    ENERGY_MANAGER: "Energy Manager",
    AUDITOR: "Auditor",
    MAINTAINER: "Maintainer",
  };
  return map[role] || role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatAction = (action) =>
  String(action || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const timeAgo = (date) => {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now - d) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const formatDate = (date) =>
  new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Build a human-readable sentence for the log
const buildSentence = (log, industry = "") => {
  const config = ACTION_FRIENDLY[log.action] || DEFAULT_ACTION;
  const who = log.performedBy?.username || "System";
  const target = toUiTerminology(log.targetResource?.resourceName, industry);
  const action = toUiTerminology(config.label, industry).toLowerCase();

  if (target) return `${who} ${action} — ${target}`;
  return `${who} ${action}`;
};

// ─── Component ──────────────────────────────────────────────────────────

const ActivityLogs = () => {
  const { user } = useAuth();
  const userIndustry = user?.organizationId?.industry || user?.organizationIndustry || "";
  const [searchParams] = useSearchParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 30, total: 0, pages: 0 });

  // Filters
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [activityTab, setActivityTab] = useState("account");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [availableActions, setAvailableActions] = useState([]);

  // Expanded row
  const [expandedLog, setExpandedLog] = useState(null);

  // ── Sync filters from URL search params (only re-run when searchParams changes) ──
  useEffect(() => {
    const actionFromQuery = searchParams.get("action") || "";
    const severityFromQuery = searchParams.get("severity") || "";
    const tabFromQuery = searchParams.get("tab") === "data" ? "data" : "account";
    setActionFilter(actionFromQuery);
    setSeverityFilter(severityFromQuery);
    setActivityTab(tabFromQuery);
  }, [searchParams]);

  // ─── Fetch ────────────────────────────────────────────────────────────

  const fetchLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("limit", pagination.limit);
        if (search) params.set("search", search);
        if (actionFilter) params.set("action", actionFilter);
        params.set("actionGroup", activityTab === "data" ? "data" : "account");
        if (severityFilter) params.set("severity", severityFilter);
        if (dateRange.start) params.set("startDate", dateRange.start);
        if (dateRange.end) params.set("endDate", dateRange.end);

        const res = await api.get(`/api/activity-logs?${params}`);
        const data = res.data?.data || res.data;
        setLogs(data.logs || []);
        setPagination((prev) => ({ ...prev, ...data.pagination }));
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        setLoading(false);
      }
    },
    [search, actionFilter, activityTab, severityFilter, dateRange, pagination.limit],
  );

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("actionGroup", activityTab === "data" ? "data" : "account");
      if (dateRange.start) params.set("startDate", dateRange.start);
      if (dateRange.end) params.set("endDate", dateRange.end);
      const res = await api.get(`/api/activity-logs/stats?${params}`);
      setStats(res.data?.data || res.data);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, [dateRange, activityTab]);

  const fetchActions = useCallback(async () => {
    try {
      const res = await api.get("/api/activity-logs/actions");
      setAvailableActions((res.data?.data?.actions || []).sort());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  useEffect(() => {
    fetchLogs(1);
    fetchStats();
  }, [search, actionFilter, activityTab, severityFilter, dateRange]);

  // ─── Handlers ─────────────────────────────────────────────────────────

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    fetchLogs(newPage);
  };

  const clearFilters = () => {
    setSearch("");
    setActionFilter("");
    setSeverityFilter("");
    setDateRange({ start: "", end: "" });
  };

  const hasActiveFilters = search || actionFilter || severityFilter || dateRange.start || dateRange.end;

  // ─── Stat Cards ───────────────────────────────────────────────────────

  const renderStatCards = () => {
    if (statsLoading) {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse shadow-sm">
              <div className="h-3 w-20 bg-slate-100 rounded mb-3" />
              <div className="h-8 w-16 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      );
    }
    if (!stats) return null;

    const severityMap = {};
    (stats.bySeverity || []).forEach((s) => {
      severityMap[s._id] = s.count;
    });

    const cards = [
      { label: "Total Activities", value: stats.totalCount || 0, icon: Activity, color: "text-blue-600", iconBg: "bg-blue-50", border: "border-blue-100" },
      { label: "Needs Attention", value: (severityMap.critical || 0) + (severityMap.high || 0), icon: AlertTriangle, color: "text-amber-600", iconBg: "bg-amber-50", border: "border-amber-100" },
      {
        label: "Approvals",
        value: (stats.byAction || []).filter((a) => a._id?.includes("APPROVED")).reduce((sum, a) => sum + a.count, 0),
        icon: CheckCircle2,
        color: "text-green-600",
        iconBg: "bg-green-50",
        border: "border-green-100",
      },
      {
        label: "Today",
        value: (stats.byDay || []).find((d) => d._id === new Date().toISOString().slice(0, 10))?.count || 0,
        icon: Clock,
        color: "text-purple-600",
        iconBg: "bg-purple-50",
        border: "border-purple-100",
      },
    ];

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, idx) => (
          <div key={idx} className={`bg-white rounded-2xl border ${card.border} p-5 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</span>
              <div className={`p-2 rounded-xl ${card.iconBg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <div className={`text-3xl font-bold ${card.color}`}>{card.value.toLocaleString()}</div>
          </div>
        ))}
      </div>
    );
  };

  // ─── Mini Chart ───────────────────────────────────────────────────────

  const renderMiniChart = () => {
    if (!stats?.byDay?.length) return null;
    const data = stats.byDay.slice(-14);
    const max = Math.max(...data.map((d) => d.count), 1);
    const chartW = 600;
    const chartH = 80;
    const padX = 10;
    const padY = 8;
    const innerW = chartW - padX * 2;
    const innerH = chartH - padY * 2;

    const points = data.map((d, i) => ({
      x: padX + (data.length > 1 ? (i / (data.length - 1)) * innerW : innerW / 2),
      y: padY + innerH - (d.count / max) * innerH,
      ...d,
    }));

    const linePath =
      `M ${points[0].x},${points[0].y} ` +
      points
        .slice(1)
        .map((p, i) => {
          const prev = points[i];
          const cpx = (prev.x + p.x) / 2;
          return `C ${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
        })
        .join(" ");

    const areaPath = `${linePath} L ${points[points.length - 1].x},${chartH} L ${points[0].x},${chartH} Z`;

    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-blue-50">
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Activity Trend</span>
          <span className="text-xs text-slate-400 ml-1">(Last 14 days)</span>
        </div>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ height: "100px" }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#areaGrad)" />
          <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="8" fill="transparent" className="cursor-pointer" />
              <circle cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke="#3b82f6" strokeWidth="2" className="pointer-events-none" />
            </g>
          ))}
        </svg>

        <div className="relative w-full" style={{ marginTop: "-100px", height: "100px" }}>
          {points.map((p, i) => {
            const leftPct = (p.x / chartW) * 100;
            const topPct = (p.y / chartH) * 100;
            return (
              <div key={i} className="absolute group" style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: "translate(-50%, -50%)", width: "20px", height: "20px" }}>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-xs text-white px-2.5 py-1.5 rounded-lg shadow-lg hidden group-hover:block whitespace-nowrap z-10">
                  {new Date(p._id).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}: <strong>{p.count}</strong> activities
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between">
          <span className="text-[10px] text-slate-400 font-medium">{new Date(data[0]?._id).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
          <span className="text-[10px] text-slate-400 font-medium">{new Date(data[data.length - 1]?._id).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
        </div>
      </div>
    );
  };

  // ─── Log Item (Timeline Style) ────────────────────────────────────────

  const renderLogItem = (log, index) => {
    const config = ACTION_FRIENDLY[log.action] || DEFAULT_ACTION;
    const Icon = config.icon;
    const priority = PRIORITY_LABELS[log.severity] || PRIORITY_LABELS.medium;
    const isExpanded = expandedLog === log._id;
    const sentence = buildSentence(log, userIndustry);

    return (
      <div key={log._id} className="relative flex gap-4 group">
        {/* Timeline connector */}
        <div className="flex flex-col items-center">
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${config.bg} ring-2 ${config.ring} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>
          {index < logs.length - 1 && <div className="w-0.5 flex-1 bg-gradient-to-b from-slate-200 to-transparent mt-2 min-h-[20px]" />}
        </div>

        {/* Card */}
        <div
          className={`flex-1 mb-4 rounded-2xl border transition-all duration-200 ${
            isExpanded ? "bg-white border-slate-200 shadow-md ring-1 ring-slate-100" : "bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"
          }`}
        >
          <button onClick={() => setExpandedLog(isExpanded ? null : log._id)} className="w-full text-left p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 leading-relaxed">{sentence}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <User className="h-3 w-3" />
                    {log.performedBy?.username || "System"}
                  </span>
                  {log.performedBy?.role && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">{friendlyRole(log.performedBy.role, userIndustry)}</span>
                  )}
                  {(log.severity === "high" || log.severity === "critical") && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${priority.bg} ${priority.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
                      {priority.label}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <span className="text-xs text-slate-400 font-medium">{timeAgo(log.timestamp)}</span>
                <ChevronDown className={`h-4 w-4 text-slate-300 mx-auto mt-1.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
              </div>
            </div>
          </button>

          {/* Expanded details */}
          {isExpanded && (
            <div className="px-4 pb-4 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-3">
                <DetailItem icon={<Clock className="h-3.5 w-3.5 text-slate-400" />} label="When" value={formatDate(log.timestamp)} />
                <DetailItem
                  icon={<User className="h-3.5 w-3.5 text-slate-400" />}
                  label="By"
                  value={`${log.performedBy?.username || "System"} (${friendlyRole(log.performedBy?.role, userIndustry)})`}
                />
                {log.targetResource?.resourceName && (
                  <DetailItem icon={<ArrowRight className="h-3.5 w-3.5 text-slate-400" />} label="Affected" value={toUiTerminology(log.targetResource.resourceName, userIndustry)} />
                )}
                {log.targetResource?.resourceType && <DetailItem icon={<Info className="h-3.5 w-3.5 text-slate-400" />} label="Type" value={log.targetResource.resourceType.replace(/_/g, " ")} />}
                {log.remarks && (
                  <div className="sm:col-span-2">
                    <DetailItem icon={<FileText className="h-3.5 w-3.5 text-slate-400" />} label="Note" value={log.remarks} />
                  </div>
                )}
              </div>

              {log.changes?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">What Changed</p>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="px-4 py-2.5 text-left text-slate-400 font-semibold">Field</th>
                          <th className="px-4 py-2.5 text-left text-slate-400 font-semibold">Before</th>
                          <th className="px-4 py-2.5 text-left text-slate-400 font-semibold">After</th>
                        </tr>
                      </thead>
                      <tbody>
                        {log.changes.map((c, i) => (
                          <tr key={i} className="border-b border-slate-50 last:border-0">
                            <td className="px-4 py-2 text-slate-600 font-medium">{c.field?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</td>
                            <td className="px-4 py-2 text-red-500/80 line-through">{JSON.stringify(c.previousValue) ?? "—"}</td>
                            <td className="px-4 py-2 text-emerald-600 font-medium">{JSON.stringify(c.newValue) ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Main render ──────────────────────────────────────────────────────

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            Activity Feed
          </h1>
          <p className="text-sm text-slate-400 mt-1 ml-12">See what's happening across your organization</p>
        </div>
        <button
          onClick={() => {
            fetchLogs(pagination.page);
            fetchStats();
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {renderStatCards()}
      {renderMiniChart()}

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6 shadow-sm">
        {/* Tab toggle */}
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-slate-50 p-1 w-fit">
          <button
            onClick={() => setActivityTab("account")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activityTab === "account" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Account Activities
          </button>
          <button
            onClick={() => setActivityTab("data")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activityTab === "data" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Data Activities
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search activities by user or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all ${
              hasActiveFilters ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters {hasActiveFilters && "(active)"}
          </button>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="px-4 py-2.5 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
              Clear all
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Activity Type</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All types</option>
                {availableActions.map((a) => (
                  <option key={a} value={a}>
                    {ACTION_FRIENDLY[a]?.label || formatAction(a)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Priority</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All priorities</option>
                <option value="low">Routine</option>
                <option value="medium">Normal</option>
                <option value="high">Important</option>
                <option value="critical">Urgent</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">From</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">To</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        )}
      </div>

      {/* Timeline log list */}
      <div className="ml-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-3" />
            <span className="text-sm text-slate-400 font-medium">Loading your activity feed...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="p-4 rounded-2xl bg-slate-50 mb-4">
              <Activity className="h-10 w-10 text-slate-300" />
            </div>
            <span className="text-sm font-medium">No activities found</span>
            <span className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</span>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-3 text-xs font-medium text-blue-500 hover:text-blue-600 hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          logs.map((log, index) => renderLogItem(log, index))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-medium">
            Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()} activities
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              let pageNum;
              if (pagination.pages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${
                    pageNum === pagination.page ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <div className="mt-0.5">{icon}</div>
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-xs text-slate-700 font-medium">{value}</p>
    </div>
  </div>
);

export default ActivityLogs;