export const NODE_WIDTH = 120;
export const NODE_HEIGHT = 96;
export const TEXTBOX_WIDTH = 200;
export const TEXTBOX_HEIGHT = 80;
export const GROUP_DEFAULT_WIDTH = 456;
export const GROUP_DEFAULT_HEIGHT = 300;

// ─── Port positions relative to node ────────────────────────────────────────
export const getInputPort = (node) => {
  const w = node.type === "Textbox" ? TEXTBOX_WIDTH : NODE_WIDTH;
  const h = node.type === "Textbox" ? TEXTBOX_HEIGHT : NODE_HEIGHT;
  return { x: node.x, y: node.y + h / 2 };
};
export const getOutputPort = (node) => {
  const w = node.type === "Textbox" ? TEXTBOX_WIDTH : NODE_WIDTH;
  const h = node.type === "Textbox" ? TEXTBOX_HEIGHT : NODE_HEIGHT;
  return { x: node.x + w, y: node.y + h / 2 };
};

// ─── Generate unique IDs ────────────────────────────────────────────────────
let _counter = 0;
export const uid = (prefix = "id") => `${prefix}-${Date.now()}-${++_counter}`;
