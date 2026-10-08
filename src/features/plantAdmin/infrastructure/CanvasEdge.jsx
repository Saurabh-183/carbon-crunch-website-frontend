import React, { memo, useMemo } from "react";
import { EDGE_TYPES, getInputPort, getOutputPort } from "./constants";

/**
 * SVG edge drawn as a cubic bezier with **draggable control-point handles**.
 *
 * Each edge can store `controlPoints: [{x,y},{x,y}]`.
 * • cp1 controls the curve leaving the source.
 * • cp2 controls the curve arriving at the target.
 *
 * When controlPoints are absent the component auto-generates a nice default.
 * The user can grab either handle to reshape the curve into any arc they want.
 */
const CanvasEdge = memo(({ edge, sourceNode, targetNode, isSelected, readOnly, onClick, onControlMouseDown }) => {
  if (!sourceNode || !targetNode) return null;

  const from = getOutputPort(sourceNode);
  const to = getInputPort(targetNode);
  const meta = EDGE_TYPES[edge.type] || EDGE_TYPES.material;

  // ─── Control points ────────────────────────────────────────────
  const { cp1, cp2 } = useMemo(() => {
    if (edge.controlPoints?.length === 2) {
      return { cp1: edge.controlPoints[0], cp2: edge.controlPoints[1] };
    }
    // Default: smooth horizontal bezier
    const dx = Math.max(80, Math.abs(to.x - from.x) * 0.45);
    return {
      cp1: { x: from.x + dx, y: from.y },
      cp2: { x: to.x - dx, y: to.y },
    };
  }, [edge.controlPoints, from.x, from.y, to.x, to.y]);

  const pathD = `M ${from.x} ${from.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${to.x} ${to.y}`;

  // Label position — evaluate bezier at t=0.5
  const midX = 0.125 * from.x + 0.375 * cp1.x + 0.375 * cp2.x + 0.125 * to.x;
  const midY = 0.125 * from.y + 0.375 * cp1.y + 0.375 * cp2.y + 0.125 * to.y - 12;

  const color = isSelected ? "#10B981" : meta.color;

  return (
    <g
      className="cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(edge.edgeId);
      }}
    >
      {/* ─── Invisible fat hit target ─── */}
      <path d={pathD} fill="none" stroke="transparent" strokeWidth={16} />

      {/* ─── Visible edge ─── */}
      <path d={pathD} fill="none" stroke={color} strokeWidth={isSelected ? 3 : 2} strokeDasharray={meta.dash || "none"} strokeLinecap="round" className="transition-colors duration-200">
        {meta.dash && <animate attributeName="stroke-dashoffset" from="0" to={meta.dash === "8 4" ? "-24" : "-16"} dur="1.5s" repeatCount="indefinite" />}
      </path>

      {/* ─── Arrowhead ─── */}
      <ArrowHead x={to.x} y={to.y} fromX={cp2.x} fromY={cp2.y} color={color} />

      {/* ─── Label ─── */}
      {edge.label && (
        <g className="pointer-events-none">
          <rect x={midX - edge.label.length * 3.5 - 6} y={midY - 8} width={edge.label.length * 7 + 12} height={16} rx={4} fill="white" fillOpacity={0.92} stroke={color} strokeWidth={0.8} />
          <text x={midX} y={midY + 3} textAnchor="middle" fill={meta.color} fontSize={10} fontWeight={500} className="select-none">
            {edge.label}
          </text>
        </g>
      )}

      {/* ─── Draggable control-point handles (shown when selected & editable) ─── */}
      {isSelected && !readOnly && (
        <>
          {/* Tangent lines to help visualise curve shape */}
          <line x1={from.x} y1={from.y} x2={cp1.x} y2={cp1.y} stroke="#10B981" strokeWidth={1} strokeDasharray="3 3" opacity={0.4} className="pointer-events-none" />
          <line x1={to.x} y1={to.y} x2={cp2.x} y2={cp2.y} stroke="#10B981" strokeWidth={1} strokeDasharray="3 3" opacity={0.4} className="pointer-events-none" />

          {/* CP1 handle */}
          <circle
            cx={cp1.x}
            cy={cp1.y}
            r={6}
            fill="white"
            stroke="#10B981"
            strokeWidth={2}
            className="cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => {
              e.stopPropagation();
              onControlMouseDown?.(e, edge.edgeId, 0, cp1, cp2);
            }}
          />
          {/* CP2 handle */}
          <circle
            cx={cp2.x}
            cy={cp2.y}
            r={6}
            fill="white"
            stroke="#10B981"
            strokeWidth={2}
            className="cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => {
              e.stopPropagation();
              onControlMouseDown?.(e, edge.edgeId, 1, cp1, cp2);
            }}
          />
        </>
      )}
    </g>
  );
});

/** Small arrowhead at target end */
const ArrowHead = ({ x, y, fromX, fromY, color }) => {
  const angle = Math.atan2(y - fromY, x - fromX);
  const size = 8;
  const p1x = x - size * Math.cos(angle - Math.PI / 6);
  const p1y = y - size * Math.sin(angle - Math.PI / 6);
  const p2x = x - size * Math.cos(angle + Math.PI / 6);
  const p2y = y - size * Math.sin(angle + Math.PI / 6);
  return <polygon points={`${x},${y} ${p1x},${p1y} ${p2x},${p2y}`} fill={color} />;
};

CanvasEdge.displayName = "CanvasEdge";
export default CanvasEdge;
