import React, { useState, useEffect } from "react";
import { Home, PlusCircle, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import Loader from "../../components/rf/Loader";
import SectionHeader from "../../components/rf/Header";
import ScopeEmissionsCards from "../../components/rf/ScopeEmissionsCards";
import TopEmissionSources from "../../components/rf/TopEmissionSources";
import EmissionsTrendChart from "../../features/plantAdmin/dashboard/EmissionsTrendChart";
import CompletionPieChart from "../../features/plantAdmin/dashboard/CompletionPieChart";
import { calculateEmissions, getScope3ModuleByActivityType } from "../../utils/emission-calculator";

const PlantAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    approvedData: 0,
    totalSubmissions: 0,
    completionRate: "0%",
    scope1: 0,
    scope2: 0,
    scope3: 0,
    totalEmissions: 0,
    topSources: [],
    emissionTrend: [],
    trendPercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedSubmitterId, setSelectedSubmitterId] = useState("all");
  const [submitterOptions, setSubmitterOptions] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
  }, [selectedSubmitterId]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch pending submissions (status=submitted)
      const pendingRes = await api.get("/api/submissions?status=submitted");
      const pendingList = pendingRes.data?.data || [];

      // Fetch approved data
      const approvedRes = await api.get("/api/submissions/approved-data");
      const approvedList = approvedRes.data?.data || [];

      const uniqueSubmitters = new Map();
      [...pendingList, ...approvedList].forEach((item) => {
        const submitterId = item?.submittedBy?._id || item?.submittedBy;
        if (!submitterId) return;
        uniqueSubmitters.set(String(submitterId), {
          id: String(submitterId),
          name: item?.submittedBy?.username || item?.submittedBy?.email || "Unknown User",
        });
      });
      setSubmitterOptions(Array.from(uniqueSubmitters.values()));

      const filteredPendingList =
        selectedSubmitterId === "all"
          ? pendingList
          : pendingList.filter((item) => {
              const submitterId = item?.submittedBy?._id || item?.submittedBy;
              return String(submitterId) === String(selectedSubmitterId);
            });

      const filteredApprovedList =
        selectedSubmitterId === "all"
          ? approvedList
          : approvedList.filter((item) => {
              const submitterId = item?.submittedBy?._id || item?.submittedBy;
              return String(submitterId) === String(selectedSubmitterId);
            });

      // console.log("🏭 [PlantAdmin Debug] Approved Data Count:", approvedList.length);
      // console.log("🏭 [PlantAdmin Debug] Approved Data:", approvedList);

      const totalSubmissions = filteredPendingList.length + filteredApprovedList.length;
      const completionRate = totalSubmissions > 0 ? `${Math.round((filteredApprovedList.length / totalSubmissions) * 100)}%` : "0%";

      // Calculate Scope Emissions
      // Calculate Scope Emissions & Top Sources
      let s1 = 0,
        s2 = 0,
        s3 = 0;
      const emissionSourcesMap = {};

      filteredApprovedList.forEach((item) => {
        const payloads = [
          { scope: "Scope 1", data: item.scope1Data },
          { scope: "Scope 2", data: item.scope2Data },
          { scope: "Scope 3", data: item.scope3Data },
        ];

        payloads.forEach(({ scope, data }) => {
          if (!data?.sections) return;
          data.sections.forEach((section) => {
            (section.activities || []).forEach((activity) => {
              (activity.sources || []).forEach((source) => {
                const resolvedScope3Module = data.scope3Module || section.scope3Module || activity.scope3Module || getScope3ModuleByActivityType(activity.activityType || activity.activityCategory);

                const emissions = calculateEmissions(source.consumption, source.unit, source.source, scope, activity.activityType, resolvedScope3Module, source.emissionFactor);

                const val = parseFloat(emissions) || 0;
                if (val > 0) {
                  if (scope === "Scope 1") s1 += val;
                  if (scope === "Scope 2") s2 += val;
                  if (scope === "Scope 3") s3 += val;

                  // Aggregate by source name for Top Sources
                  const sourceName = source.source || activity.activityType || activity.activityCategory || "Unknown Source";
                  emissionSourcesMap[sourceName] = (emissionSourcesMap[sourceName] || 0) + val;
                }
              });
            });
          });
        });
      });

      const topSources = Object.entries(emissionSourcesMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Calculate Emissions Trend (Monthly)
      const monthlyEmissions = {};
      filteredApprovedList.forEach((item) => {
        // Use the approvedData's date or createdAt
        // We'll try to find the earliest date in the item sources, or fallback to item date
        let itemDate = new Date(item.approvedAt || item.createdAt);

        // Iterate scope data to find specific dates if possible (more accurate)
        // For simplicity in this dashboard view, we might just use the item level date
        // OR we can aggregate per source if we want perfect accuracy
        // Let's iterate sources again to be consistent with total calculation

        const payloads = [
          { scope: "Scope 1", data: item.scope1Data },
          { scope: "Scope 2", data: item.scope2Data },
          { scope: "Scope 3", data: item.scope3Data },
        ];

        payloads.forEach(({ scope, data }) => {
          if (!data?.sections) return;
          data.sections.forEach((section) => {
            (section.activities || []).forEach((activity) => {
              (activity.sources || []).forEach((source) => {
                const resolvedScope3Module = data.scope3Module || section.scope3Module || activity.scope3Module || getScope3ModuleByActivityType(activity.activityType || activity.activityCategory);

                const emissions = calculateEmissions(source.consumption, source.unit, source.source, scope, activity.activityType, resolvedScope3Module, source.emissionFactor);

                const val = parseFloat(emissions) || 0;
                if (val > 0) {
                  // Determine date for this specific source emission
                  const dateStr = source.date || item.approvedAt || item.createdAt;
                  const date = new Date(dateStr);
                  const monthKey = date.toLocaleString("default", { month: "short" }); // e.g. "Jan", "Feb"
                  // We need a sortable key too, e.g. "2023-01"
                  const year = date.getFullYear();
                  const monthIndex = date.getMonth();
                  const sortKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

                  if (!monthlyEmissions[sortKey]) {
                    monthlyEmissions[sortKey] = { month: monthKey, emissions: 0, sortKey };
                  }
                  monthlyEmissions[sortKey].emissions += val;
                }
              });
            });
          });
        });
      });

      // Convert to array and sort
      const trendData = Object.values(monthlyEmissions)
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
        .map((item) => ({ month: item.month, emissions: item.emissions }));

      // Calculate trend percentage (last month vs month before)
      let trendPercentage = 0;
      if (trendData.length >= 2) {
        const lastMonth = trendData[trendData.length - 1].emissions;
        const prevMonth = trendData[trendData.length - 2].emissions;
        if (prevMonth > 0) {
          trendPercentage = ((lastMonth - prevMonth) / prevMonth) * 100;
        } else if (lastMonth > 0) {
          trendPercentage = 100; // 0 to something is 100% increase
        }
      }
      trendPercentage = Math.round(trendPercentage);

      // console.log("🔥 [PlantAdmin Debug] Scope 1 Total:", s1);
      // console.log("🔥 [PlantAdmin Debug] Scope 2 Total:", s2);
      // console.log("🔥 [PlantAdmin Debug] Scope 3 Total:", s3);
      // console.log("🔥 [PlantAdmin Debug] Total Emissions:", s1 + s2 + s3);
      // console.log("📈 [PlantAdmin Debug] Trend Percentage:", trendPercentage);

      setStats({
        pendingApprovals: filteredPendingList.length,
        approvedData: filteredApprovedList.length,
        totalSubmissions: totalSubmissions,
        completionRate: completionRate,
        scope1: s1,
        scope2: s2,
        scope3: s3,
        totalEmissions: s1 + s2 + s3,
        topSources: topSources,
        emissionTrend: trendData,
        trendPercentage: trendPercentage,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-3 py-3 animate-in fade-in duration-500">
      {/* Header Section */}
      <SectionHeader icon={Home} title="Branch Manager Dashboard" description="Overview of your branch emissions and submissions" />

      <div className="mb-6 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Filter By Submitter</label>
        <select value={selectedSubmitterId} onChange={(event) => setSelectedSubmitterId(event.target.value)} className="w-full md:w-96 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
          <option value="all">All Submitters</option>
          {submitterOptions.map((submitter) => (
            <option key={submitter.id} value={submitter.id}>
              {submitter.name}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Actions */}
      {/* <div className="bg-white rounded-2xl border mb-5 border-slate-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <QuickActionCard
            title="Review Submissions"
            subtitle="Approve or reject data logs"
            icon={CheckCircle}
            onClick={() => navigate("/plant/approvals")}
            hoverColorClass="hover:shadow-emerald-100/50 hover:border-emerald-200"
            iconColorClass="bg-emerald-100/80 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
            titleColorClass="text-slate-800 group-hover:text-emerald-700"
            gradientColorClass="from-emerald-50/50"
          />

          <QuickActionCard
            title="Data Archive"
            subtitle="Export and view history"
            icon={FileText}
            onClick={() => navigate("/plant/approved-reports")}
            hoverColorClass="hover:shadow-emerald-100/50 hover:border-emerald-200"
            iconColorClass="bg-emerald-100/80 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
            titleColorClass="text-slate-800 group-hover:text-emerald-700"
            gradientColorClass="from-emerald-50/50"
          />

        </div>
      </div> */}

      <div className="mb-4 bg-white rounded-2xl p-3">
        <h1 className="font-bold text-lg m-2">Emission By Scope</h1>
        <ScopeEmissionsCards scope1={stats.scope1} scope2={stats.scope2} scope3={stats.scope3} totalEmissions={stats.totalEmissions} chartType="area" showTrendIndicator={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 h-96">
        <div className="lg:col-span-1 h-full">
          <EmissionsTrendChart data={stats.emissionTrend} trendPercentage={stats.trendPercentage} />
        </div>
        <div className="lg:col-span-1 h-full">
          <CompletionPieChart completed={stats.approvedData} pending={stats.pendingApprovals} percentage={stats.completionRate} />
        </div>
      </div>

      <div className="lg:col-span-1 my-5 h-full">
        <TopEmissionSources sources={stats.topSources} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Activity Log Shortcuts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/plant/logs?action=ENERGY_DATA_ENTERED")}
            className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 hover:bg-emerald-100/70 transition-colors"
          >
            <span className="text-sm font-semibold text-emerald-700">Data Entry Logs</span>
            <PlusCircle className="w-4 h-4 text-emerald-700" />
          </button>
          <button
            onClick={() => navigate("/plant/logs?action=ENERGY_DATA_APPROVED")}
            className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 hover:bg-blue-100/70 transition-colors"
          >
            <span className="text-sm font-semibold text-blue-700">Approval Logs</span>
            <CheckCircle2 className="w-4 h-4 text-blue-700" />
          </button>
          <button
            onClick={() => navigate("/plant/logs?action=ENERGY_DATA_REJECTED")}
            className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/70 px-4 py-3 hover:bg-red-100/70 transition-colors"
          >
            <span className="text-sm font-semibold text-red-700">Rejection Logs</span>
            <XCircle className="w-4 h-4 text-red-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantAdminDashboard;
