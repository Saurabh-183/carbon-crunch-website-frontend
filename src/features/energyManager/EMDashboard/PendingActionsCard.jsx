import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react";

const PendingActionsCard = ({
  approvedCount = 0,
  pendingCount = 0,
  rejectedCount = 0,
  paths = {} // Corrected prop name to match your usage
}) => {
  const cards = [
    {
      id: "pending",
      title: "Pending Approval",
      count: pendingCount,
      icon: Clock,
      brandColor: "#d97706",
      accent: "bg-amber-500",
      label: "Awaiting review",
      path: paths.pending
    },
    {
      id: "rejected",
      title: "Rejected Entries",
      count: rejectedCount,
      icon: AlertCircle,
      brandColor: "#dc2626",
      accent: "bg-red-500",
      label: "Needs attention",
      path: paths.rejected
    },
    {
      id: "approved",
      title: "Approved Data",
      count: approvedCount,
      icon: CheckCircle,
      brandColor: "#059669",
      accent: "bg-emerald-500",
      label: "Successfully logged",
      path: paths.approved
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {cards.map((card) => {
        const Icon = card.icon;
        const hasPath = !!card.path;

        return (
          <div
            key={card.id}
            style={{ 
              borderColor: `${card.brandColor}20`,
              backgroundColor: `${card.brandColor}05`
            }}
            className={`group relative overflow-hidden rounded-[2rem] border bg-white p-6 transition-all duration-300 
              ${hasPath ? "hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1.5 hover:scale-[1.02]" : ""}`}
          >
            <div className={`absolute top-0 left-0 h-1.5 w-full ${card.accent} opacity-80`} />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div 
                  style={{ backgroundColor: `${card.brandColor}15` }}
                  className="p-3 rounded-2xl transition-transform duration-500 group-hover:rotate-[10deg]"
                >
                  <Icon style={{ color: card.brandColor }} className="w-6 h-6" />
                </div>

                <span 
                  style={{ 
                    color: card.brandColor, 
                    backgroundColor: `${card.brandColor}10`,
                    borderColor: `${card.brandColor}20`
                  }}
                  className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border"
                >
                  {card.label}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                  {card.title}
                </p>
                
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black tracking-tight text-slate-900">
                    {card.count.toLocaleString()}
                  </h3>
                  <span className="text-sm font-bold text-slate-400">entries</span>
                </div>
              </div>

              {hasPath && (
                <Link 
                  to={card.path}
                  className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between group-hover:border-transparent transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">
                    View details
                  </span>
                  <ArrowRight 
                    style={{ color: card.brandColor }} 
                    className="w-4 h-4 translate-x-[-4px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" 
                  />
                </Link>
              )}
            </div>

            <div 
              style={{ backgroundColor: card.brandColor }}
              className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full opacity-[0.03] transition-transform duration-700 group-hover:scale-150"
            />
          </div>
        );
      })}
    </div>
  );
};

export default PendingActionsCard;