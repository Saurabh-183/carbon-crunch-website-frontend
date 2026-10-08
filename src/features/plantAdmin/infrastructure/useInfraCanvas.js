import { useState, useRef, useCallback } from "react";
import {
  NODE_TYPES,
  NODE_WIDTH,
  NODE_HEIGHT,
  TEXTBOX_WIDTH,
  TEXTBOX_HEIGHT,
  GROUP_DEFAULT_WIDTH,
  GROUP_DEFAULT_HEIGHT,
  getInputPort,
  getOutputPort,
  uid,
  inferEdgeType,
  DEFAULT_CAPACITY_UNITS,
} from "./constants";

/**
 * Lightweight canvas state hook — handles nodes, edges, viewport, drag, and connections.
 * No external dependencies. Pure React state.
 */
export default function useInfraCanvas({ readOnly = false } = {}) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [selectedId, setSelectedId] = useState(null); // node or edge id
  const [connecting, setConnecting] = useState(null); // { sourceId, mouse: {x,y} }
  const [groupDrawMode, setGroupDrawMode] = useState(false);

  const canvasRef = useRef(null);
  const dragRef = useRef(null); // { type: 'node'|'pan', id?, startX, startY, origX, origY }

  // ─── Coordinate helpers ─────────────────────────────────────────
  const screenToCanvas = useCallback(
    (sx, sy) => {
      const { x, y, zoom } = viewport;
      return { x: (sx - x) / zoom, y: (sy - y) / zoom };
    },
    [viewport],
  );

  const canvasOffset = useCallback(() => {
    if (!canvasRef.current) return { left: 0, top: 0 };
    const r = canvasRef.current.getBoundingClientRect();
    return { left: r.left, top: r.top };
  }, []);

  // ─── Node CRUD ──────────────────────────────────────────────────
  const addNode = useCallback(
    (type, label, cx, cy, data = {}) => {
      if (readOnly) return;
      const n = { nodeId: uid("n"), type, label, x: cx, y: cy, data };
      setNodes((prev) => [...prev, n]);
      return n.nodeId;
    },
    [readOnly],
  );

  const removeNode = useCallback(
    (nodeId) => {
      if (readOnly) return;
      setNodes((prev) => prev.filter((n) => n.nodeId !== nodeId));
      setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
      if (selectedId === nodeId) setSelectedId(null);
    },
    [readOnly, selectedId],
  );

  const updateNodeData = useCallback(
    (nodeId, patch) => {
      if (readOnly) return;
      setNodes((prev) => prev.map((n) => (n.nodeId === nodeId ? { ...n, ...patch } : n)));
    },
    [readOnly],
  );

  // ─── Edge CRUD ──────────────────────────────────────────────────
  const addEdge = useCallback(
    (sourceId, targetId, type = "material", label = "") => {
      if (readOnly) return;
      if (sourceId === targetId) return;
      // prevent duplicates
      setEdges((prev) => {
        if (prev.some((e) => e.source === sourceId && e.target === targetId)) return prev;
        return [...prev, { edgeId: uid("e"), source: sourceId, target: targetId, type, label }];
      });
    },
    [readOnly],
  );

  const removeEdge = useCallback(
    (edgeId) => {
      if (readOnly) return;
      setEdges((prev) => prev.filter((e) => e.edgeId !== edgeId));
      if (selectedId === edgeId) setSelectedId(null);
    },
    [readOnly, selectedId],
  );

  const updateEdge = useCallback(
    (edgeId, patch) => {
      if (readOnly) return;
      setEdges((prev) => prev.map((e) => (e.edgeId === edgeId ? { ...e, ...patch } : e)));
    },
    [readOnly],
  );

  // ─── Node Dragging ─────────────────────────────────────────────
  const onNodeMouseDown = useCallback(
    (e, nodeId) => {
      if (readOnly) return;
      e.stopPropagation();
      const node = nodes.find((n) => n.nodeId === nodeId);
      if (!node) return;

      // When starting a drag on a group, find all nodes fully enclosed by this group's bounding box.
      let nestedIds = [];
      if (node.type === "Group") {
        const gw = node.data?.width || GROUP_DEFAULT_WIDTH;
        const gh = node.data?.height || GROUP_DEFAULT_HEIGHT;
        const groupRect = { left: node.x, right: node.x + gw, top: node.y, bottom: node.y + gh };

        nestedIds = nodes
          .filter((n) => {
            if (n.nodeId === nodeId || n.type === "Group") return false;
            // Get candidate node width/height
            const nw = n.type === "Textbox" ? TEXTBOX_WIDTH : NODE_WIDTH;
            const nh = n.type === "Textbox" ? TEXTBOX_HEIGHT : NODE_HEIGHT;
            const nodeRect = { left: n.x, right: n.x + nw, top: n.y, bottom: n.y + nh };

            // Check if node is fully enclosed
            return nodeRect.left >= groupRect.left && nodeRect.right <= groupRect.right && nodeRect.top >= groupRect.top && nodeRect.bottom <= groupRect.bottom;
          })
          .map((n) => n.nodeId);
      }

      dragRef.current = {
        type: "node",
        id: nodeId,
        startX: e.clientX,
        startY: e.clientY,
        origX: node.x,
        origY: node.y,
        nestedIds, // the nodes moving with this group
        origNestedOffsets: nestedIds.map((nid) => {
          const innerNode = nodes.find((n) => n.nodeId === nid);
          return { id: nid, dx: innerNode.x - node.x, dy: innerNode.y - node.y };
        }),
      };
      setSelectedId(nodeId);
    },
    [readOnly, nodes],
  );

  // ─── Node Resizing ─────────────────────────────────────────────
  const onResizeMouseDown = useCallback(
    (e, nodeId) => {
      if (readOnly) return;
      e.stopPropagation();
      const node = nodes.find((n) => n.nodeId === nodeId);
      if (!node) return;
      // When resizing, we don't want nested drag to trigger, but we need origW/origH
      dragRef.current = {
        type: "resize",
        id: nodeId,
        startX: e.clientX,
        startY: e.clientY,
        origW: node.data?.width || GROUP_DEFAULT_WIDTH,
        origH: node.data?.height || GROUP_DEFAULT_HEIGHT,
        nestedIds: [], // Empty for resize so we don't accidentally try to pan children
      };
      setSelectedId(nodeId);
    },
    [readOnly, nodes],
  );

  // ─── Canvas Panning & Drawing ──────────────────────────────────
  const onCanvasMouseDown = useCallback(
    (e) => {
      if (e.target !== e.currentTarget && !e.target.closest("[data-canvas-bg]")) return;

      // If user holds Shift, enter "drawGroup" mode
      if ((e.shiftKey || groupDrawMode) && !readOnly) {
        const off = canvasOffset();
        const startPos = screenToCanvas(e.clientX - off.left, e.clientY - off.top);
        const newGroupId = uid("n");
        addNode("Group", "New Group", startPos.x, startPos.y, { width: 10, height: 10 });

        dragRef.current = {
          type: "drawGroup",
          id: newGroupId,
          startX: startPos.x,
          startY: startPos.y,
        };
        setSelectedId(newGroupId);
        return;
      }

      // Default panning
      dragRef.current = {
        type: "pan",
        startX: e.clientX,
        startY: e.clientY,
        origX: viewport.x,
        origY: viewport.y,
      };
      setSelectedId(null);
    },
    [viewport, readOnly, addNode, canvasOffset, screenToCanvas, groupDrawMode],
  );

  // ─── Edge control-point drag ────────────────────────────────────
  const onEdgeControlMouseDown = useCallback(
    (e, edgeId, cpIndex, cp1, cp2) => {
      if (readOnly) return;
      e.stopPropagation();
      dragRef.current = {
        type: "controlPoint",
        edgeId,
        cpIndex, // 0 = cp1, 1 = cp2
        startX: e.clientX,
        startY: e.clientY,
        origCp1: { ...cp1 },
        origCp2: { ...cp2 },
      };
    },
    [readOnly],
  );

  // ─── Mouse Move (node drag, pan, or control-point drag) ────────
  const onMouseMove = useCallback(
    (e) => {
      // Connection drawing
      if (connecting) {
        const off = canvasOffset();
        const canvasPos = screenToCanvas(e.clientX - off.left, e.clientY - off.top);
        setConnecting((prev) => (prev ? { ...prev, mouse: canvasPos } : null));
        return;
      }

      const d = dragRef.current;
      if (!d) return;

      if (d.type === "node") {
        const dx = (e.clientX - d.startX) / viewport.zoom;
        const dy = (e.clientY - d.startY) / viewport.zoom;

        const mainNewX = d.origX + dx;
        const mainNewY = d.origY + dy;

        setNodes((prev) =>
          prev.map((n) => {
            // Drag the main node
            if (n.nodeId === d.id) {
              return { ...n, x: mainNewX, y: mainNewY };
            }
            // Drag any nested nodes using their original relative offsets
            if (d.nestedIds?.includes(n.nodeId)) {
              const offset = d.origNestedOffsets.find((o) => o.id === n.nodeId);
              return { ...n, x: mainNewX + offset.dx, y: mainNewY + offset.dy };
            }
            return n;
          }),
        );
      } else if (d.type === "resize") {
        const dx = (e.clientX - d.startX) / viewport.zoom;
        const dy = (e.clientY - d.startY) / viewport.zoom;
        setNodes((prev) => prev.map((n) => (n.nodeId === d.id ? { ...n, data: { ...n.data, width: Math.max(100, d.origW + dx), height: Math.max(100, d.origH + dy) } } : n)));
      } else if (d.type === "drawGroup") {
        const off = canvasOffset();
        const currentPos = screenToCanvas(e.clientX - off.left, e.clientY - off.top);
        const minX = Math.min(d.startX, currentPos.x);
        const minY = Math.min(d.startY, currentPos.y);
        const w = Math.max(10, Math.abs(currentPos.x - d.startX));
        const h = Math.max(10, Math.abs(currentPos.y - d.startY));

        setNodes((prev) => prev.map((n) => (n.nodeId === d.id ? { ...n, x: minX, y: minY, data: { ...n.data, width: w, height: h } } : n)));
      } else if (d.type === "pan") {
        setViewport((prev) => ({
          ...prev,
          x: d.origX + (e.clientX - d.startX),
          y: d.origY + (e.clientY - d.startY),
        }));
      } else if (d.type === "controlPoint") {
        const dx = (e.clientX - d.startX) / viewport.zoom;
        const dy = (e.clientY - d.startY) / viewport.zoom;
        const newCp1 = d.cpIndex === 0 ? { x: d.origCp1.x + dx, y: d.origCp1.y + dy } : { ...d.origCp1 };
        const newCp2 = d.cpIndex === 1 ? { x: d.origCp2.x + dx, y: d.origCp2.y + dy } : { ...d.origCp2 };
        setEdges((prev) => prev.map((ed) => (ed.edgeId === d.edgeId ? { ...ed, controlPoints: [newCp1, newCp2] } : ed)));
      }
    },
    [connecting, viewport.zoom, screenToCanvas, canvasOffset],
  );

  const onMouseUp = useCallback(() => {
    if (dragRef.current?.type === "drawGroup") {
      setGroupDrawMode(false);
    }
    dragRef.current = null;
    if (connecting) setConnecting(null);
  }, [connecting]);

  // ─── Zoom (reduced sensitivity) ────────────────────────────────
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    setViewport((prev) => ({
      ...prev,
      zoom: Math.min(3, Math.max(0.2, prev.zoom * delta)),
    }));
  }, []);

  // ─── Connection drawing ────────────────────────────────────────
  const onPortMouseDown = useCallback(
    (e, nodeId, portType) => {
      if (readOnly) return;
      e.stopPropagation();
      if (portType === "output") {
        const node = nodes.find((n) => n.nodeId === nodeId);
        if (!node) return;
        const port = getOutputPort(node);
        setConnecting({ sourceId: nodeId, mouse: port });
      }
    },
    [readOnly, nodes],
  );

  const onPortMouseUp = useCallback(
    (e, nodeId, portType) => {
      e.stopPropagation();
      if (connecting && portType === "input" && connecting.sourceId !== nodeId) {
        // Auto-infer connection type from source & target node types
        const srcNode = nodes.find((n) => n.nodeId === connecting.sourceId);
        const tgtNode = nodes.find((n) => n.nodeId === nodeId);
        const edgeType = inferEdgeType(srcNode?.type || "", tgtNode?.type || "");
        addEdge(connecting.sourceId, nodeId, edgeType);
      }
      setConnecting(null);
    },
    [connecting, addEdge, nodes],
  );

  // ─── Drop from palette ─────────────────────────────────────────
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      if (readOnly) return;
      const data = e.dataTransfer.getData("application/infra-node");
      if (!data) return;
      const { type } = JSON.parse(data);
      const off = canvasOffset();
      const pos = screenToCanvas(e.clientX - off.left, e.clientY - off.top);
      const w = type === "Textbox" ? TEXTBOX_WIDTH : NODE_WIDTH;
      const h = type === "Textbox" ? TEXTBOX_HEIGHT : NODE_HEIGHT;
      // Serial naming: count existing nodes of same type
      const count = nodes.filter((n) => n.type === type).length + 1;
      const serialLabel = count === 1 ? type : `${type} ${count}`;
      // Auto-assign default capacity unit and scope from type definition
      const defaultUnit = DEFAULT_CAPACITY_UNITS[type] || "";
      const typeMeta = NODE_TYPES[type];
      const nodeData = {
        ...(defaultUnit ? { capacityUnit: defaultUnit } : {}),
        ...(typeMeta?.scope != null ? { scope: typeMeta.scope } : {}),
      };
      if (type === "Group") {
        // Create a larger default group on first drop for easier grouping
        addNode(type, serialLabel, pos.x - GROUP_DEFAULT_WIDTH / 2, pos.y - GROUP_DEFAULT_HEIGHT / 2, {
          ...nodeData,
          width: GROUP_DEFAULT_WIDTH,
          height: GROUP_DEFAULT_HEIGHT,
        });
        return;
      }

      addNode(type, serialLabel, pos.x - w / 2, pos.y - h / 2, nodeData);
    },
    [readOnly, addNode, screenToCanvas, canvasOffset, nodes],
  );

  // ─── Load / Reset / Append ──────────────────────────────────────
  const loadLayout = useCallback((layout) => {
    setNodes(layout.nodes || []);
    setEdges(layout.edges || []);
    setViewport({ x: 0, y: 0, zoom: 1 });
    setSelectedId(null);
    setConnecting(null);
    setGroupDrawMode(false);
  }, []);

  const appendTemplate = useCallback(
    (templateNodes = [], templateEdges = []) => {
      if (readOnly) return;

      // Map old node IDs to newly generated ones so connections stay valid internally
      const idMap = {};
      const newNodes = templateNodes.map((pn) => {
        const newId = uid("n");
        idMap[pn.nodeId] = newId;
        // Shift slightly so it doesn't drop exactly on top if they spawn at 0,0
        return { ...pn, nodeId: newId, x: pn.x + 50, y: pn.y + 50 };
      });

      const newEdges = templateEdges.map((pe) => {
        return {
          ...pe,
          edgeId: uid("e"),
          source: idMap[pe.source] || pe.source, // Map source to new node id
          target: idMap[pe.target] || pe.target, // Map target to new node id
        };
      });

      setNodes((prev) => [...prev, ...newNodes]);
      setEdges((prev) => [...prev, ...newEdges]);
    },
    [readOnly],
  );

  const resetCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setViewport({ x: 0, y: 0, zoom: 1 });
    setSelectedId(null);
    setGroupDrawMode(false);
  }, []);

  const fitView = useCallback(() => {
    if (!nodes.length || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxX = Math.max(...nodes.map((n) => n.x + (n.type === "Group" ? n.data?.width || GROUP_DEFAULT_WIDTH : n.type === "Textbox" ? TEXTBOX_WIDTH : NODE_WIDTH)));
    const maxY = Math.max(...nodes.map((n) => n.y + (n.type === "Group" ? n.data?.height || GROUP_DEFAULT_HEIGHT : n.type === "Textbox" ? TEXTBOX_HEIGHT : NODE_HEIGHT)));
    const w = maxX - minX + 100;
    const h = maxY - minY + 100;
    const zoom = Math.min(rect.width / w, rect.height / h, 1.2);
    setViewport({
      x: (rect.width - w * zoom) / 2 - minX * zoom + 50 * zoom,
      y: (rect.height - h * zoom) / 2 - minY * zoom + 50 * zoom,
      zoom,
    });
  }, [nodes]);

  // ─── Export ────────────────────────────────────────────────────
  const exportLayout = useCallback(() => ({ nodes, edges }), [nodes, edges]);

  return {
    nodes,
    edges,
    viewport,
    selectedId,
    connecting,
    groupDrawMode,
    canvasRef,
    setSelectedId,
    addNode,
    removeNode,
    updateNodeData,
    addEdge,
    removeEdge,
    updateEdge,
    onNodeMouseDown,
    onCanvasMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
    onPortMouseDown,
    onPortMouseUp,
    onEdgeControlMouseDown,
    onResizeMouseDown,
    onDragOver,
    onDrop,
    loadLayout,
    appendTemplate,
    resetCanvas,
    fitView,
    exportLayout,
    enableGroupDrawMode: () => setGroupDrawMode(true),
    disableGroupDrawMode: () => setGroupDrawMode(false),
    toggleGroupDrawMode: () => setGroupDrawMode((prev) => !prev),
  };
}
