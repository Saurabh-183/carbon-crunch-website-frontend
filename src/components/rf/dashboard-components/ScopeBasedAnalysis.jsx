import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const ScopeBasedAnalysis = ({ emissionsData, loading }) => {
  const [viewType, setViewType] = useState("stacked"); // 'stacked' or 'grouped'

  // Generate dynamic data or fallback to static
  const scopeData = React.useMemo(() => {
    if (!emissionsData?.byScope) {
      // Static fallback data
      // return [
      //   { organization: "Acme Mfg", scope1: 45000, scope2: 38000, scope3: 42000 },
      //   { organization: "TechCorp", scope1: 32000, scope2: 28000, scope3: 38000 },
      //   { organization: "GreenEnergy", scope1: 28000, scope2: 25000, scope3: 34000 },
      //   { organization: "Global Log", scope1: 25000, scope2: 22000, scope3: 29000 },
      //   { organization: "Urban Sol", scope1: 18000, scope2: 16000, scope3: 20000 },
      //   { organization: "Smart Sys", scope1: 14000, scope2: 12000, scope3: 16000 },
      // ];
    }

    return [{
      organization: "Total",
      scope1: Math.round(emissionsData.byScope.scope1 || 0),
      scope2: Math.round(emissionsData.byScope.scope2 || 0),
      scope3: Math.round(emissionsData.byScope.scope3 || 0),
    }];
  }, [emissionsData]);

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

  // Total by scope for pie chart
  const totalByScope = [
    {
      name: "Scope 1",
      value: scopeData.reduce((sum, org) => sum + org.scope1, 0),
      color: "#3b82f6",
      description: "Direct emissions",
    },
    {
      name: "Scope 2",
      value: scopeData.reduce((sum, org) => sum + org.scope2, 0),
      color: "#8b5cf6",
      description: "Indirect emissions from electricity",
    },
    {
      name: "Scope 3",
      value: scopeData.reduce((sum, org) => sum + org.scope3, 0),
      color: "#06b6d4",
      description: "Other indirect emissions",
    },
  ];

  const totalEmissions = totalByScope.reduce((sum, scope) => sum + scope.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.organization || payload[0].name}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()} tCO₂e
            </p>
          ))}
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

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" className="text-sm font-semibold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Scope-Based Emissions Analysis</h2>
          <p className="text-gray-600">Breakdown of emissions by GHG Protocol scopes</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewType("stacked")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewType === "stacked" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Stacked
          </button>
          <button
            onClick={() => setViewType("grouped")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewType === "grouped" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Grouped
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart - Organization by Scope */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Emissions by Organization & Scope</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={scopeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="organization" stroke="#6b7280" style={{ fontSize: "11px" }} angle={-15} textAnchor="end" height={80} />
              <YAxis stroke="#6b7280" style={{ fontSize: "11px" }} tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              {viewType === "stacked" ? (
                <>
                  <Bar dataKey="scope1" stackId="a" fill="#3b82f6" name="Scope 1" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="scope2" stackId="a" fill="#8b5cf6" name="Scope 2" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="scope3" stackId="a" fill="#06b6d4" name="Scope 3" radius={[8, 8, 0, 0]} />
                </>
              ) : (
                <>
                  <Bar dataKey="scope1" fill="#3b82f6" name="Scope 1" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="scope2" fill="#8b5cf6" name="Scope 2" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="scope3" fill="#06b6d4" name="Scope 3" radius={[8, 8, 0, 0]} />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Total by Scope */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Total Emissions by Scope</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie data={totalByScope} cx="50%" cy="50%" labelLine={false} label={renderCustomLabel} outerRadius={110} fill="#8884d8" dataKey="value" paddingAngle={3}>
                {totalByScope.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {totalByScope.map((scope, index) => (
              <div key={index} className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: scope.color }}></div>
                  <div>
                    <p className="font-medium text-gray-900">{scope.name}</p>
                    <p className="text-xs text-gray-600">{scope.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{scope.value.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">{((scope.value / totalEmissions) * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scope Information Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Scope 1 - Direct</h4>
              <p className="text-sm text-blue-700">Emissions from owned sources (fuel combustion, company vehicles)</p>
              <p className="text-xl font-bold text-blue-900 mt-2">{totalByScope[0].value.toLocaleString()} tCO₂e</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-purple-900 mb-1">Scope 2 - Indirect Energy</h4>
              <p className="text-sm text-purple-700">Emissions from purchased electricity, heat, cooling</p>
              <p className="text-xl font-bold text-purple-900 mt-2">{totalByScope[1].value.toLocaleString()} tCO₂e</p>
            </div>
          </div>
        </div>
        <div className="bg-cyan-50 border-l-4 border-cyan-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="bg-cyan-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-cyan-900 mb-1">Scope 3 - Other Indirect</h4>
              <p className="text-sm text-cyan-700">Supply chain, business travel, waste, commuting</p>
              <p className="text-xl font-bold text-cyan-900 mt-2">{totalByScope[2].value.toLocaleString()} tCO₂e</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScopeBasedAnalysis;
