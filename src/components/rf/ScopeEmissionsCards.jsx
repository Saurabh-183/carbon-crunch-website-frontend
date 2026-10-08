import React from "react";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const ScopeEmissionsCards = ({
  scope1 = 0,
  scope2 = 0,
  scope3 = 0,
  totalEmissions,
  scope1Trend = [],
  scope2Trend = [],
  scope3Trend = [],
  totalTrend = [],
  unit = "tCO₂e",
  chartType = "area",
  showTrendIndicator = false,
  trendPercentages = {},
}) => {
  const calculatedTotal = totalEmissions ?? scope1 + scope2 + scope3;

  const generateDefaultTrend = (value) => {
    if (!value || value === 0) return [0, 0, 0, 0, 0].map((v) => ({ value: v }));
    const factors = [0.78, 0.9, 0.84, 0.95, 1];
    return factors.map((factor) => ({ value: Number((value * factor).toFixed(4)) }));
  };

  const normalizeTrendData = (trend, fallbackValue) => {
    const normalized = (Array.isArray(trend) ? trend : [])
      .map((point) => {
        if (typeof point === "number") return { value: point };
        if (point && typeof point.value === "number") return { value: point.value };
        return null;
      })
      .filter(Boolean);

    if (normalized.length >= 2) return normalized;

    if (normalized.length === 1) {
      const base = normalized[0].value;
      const factors = [0.8, 0.92, 0.86, 0.96, 1];
      return factors.map((factor, index) => ({
        value: index === factors.length - 1 ? base : Number((base * factor).toFixed(4)),
      }));
    }

    return generateDefaultTrend(fallbackValue);
  };

  const totalConfig = {
    id: "total",
    title: "Total Emissions",
    value: calculatedTotal,
    color: "#10b981", // Emerald-500
    trendData: normalizeTrendData(totalTrend, calculatedTotal),
    trendPercent: trendPercentages.total,
    description: "Scope 1 + Scope 2 + Scope 3",
  };

  const scopeConfigs = [
    {
      id: "scope1",
      title: "Scope 1",
      value: scope1,
      color: "#3b82f6", // Blue-500
      trendData: normalizeTrendData(scope1Trend, scope1),
      trendPercent: trendPercentages.scope1,
      description: "Direct Emissions",
    },
    {
      id: "scope2",
      title: "Scope 2",
      value: scope2,
      color: "#8b5cf6", // Violet-500
      trendData: normalizeTrendData(scope2Trend, scope2),
      trendPercent: trendPercentages.scope2,
      description: "Energy Indirect",
    },
    {
      id: "scope3",
      title: "Scope 3",
      value: scope3,
      color: "#06b6d4", // Cyan-500
      trendData: normalizeTrendData(scope3Trend, scope3),
      trendPercent: trendPercentages.scope3,
      description: "Value Chain",
    },
  ];

  const formatValue = (value) => {
    return Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getTrendIcon = (percent) => {
    if (!percent) return null;
    return percent > 0 ? TrendingUp : TrendingDown;
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const renderTrend = (config, TrendIcon, trendColor, trendBg) => {
    if (showTrendIndicator && config.trendPercent !== undefined && TrendIcon) {
      return (
        <div className={`flex items-center gap-1.5 mt-2 ${trendColor}`}>
          <div className={`p-0.5 rounded-full ${trendBg}`}>
            <TrendIcon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold">
            {Math.abs(config.trendPercent).toFixed(1)}%<span className="text-slate-400 font-medium ml-1">vs last month</span>
          </span>
        </div>
      );
    }

    return <div className="h-6 mt-2" />;
  };

  const renderChart = (config) => (
    <div className="absolute bottom-0 left-0 right-0 h-20 opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
      <ResponsiveContainer width="100%" height="100%">
        {chartType === "area" ? (
          <AreaChart data={config.trendData}>
            <defs>
              <linearGradient id={`gradient-${config.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={config.color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={config.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="natural" dataKey="value" stroke={config.color} strokeWidth={2} fill={`url(#gradient-${config.id})`} animationDuration={1500} />
          </AreaChart>
        ) : (
          <BarChart data={config.trendData}>
            <Bar dataKey="value" fill={config.color} radius={[4, 4, 0, 0]} opacity={0.6} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <motion.div
        key={totalConfig.id}
        variants={cardVariants}
        whileHover={{ y: -4, scale: 1.005 }}
        className="h-60 relative bg-white rounded-3xl border border-emerald-100 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.2)] overflow-hidden group transition-shadow duration-300 flex flex-col justify-between"
      >
        <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: totalConfig.color }} />

        <div className="p-6 relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <span className="text-base font-semibold text-slate-600 mt-1">{totalConfig.title}</span>

            <span
              className="text-[11px] font-bold px-3 py-1 rounded-full border"
              style={{
                backgroundColor: `${totalConfig.color}10`,
                color: totalConfig.color,
                borderColor: `${totalConfig.color}30`,
              }}
            >
              {totalConfig.description}
            </span>
          </div>

          <div className="flex flex-col gap-1 mb-auto">
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 group-hover:text-slate-800">{formatValue(totalConfig.value)}</h3>
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{unit}</span>
            {renderTrend(
              totalConfig,
              showTrendIndicator && totalConfig.trendPercent ? getTrendIcon(totalConfig.trendPercent) : null,
              totalConfig.trendPercent < 0 ? "text-emerald-500" : "text-rose-500",
              totalConfig.trendPercent < 0 ? "bg-emerald-50" : "bg-rose-50",
            )}
          </div>
        </div>

        {renderChart(totalConfig)}
      </motion.div>

      {scopeConfigs.map((config) => {
        const TrendIcon = showTrendIndicator && config.trendPercent ? getTrendIcon(config.trendPercent) : null;

        const trendColor = config.trendPercent < 0 ? "text-emerald-500" : "text-rose-500";
        const trendBg = config.trendPercent < 0 ? "bg-emerald-50" : "bg-rose-50";

        return (
          <motion.div
            key={config.id}
            variants={cardVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            className="h-60 relative rounded-3xl border-2 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] overflow-hidden group transition-shadow duration-300 flex flex-col justify-between"
            style={{
              background: `linear-gradient(180deg, ${config.color}10 0%, #ffffff 45%)`,
              borderColor: `${config.color}55`,
              boxShadow: `0 10px 25px -20px ${config.color}`,
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: config.color }} />

            <div className="p-6 relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between mb-6">
                <span className="text-sm font-semibold text-slate-500 mt-1">{config.title}</span>

                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors"
                  style={{
                    backgroundColor: `${config.color}15`,
                    color: config.color,
                    borderColor: `${config.color}35`,
                  }}
                >
                  {config.description}
                </span>
              </div>

              <div className="flex flex-col gap-1 mb-auto">
                <h3 className="text-3xl font-bold tracking-tight text-slate-900 group-hover:text-slate-800">{formatValue(config.value)}</h3>
                <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{unit}</span>

                {renderTrend(config, TrendIcon, trendColor, trendBg)}
              </div>
            </div>

            {renderChart(config)}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default ScopeEmissionsCards;
