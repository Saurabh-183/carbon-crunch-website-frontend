import React from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RejectedScopeTabs = ({ selectedScope, selectedScope3Module, onScopeNav }) => {
  const scopes = ["All", "Scope 1", "Scope 2", "Scope 3"];

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* Primary Tabs */}
      <div className="flex items-center gap-1 p-1.5 bg-emerald-50/50 rounded-xl w-fit border border-emerald-100/50 relative">
        {scopes.map((scope) => {
          const isActive = selectedScope === scope;
          return (
            <button
              key={scope}
              type="button"
              onClick={() => onScopeNav(scope, scope === "Scope 3" ? selectedScope3Module : null)}
              className={`
                relative px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-300
                ${isActive ? "text-white" : "text-emerald-800 hover:text-emerald-950"}
              `}
            >
              <span className="relative z-10">{scope}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-emerald-600 rounded-lg shadow-sm ring-1 ring-emerald-700"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Secondary Sub-Tabs Animation */}
      <AnimatePresence mode="wait">
        {selectedScope === "Scope 3" && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 pl-2"
          >
            <ChevronRight className="w-4 h-4 text-emerald-400" />
            <div className="flex p-1 bg-slate-100 rounded-lg gap-1 border border-slate-200 relative">
              {["Upstream", "Downstream"].map((module) => {
                const isSubActive = selectedScope3Module === module;
                return (
                  <button
                    key={module}
                    type="button"
                    onClick={() => onScopeNav("Scope 3", module)}
                    className={`
                      relative px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide uppercase transition-colors duration-300
                      ${isSubActive ? "text-slate-900" : "text-slate-500 hover:text-slate-700"}
                    `}
                  >
                    <span className="relative z-10">{module}</span>
                    {isSubActive && (
                      <motion.div
                        layoutId="activeSubTab"
                        className="absolute inset-0 bg-white rounded shadow-sm"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RejectedScopeTabs;