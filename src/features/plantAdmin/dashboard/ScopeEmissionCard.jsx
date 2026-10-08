import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const ScopeEmissionCard = ({
    title,
    value,
    unit = "tCO₂e",
    trend,
    trendLabel = "vs last month",
    icon: Icon,
    colorTheme = "green"
}) => {

    const themeConfig = {
        green: {
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
            trendPositive: "text-green-600",
            trendNegative: "text-red-600", // Usually less emissions is better (green), but typical UI associates red with down. However for emissions, down is good. Let's stick to standard financial/dashboard colors where down is usually red, but maybe we want down to be green for emissions? 
            // User image shows: 
            // Total Emissions: 144.08, Down 12% is RED. (Wait, usually down emissions is good). 
            // Scope 1: 22.06, Down 8% is GREEN. (So down is good).
            // Scope 2: 122.02, Up 5% is GREEN. (Wait, up is bad? Or is it just generic up/down colors?)
            // Let's look closer at the image description or just infer standard dash practices.
            // In the image:
            // Total: Down arrow, 12% (Red text). "vs last month".
            // Scope 1: Zigzag down arrow, 8% (Green text). "vs last month".
            // Scope 2: Zigzag up arrow, 5% (Green text). "vs last month".

            // Actually standardizing: 
            // Negative trend (reduction) -> Good (Green)
            // Positive trend (increase) -> Bad (Red)
        },
        amber: {
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
        },
        blue: {
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
        }
    };

    const currentTheme = themeConfig[colorTheme] || themeConfig.green;

    // Determination of trend color based on value direction for emissions
    // Assuming negative trend value passed means reduction
    const isReduction = trend < 0;
    const trendColor = isReduction ? "text-green-600" : (trend > 0 ? "text-red-600" : "text-gray-500");
    const TrendIcon = isReduction ? TrendingDown : (trend > 0 ? TrendingUp : Minus);

    return (
       <div
  className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col justify-between h-full hover:shadow-md transition-shadow
    ${colorTheme === "green" ? "border-emerald-300 border-2" : ""}
    ${colorTheme === "amber" ? "border-yellow-300 border-2" : ""}
    ${colorTheme === "blue" ? "border-blue-300 border-2" : ""}
  `}
>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-slate-500 font-medium text-sm">{title}</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-bold text-slate-900">{parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-sm font-medium text-slate-400">{unit}</span>
                    </div>
                </div>
                <div className={`p-3 rounded-2xl ${currentTheme.iconBg}`}>
                    {Icon && <Icon className={`w-6 h-6 ${currentTheme.iconColor}`} />}
                </div>
            </div>

            {trend !== undefined && trend !== null && (
                <div className="flex items-center gap-2 mt-2">
                    <span className={`flex items-center text-sm font-bold ${trendColor}`}>
                        <TrendIcon className="w-4 h-4 mr-1" />
                        {Math.abs(trend)}%
                    </span>
                    <span className="text-sm text-slate-400">{trendLabel}</span>
                </div>
            )}
        </div>
    );
};

export default ScopeEmissionCard;
