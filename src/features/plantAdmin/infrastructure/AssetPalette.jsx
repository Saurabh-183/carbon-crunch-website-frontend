import React, { useState, memo } from "react";
import { ChevronDown, ChevronRight, Search, Box, Flame, Zap, Package, Warehouse, Settings, Thermometer, Droplets, Wind, CheckCircle, Truck, Type } from "lucide-react";
import { NODE_TYPES, NODE_GROUPS } from "./constants";
import ASSET_SVG_ICONS, { CustomProcessIcon } from "./AssetIcons";

/* Small lucide icons used only for the group header chevrons */
const GROUP_ICON_MAP = {
  Flame,
  Zap,
  Package,
  Warehouse,
  Settings,
  Thermometer,
  Droplets,
  Wind,
  CheckCircle,
  Truck,
  Type,
};

const AssetPalette = memo(({ readOnly }) => {
  const [expandedGroup, setExpandedGroup] = useState("Thermal");
  const [search, setSearch] = useState("");

  if (readOnly) return null;

  const filteredTypes = Object.entries(NODE_TYPES).filter(([name]) => !search || name.toLowerCase().includes(search.toLowerCase()));

  const groupedTypes = {};
  filteredTypes.forEach(([name, meta]) => {
    const g = meta.group || "Other";
    if (!groupedTypes[g]) groupedTypes[g] = [];
    groupedTypes[g].push({ name, ...meta });
  });

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData("application/infra-node", JSON.stringify({ type, label: type }));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">Asset Library</h3>
        <p className="text-[11px] text-slate-400 mt-0.5">Drag assets onto the canvas</p>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-slate-50">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400"
          />
        </div>
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto px-2 py-1 custom-scrollbar">
        {NODE_GROUPS.map((group) => {
          const items = groupedTypes[group.key];
          if (!items?.length) return null;
          const isOpen = search ? true : expandedGroup === group.key;
          const GroupIcon = GROUP_ICON_MAP[group.icon] || Box;

          return (
            <div key={group.key} className="mb-1">
              <button
                onClick={() => setExpandedGroup(isOpen && !search ? null : group.key)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <GroupIcon className="w-3.5 h-3.5 text-slate-400" />
                <span className="flex-1 text-left">{group.label}</span>
                <span className="text-[10px] text-slate-400 mr-1">{items.length}</span>
                {isOpen ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
              </button>

              {isOpen && (
                <div className="ml-1 space-y-0.5 mb-1">
                  {items.map((item) => {
                    const SvgIcon = ASSET_SVG_ICONS[item.name] || CustomProcessIcon;
                    return (
                      <div
                        key={item.name}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.name)}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing
                          hover:bg-slate-50 border border-transparent hover:border-slate-200
                          transition-all duration-150 group/item"
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm
                            transition-transform group-hover/item:scale-110 p-1"
                          style={{ backgroundColor: item.bg }}
                        >
                          <SvgIcon className="w-full h-full" />
                        </div>
                        <span className="text-[12px] text-slate-700 font-medium truncate">{item.name}</span>
                        {item.scope && (
                          <span className="ml-auto text-[9px] font-bold px-1 py-0.5 rounded text-white shrink-0" style={{ backgroundColor: item.color }}>
                            S{item.scope}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/60">
        <p className="text-[10px] font-semibold text-slate-500 mb-1">SCOPE LEGEND</p>
        <div className="flex gap-3">
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-red-500" /> S1
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> S2
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> S3
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-slate-300" /> Set in panel
          </span>
        </div>
      </div>
    </div>
  );
});

AssetPalette.displayName = "AssetPalette";
export default AssetPalette;
