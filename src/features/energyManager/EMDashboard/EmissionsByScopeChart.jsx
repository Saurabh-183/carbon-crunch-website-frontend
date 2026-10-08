import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const EmissionsByScopeChart = ({ scope1 = 0, scope2 = 0, scope3 = 0, unit = "tCO₂e" }) => {
    const data = [
        { name: "Scope 1", value: parseFloat(scope1) || 0, color: "#1e3a8a" }, // Blue-900
        { name: "Scope 2", value: parseFloat(scope2) || 0, color: "#06b6d4" }, // Cyan-500
        { name: "Scope 3", value: parseFloat(scope3) || 0, color: "#10b981" }, // Emerald-500
    ];

    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    // If no data, show a grey empty ring
    const isEmpty = total === 0;
    const displayData = isEmpty ? [{ name: "No Data", value: 1, color: "#f1f5f9" }] : data;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full flex flex-col items-center justify-between">
            <div className="w-full mb-2">
                <h3 className="text-lg font-bold text-slate-900 text-left">
                    Emissions by Scope
                </h3>
                <p className="text-slate-500 text-sm text-left">Breakdown by impact area</p>
            </div>

            <div className="relative w-full h-[220px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={displayData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={isEmpty ? 0 : 5}
                            dataKey="value"
                            stroke="none"
                        >
                            {displayData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        {!isEmpty && (
                            <Tooltip
                                formatter={(value, name) => [
                                    `${value.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })} ${unit}`,
                                    name,
                                ]}
                                contentStyle={{
                                    borderRadius: "12px",
                                    border: "none",
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                }}
                            />
                        )}
                    </PieChart>
                </ResponsiveContainer>

                {/* Centered Total */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-900">
                        {total.toLocaleString(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        })}
                    </span>
                    <span className="text-xs font-medium text-slate-400">Total {unit}</span>
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-4 w-full">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                        ></div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-500">
                                {item.name}
                            </span>
                            <span className="text-sm font-bold text-slate-700">
                                {item.value.toLocaleString(undefined, {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmissionsByScopeChart;
