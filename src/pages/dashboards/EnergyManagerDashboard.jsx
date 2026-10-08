import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AtomIcon, FileEdit, FileUp, Import, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import SectionHeader from "../../components/rf/Header.jsx";
import Loader from "../../components/rf/Loader";
import ScopeEmissionsCards from "../../components/rf/ScopeEmissionsCards";
import { getDisplayRoleLabel } from "../../utils/uiTerminology";

// Import EMDashboard Components
import ConsumptionTrendChart from "../../features/energyManager/EMDashboard/ConsumptionTrendChart";
import TopEmissionSourcesChart from "../../features/energyManager/EMDashboard/TopEmissionSourcesChart";
import EmissionsByScopeChart from "../../features/energyManager/EMDashboard/EmissionsByScopeChart.jsx";
import QuickActionCard from "../../components/rf/QuickActionCard.jsx";

// Import Emission Calculation Utilities
import { calculateEmissions, getScope3ModuleByActivityType } from "../../utils/emission-calculator";
const EnergyManagerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [resolvedIndustry, setResolvedIndustry] = useState(user?.organizationId?.industry || user?.organizationIndustry || "");
  const assignedFacilities = user?.facilities || [];
  const getFacilityId = (facilityRef) => facilityRef?.facilityId?._id || facilityRef?.facilityId || facilityRef?._id || facilityRef;
  const getFacilityName = (facilityRef) => facilityRef?.facilityId?.facilityName || facilityRef?.facilityId?.name || facilityRef?.facilityName || facilityRef?.name || "Unnamed Facility";
  const [selectedFacilityId, setSelectedFacilityId] = useState(() => {
    const first = assignedFacilities[0];
    return first ? String(getFacilityId(first) || "") : "";
  });
  const [loading, setLoading] = useState(true);
  const lastFetchTimeRef = useRef(0);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    scope1: 0,
    scope2: 0,
    scope3: 0,
    totalEmissions: 0,
    topSources: [],
    trendData: [],
    trendPercentage: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, [location.key, user?.facilities, selectedFacilityId]);

  useEffect(() => {
    if (selectedFacilityId) return;
    const first = assignedFacilities[0];
    const firstId = first ? String(getFacilityId(first) || "") : "";
    if (firstId) {
      setSelectedFacilityId(firstId);
    }
  }, [assignedFacilities, selectedFacilityId]);

  useEffect(() => {
    const fetchOrganizationIndustry = async () => {
      const orgId = user?.organizationId?._id || user?.organizationId;
      if (!orgId) return;

      try {
        const res = await api.get(`/api/organizations/${orgId}`);
        const org = res.data?.data || res.data;
        if (org?.industry) {
          setResolvedIndustry(org.industry);
        }
      } catch (error) {
        console.error("Error fetching organization industry:", error);
      }
    };

    fetchOrganizationIndustry();
  }, [user?.organizationId]);

  useEffect(() => {
    const handleFocus = () => {
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTimeRef.current;
      const fiveMinutes = 5 * 60 * 1000;

      // Only refetch if 5 minutes have passed since last fetch
      if (timeSinceLastFetch > fiveMinutes) {
        fetchDashboardStats();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleFocus();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      lastFetchTimeRef.current = Date.now();

      if (!user) {
        setStats((prev) => ({ ...prev, topSources: [], trendData: [] }));
        return;
      }

      // Fetch all submissions for overview
      // Note: Ideally query parameters would filter by facility if the user has multiple
      // But assuming Energy Manager sees all their assigned data
      const facilityId = selectedFacilityId || user?.facilities?.[0]?.facilityId?._id || user?.facilities?.[0]?.facilityId;
      if (!facilityId) {
        setStats((prev) => ({
          ...prev,
          pending: 0,
          approved: 0,
          rejected: 0,
          scope1: 0,
          scope2: 0,
          scope3: 0,
          totalEmissions: 0,
          topSources: [],
          trendData: [],
          trendPercentage: 0,
        }));
        return;
      }
      const res = await api.get(`/api/submissions${facilityId ? `?facilityId=${facilityId}` : ""}`);
      const submissions = res.data?.data || [];

      let pending = 0;
      let approved = 0;
      let rejected = 0;
      let s1 = 0,
        s2 = 0,
        s3 = 0;
      const emissionSourcesMap = {};
      const monthlyEmissions = {};

      submissions.forEach((item) => {
        // Count Status
        const status = item.status || "draft";
        if (status === "approved") approved++;
        else if (status === "rejected") rejected++;
        else if (status === "submitted") pending++;

        // Include drafts + submitted + approved for live Energy Manager insights
        if (status === "rejected") return;

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

                const emis = calculateEmissions(source.consumption, source.unit, source.source, scope, activity.activityType, resolvedScope3Module, source.emissionFactor);

                const val = parseFloat(emis) || 0;
                if (val > 0) {
                  if (scope === "Scope 1") s1 += val;
                  if (scope === "Scope 2") s2 += val;
                  if (scope === "Scope 3") s3 += val;

                  // Top Sources
                  const sourceName = source.source || activity.activityCategory || "Unknown";
                  emissionSourcesMap[sourceName] = (emissionSourcesMap[sourceName] || 0) + val;

                  // Monthly Trend
                  const dateStr = source.date || item.approvedAt || item.createdAt;
                  const date = new Date(dateStr);
                  const monthIndex = date.getMonth();
                  const year = date.getFullYear();
                  const sortKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
                  const monthLabel = date.toLocaleString("default", { month: "short" });

                  if (!monthlyEmissions[sortKey]) {
                    monthlyEmissions[sortKey] = { month: monthLabel, value: 0, sortKey };
                  }
                  monthlyEmissions[sortKey].value += val;
                }
              });
            });
          });
        });
      });

      // Format Top Sources
      const topSources = Object.entries(emissionSourcesMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Format Trend Data
      const trendData = Object.values(monthlyEmissions)
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
        .map(({ month, value }) => ({ month, value }));

      // Calculate Trend Percentage
      let trendPercentage = 0;
      if (trendData.length >= 2) {
        const last = trendData[trendData.length - 1].value;
        const prev = trendData[trendData.length - 2].value;
        if (prev > 0) trendPercentage = Math.round(((last - prev) / prev) * 100);
        else if (last > 0) trendPercentage = 100;
      }

      setStats({
        pending,
        approved,
        rejected,
        scope1: s1,
        scope2: s2,
        scope3: s3,
        totalEmissions: s1 + s2 + s3,
        topSources,
        trendData,
        trendPercentage,
      });
    } catch (error) {
      console.error("Error fetching energy dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  const managerLabel = getDisplayRoleLabel("ENERGY_MANAGER", resolvedIndustry);

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-3 py-3 animate-in fade-in duration-500 space-y-8">
      <SectionHeader icon={LayoutDashboard} title={`${managerLabel} Dashboard`} description="Fill in emission data and view emissions impact." />

      <div className="mb-4 bg-white rounded-2xl p-3">
        <h1 className="font-bold text-lg m-2">Emission By Scope</h1>
        <ScopeEmissionsCards scope1={stats.scope1} scope2={stats.scope2} scope3={stats.scope3} totalEmissions={stats.totalEmissions} chartType="area" showTrendIndicator={false} />
      </div>

      {/* Charts Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart (2/3 width) */}
        <div className="lg:col-span-2 h-[350px] min-w-0">
          <ConsumptionTrendChart data={stats.trendData} title="Emission Trends" unit="tCO₂e" trendPercentage={stats.trendPercentage} />
        </div>

        {/* Scope Donut Chart (1/3 width) */}
        <div className="lg:col-span-1 h-[350px] min-w-0">
          <EmissionsByScopeChart scope1={stats.scope1} scope2={stats.scope2} scope3={stats.scope3} />
        </div>
      </div>

      {/* Top Value Sources */}
      <div className="h-[400px] min-w-0">
        <TopEmissionSourcesChart data={stats.topSources} />
      </div>

      <div className="bg-white rounded-2xl py-5 px-6">
        <h1 className="text-xl my-2 font-semibold">Quick Actions</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <QuickActionCard
            title="Enter Data"
            subtitle="Fill emission data entry"
            icon={FileEdit}
            onClick={() => navigate("/energy/data-entry")}
            hoverColorClass="hover:shadow-emerald-100/50 hover:border-emerald-200"
            iconColorClass="bg-emerald-100/80 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
            titleColorClass="text-slate-800 group-hover:text-emerald-700"
            gradientColorClass="from-emerald-50/50"
          />

          <QuickActionCard
            title="Bulk Import"
            subtitle="Upload Excel files"
            icon={Import}
            onClick={() => navigate("/energy/bulk-import")}
            hoverColorClass="hover:shadow-blue-100/50 hover:border-blue-200"
            iconColorClass="bg-blue-100/80 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
            titleColorClass="text-slate-800 group-hover:text-blue-700"
            gradientColorClass="from-blue-50/50"
          />

          <QuickActionCard title="AI-OCR" subtitle="Automated data extraction" icon={AtomIcon} onClick={() => navigate("/energy/ai-ocr")} />
        </div>
      </div>
    </div>
  );
};

export default EnergyManagerDashboard;
