import React, { memo } from "react";
import { X, Trash2 } from "lucide-react";
import { NODE_TYPES, EDGE_TYPES, CAPACITY_UNIT_OPTIONS, DEFAULT_CAPACITY_UNITS, NODE_FUEL_OPTIONS, DEFAULT_FUEL_OPTIONS, SOURCE_UNIT_OPTIONS, DEFAULT_UNIT_OPTIONS } from "./constants";

const normalizeEnergyProfiles = (profiles = []) => {
  if (!Array.isArray(profiles)) return [];
  return profiles.map((item) => ({
    sourceType: String(item?.sourceType || ""),
    unit: String(item?.unit || ""),
  }));
};

const OTHER_FUEL_VALUE = "__OTHER__";
const OTHER_UNIT_VALUE = "__OTHER_UNIT__";
const DEFAULT_GROUP_TINT = "#94A3B8";
const GROUP_TINT_OPTIONS = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#6366F1", "#A855F7", "#EC4899", "#94A3B8"];

const getFuelOptionsForNode = (nodeType) => {
  const nodeOptions = NODE_FUEL_OPTIONS[nodeType] || DEFAULT_FUEL_OPTIONS;
  const unique = Array.from(new Set(nodeOptions.filter(Boolean)));
  return unique;
};

const getProbableSourceByUnit = (unit = "") => {
  const normalizedUnit = String(unit).trim().toLowerCase();
  if (!normalizedUnit) return "";

  if (["kwh", "mwh", "gwh", "mu", "kw", "mw", "kva", "mva", "mv", "kv", "mvk"].includes(normalizedUnit)) {
    return "Electricity";
  }
  if (["litres", "liters", "l", "kl", "gallons"].includes(normalizedUnit)) {
    return "Diesel";
  }
  if (["m³", "m3", "m³/hr", "m3/hr", "scm"].includes(normalizedUnit)) {
    return "Natural Gas";
  }
  if (["tph", "tpd", "tpa", "tonnes", "tons", "kg", "kg/hr"].includes(normalizedUnit)) {
    return "Coal";
  }

  return "";
};

const getDefaultSourceForNode = (nodeType, unit = "") => {
  const options = getFuelOptionsForNode(nodeType);
  const probableByUnit = getProbableSourceByUnit(unit);

  if (probableByUnit && options.includes(probableByUnit)) {
    return probableByUnit;
  }

  const firstNonOther = options.find((option) => option !== "Other");
  return firstNonOther || "";
};

const getUnitOptionsForSource = (sourceType = "") => {
  const sourceKey = String(sourceType || "").trim();
  if (sourceKey && Array.isArray(SOURCE_UNIT_OPTIONS[sourceKey]) && SOURCE_UNIT_OPTIONS[sourceKey].length) {
    return Array.from(new Set(SOURCE_UNIT_OPTIONS[sourceKey].filter(Boolean)));
  }
  return Array.from(new Set(DEFAULT_UNIT_OPTIONS.filter(Boolean)));
};

const getDefaultUnitForSource = (sourceType = "", fallbackUnit = "") => {
  const normalizedFallback = String(fallbackUnit || "").trim();
  const unitOptions = getUnitOptionsForSource(sourceType);

  if (normalizedFallback && unitOptions.includes(normalizedFallback)) {
    return normalizedFallback;
  }

  const firstNonOther = unitOptions.find((option) => option !== "Other");
  return firstNonOther || normalizedFallback || "";
};

/**
 * Right-side panel showing properties of the selected node or edge.
 */
const PropertiesPanel = memo(({ selectedId, nodes, edges, readOnly, onUpdateNode, onUpdateEdge, onRemoveNode, onRemoveEdge, onClose }) => {
  const selectedNode = nodes.find((n) => n.nodeId === selectedId);
  const selectedEdge = edges.find((e) => e.edgeId === selectedId);

  if (!selectedNode && !selectedEdge) return null;

  // ─── Node Properties ───────────────────────────────────────────
  if (selectedNode) {
    const meta = NODE_TYPES[selectedNode.type] || {};
    const isGroupNode = selectedNode.type === "Group";
    const groupTint = String(selectedNode.data?.groupTint || DEFAULT_GROUP_TINT);
    return (
      <div className="w-72 shrink-0 bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden animate-in slide-in-from-right-4 duration-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Node Properties</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Type badge */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold text-white" style={{ backgroundColor: meta.color || "#64748B" }}>
              {selectedNode.type}
            </span>
            {(() => {
              const eff = selectedNode.data?.scope !== undefined ? selectedNode.data.scope : meta.scope;
              return eff ? (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${eff === 1 ? "bg-red-100 text-red-700" : eff === 2 ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                  S{eff}
                </span>
              ) : null;
            })()}
          </div>

          {/* Emission Scope */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Emission Scope</label>
            <div className="flex items-center gap-2">
              <select
                value={String(selectedNode.data?.scope !== undefined ? (selectedNode.data.scope ?? "") : (meta.scope ?? ""))}
                disabled={readOnly}
                onChange={(e) => {
                  const val = e.target.value;
                  onUpdateNode?.(selectedNode.nodeId, {
                    data: { ...selectedNode.data, scope: val === "" ? null : Number(val) },
                  });
                }}
                className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 bg-white disabled:bg-slate-50"
              >
                <option value="">No scope</option>
                <option value="1">Scope 1 - Direct</option>
                <option value="2">Scope 2 - Purchased Energy</option>
                <option value="3">Scope 3 - Value Chain</option>
              </select>
              {selectedNode.data?.scope !== undefined && (
                <button
                  type="button"
                  onClick={() => {
                    const { scope: _unusedScope, ...rest } = selectedNode.data || {};
                    onUpdateNode?.(selectedNode.nodeId, { data: rest });
                  }}
                  className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap"
                  title="Reset to default scope"
                >
                  Reset
                </button>
              )}
            </div>
            {selectedNode.data?.scope !== undefined && meta.scope && selectedNode.data.scope !== meta.scope && (
              <p className="text-[10px] text-amber-500 mt-0.5">
                Default for {selectedNode.type}: Scope {meta.scope}
              </p>
            )}
          </div>

          {/* Label */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Label</label>
            <input
              type="text"
              value={selectedNode.label}
              disabled={readOnly}
              onChange={(e) => onUpdateNode?.(selectedNode.nodeId, { label: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:bg-slate-50"
            />
          </div>

          {isGroupNode && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Group Color (Light Tint)</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="color"
                  value={groupTint}
                  disabled={readOnly}
                  onChange={(e) =>
                    onUpdateNode?.(selectedNode.nodeId, {
                      data: { ...selectedNode.data, groupTint: e.target.value },
                    })
                  }
                  className="h-8 w-10 p-0 border border-slate-200 rounded cursor-pointer disabled:cursor-not-allowed"
                />
                <input
                  type="text"
                  value={groupTint}
                  disabled={readOnly}
                  onChange={(e) =>
                    onUpdateNode?.(selectedNode.nodeId, {
                      data: { ...selectedNode.data, groupTint: e.target.value },
                    })
                  }
                  placeholder="#94A3B8"
                  className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:bg-slate-50"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {GROUP_TINT_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    disabled={readOnly}
                    onClick={() =>
                      onUpdateNode?.(selectedNode.nodeId, {
                        data: { ...selectedNode.data, groupTint: color },
                      })
                    }
                    className="w-5 h-5 rounded border border-slate-300 disabled:opacity-50"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Capacity */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Capacity</label>
              <input
                type="number"
                value={selectedNode.data?.capacity || ""}
                disabled={readOnly}
                onChange={(e) =>
                  onUpdateNode?.(selectedNode.nodeId, {
                    data: { ...selectedNode.data, capacity: Number(e.target.value) || null },
                  })
                }
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Unit</label>
              <select
                value={selectedNode.data?.capacityUnit || DEFAULT_CAPACITY_UNITS[selectedNode.type] || ""}
                disabled={readOnly}
                onChange={(e) =>
                  onUpdateNode?.(selectedNode.nodeId, {
                    data: { ...selectedNode.data, capacityUnit: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 bg-white disabled:bg-slate-50"
              >
                <option value="">—</option>
                {CAPACITY_UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Energy Input Profile */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Energy Source:Unit</label>
            <div className="space-y-2">
              {normalizeEnergyProfiles(selectedNode.data?.energyProfiles || []).map((profile, index) => {
                const sourceOptions = getFuelOptionsForNode(selectedNode.type);
                const unitOptions = getUnitOptionsForSource(profile.sourceType);
                const selectedSourceValue = !profile.sourceType ? "" : sourceOptions.includes(profile.sourceType) ? profile.sourceType : OTHER_FUEL_VALUE;
                const selectedUnitValue = !profile.unit ? "" : unitOptions.includes(profile.unit) ? profile.unit : OTHER_UNIT_VALUE;

                return (
                  <div key={`${selectedNode.nodeId}-energy-${index}`} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-6 space-y-1">
                      <select
                        value={selectedSourceValue}
                        disabled={readOnly}
                        onChange={(e) => {
                          const nextProfiles = normalizeEnergyProfiles(selectedNode.data?.energyProfiles || []);
                          const nextSourceType = e.target.value === OTHER_FUEL_VALUE ? "" : e.target.value;
                          const nextUnitOptions = getUnitOptionsForSource(nextSourceType);
                          const existingUnit = String(nextProfiles[index]?.unit || "").trim();
                          const nextUnit =
                            existingUnit && (nextUnitOptions.includes(existingUnit) || !nextSourceType) ? existingUnit : getDefaultUnitForSource(nextSourceType, selectedNode.data?.capacityUnit || "");

                          nextProfiles[index] = {
                            ...nextProfiles[index],
                            sourceType: nextSourceType,
                            unit: nextUnit,
                          };
                          onUpdateNode?.(selectedNode.nodeId, {
                            data: {
                              ...selectedNode.data,
                              energyProfiles: nextProfiles,
                            },
                          });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 bg-white disabled:bg-slate-50"
                      >
                        <option value="">Select fuel/source</option>
                        {sourceOptions
                          .filter((option) => option !== "Other")
                          .map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        <option value={OTHER_FUEL_VALUE}>Other</option>
                      </select>

                      {(!sourceOptions.includes(profile.sourceType) || !profile.sourceType) && (
                        <input
                          type="text"
                          value={profile.sourceType}
                          disabled={readOnly}
                          onChange={(e) => {
                            const nextProfiles = normalizeEnergyProfiles(selectedNode.data?.energyProfiles || []);
                            nextProfiles[index] = {
                              ...nextProfiles[index],
                              sourceType: e.target.value,
                            };
                            onUpdateNode?.(selectedNode.nodeId, {
                              data: {
                                ...selectedNode.data,
                                energyProfiles: nextProfiles,
                              },
                            });
                          }}
                          placeholder="Enter custom source"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:bg-slate-50"
                        />
                      )}
                    </div>
                    <div className="col-span-4 space-y-1">
                      <select
                        value={selectedUnitValue}
                        disabled={readOnly}
                        onChange={(e) => {
                          const nextProfiles = normalizeEnergyProfiles(selectedNode.data?.energyProfiles || []);
                          nextProfiles[index] = {
                            ...nextProfiles[index],
                            unit: e.target.value === OTHER_UNIT_VALUE ? "" : e.target.value,
                          };
                          onUpdateNode?.(selectedNode.nodeId, {
                            data: {
                              ...selectedNode.data,
                              energyProfiles: nextProfiles,
                            },
                          });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 bg-white disabled:bg-slate-50"
                      >
                        <option value="">Select unit</option>
                        {unitOptions
                          .filter((option) => option !== "Other")
                          .map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        <option value={OTHER_UNIT_VALUE}>Other</option>
                      </select>

                      {(!unitOptions.includes(profile.unit) || !profile.unit) && (
                        <input
                          type="text"
                          value={profile.unit}
                          disabled={readOnly}
                          onChange={(e) => {
                            const nextProfiles = normalizeEnergyProfiles(selectedNode.data?.energyProfiles || []);
                            nextProfiles[index] = {
                              ...nextProfiles[index],
                              unit: e.target.value,
                            };
                            onUpdateNode?.(selectedNode.nodeId, {
                              data: {
                                ...selectedNode.data,
                                energyProfiles: nextProfiles,
                              },
                            });
                          }}
                          placeholder="Enter custom unit"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:bg-slate-50"
                        />
                      )}
                    </div>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          const nextProfiles = normalizeEnergyProfiles(selectedNode.data?.energyProfiles || []).filter((_, rowIndex) => rowIndex !== index);
                          onUpdateNode?.(selectedNode.nodeId, {
                            data: {
                              ...selectedNode.data,
                              energyProfiles: nextProfiles,
                            },
                          });
                        }}
                        className="col-span-2 px-2 py-1.5 text-[10px] font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              {!readOnly && (
                <button
                  type="button"
                  onClick={() => {
                    const nextProfiles = normalizeEnergyProfiles(selectedNode.data?.energyProfiles || []);
                    const inferredUnit = String(selectedNode.data?.capacityUnit || "").trim();
                    const defaultSourceType = getDefaultSourceForNode(selectedNode.type, inferredUnit);
                    const defaultUnit = getDefaultUnitForSource(defaultSourceType, inferredUnit);
                    nextProfiles.push({
                      sourceType: defaultSourceType,
                      unit: defaultUnit,
                    });
                    onUpdateNode?.(selectedNode.nodeId, {
                      data: {
                        ...selectedNode.data,
                        energyProfiles: nextProfiles,
                      },
                    });
                  }}
                  className="w-full px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  + Add Fuel / Source
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Add as many rows as needed. These values control Data Entry dropdowns for this asset.</p>
          </div>

          {/* Position */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">X</label>
              <input type="number" value={Math.round(selectedNode.x)} disabled className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-400" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Y</label>
              <input type="number" value={Math.round(selectedNode.y)} disabled className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-400" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</label>
            <textarea
              rows={2}
              value={selectedNode.data?.description || ""}
              disabled={readOnly}
              onChange={(e) =>
                onUpdateNode?.(selectedNode.nodeId, {
                  data: { ...selectedNode.data, description: e.target.value },
                })
              }
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none disabled:bg-slate-50"
            />
          </div>

          {/* Connected edges */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Connections ({edges.filter((e) => e.source === selectedNode.nodeId || e.target === selectedNode.nodeId).length})
            </label>
            <div className="space-y-1">
              {edges
                .filter((e) => e.source === selectedNode.nodeId || e.target === selectedNode.nodeId)
                .map((e) => {
                  const isSource = e.source === selectedNode.nodeId;
                  const otherNode = nodes.find((n) => n.nodeId === (isSource ? e.target : e.source));
                  const eMeta = EDGE_TYPES[e.type] || EDGE_TYPES.material;
                  return (
                    <div key={e.edgeId} className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 rounded-md px-2 py-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: eMeta.color }} />
                      <span className="truncate">
                        {isSource ? "→" : "←"} {otherNode?.label || "?"}
                      </span>
                      {e.label && <span className="text-slate-400 ml-auto truncate">{e.label}</span>}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Delete */}
        {!readOnly && (
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={() => onRemoveNode?.(selectedNode.nodeId)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove Node
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── Edge Properties ───────────────────────────────────────────
  if (selectedEdge) {
    const eMeta = EDGE_TYPES[selectedEdge.type] || EDGE_TYPES.material;
    const sourceNode = nodes.find((n) => n.nodeId === selectedEdge.source);
    const targetNode = nodes.find((n) => n.nodeId === selectedEdge.target);

    return (
      <div className="w-72 shrink-0 bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden animate-in slide-in-from-right-4 duration-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Connection</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* From → To */}
          <div className="bg-slate-50 rounded-lg p-3 text-sm">
            <p className="text-slate-500 text-[11px] font-semibold mb-1">FROM</p>
            <p className="font-medium text-slate-800">{sourceNode?.label || "?"}</p>
            <div className="flex justify-center my-2">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ backgroundColor: eMeta.color, color: "white" }}>
                →
              </span>
            </div>
            <p className="text-slate-500 text-[11px] font-semibold mb-1">TO</p>
            <p className="font-medium text-slate-800">{targetNode?.label || "?"}</p>
          </div>

          {/* Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Flow Type</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: eMeta.color }} />
              <select
                value={selectedEdge.type}
                disabled={readOnly}
                onChange={(e) => onUpdateEdge?.(selectedEdge.edgeId, { type: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 bg-white disabled:bg-slate-50"
              >
                {Object.entries(EDGE_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Label</label>
            <input
              type="text"
              value={selectedEdge.label || ""}
              disabled={readOnly}
              onChange={(e) => onUpdateEdge?.(selectedEdge.edgeId, { label: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:bg-slate-50"
              placeholder="e.g. Molten Metal, Steam..."
            />
          </div>
        </div>

        {!readOnly && (
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={() => onRemoveEdge?.(selectedEdge.edgeId)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove Connection
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
});

PropertiesPanel.displayName = "PropertiesPanel";
export default PropertiesPanel;
