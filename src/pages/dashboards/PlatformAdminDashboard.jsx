import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Factory, Users, BarChart3 } from "lucide-react";
import api from "../../utils/api";
import Loader from "../../components/rf/Loader";
import { calculateEmissions, getScope3ModuleByActivityType } from "../../features/energyManager/data-entry/utils";
import TotalEmissionsOverview from "../../components/rf/dashboard-components/TotalEmissionsOverview";
import EmissionsByOrganization from "../../components/rf/dashboard-components/EmissionsByOrganization";
import ScopeBasedAnalysis from "../../components/rf/dashboard-components/ScopeBasedAnalysis";
import FacilityEmissions from "../../components/rf/dashboard-components/FacilityEmissions";
import QuickActionCard from "../../components/rf/QuickActionCard";

const PlatformAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    organizations: 0,
    facilities: 0,
    users: 0,
  });
  const [dashboardData, setDashboardData] = useState({
    organizations: [],
    facilities: [],
    users: [],
    submissions: [],
    emissionsData: null,
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("all");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // console.log("🔄 Fetching dashboard data...");

      // Fetch all required data in parallel
      const [orgsRes, facilitiesRes, usersRes, submissionsRes] = await Promise.all([
        api.get("/api/organizations"),
        api.get("/api/facilities").catch(() => ({ data: { data: [] } })),
        api.get("/api/users").catch(() => ({ data: { data: [] } })),
        api.get("/api/submissions?status=approved").catch(() => ({ data: { data: [] } })),
      ]);

      const organizations = orgsRes.data?.data?.organizations || orgsRes.data?.data || [];
      const facilities = facilitiesRes.data?.data?.facilities || facilitiesRes.data?.data || [];
      const users = usersRes.data?.data?.users || usersRes.data?.data || [];
      const submissions = submissionsRes.data?.data || [];

      // console.log("✅ Fetched Data:", {
      //   organizations: organizations.length,
      //   facilities: facilities.length,
      //   users: users.length,
      //   submissions: submissions.length,
      // });

      // Calculate emissions data from submissions
      const emissionsData = calculateEmissionsData(submissions, organizations, facilities);

      setStats({
        organizations: organizations.length || 0,
        facilities: facilities.length || 0,
        users: users.length || 0,
      });

      setDashboardData({
        organizations,
        facilities,
        users,
        submissions,
        emissionsData,
      });
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      setStats({ organizations: 0, facilities: 0, users: 0 });
    } finally {
      setLoading(false);
    }
  };

  const calculateEmissionsData = (submissions, organizations, facilities) => {
    // console.log("🔍 Total Submissions Received:", submissions.length);
    // console.log("📊 Sample Submission:", submissions[0]);

    const emissionsByOrg = {};
    const emissionsByFacility = {};
    const emissionsByScope = { scope1: 0, scope2: 0, scope3: 0 };
    const monthlyEmissions = {};
    let totalEmissions = 0;

    submissions.forEach((submission, index) => {
      // console.log(`\n📝 Processing Submission ${index + 1}:`, {
      //   id: submission._id,
      //   organizationId: submission.organizationId,
      //   facilityId: submission.facilityId,
      //   status: submission.status,
      //   hasScope1: !!submission.scope1Data,
      //   hasScope2: !!submission.scope2Data,
      //   hasScope3: !!submission.scope3Data,
      // });

      // Extract emissions from each scope
      const processScope = (scopeData, scopeName) => {
        if (!scopeData) {
          // console.log(`  ⚠️ No ${scopeName} data`);
          return;
        }

        // console.log(`  ✅ Processing ${scopeName}:`, {
        //   hasSections: !!scopeData.sections,
        //   sectionsCount: scopeData.sections?.length || 0,
        // });

        scopeData.sections?.forEach((section, sIdx) => {
          // console.log(`    📂 Section ${sIdx}:`, section.name, `Activities: ${section.activities?.length || 0}`);

          section.activities?.forEach((activity, aIdx) => {
            activity.sources?.forEach((source, sIdx) => {
              const resolvedScope3Module = scopeData.scope3Module || section.scope3Module || activity.scope3Module || getScope3ModuleByActivityType(activity.activityType || activity.activityCategory);

              const emissions = calculateEmissions(
                source.consumption,
                source.unit,
                source.source,
                scopeName === "scope1" ? "Scope 1" : scopeName === "scope2" ? "Scope 2" : "Scope 3",
                activity.activityType,
                resolvedScope3Module,
                source.emissionFactor,
              );

              const val = parseFloat(emissions) || 0;
              //console.log(`      🔢 Source ${sIdx}: ${source.source} - Consumption: ${source.consumption} ${source.unit} = ${val} tCO₂e`);

              if (val > 0) {
                totalEmissions += val;
                emissionsByScope[scopeName] = (emissionsByScope[scopeName] || 0) + val;

                // By organization
                if (submission.organizationId) {
                  const orgId = submission.organizationId._id || submission.organizationId;
                  emissionsByOrg[orgId] = (emissionsByOrg[orgId] || 0) + val;
                  //console.log(`      🏢 Added ${val} to Org: ${orgId}`);
                }

                // By facility
                if (submission.facilityId) {
                  const facId = submission.facilityId._id || submission.facilityId;
                  emissionsByFacility[facId] = (emissionsByFacility[facId] || 0) + val;
                  // console.log(`      🏭 Added ${val} to Facility: ${facId}`);
                }

                // By month
                if (source.date) {
                  const dateObj = new Date(source.date);
                  const month = dateObj.toLocaleString("default", { month: "short" });
                  const year = dateObj.getFullYear();
                  const monthYear = `${month} ${year}`;
                  monthlyEmissions[monthYear] = (monthlyEmissions[monthYear] || 0) + val;
                }
              }
            });
          });
        });
      };

      processScope(submission.scope1Data, "scope1");
      processScope(submission.scope2Data, "scope2");
      processScope(submission.scope3Data, "scope3");
    });

    // console.log("\n📊 Final Emissions Data:", {
    //   totalEmissions,
    //   emissionsByScope,
    //   emissionsByOrg,
    //   emissionsByFacility,
    //   monthlyEmissions,
    // });

    return {
      total: totalEmissions,
      byOrganization: emissionsByOrg,
      byFacility: emissionsByFacility,
      byScope: emissionsByScope,
      monthly: monthlyEmissions,
    };
  };

  const filteredData = useMemo(() => {
    if (selectedOrganizationId === "all") {
      return {
        organizations: dashboardData.organizations,
        facilities: dashboardData.facilities,
        users: dashboardData.users,
        submissions: dashboardData.submissions,
      };
    }

    const organizations = dashboardData.organizations.filter((org) => String(org?._id || org?.id) === String(selectedOrganizationId));

    const facilities = dashboardData.facilities.filter((facility) => {
      const facilityOrgId = facility?.organizationId?._id || facility?.organizationId;
      return String(facilityOrgId) === String(selectedOrganizationId);
    });

    const users = dashboardData.users.filter((user) => {
      const userOrgId = user?.organizationId?._id || user?.organizationId;
      return String(userOrgId) === String(selectedOrganizationId);
    });

    const submissions = dashboardData.submissions.filter((submission) => {
      const submissionOrgId = submission?.organizationId?._id || submission?.organizationId;
      return String(submissionOrgId) === String(selectedOrganizationId);
    });

    return {
      organizations,
      facilities,
      users,
      submissions,
    };
  }, [dashboardData, selectedOrganizationId]);

  const filteredEmissionsData = useMemo(() => calculateEmissionsData(filteredData.submissions, filteredData.organizations, filteredData.facilities), [filteredData]);

  const visibleStats = useMemo(
    () => ({
      organizations: filteredData.organizations.length,
      facilities: filteredData.facilities.length,
      users: filteredData.users.length,
    }),
    [filteredData],
  );

  const cards = [
    {
      title: "Organizations",
      value: visibleStats.organizations,
      icon: Building2,
      color: "bg-blue-500",
      path: "/admin/organizations",
    },
    {
      title: "Facilities",
      value: visibleStats.facilities,
      icon: Factory,
      color: "bg-green-500",
      path: "/admin/facilities",
    },
    {
      title: "Users",
      value: visibleStats.users,
      icon: Users,
      color: "bg-purple-500",
      path: "/admin/users",
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Platform Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage all organizations, facilities, and users</p>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Filter By Organization</label>
        <select
          value={selectedOrganizationId}
          onChange={(event) => setSelectedOrganizationId(event.target.value)}
          className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="all">All Organizations</option>
          {dashboardData.organizations.map((org) => (
            <option key={org._id || org.id} value={org._id || org.id}>
              {org.name || "Unnamed Organization"}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} onClick={() => navigate(card.path)} className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} rounded-full p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-8">
        {/* Total Emissions Overview */}
        <TotalEmissionsOverview emissionsData={filteredEmissionsData} loading={loading} />

        {/* Emissions by Organization */}
        <EmissionsByOrganization organizations={filteredData.organizations} emissionsData={filteredEmissionsData} loading={loading} />

        {/* Scope-Based Analysis */}
        <ScopeBasedAnalysis emissionsData={filteredEmissionsData} loading={loading} />

        {/* Facility Emissions */}
        <FacilityEmissions facilities={filteredData.facilities} emissionsData={filteredEmissionsData} loading={loading} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg my-4 shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            title="Manage Organizations"
            subtitle="Create, edit, delete organizations"
            icon={Building2}
            onClick={() => navigate("/admin/organizations")}
            hoverColorClass="hover:shadow-green-100/50 hover:border-green-200"
            iconColorClass="bg-green-100/80 text-green-600 group-hover:bg-green-600 group-hover:text-white"
            titleColorClass="text-slate-800 group-hover:text-green-700"
            gradientColorClass="from-green-50/50"
          />
          <QuickActionCard
            title="Manage Facilities"
            subtitle="Add facilities to organizations"
            icon={Factory}
            onClick={() => navigate("/admin/facilities")}
            hoverColorClass="hover:shadow-blue-100/50 hover:border-blue-200"
            iconColorClass="bg-blue-100/80 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
            titleColorClass="text-slate-800 group-hover:text-blue-700"
            gradientColorClass="from-blue-50/50"
          />

          <QuickActionCard
            title="Manage Organizations"
            subtitle="Create, edit, delete organizations"
            icon={Building2}
            onClick={() => navigate("/admin/organizations")}
            hoverColorClass="hover:shadow-purple-100/50 hover:border-purple-200"
            iconColorClass="bg-purple-100/80 text-purple-600 group-hover:bg-purple-600 group-hover:text-white"
            titleColorClass="text-slate-800 group-hover:text-purple-700"
            gradientColorClass="from-purple-50/50"
          />
        </div>
      </div>
    </div>
  );
};

export default PlatformAdminDashboard;
