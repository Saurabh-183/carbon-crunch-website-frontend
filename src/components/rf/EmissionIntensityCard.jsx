import React from "react";
import { Gauge, TrendingDown, Info } from "lucide-react";

const EmissionIntensityCard = ({
    intensityValue = 0, // tCO2e / sq ft
    unit = "tCO₂e / sq ft",
    trend = -5, // Percentage
}) => {

    // Determine color based on simple threshold logic (placeholder)
    const isGood = intensityValue < 0.05; // Example threshold
    const colorClass = isGood ? "text-emerald-600" : "text-amber-600";
    const bgClass = isGood ? "bg-emerald-50" : "bg-amber-50";

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Emission Intensity</h3>
                </div>
                <div className={`p-1.5 rounded-lg ${bgClass}`}>
                    <Gauge className={`w-4 h-4 ${colorClass}`} />
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">
                        {Number(intensityValue).toFixed(4)}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                        {unit}
                    </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="flex items-center gap-1 font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <TrendingDown className="w-3 h-3" />
                        {Math.abs(trend)}%
                    </span>
                    <span className="text-slate-400 text-xs">vs last month</span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-50">
                    <div className="flex gap-2 items-start">
                        <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-400 leading-snug">
                            Lower is better. This metric normalizes emissions by facility area to show true efficiency.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmissionIntensityCard;
