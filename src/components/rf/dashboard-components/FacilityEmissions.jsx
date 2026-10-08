import React from "react";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { useAuth } from "../../../context/AuthContext";
import { getSiteUnitLabel } from "../../../utils/uiTerminology";

const FacilityEmissions = ({ facilities, emissionsData, loading }) => {
  const { user } = useAuth();
  const industry = user?.organizationId?.industry || user?.organizationIndustry || "";
  const siteUnitLabel = getSiteUnitLabel(industry, "singular");

  // Prepare data for bar chart visualization
  const chartData = React.useMemo(() => {
    if (!emissionsData?.byFacility || !facilities?.length) {
      return [];
    }

    // Create flat array of facilities with emissions
    const data = facilities
      .map((facility) => {
        const emissions = emissionsData.byFacility[facility._id] || 0;
        const orgName = facility.organizationId?.name || "Unknown Org";

        return {
          id: facility._id,
          name: facility.facilityName || facility.name || `Unnamed ${siteUnitLabel}`,
          emissions: Math.round(emissions),
          type: facility.type || siteUnitLabel,
          organization: orgName,
        };
      })
      .filter((item) => item.emissions > 0)
      .sort((a, b) => b.emissions - a.emissions); // Sort by emissions descending

    console.log("📊 Chart Data:", data);
    return data;
  }, [facilities, emissionsData, siteUnitLabel]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{siteUnitLabel} Emissions Analysis</h2>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No {siteUnitLabel.toLowerCase()} emissions data available.</p>
        </div>
      </div>
    );
  }

  // Consistent color palette based on organization
  const getColorForOrg = (orgName) => {
    const colors = {
      "AKVP NEXTTECH INDIA PRIVATE LIMITED": "#3b82f6", // Blue
      "BK Towers": "#10b981", // Green
      "Galvanic Copper": "#8b5cf6", // Purple
      "Vidushi Crunchies": "#06b6d4", // Cyan
      "Test Industries": "#f59e0b", // Amber
    };
    return colors[orgName] || "#6366f1"; // Default indigo
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl">
          <p className="font-bold text-gray-900 text-base mb-2">{data.name}</p>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Organization:</span> {data.organization}
            </p>
            {data.type && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Type:</span> {data.type}
              </p>
            )}
            <p className="text-sm font-semibold text-blue-600 mt-2">Total Emissions: {data.emissions?.toLocaleString()} tCO₂e</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{siteUnitLabel} Emissions Analysis</h2>
        <p className="text-gray-600">Emissions breakdown by {siteUnitLabel.toLowerCase()} across all organizations</p>
      </div>

      {/* Bar Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Emissions by {siteUnitLabel}</h3>
        <ResponsiveContainer width="100%" height={Math.max(400, chartData.length * 60)}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" stroke="#6b7280" />
            <YAxis type="category" dataKey="name" stroke="#6b7280" width={140} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="emissions" radius={[0, 8, 8, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColorForOrg(entry.organization)} opacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mb-6 flex flex-wrap gap-4 justify-center">
        {[...new Set(chartData.map((d) => d.organization))].map((org) => (
          <div key={org} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: getColorForOrg(org) }} />
            <span className="text-sm text-gray-700">{org}</span>
          </div>
        ))}
      </div>

      {/* Summary Table */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">{siteUnitLabel} Rankings</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{siteUnitLabel}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Emissions (tCO₂e)</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">% of Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chartData.map((facility, index) => {
                const total = chartData.reduce((sum, f) => sum + f.emissions, 0);
                const percentage = ((facility.emissions / total) * 100).toFixed(1);
                return (
                  <tr key={facility.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{facility.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{facility.organization}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{facility.type}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{facility.emissions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          percentage > 50 ? "bg-red-100 text-red-800" : percentage > 20 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {percentage}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FacilityEmissions;
