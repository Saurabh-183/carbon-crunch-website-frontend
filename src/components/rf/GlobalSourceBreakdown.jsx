import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Flame } from "lucide-react";

const GlobalSourceBreakdown = ({ data = [] }) => {
    // Logic remains unchanged
    const COLORS = [
        "#3b82f6", // Blue
        "#10b981", // Emerald 
        "#f59e0b", // Amber
        "#ef4444", // Red
        "#8b5cf6", // Violet
        "#06b6d4", // Cyan
        "#6366f1", // Indigo
    ];

    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const percent = ((payload[0].value / total) * 100).toFixed(1);
            return (
                <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: payload[0].payload.fill }}
                        />
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
                            {payload[0].name}
                        </p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="font-bold text-slate-800 text-lg">
                            {Number(payload[0].value).toFixed(2)}
                            <span className="text-xs font-medium text-slate-400 ml-1">t</span>
                        </span>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            {percent}%
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col h-full hover:shadow-md transition-shadow duration-300">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Emissions Mix</h3>
                    <p className="text-slate-400 text-sm font-medium mt-1">Breakdown by source</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Flame className="w-5 h-5 text-slate-400" />
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 min-h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="45%" // Moved up slightly to make room for bottom legend
                            innerRadius={85} // Significantly increased from 50
                            outerRadius={110} // Significantly increased from 70
                            paddingAngle={5}
                            cornerRadius={6} // Adds modern rounded edges to segments
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index % COLORS.length]} 
                                    className="outline-none focus:outline-none transition-all duration-300 hover:opacity-80"
                                />
                            ))}
                        </Pie>
                        <Tooltip 
                            content={<CustomTooltip />} 
                            cursor={{ fill: 'transparent' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ bottom: 0, width: '100%' }}
                            formatter={(value) => (
                                <span className="text-sm font-medium text-slate-600 ml-1 mr-4">{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text - Adjusted position to match new cy="45%" */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        {(total / 1000).toFixed(1)}
                        <span className="text-xl text-slate-400 ml-0.5">k</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                        Total tCO₂e
                    </span>
                </div>
            </div>
        </div>
    );
};

export default GlobalSourceBreakdown;