import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import {
  Search,
  Filter,
  LifeBuoy,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  MoreVertical,
  Calendar,
  MessageSquare,
  FileText
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { isGodMode, ROLE_CODES } from "../../config/roleConfig";

const STATUS_COLORS = {
  "Draft": "bg-slate-100 text-slate-600",
  "Submitted": "bg-blue-50 text-blue-600",
  "Under Review": "bg-purple-50 text-purple-600",
  "Awaiting Information": "bg-amber-50 text-amber-600",
  "Response Drafted": "bg-indigo-50 text-indigo-600",
  "Resolved": "bg-emerald-50 text-emerald-600",
  "Closed": "bg-slate-100 text-slate-500"
};

const PRIORITY_COLORS = {
  "Low": "text-slate-500",
  "Medium": "text-blue-500",
  "High": "text-orange-500",
  "Critical": "text-red-500"
};

const QueryDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/queries");
      setQueries(res.data.data);
    } catch (error) {
      console.error("Failed to fetch queries:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQueries = queries.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "Resolved":
      case "Closed": return <CheckCircle className="w-3 h-3" />;
      case "Awaiting Information": return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const isAdminOrHead = ROLE_CODES.HEAD.includes(user?.role) || 
                        ROLE_CODES.ORG_ADMIN.includes(user?.role) || 
                        ROLE_CODES.REGION_ADMIN.includes(user?.role) || 
                        ROLE_CODES.PLANT_ADMIN.includes(user?.role);

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl flex items-center justify-center">
            <LifeBuoy className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Query Tracking Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and track your support tickets and methodology queries.</p>
          </div>
        </div>
        {!isAdminOrHead && (
          <Link
            to="/helpdesk/submit"
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition-all text-center"
          >
            + New Request
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Awaiting Information">Awaiting Information</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket ID</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status & Priority</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Requester</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Timeline</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-500 text-sm">
                    Loading queries...
                  </td>
                </tr>
              ) : filteredQueries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <FileText className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-slate-600 font-medium">No queries found</p>
                      <p className="text-slate-400 text-xs mt-1">Adjust your filters or submit a new query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQueries.map((query) => (
                  <tr 
                    key={query._id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/helpdesk/${query._id}`)}
                  >
                    <td className="px-5 py-4 align-top">
                      <div className="text-xs font-mono font-medium text-slate-500">
                        #{query._id.slice(-6).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top max-w-[250px]">
                      <div className="font-semibold text-slate-800 text-sm truncate mb-1" title={query.title}>
                        {query.title}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {query.category}
                        </span>
                        {query.subCategory && (
                          <span className="text-[10px] font-medium text-slate-500 truncate max-w-[100px]">
                            • {query.subCategory}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-col gap-2">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${STATUS_COLORS[query.status] || STATUS_COLORS["Draft"]}`}>
                          {getStatusIcon(query.status)}
                          {query.status}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span className={PRIORITY_COLORS[query.priority]}>{query.priority} Priority</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="text-sm font-medium text-slate-700">{query.createdBy?.username || "User"}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {query.assignedTo ? (
                          <span className="text-emerald-600 font-medium flex items-center gap-1 mt-1">
                            Assigned to: {query.assignedTo.username}
                          </span>
                        ) : (
                          <span className="text-amber-500 font-medium">Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {dayjs(query.createdAt).format("MMM DD, YYYY")}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {dayjs(query.createdAt).fromNow()}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle text-right">
                      <button className="p-2 text-slate-400 group-hover:text-emerald-600 bg-white border border-slate-200 group-hover:border-emerald-200 rounded-xl transition-all shadow-sm">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QueryDashboard;
