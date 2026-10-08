import React from "react";

const TopEmissionSources = ({ sources }) => {
    // Sort sources by value descending and take top 5
    const topSources = [...sources]
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const maxValue = Math.max(...topSources.map((s) => s.value), 0);

    // Chart scale markers (0, 25%, 50%, 75%, 100% of max value rounded up)
    const maxScale = Math.ceil(maxValue * 1.1); // Add 10% headroom
    const scaleMarkers = [0, Math.round(maxScale * 0.25), Math.round(maxScale * 0.5), Math.round(maxScale * 0.75), maxScale];

    const colors = [
        "bg-emerald-500",
        "bg-red-500",
        "bg-blue-500",
        "bg-teal-400",
        "bg-purple-500"
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Top Emission Sources</h3>
                <p className="text-slate-500 text-sm">By total tCO₂e</p>
            </div>

            <div className="relative pt-2 pb-6">
                {/* Y-axis grid lines */}
                <div className="absolute inset-0 flex justify-between pointer-events-none pl-24 pr-4">
                    {scaleMarkers.map((marker, i) => (
                        <div key={i} className="h-full border-l border-slate-100 border-dashed absolute top-0" style={{ left: `${(marker / maxScale) * 100}%` }}>
                            <span className="absolute bottom-[-24px] -translate-x-1/2 text-xs text-slate-400 font-medium">
                                {marker}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="space-y-6 relative z-10">
                    {topSources.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm">No emission data available</div>
                    ) : (
                        topSources.map((source, index) => (
                            <div key={index} className="flex items-center group">
                                {/* Label */}
                                <div className="w-24 text-right pr-4 text-sm font-medium text-slate-600 truncate" title={source.name}>
                                    {source.name}
                                </div>

                                {/* Bar */}
                                <div className="flex-1 h-8 relative bg-slate-50 rounded-r-lg overflow-hidden">
                                    <div
                                        className={`h-full rounded-r-lg transition-all duration-700 ease-out ${colors[index % colors.length]}`}
                                        style={{ width: `${(source.value / maxScale) * 100}%` }}
                                    >
                                        {/* Tooltip on hover */}
                                        <div className="opacity-0 group-hover:opacity-100 absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-20 pointer-events-none transition-opacity">
                                            {source.value.toFixed(2)} tCO₂e
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopEmissionSources;
