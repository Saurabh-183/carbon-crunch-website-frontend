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

const CustomTooltip = ({ active, payload, label, unit }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl">
                <p className="text-slate-500 text-xs font-medium mb-1">{label}</p>
                <p className="text-emerald-600 font-bold text-lg">
                    {Number(payload[0].value).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                    <span className="text-xs font-medium text-slate-400 ml-1">{unit}</span>
                </p>
            </div>
        );
    }
    return null;
};

const ConsumptionTrendChart = ({
    data = [],
    title = "Trend",
    subtitle = "Over time",
    unit = "",
    trendPercentage = null,
    color = "#10b981", // default emerald
}) => {
    const isPositive = trendPercentage > 0;
    const isNeutral = trendPercentage === 0;
    const TrendIcon = isPositive ? TrendingUp : isNeutral ? Minus : TrendingDown;

    // Decide trend color based on context if needed, defaulting to generic green/slate/red logic
    // Here we use green for up/down just to show activity unless specified
    const trendColor = isPositive ? "text-emerald-600" : isNeutral ? "text-slate-500" : "text-emerald-600";

    const gradientId = `color${title.replace(/\s+/g, "")}`;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    <p className="text-slate-500 text-sm">{subtitle}</p>
                </div>
                {trendPercentage !== null && (
                    <div className={`flex items-center gap-1.5 text-sm font-bold ${trendColor}`}>
                        <TrendIcon className="w-4 h-4" />
                        <span>
                            {isPositive ? "+" : ""}
                            {trendPercentage}% this period
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
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1f5f9"
                        />
                        <XAxis
                            dataKey="month" // Expecting 'month' or 'date' key
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
                        <Tooltip content={<CustomTooltip unit={unit} />} />
                        <Area
                            type="monotone"
                            dataKey="value" // Expecting 'value' key
                            stroke={color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#${gradientId})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ConsumptionTrendChart;
