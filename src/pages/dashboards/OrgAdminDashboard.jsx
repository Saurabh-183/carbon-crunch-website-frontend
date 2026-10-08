import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2Icon, Settings2, Building2, Users, PlusCircle, CheckCircle2, XCircle } from "lucide-react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import SectionHeader from "../../components/rf/Header";
import Loader from "../../components/rf/Loader";
import { calculateEmissions, getScope3ModuleByActivityType } from "../../utils/emission-calculator";
import { getDisplayRoleLabel, getSiteUnitLabel, isServiceSectorIndustry } from "../../utils/uiTerminology";

// Enhanced Components
import ScopeEmissionsCards from "../../components/rf/ScopeEmissionsCards";
import FacilityEmissionsRankChart from "../../components/rf/FacilityEmissionsRankChart";
import GlobalSourceBreakdown from "../../components/rf/GlobalSourceBreakdown";
import EmissionIntensityCard from "../../components/rf/EmissionIntensityCard";
import PendingActionsCard from "../../features/energyManager/EMDashboard/PendingActionsCard"; // Reusing this for consistent look if needed, or simple stats
import QuickActionCard from "../../components/rf/QuickActionCard";

const OrgAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const organizationId = user?.organizationId?._id || user?.organizationId || "";
  const routeBase = user?.role === "HEAD" ? "/head" : "/org";
  const industry = user?.organizationId?.industry || user?.organizationIndustry || "";
  const [resolvedIndustry, setResolvedIndustry] = useState(industry);
  const isServiceSector = isServiceSectorIndustry(resolvedIndustry || industry);
  const siteUnitLabel = getSiteUnitLabel(resolvedIndustry || industry, "singular", user?.role);
  const siteUnitPluralLabel = getSiteUnitLabel(resolvedIndustry || industry, "plural", user?.role);
  const [selectedSiteUnitId, setSelectedSiteUnitId] = useState("all");
  const [siteUnits, setSiteUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    scope1: 0,
    scope2: 0,
    scope3: 0,
    totalEmissions: 0,
    scope1Trend: [],
    scope2Trend: [],
    scope3Trend: [],
    totalTrend: [],
    facilityRankings: [],
    sourceMix: [],
    intensity: 0,
    intensityTrend: 0, // Mock or calculated
    facilitiesCount: 0,
    approvedReports: 0,
    pendingReports: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [selectedSiteUnitId, organizationId]);

  useEffect(() => {
    const fetchOrganizationIndustry = async () => {
      if (!organizationId) return;

      try {
        const res = await api.get(`/api/organizations/${organizationId}`);
        const org = res.data?.data || res.data;
        if (org?.industry) {
          setResolvedIndustry(org.industry);
        }
      } catch (error) {
        console.error("Error fetching organization industry:", error);
      }
    };

    fetchOrganizationIndustry();
  }, [organizationId]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      if (!organizationId) {
        setSiteUnits([]);
        return;
      }

      const [facilitiesRes, approvedDataRes, pendingRes] = await Promise.all([
        api.get(`/api/facilities?organizationId=${organizationId}`),
        api.get("/api/submissions/approved-data"),
        api.get("/api/submissions?status=submitted"),
      ]);

      const facilitiesPayload = facilitiesRes.data?.data;
      const facilities = Array.isArray(facilitiesPayload) ? facilitiesPayload : facilitiesPayload?.facilities || [];
      setSiteUnits(facilities);

      if (!resolvedIndustry && facilities.length > 0) {
        const orgIndustryFromFacility = facilities[0]?.organizationId?.industry || facilities[0]?.organizationIndustry;
        if (orgIndustryFromFacility) {
          setResolvedIndustry(orgIndustryFromFacility);
        }
      }

      const approvedData = approvedDataRes.data?.data || [];
      const pendingData = pendingRes.data?.data || [];
      const facilityIds = new Set(facilities.map((f) => f._id || f.id));

      // console.log("🏢 [OrgAdmin Debug] Facilities:", facilities.length);
      // console.log("🏢 [OrgAdmin Debug] Facility IDs:", Array.from(facilityIds));
      // console.log("📊 [OrgAdmin Debug] Total Approved Data:", approvedData.length);
      // console.log("📊 [OrgAdmin Debug] Total Pending Data:", pendingData.length);

      // Filter approved data to only include this organization's facilities
      const scopedSubmissions = approvedData.filter((item) => {
        const facilityId = item.facilityId?._id || item.facilityId;
        return facilityIds.has(facilityId);
      });

      const siteFilteredSubmissions =
        selectedSiteUnitId === "all"
          ? scopedSubmissions
          : scopedSubmissions.filter((item) => {
              const facilityId = item.facilityId?._id || item.facilityId;
              return String(facilityId) === String(selectedSiteUnitId);
            });

      // 1. Calculate Total Area (for Intensity)
      // Assuming facilityArea is in sq ft. Handle variations if needed.
      const totalArea = facilities.reduce((sum, f) => sum + (Number(f.facilityArea) || 0), 0);

      // 2. Maps for Aggregation
      const facilityEmissionMap = {}; // { facilityId: totalEmissions }
      const sourceEmissionMap = {}; // { sourceName: totalEmissions }
      const monthlyScopeData = {}; // { "2023-01": { s1: 0, s2: 0, s3: 0 } }

      let s1Total = 0,
        s2Total = 0,
        s3Total = 0;

      // 3. Process All Approved Data
      // console.log("✅ [OrgAdmin Debug] Scoped Submissions:", scopedSubmissions.length);

      // All scopedSubmissions are already approved, count them directly
      const approvedReports = siteFilteredSubmissions.length;
      const pendingReports = pendingData.filter((item) => {
        const facilityId = item.facilityId?._id || item.facilityId;
        if (!facilityIds.has(facilityId)) return false;
        if (selectedSiteUnitId === "all") return true;
        return String(facilityId) === String(selectedSiteUnitId);
      }).length;

      siteFilteredSubmissions.forEach((item) => {
        const facilityId = item.facilityId?._id || item.facilityId;
        const entryDate = new Date(item.period?.startDate || item.createdAt);
        const monthKey = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, "0")}`;

        if (!monthlyScopeData[monthKey]) monthlyScopeData[monthKey] = { s1: 0, s2: 0, s3: 0 };

        // Helper to process a specific scope payload (using same pattern as PlantAdminDashboard)
        const processScope = (scopeName, data) => {
          let scopeSum = 0;
          data?.sections?.forEach((section) => {
            section.activities?.forEach((act) => {
              act.sources?.forEach((src) => {
                const resolvedScope3Module = data.scope3Module || section.scope3Module || act.scope3Module || getScope3ModuleByActivityType(act.activityType || act.activityCategory);

                const emissions = calculateEmissions(src.consumption, src.unit, src.source, scopeName, act.activityType, resolvedScope3Module, src.emissionFactor);

                const val = parseFloat(emissions) || 0;
                if (val > 0) {
                  scopeSum += val;

                  // Source Mix Aggregate
                  const sourceName = src.source || act.activityType || act.activityCategory || "Other";
                  sourceEmissionMap[sourceName] = (sourceEmissionMap[sourceName] || 0) + val;
                }
              });
            });
          });
          return scopeSum;
        };

        const s1 = processScope("Scope 1", item.scope1Data);
        const s2 = processScope("Scope 2", item.scope2Data);
        const s3 = processScope("Scope 3", item.scope3Data);

        const itemTotal = s1 + s2 + s3;

        // Totals
        s1Total += s1;
        s2Total += s2;
        s3Total += s3;

        // Facility Aggregate
        facilityEmissionMap[facilityId] = (facilityEmissionMap[facilityId] || 0) + itemTotal;

        // Monthly Trend
        monthlyScopeData[monthKey].s1 += s1;
        monthlyScopeData[monthKey].s2 += s2;
        monthlyScopeData[monthKey].s3 += s3;
      });

      // 4. Format Data for Components

      // A. Facility Rankings
      const facilityMap = new Map(facilities.map((f) => [f._id, f]));
      const facilityRankings = Object.entries(facilityEmissionMap)
        .map(([id, val]) => ({
          name: facilityMap.get(id)?.facilityName || facilityMap.get(id)?.name || `Unknown ${siteUnitLabel}`,
          value: val,
        }))
        .sort((a, b) => b.value - a.value);

      // B. Source Mix (Top 5 + Other)
      const sortedSources = Object.entries(sourceEmissionMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const topSumberData = sortedSources.slice(0, 5);
      const otherValue = sortedSources.slice(5).reduce((acc, curr) => acc + curr.value, 0);
      if (otherValue > 0) topSumberData.push({ name: "Others", value: otherValue });

      // C. Trends (Sparklines)
      // Sort months
      const sortedMonths = Object.keys(monthlyScopeData).sort();
      const scope1Trend = sortedMonths.map((m) => monthlyScopeData[m].s1);
      const scope2Trend = sortedMonths.map((m) => monthlyScopeData[m].s2);
      const scope3Trend = sortedMonths.map((m) => monthlyScopeData[m].s3);
      const totalTrend = sortedMonths.map((m) => monthlyScopeData[m].s1 + monthlyScopeData[m].s2 + monthlyScopeData[m].s3);

      // D. Intensity
      const totalEmissions = s1Total + s2Total + s3Total;
      const intensity = totalArea > 0 ? totalEmissions / totalArea : 0;

      // console.log("📈 [OrgAdmin Debug] Approved Submissions:", approvedReports);
      // console.log("📈 [OrgAdmin Debug] Pending Submissions:", pendingReports);
      // console.log("🔥 [OrgAdmin Debug] Scope 1 Total:", s1Total);
      // console.log("🔥 [OrgAdmin Debug] Scope 2 Total:", s2Total);
      // console.log("🔥 [OrgAdmin Debug] Scope 3 Total:", s3Total);
      // console.log("🔥 [OrgAdmin Debug] Total Emissions:", totalEmissions);

      setStats({
        scope1: s1Total,
        scope2: s2Total,
        scope3: s3Total,
        totalEmissions,
        scope1Trend,
        scope2Trend,
        scope3Trend,
        totalTrend,
        facilityRankings,
        sourceMix: topSumberData,
        intensity,
        intensityTrend: 0, // Needs historical comparison for real trend
        facilitiesCount: selectedSiteUnitId === "all" ? facilities.length : 1,
        approvedReports,
        pendingReports,
      });
    } catch (error) {
      console.error("Error fetching org stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  const orgAdminLabel = getDisplayRoleLabel(user?.role || "ORG_ADMIN", resolvedIndustry || industry);

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-3 py-3 space-y-8">
      <SectionHeader
        icon={Building2Icon}
        title={`${orgAdminLabel} Dashboard`}
        description={`Overview of emissions across all ${siteUnitPluralLabel.toLowerCase()}.`}
        rightContent={
          <div className="w-full md:w-[320px]">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Filter By {siteUnitLabel}</label>
            <select value={selectedSiteUnitId} onChange={(event) => setSelectedSiteUnitId(event.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
              <option value="all">All {siteUnitPluralLabel}</option>
              {siteUnits.map((siteUnit) => (
                <option key={siteUnit._id} value={siteUnit._id}>
                  {siteUnit.facilityName || siteUnit.name || `Unnamed ${siteUnitLabel}`}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Scope Cards Row */}
      <div className="mb-4 bg-white rounded-2xl p-3">
        <h1 className="font-bold text-lg m-2">Emission By Scope</h1>
        <ScopeEmissionsCards
          scope1={stats.scope1}
          scope2={stats.scope2}
          scope3={stats.scope3}
          totalEmissions={stats.totalEmissions}
          scope1Trend={stats.scope1Trend.map((v) => ({ value: v }))}
          scope2Trend={stats.scope2Trend.map((v) => ({ value: v }))}
          scope3Trend={stats.scope3Trend.map((v) => ({ value: v }))}
          chartType="area"
          showTrendIndicator={false}
        />
      </div>

      {/*  Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-auto ">
        {/* Left: Facility Leaderboard (2 Cols) */}
        <div className="lg:col-span-2 h-auto">
          <FacilityEmissionsRankChart data={stats.facilityRankings} industry={resolvedIndustry || industry} role={user?.role} />
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          <div className="flex-[1.5]">
            <GlobalSourceBreakdown data={stats.sourceMix} />
          </div>
        </div>
      </div>

      {/*  Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {!isServiceSector && (
            <QuickActionCard
              title="Set Boundary"
              subtitle="Configure equity share"
              icon={Settings2}
              onClick={() => navigate(`${routeBase}/boundary-settings`)}
              hoverColorClass="hover:shadow-blue-100/50 hover:border-blue-200"
              iconColorClass="bg-blue-100/80 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
              titleColorClass="text-slate-800 group-hover:text-blue-700"
              gradientColorClass="from-blue-50/50"
            />
          )}

          <QuickActionCard
            title={`Manage ${siteUnitPluralLabel}`}
            subtitle={`View and edit ${siteUnitPluralLabel.toLowerCase()}`}
            icon={Building2}
            onClick={() => navigate(`${routeBase}/facilities`)}
            hoverColorClass="hover:shadow-emerald-100/50 hover:border-emerald-200"
            iconColorClass="bg-emerald-100/80 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
            titleColorClass="text-slate-800 group-hover:text-emerald-700"
            gradientColorClass="from-emerald-50/50"
          />

          <QuickActionCard
            title="Admin Users"
            subtitle={`Assign ${siteUnitLabel.toLowerCase()} heads`}
            icon={Users}
            onClick={() => navigate(`${routeBase}/users`)}
            hoverColorClass="hover:shadow-purple-100/50 hover:border-purple-200"
            iconColorClass="bg-purple-100/80 text-purple-600 group-hover:bg-purple-600 group-hover:text-white"
            titleColorClass="text-slate-800 group-hover:text-purple-700"
            gradientColorClass="from-purple-50/50"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Activity Log Shortcuts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => navigate(`${routeBase}/logs?action=ENERGY_DATA_ENTERED`)}
            className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 hover:bg-emerald-100/70 transition-colors"
          >
            <span className="text-sm font-semibold text-emerald-700">Data Entry Logs</span>
            <PlusCircle className="w-4 h-4 text-emerald-700" />
          </button>
          <button
            onClick={() => navigate(`${routeBase}/logs?action=ENERGY_DATA_APPROVED`)}
            className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 hover:bg-blue-100/70 transition-colors"
          >
            <span className="text-sm font-semibold text-blue-700">Approval Logs</span>
            <CheckCircle2 className="w-4 h-4 text-blue-700" />
          </button>
          <button
            onClick={() => navigate(`${routeBase}/logs?action=ENERGY_DATA_REJECTED`)}
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

export default OrgAdminDashboard;
