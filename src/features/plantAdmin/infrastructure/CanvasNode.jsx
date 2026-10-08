import React, { memo, useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { NODE_TYPES, NODE_WIDTH, NODE_HEIGHT, TEXTBOX_WIDTH, TEXTBOX_HEIGHT, GROUP_DEFAULT_WIDTH, GROUP_DEFAULT_HEIGHT } from "./constants";
import ASSET_SVG_ICONS, { CustomProcessIcon } from "./AssetIcons";

const DEFAULT_GROUP_TINT = "#94A3B8";

const hexToRgba = (hex, alpha) => {
  const safeHex = String(hex || "")
    .replace("#", "")
    .trim();
  if (!/^[0-9a-fA-F]{6}$/.test(safeHex)) {
    return `rgba(148, 163, 184, ${alpha})`;
  }

  const r = parseInt(safeHex.slice(0, 2), 16);
  const g = parseInt(safeHex.slice(2, 4), 16);
  const b = parseInt(safeHex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const CanvasNode = memo(({ node, isSelected, readOnly, onMouseDown, onPortMouseDown, onPortMouseUp, onDelete, onSelect, onUpdateNodeData, onResizeMouseDown }) => {
  const meta = NODE_TYPES[node.type] || { icon: "Box", color: "#64748B", bg: "#F1F5F9" };
  const SvgIcon = ASSET_SVG_ICONS[node.type] || CustomProcessIcon;
  const scopeValue = node.data?.scope ?? meta.scope;
  const scopeLabel = scopeValue ? `S${scopeValue}` : null;
  const isTextbox = node.type === "Textbox";
  const isGroup = node.type === "Group";
  const w = isGroup ? node.data?.width || GROUP_DEFAULT_WIDTH : isTextbox ? TEXTBOX_WIDTH : NODE_WIDTH;
  const h = isGroup ? node.data?.height || GROUP_DEFAULT_HEIGHT : isTextbox ? TEXTBOX_HEIGHT : NODE_HEIGHT;
  const portY = h / 2;

  // ─── Textbox editable state ───
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(node.data?.text || node.label || "");
  const textRef = useRef(null);

  useEffect(() => {
    if (editing && textRef.current) {
      textRef.current.focus();
      textRef.current.select();
    }
  }, [editing]);

  const commitText = () => {
    setEditing(false);
    if (onUpdateNodeData && text !== (node.data?.text || node.label)) {
      onUpdateNodeData(node.nodeId, { data: { ...node.data, text } });
    }
  };

  // ─── Group rendering ───
  if (isGroup) {
    const groupTint = String(node.data?.groupTint || DEFAULT_GROUP_TINT);
    const groupBorder = hexToRgba(groupTint, isSelected ? 0.85 : 0.65);
    const groupBg = hexToRgba(groupTint, isSelected ? 0.14 : 0.09);
    const groupHeaderBorder = hexToRgba(groupTint, 0.45);

    return (
      <div className="absolute select-none group" style={{ left: node.x, top: node.y, width: w, height: h, zIndex: isSelected ? 5 : 0 }}>
        <div
          className={`w-full h-full border-2 transition-all duration-150 relative flex flex-col p-3 rounded-lg
            ${readOnly ? "cursor-default" : ""}
            ${isSelected ? "ring-2 ring-slate-400 shadow-md" : "hover:shadow-sm"}`}
          style={{ borderStyle: "dashed", borderColor: groupBorder, backgroundColor: groupBg }}
          onDoubleClick={() => {
            if (!readOnly) setEditing(true);
          }}
        >
          {/* Header area acts as drag handle */}
          <div
            className={`w-full h-8 flex items-center shrink-0 border-b ${readOnly ? "" : "cursor-grab active:cursor-grabbing"}`}
            style={{ borderBottomColor: groupHeaderBorder }}
            onMouseDown={(e) => {
              onSelect?.(node.nodeId);
              onMouseDown?.(e, node.nodeId);
            }}
          >
            {editing ? (
              <input
                ref={textRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={commitText}
                onKeyDown={(e) => {
                  if (e.key === "Escape" || e.key === "Enter") {
                    e.preventDefault();
                    commitText();
                  }
                }}
                className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Group Name"
                onMouseDown={(e) => e.stopPropagation()}
              />
            ) : (
              <p className="text-sm font-bold text-slate-600 truncate px-1 flex-1">{node.data?.text || node.label || "Group"}</p>
            )}

            {!readOnly && isSelected && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(node.nodeId);
                }}
                className="w-5 h-5 bg-red-500 text-white rounded-md flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors ml-2 shrink-0 z-30"
                title="Delete Group"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Main area - pointer events mostly disabled so user can click nodes inside */}
          <div className="flex-1 w-full pointer-events-none" />

          {/* Resize Handle */}
          {!readOnly && isSelected && (
            <div
              className="absolute bottom-0 right-0 w-8 h-8 cursor-se-resize flex items-end justify-end p-2 z-30 pointer-events-auto"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onResizeMouseDown?.(e, node.nodeId);
              }}
            >
              <div className="w-3 h-3 border-r-2 border-b-2 opacity-70 cursor-se-resize pointer-events-none" style={{ borderColor: groupBorder }} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Textbox rendering ───
  if (isTextbox) {
    return (
      <div className="absolute select-none group" style={{ left: node.x, top: node.y, width: w, height: h, zIndex: isSelected ? 20 : 10 }}>
        {/* Input Port (left) */}
        <div className="absolute -left-[7px] z-30" style={{ top: portY }}>
          <div
            onMouseUp={(e) => onPortMouseUp?.(e, node.nodeId, "input")}
            className={`w-[14px] h-[14px] rounded-full border-2 border-white shadow-md transition-transform hover:scale-125
              ${readOnly ? "" : "cursor-crosshair"}`}
            style={{ backgroundColor: "#94A3B8" }}
          />
        </div>
        {/* Output Port (right) */}
        <div className="absolute -right-[7px] z-30" style={{ top: portY }}>
          <div
            onMouseDown={(e) => onPortMouseDown?.(e, node.nodeId, "output")}
            className={`w-[14px] h-[14px] rounded-full border-2 border-white shadow-md transition-transform hover:scale-125
              ${readOnly ? "" : "cursor-crosshair"}`}
            style={{ backgroundColor: "#94A3B8" }}
          />
        </div>

        {/* Textbox Visual */}
        <div
          className={`w-full h-full rounded-xl border-2 transition-all duration-150 relative flex items-center px-3
            ${readOnly ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
            ${isSelected ? "ring-2 ring-blue-400 shadow-lg shadow-blue-100/50 border-blue-400" : "hover:shadow-md border-slate-300"}`}
          style={{ background: "#ffffffee", borderStyle: "dashed" }}
          onMouseDown={(e) => {
            onSelect?.(node.nodeId);
            onMouseDown?.(e, node.nodeId);
          }}
          onDoubleClick={() => {
            if (!readOnly) setEditing(true);
          }}
        >
          {!readOnly && isSelected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(node.nodeId);
              }}
              className="absolute -top-2.5 -right-2.5 z-30 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {editing ? (
            <textarea
              ref={textRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={commitText}
              onKeyDown={(e) => {
                if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey)) {
                  e.preventDefault();
                  commitText();
                }
              }}
              className="w-full h-full resize-none bg-transparent text-xs text-slate-700 outline-none"
              style={{ cursor: "text" }}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <p className="text-xs text-slate-600 leading-snug whitespace-pre-wrap break-words w-full">{node.data?.text || node.label || "Double-click to edit"}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute select-none group"
      style={{
        left: node.x,
        top: node.y,
        width: w,
        height: h,
        zIndex: isSelected ? 20 : 10,
      }}
    >
      {/* ─── Input Port (left) ─── */}
      <div className="absolute -left-[7px] z-30" style={{ top: portY }} onMouseUp={(e) => onPortMouseUp?.(e, node.nodeId, "input")}>
        <div
          className={`w-[14px] h-[14px] rounded-full border-2 border-white shadow-md transition-transform hover:scale-125
            ${readOnly ? "" : "cursor-crosshair"}`}
          style={{ backgroundColor: meta.color }}
        />
      </div>

      {/* ─── Output Port (right) ─── */}
      <div className="absolute -right-[7px] z-30" style={{ top: portY }} onMouseDown={(e) => onPortMouseDown?.(e, node.nodeId, "output")}>
        <div
          className={`w-[14px] h-[14px] rounded-full border-2 border-white shadow-md transition-transform hover:scale-125
            ${readOnly ? "" : "cursor-crosshair"}`}
          style={{ backgroundColor: meta.color }}
        />
      </div>

      {/* ─── Node Visual ─── */}
      <div
        className={`w-full h-full flex flex-col items-center justify-center rounded-2xl
          transition-all duration-150 relative
          ${readOnly ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
          ${isSelected ? "ring-2 ring-emerald-400 shadow-lg shadow-emerald-200/50" : "hover:shadow-lg"}`}
        style={{
          background: `radial-gradient(ellipse at center, ${meta.bg}dd, ${meta.bg}66)`,
          border: `2px solid ${isSelected ? "#10b981" : meta.color + "30"}`,
        }}
        onMouseDown={(e) => {
          onSelect?.(node.nodeId);
          onMouseDown?.(e, node.nodeId);
        }}
      >
        {/* Delete button */}
        {!readOnly && isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(node.nodeId);
            }}
            className="absolute -top-2.5 -right-2.5 z-30 w-5 h-5 bg-red-500 text-white rounded-full
              flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {/* Scope badge */}
        {scopeLabel && (
          <span className="absolute -top-1.5 -left-1 z-20 text-[8px] font-bold px-1.5 py-[1px] rounded-full text-white shadow-sm" style={{ backgroundColor: meta.color }}>
            {scopeLabel}
          </span>
        )}

        {/* SVG Icon – hero element */}
        <div className="w-[52px] h-[52px] mb-1 drop-shadow-sm">
          <SvgIcon className="w-full h-full" />
        </div>

        {/* Label */}
        <p className="text-[11px] font-semibold text-slate-700 leading-tight text-center truncate w-full px-2">{node.label}</p>

        {/* Capacity subtitle */}
        {node.data?.capacity && (
          <p className="text-[9px] text-slate-400 mt-0.5 truncate">
            {node.data.capacity} {node.data.capacityUnit || ""}
          </p>
        )}
      </div>
    </div>
  );
});

CanvasNode.displayName = "CanvasNode";
export default CanvasNode;
