import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { toast } from "sonner";
import { Users, UserCheck, Shield, BarChart3, RefreshCcw, Activity } from "lucide-react";

const roleBadgeColor = (role) => {
  const colors = {
    GOD_MODE: "bg-red-900 text-red-200",
    PLATFORM_ADMIN: "bg-red-100 text-red-800",
    MAINTAINER: "bg-cyan-100 text-cyan-800",
    ORG_ADMIN: "bg-blue-100 text-blue-800",
    PLANT_ADMIN: "bg-green-100 text-green-800",
    ENERGY_MANAGER: "bg-orange-100 text-orange-800",
    COMPLIANCE_OFFICER: "bg-yellow-100 text-yellow-800",
    AUDITOR: "bg-gray-100 text-gray-800",
    FINANCE_CFO: "bg-indigo-100 text-indigo-800",
  };
  return colors[role] || "bg-gray-100 text-gray-800";
};

const GodModeStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/god/stats");
      setStats(res.data?.data || null);
    } catch (err) {
      console.error("Failed to load stats:", err);
      toast.error("Failed to load system statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>Unable to load statistics.</p>
        <button onClick={fetchStats} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
          Retry
        </button>
      </div>
    );
  }

  const { totalUsers = 0, activeUsers = 0, roleDistribution = {} } = stats;
  const inactiveUsers = totalUsers - activeUsers;
  const sortedRoles = Object.entries(roleDistribution).sort((a, b) => b[1] - a[1]);
  const maxRoleCount = Math.max(...Object.values(roleDistribution), 1);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-red-600" />
          <h1 className="text-2xl font-bold">System Statistics</h1>
        </div>
        <button onClick={fetchStats} className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
          <RefreshCcw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          </div>
          <p className="text-3xl font-bold">{totalUsers}</p>
          <p className="text-xs text-gray-400 mt-1">All registered accounts</p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
          </div>
          <p className="text-3xl font-bold text-green-700">{activeUsers}</p>
          <p className="text-xs text-gray-400 mt-1">{totalUsers > 0 ? `${Math.round((activeUsers / totalUsers) * 100)}% of total` : "—"}</p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <Activity className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Inactive Users</h3>
          </div>
          <p className="text-3xl font-bold text-red-700">{inactiveUsers}</p>
          <p className="text-xs text-gray-400 mt-1">{totalUsers > 0 ? `${Math.round((inactiveUsers / totalUsers) * 100)}% of total` : "—"}</p>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-semibold">Role Distribution</h2>
        </div>
        {sortedRoles.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No role data available</p>
        ) : (
          <div className="space-y-4">
            {sortedRoles.map(([role, count]) => (
              <div key={role} className="flex items-center gap-4">
                <div className="w-40 flex-shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleBadgeColor(role)}`}>{role}</span>
                </div>
                <div className="flex-1">
                  <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${(count / maxRoleCount) * 100}%` }} />
                  </div>
                </div>
                <div className="w-12 text-right">
                  <span className="text-sm font-semibold text-gray-700">{count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GodModeStats;
