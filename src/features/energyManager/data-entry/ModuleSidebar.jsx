import React from "react";
import { Flame, Zap, Factory, Truck, Link, Wind, Building2, FileText, ChevronDown, ChevronRight } from "lucide-react";

const ICON_MAP = {
  Flame,
  Zap,
  Factory,
  Truck,
  Link,
  Wind,
  Building2,
  FileText,
};

const ModuleSidebar = ({ modules, activeModule, onModuleChange, hideHeader = false, hideCategoryTitle = false }) => {
  const hasCategory = React.useMemo(() => modules.some((mod) => mod.category), [modules]);

  const groupedModules = React.useMemo(() => {
    if (!hasCategory) {
      return [{ category: "Sections", items: modules }];
    }

    const map = new Map();
    modules.forEach((mod) => {
      const category = mod.category || "Sections";
      if (!map.has(category)) map.set(category, []);
      map.get(category).push(mod);
    });

    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  }, [modules, hasCategory]);

  const [expandedGroups, setExpandedGroups] = React.useState({});

  React.useEffect(() => {
    if (!hasCategory) {
      setExpandedGroups({});
      return;
    }

    setExpandedGroups((prev) => {
      const next = { ...prev };

      groupedModules.forEach((group) => {
        if (next[group.category] === undefined) {
          next[group.category] = false;
        }
      });

      Object.keys(next).forEach((groupName) => {
        if (!groupedModules.some((group) => group.category === groupName)) {
          delete next[groupName];
        }
      });

      const activeGroup = groupedModules.find((group) => group.items.some((mod) => mod.key === activeModule));
      if (activeGroup) {
        next[activeGroup.category] = true;
      }

      return next;
    });
  }, [groupedModules, hasCategory, activeModule]);

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  return (
    <div className="w-[240px] min-w-[240px] bg-white border-r border-slate-200 flex flex-col">
      {/* Header */}
      {!hideHeader && (
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Modules</h3>
        </div>
      )}

      {/* Module List */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto">
        {!hasCategory &&
          modules.map((mod) => {
            const isActive = activeModule === mod.key;
            const Icon = ICON_MAP[mod.icon] || Flame;

            return (
              <button
                key={mod.key}
                type="button"
                onClick={() => onModuleChange(mod.key)}
                className={`
                  w-full mb-1 flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200
                  ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}
                `}
              >
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0
                    ${isActive ? "bg-blue-500/30" : "bg-slate-100"}
                  `}
                >
                  <Icon size={16} className={isActive ? "text-white" : "text-slate-500"} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-semibold truncate leading-tight ${isActive ? "text-white" : "text-slate-700"}`}>{mod.label}</div>
                </div>
              </button>
            );
          })}

        {hasCategory &&
          groupedModules.map((group) => {
            const isExpanded = hideCategoryTitle ? true : Boolean(expandedGroups[group.category]);

            return (
              <div key={group.category} className="mb-2">
                {!hideCategoryTitle && (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.category)}
                    className="w-full px-2 py-2 flex items-center justify-between rounded-lg text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em] hover:bg-slate-100"
                    aria-expanded={isExpanded}
                  >
                    <span>{group.category}</span>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                )}

                {isExpanded && (
                  <div className="mt-1 space-y-1">
                    {group.items.map((mod) => {
                      const isActive = activeModule === mod.key;
                      const Icon = ICON_MAP[mod.icon] || Flame;

                      return (
                        <button
                          key={mod.key}
                          type="button"
                          onClick={() => onModuleChange(mod.key)}
                          className={`
                            w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200
                            ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}
                          `}
                        >
                          <div
                            className={`
                              flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0
                              ${isActive ? "bg-blue-500/30" : "bg-slate-100"}
                            `}
                          >
                            <Icon size={16} className={isActive ? "text-white" : "text-slate-500"} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-sm font-semibold truncate leading-tight ${isActive ? "text-white" : "text-slate-700"}`}>{mod.label}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </nav>
    </div>
  );
};

export default ModuleSidebar;
