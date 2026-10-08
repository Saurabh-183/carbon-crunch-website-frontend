import React from "react";
import { useAuth } from "../../context/AuthContext";
import { toUiTerminology } from "../../utils/uiTerminology";

const QuickActionCard = ({
  title,
  subtitle,
  icon: Icon,
  onClick,
  className = "bg-white border-slate-200",
  hoverColorClass = "hover:shadow-teal-100/50 hover:border-teal-200",
  iconColorClass = "bg-teal-100/80 text-teal-600 group-hover:bg-teal-600 group-hover:text-white",
  titleColorClass = "text-slate-800 group-hover:text-teal-700",
  gradientColorClass = "from-teal-50/50",
}) => {
  const { user } = useAuth();
  const industry = user?.organizationId?.industry || user?.organizationIndustry || "";
  const role = user?.role || "";

  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center p-5 rounded-2xl shadow-sm border
        transition-all duration-300 group overflow-hidden
        hover:shadow-lg hover:-translate-y-0.5
        ${className}
        ${hoverColorClass}
      `}
    >
      {/* Dynamic Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradientColorClass}`} />

      {/* Icon Wrapper */}
      <div
        className={`
        relative h-12 w-12 flex items-center justify-center rounded-xl 
        transition-all duration-300
        ${iconColorClass}
      `}
      >
        <Icon className="w-6 h-6 transform group-hover:scale-110 transition-transform duration-300" />
      </div>

      {/* Text Content */}
      <div className="relative ml-4 text-left">
        <p className={`font-bold text-lg leading-tight transition-colors ${titleColorClass}`}>{toUiTerminology(title, industry, role)}</p>
        <p className="text-xs font-medium text-slate-400 mt-1">{toUiTerminology(subtitle, industry, role)}</p>
      </div>
    </button>
  );
};

export default QuickActionCard;
