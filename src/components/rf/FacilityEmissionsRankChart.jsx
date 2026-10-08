import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList } from "recharts";
import { Building2, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getSiteUnitLabel } from "../../utils/uiTerminology";

const FacilityEmissionsRankChart = ({ data = [], industry: industryProp = "", role: roleProp = "" }) => {
  const { user } = useAuth();
  const industry = industryProp || user?.organizationId?.industry || user?.organizationIndustry || "";
  const role = roleProp || user?.role || "";
  const routeBase = role === "HEAD" ? "/head" : "/org";
  const siteUnitLabel = getSiteUnitLabel(industry, "singular", role);
  const siteUnitPluralLabel = getSiteUnitLabel(industry, "plural", role);

  // sort max to min
  const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, 5); // top 5
  const totalEmissionsFromTop = sortedData.reduce((sum, entry) => sum + entry.value, 0);
  const topValue = sortedData[0]?.value || 0;
  const enhancedData = sortedData.map((entry) => {
    const percentOfTop = topValue ? (entry.value / topValue) * 100 : 0;
    const percentOfTotal = totalEmissionsFromTop ? (entry.value / totalEmissionsFromTop) * 100 : 0;
    return { ...entry, percentOfTop, percentOfTotal };
  });
  const maxValue = Math.max(...enhancedData.map((d) => d.value), 0);

  // Dynamic colors based on intensity
  const getBarColor = (value, max) => {
    const ratio = value / (max || 1);
    // Green (low) -> Yellow -> Red (high)
    if (ratio > 0.8) return "#ef4444"; // Red-500
    if (ratio > 0.4) return "#f59e0b"; // Amber-500
    return "#10b981"; // Emerald-500
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white text-xs p-2 rounded shadow-lg border border-slate-700">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p>{Number(payload[0].value).toFixed(2)} tCO₂e</p>
          <p className="text-slate-300 text-[11px] mt-1">
            {payload[0].payload.percentOfTop?.toFixed(1)}% vs top · {payload[0].payload.percentOfTotal?.toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{siteUnitLabel} Leaderboard</h3>
          <p className="text-slate-500 text-sm">Top emitting sites</p>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg">
          <Building2 className="w-5 h-5 text-slate-500" />
        </div>
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        {sortedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">No {siteUnitLabel.toLowerCase()} data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={enhancedData} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }} barSize={20}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {enhancedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.value, maxValue)} />
                ))}
                <LabelList dataKey="value" position="right" formatter={(val) => val.toFixed(1)} fill="#64748b" fontSize={11} fontWeight={600} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {enhancedData.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-1 text-xs">
          <div className="text-slate-400 uppercase tracking-wide font-semibold text-[11px]">Percent comparison</div>
          {enhancedData.map((entry, idx) => (
            <div key={`${entry.name}-${idx}`} className="flex items-center justify-between text-slate-700">
              <span className="font-medium text-sm truncate max-w-[60%]">{entry.name}</span>
              <span className="text-slate-500 text-[11px] text-right">
                {entry.percentOfTop.toFixed(0)}% vs top · {entry.percentOfTotal.toFixed(1)}% share
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
        <a href={`${routeBase}/facilities`} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
          View All {siteUnitPluralLabel} <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default FacilityEmissionsRankChart;
