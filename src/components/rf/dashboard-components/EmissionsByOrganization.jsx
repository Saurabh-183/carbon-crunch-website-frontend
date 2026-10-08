import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useAuth } from "../../../context/AuthContext";
import { getSiteUnitLabel } from "../../../utils/uiTerminology";

const EmissionsByOrganization = ({ organizations, emissionsData, loading }) => {
  const { user } = useAuth();
  const industry = user?.organizationId?.industry || user?.organizationIndustry || "";
  const siteUnitPluralLabel = getSiteUnitLabel(industry, "plural", user?.role);

  // Generate dynamic data or fallback to static
  const organizationData = React.useMemo(() => {
    if (!organizations?.length) {
      return [];
    }

    const colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#6366f1", "#14b8a6", "#f59e0b", "#ef4444"];

    // Map all organizations, even if they have 0 emissions
    return organizations
      .map((org, index) => ({
        name: org.name || org.organizationName || `Organization ${index + 1}`,
        emissions: Math.round(emissionsData?.byOrganization?.[org._id] || 0),
        facilities: org.facilities?.length || 0,
        color: colors[index % colors.length],
        orgId: org._id,
      }))
      .sort((a, b) => b.emissions - a.emissions); // Sort by emissions descending
  }, [organizations, emissionsData]);

  const totalEmissions = organizationData.reduce((sum, org) => sum + org.emissions, 0);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!organizationData.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Emissions by Organization</h2>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No organization data available.</p>
        </div>
      </div>
    );
  }

  // Filter for charts - only show organizations with emissions
  const organizationsWithEmissions = organizationData.filter((org) => org.emissions > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.emissions / totalEmissions) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">Emissions: {data.emissions.toLocaleString()} tCO₂e</p>
          <p className="text-sm text-gray-600">Percentage: {percentage}%</p>
          <p className="text-sm text-gray-600">
            {siteUnitPluralLabel}: {data.facilities}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for small slices

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" className="text-xs font-semibold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Emissions by Organization</h2>
        <p className="text-gray-600">Distribution of total emissions across all organizations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donut Chart */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Emissions Distribution</h3>
          {organizationsWithEmissions.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={organizationsWithEmissions}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="emissions"
                  paddingAngle={2}
                >
                  {organizationsWithEmissions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-gray-400">
              <p>No emissions data to display</p>
            </div>
          )}
        </div>

        {/* Bar Chart - Top Emitters */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Organizations by Emissions</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={organizationData.slice(0, 8)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis type="number" stroke="#6b7280" style={{ fontSize: "11px" }} tickFormatter={(value) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value)} />
              <YAxis type="category" dataKey="name" stroke="#6b7280" style={{ fontSize: "11px" }} width={140} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value.toLocaleString()} tCO₂e`, "Emissions"]}
              />
              <Bar dataKey="emissions" radius={[0, 8, 8, 0]}>
                {organizationData.slice(0, 8).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium">Total Organizations</p>
          <p className="text-2xl font-bold text-blue-900">{organizationData.length}</p>
          <p className="text-xs text-blue-500 mt-1">{organizationsWithEmissions.length} with emissions</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-medium">Total Emissions</p>
          <p className="text-2xl font-bold text-purple-900">{totalEmissions.toLocaleString()}</p>
          <p className="text-xs text-purple-500 mt-1">tCO₂e</p>
        </div>
        <div className="bg-cyan-50 rounded-lg p-4">
          <p className="text-sm text-cyan-600 font-medium">Avg per Org</p>
          <p className="text-2xl font-bold text-cyan-900">{organizationsWithEmissions.length > 0 ? Math.round(totalEmissions / organizationsWithEmissions.length).toLocaleString() : 0}</p>
          <p className="text-xs text-cyan-500 mt-1">tCO₂e</p>
        </div>
        <div className="bg-teal-50 rounded-lg p-4">
          <p className="text-sm text-teal-600 font-medium">Total {siteUnitPluralLabel}</p>
          <p className="text-2xl font-bold text-teal-900">{organizationData.reduce((sum, org) => sum + org.facilities, 0)}</p>
          <p className="text-xs text-teal-500 mt-1">across all orgs</p>
        </div>
      </div>
    </div>
  );
};

export default EmissionsByOrganization;
