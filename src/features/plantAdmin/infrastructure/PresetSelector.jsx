import React, { memo, useState } from "react";
import { X, Check, Factory, Zap, Settings } from "lucide-react";

const INDUSTRY_ICONS = {
  Steel: Factory,
  Power: Zap,
  Manufacturing: Settings,
};

/**
 * Modal to select a preset infrastructure template.
 */
const PresetSelector = memo(({ isOpen, onClose, onApply, presets = {}, title = "Choose Infrastructure Template", subtitle = "Select an industry-specific layout to get started quickly" }) => {
  const [selected, setSelected] = useState(null);
  const [applying, setApplying] = useState(false);

  if (!isOpen) return null;

  const presetEntries = Object.entries(presets);

  const handleApply = async () => {
    if (!selected) return;
    setApplying(true);
    try {
      const result = await onApply?.(selected, presets[selected]);
      if (result === true) {
        onClose?.();
      }
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Preset Grid */}
        <div className="p-6 overflow-y-auto max-h-[55vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {presetEntries.map(([key, preset]) => {
              const isActive = selected === key;
              const IndustryIcon = INDUSTRY_ICONS[preset.industryType] || Factory;
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 group
                    ${isActive ? "border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-100" : "border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white"}`}
                >
                  {/* Checkmark */}
                  {isActive && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0
                      ${isActive ? "bg-emerald-100" : "bg-slate-100 group-hover:bg-slate-200"} transition-colors`}
                    >
                      {preset.thumbnail}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-800">{preset.name}</h3>
                      <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-2">{preset.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                          <IndustryIcon className="w-3 h-3" /> {preset.industryType}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {preset.nodes.length} nodes · {preset.edges.length} connections
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-400">{selected ? "Template will be applied to the canvas" : "Select a template to continue"}</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition-colors">
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!selected || applying}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {applying ? "Applying..." : "Apply Template"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

PresetSelector.displayName = "PresetSelector";
export default PresetSelector;
