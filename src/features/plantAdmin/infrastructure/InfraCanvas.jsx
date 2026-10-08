import React, { memo, useCallback } from "react";
import CanvasNode from "./CanvasNode";
import CanvasEdge from "./CanvasEdge";
import { getOutputPort, NODE_TYPES } from "./constants";

/**
 * Infinite canvas with dot-grid background, SVG edges, and positioned nodes.
 * Supports pan, zoom, drag-to-connect, and drop-from-palette.
 */
const InfraCanvas = memo(
  ({
    nodes,
    edges,
    viewport,
    selectedId,
    connecting,
    canvasRef,
    readOnly,
    groupDrawMode,
    // Handlers
    onCanvasMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
    onNodeMouseDown,
    onPortMouseDown,
    onPortMouseUp,
    onEdgeControlMouseDown,
    onResizeMouseDown,
    onDragOver,
    onDrop,
    setSelectedId,
    removeNode,
    removeEdge,
    onUpdateNodeData,
  }) => {
    const { x: vx, y: vy, zoom } = viewport;

    // Grid pattern size
    const gridSize = 24 * zoom;
    const dotR = Math.max(0.8, zoom * 0.8);

    // Find node by id (for edges)
    const nodeMap = {};
    nodes.forEach((n) => {
      nodeMap[n.nodeId] = n;
    });

    // Temp connection line
    const connectSourceNode = connecting ? nodeMap[connecting.sourceId] : null;
    const connectFrom = connectSourceNode ? getOutputPort(connectSourceNode) : null;

    const handleEdgeClick = useCallback((edgeId) => setSelectedId?.(edgeId), [setSelectedId]);

    const handleKeyDown = useCallback(
      (e) => {
        if (readOnly) return;
        if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
          if (nodes.some((n) => n.nodeId === selectedId)) {
            removeNode?.(selectedId);
          } else if (edges.some((ed) => ed.edgeId === selectedId)) {
            removeEdge?.(selectedId);
          }
        }
        if (e.key === "Escape") setSelectedId?.(null);
      },
      [readOnly, selectedId, nodes, edges, removeNode, removeEdge, setSelectedId],
    );

    return (
      <div
        ref={canvasRef}
        className={`flex-1 relative overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/40 focus:outline-none ${groupDrawMode ? "cursor-crosshair" : ""}`}
        tabIndex={0}
        onMouseDown={onCanvasMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onWheel={onWheel}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onKeyDown={handleKeyDown}
        data-canvas-bg
      >
        {/* ─── Dot Grid Background ─── */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" data-canvas-bg data-export-hide-grid>
          <defs>
            <pattern id="infra-grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse" patternTransform={`translate(${vx % gridSize}, ${vy % gridSize})`}>
              <circle cx={gridSize / 2} cy={gridSize / 2} r={dotR} fill="rgba(148,163,184,0.35)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#infra-grid)" data-canvas-bg />
        </svg>

        {/* ─── Canvas Transform Layer ─── */}
        <div
          className="absolute origin-top-left"
          style={{
            transform: `translate(${vx}px, ${vy}px) scale(${zoom})`,
            width: "10000px",
            height: "10000px",
          }}
        >
          {/* ─── SVG Edges Layer ─── */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: "10000px", height: "10000px", overflow: "visible" }}>
            <g className="pointer-events-auto">
              {edges.map((edge) => (
                <CanvasEdge
                  key={edge.edgeId}
                  edge={edge}
                  sourceNode={nodeMap[edge.source]}
                  targetNode={nodeMap[edge.target]}
                  isSelected={selectedId === edge.edgeId}
                  readOnly={readOnly}
                  onClick={handleEdgeClick}
                  onControlMouseDown={onEdgeControlMouseDown}
                />
              ))}

              {/* Temporary connection line while dragging */}
              {connecting && connectFrom && (
                <path
                  d={`M ${connectFrom.x} ${connectFrom.y} C ${connectFrom.x + 60} ${connectFrom.y}, ${connecting.mouse.x - 60} ${connecting.mouse.y}, ${connecting.mouse.x} ${connecting.mouse.y}`}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  className="pointer-events-none"
                >
                  <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="0.8s" repeatCount="indefinite" />
                </path>
              )}
            </g>
          </svg>

          {/* ─── Nodes ─── */}
          {nodes.map((node) => (
            <CanvasNode
              key={node.nodeId}
              node={node}
              isSelected={selectedId === node.nodeId}
              readOnly={readOnly}
              onMouseDown={onNodeMouseDown}
              onPortMouseDown={onPortMouseDown}
              onPortMouseUp={onPortMouseUp}
              onResizeMouseDown={onResizeMouseDown}
              onDelete={removeNode}
              onSelect={setSelectedId}
              onUpdateNodeData={onUpdateNodeData}
            />
          ))}
        </div>

        {/* ─── Empty state ─── */}
        {!nodes.length && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" data-canvas-bg>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-200/60 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-500">{readOnly ? "No infrastructure layout configured" : "Drag assets from the sidebar to begin"}</p>
              <p className="text-xs text-slate-400 mt-1">{readOnly ? "" : "Or select a preset template from the toolbar"}</p>
            </div>
          </div>
        )}

        {/* ─── Zoom indicator ─── */}
        <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-500 shadow-sm border border-slate-200/60" data-export-ignore>
          {Math.round(zoom * 100)}%
        </div>
      </div>
    );
  },
);

InfraCanvas.displayName = "InfraCanvas";
export default InfraCanvas;
