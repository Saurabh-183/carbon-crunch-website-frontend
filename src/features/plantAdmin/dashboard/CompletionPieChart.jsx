import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const CompletionPieChart = ({ completed, pending, percentage }) => {
    const data = [
        { name: "Completed", value: completed },
        { name: "Pending", value: pending },
    ];

    const COLORS = ["#10b981", "#cbd5e1"]; // Emerald-500 for Completed, Slate-300 for Pending

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full flex flex-col items-center justify-between">
            <div className="w-full mb-2">
                <h3 className="text-lg font-bold text-slate-900 text-left">Completion</h3>
                <p className="text-slate-500 text-sm text-left">Monthly submission status</p>
            </div>

            <div className="relative w-full h-[200px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            startAngle={90}
                            endAngle={-270}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value, name) => [`${value} entries`, name]}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Centered Percentage */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-slate-900">{percentage}</span>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Done</span>
                </div>
            </div>

            <div className="flex gap-6 mt-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-medium text-slate-600">Done</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                    <span className="text-sm font-medium text-slate-600">Pending</span>
                </div>
            </div>
        </div>
    );
};

export default CompletionPieChart;
