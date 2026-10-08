import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

const GodModeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/god/stats");
        setStats(res.data?.data);
      } catch (err) {
        console.error("Failed to load god mode stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8">
      {/* God Mode Banner */}
      <div className="mb-8 p-4 bg-red-950 border border-red-800 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <h1 className="text-xl font-bold text-red-400">God Mode Active</h1>
            <p className="text-sm text-red-300/70">
              Root access — all system controls enabled. Logged in as{" "}
              <span className="font-mono text-red-300">{user?.username}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Total Users</p>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Active Users</p>
            <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Role Distribution</p>
            <div className="mt-2 space-y-1">
              {stats.roleDistribution &&
                Object.entries(stats.roleDistribution).map(([role, count]) => (
                  <div key={role} className="flex justify-between text-sm">
                    <span className="text-gray-600">{role}</span>
                    <span className="font-mono font-semibold">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Failed to load statistics.</p>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800">
          <strong>Security reminder:</strong> God Mode actions are logged with
          immutable audit trails. Maximum 1–2 God Mode users recommended. MFA &
          IP restrictions should be enforced.
        </p>
      </div>
    </div>
  );
};

export default GodModeDashboard;
