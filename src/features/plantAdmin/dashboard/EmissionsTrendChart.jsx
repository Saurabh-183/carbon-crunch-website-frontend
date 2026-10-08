import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl">
                <p className="text-slate-500 text-xs font-medium mb-1">{label}</p>
                <p className="text-emerald-600 font-bold text-lg">
                    {Number(payload[0].value).toFixed(2)}
                    <span className="text-xs font-medium text-slate-400 ml-1">tCO₂e</span>
                </p>
            </div>
        );
    }
    return null;
};

const EmissionsTrendChart = ({ data, trendPercentage }) => {
    const isPositive = trendPercentage > 0;
    const isNeutral = trendPercentage === 0;
    const TrendIcon = isPositive ? TrendingUp : isNeutral ? Minus : TrendingDown;
    const trendColor = isPositive
        ? "text-green-600"
        : isNeutral
            ? "text-slate-500"
            : "text-emerald-600"; // Assuming reduction (negative trend) is also good/green in environmental context? 
    // Actually, usually "Trending Up" for emissions is BAD (Red), "Trending Down" is GOOD (Green).
    // But the design in the image showed "+12% this month" in Green with an Up arrow. 
    // This implies the user might just want a generic "green" theme or maybe in this specific context up is good?
    // Wait, usually +Emissions is bad. But let's stick to the visual design provided: Green Text + Green Arrow for +12%. 
    // I will stick to the requested design exactly: Green for the requested image style.

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Emissions Trend</h3>
                    <p className="text-slate-500 text-sm">Monthly tCO₂e over time</p>
                </div>
                {trendPercentage !== null && trendPercentage !== undefined && (
                    <div className={`flex items-center gap-1.5 text-sm font-bold ${trendColor}`}>
                        <TrendIcon className="w-4 h-4" />
                        <span>
                            {isPositive ? "+" : ""}
                            {trendPercentage}% this month
                        </span>
                    </div>
                )}
            </div>

            <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1f5f9"
                        />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="emissions"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorEmissions)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default EmissionsTrendChart;
