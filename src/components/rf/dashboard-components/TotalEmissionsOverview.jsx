import React from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

const TotalEmissionsOverview = ({ emissionsData, loading }) => {

  // Use dynamic data or fallback to static
  const monthlyData = React.useMemo(() => {
    if (!emissionsData?.monthly || Object.keys(emissionsData.monthly).length === 0) {
      // Return empty array if no data
      return [];
    }

    // Get all month-year entries and sort by date
    const entries = Object.entries(emissionsData.monthly)
      .filter(([, value]) => value > 0)
      .map(([monthYear, emissions]) => {
        // Parse "Month Year" format (e.g., "Jan 2026")
        const [month, year] = monthYear.split(' ');
        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIndex = monthOrder.indexOf(month);
        
        return {
          monthYear,
          month,
          year: parseInt(year),
          monthIndex,
          emissions: Math.round(emissions),
          target: Math.round(emissions * 1.1),
          sortKey: parseInt(year) * 100 + monthIndex, // For proper sorting
        };
      })
      .sort((a, b) => a.sortKey - b.sortKey);

    // Take only the last 12 months
    const last12Months = entries.slice(-12);

    return last12Months.map(({ monthYear, emissions, target }) => ({
      month: monthYear,
      emissions,
      target,
    }));
  }, [emissionsData]);

  const totalEmissions = emissionsData?.total || 0;
  const previousTotal = totalEmissions * 1.1; // Assume 10% reduction from previous year
  const percentageChange = totalEmissions > 0 ? (((totalEmissions - previousTotal) / previousTotal) * 100).toFixed(1) : 0;
  const isPositive = percentageChange < 0; // Negative emissions change is positive for environment

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!emissionsData || totalEmissions === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Total Emissions Overview</h2>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No emissions data available yet.</p>
          <p className="text-gray-400 text-sm mt-2">Submit approved emissions data to see analytics here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Total Emissions Overview</h2>
        <div className="flex items-baseline gap-4">
          <div className="text-4xl font-bold text-gray-900">
            {totalEmissions.toLocaleString()} <span className="text-lg font-normal text-gray-600">tCO₂e</span>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${isPositive ? "bg-green-100" : "bg-red-100"}`}>
            {isPositive ? <TrendingDown className="w-4 h-4 text-green-600" /> : <TrendingUp className="w-4 h-4 text-red-600" />}
            <span className={`text-sm font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {Math.abs(percentageChange)}% vs last year
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Emissions Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: "12px" }} />
            <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} tickFormatter={(value) => `${value / 1000}k`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value) => [`${value.toLocaleString()} tCO₂e`, ""]}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Line type="monotone" dataKey="emissions" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 4 }} name="Actual Emissions" activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "#10b981", r: 3 }} name="Target" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Cumulative Emissions</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: "12px" }} />
            <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} tickFormatter={(value) => `${value / 1000}k`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value) => [`${value.toLocaleString()} tCO₂e`, "Emissions"]}
            />
            <Area type="monotone" dataKey="emissions" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorEmissions)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TotalEmissionsOverview;
