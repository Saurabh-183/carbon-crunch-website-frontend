// Map production route categories to predefined NODE_TYPE keys
const CATEGORY_TO_NODE_TYPE = {
  "Storage & Materials": "Raw Material Storage",
  "Thermal / Combustion": "Furnace",
  Processing: "Rolling Mill",
  "Heat Treatment": "Heat Treatment",
  "Power & Electrical": "Transformer",
  "Quality & Output": "Quality Inspection",
};

// Parse "Scope 1" / "Scope 2" / "Scope 3" → numeric 1/2/3
const parseScopeNumber = (scopeType) => {
  const match = String(scopeType || "").match(/(\d)/);
  return match ? Number(match[1]) : null;
};

const createProductionRouteTemplate = ({ name, description, steps, thumbnail = "🧭" }) => {
  // Wide spacing + staggered rows to keep connection labels from overlapping.
  const COLS = 3;
  const X_START = 120;
  const Y_START = 90;
  const X_GAP = 420;
  const Y_GAP = 290;
  const Y_STAGGER = 120;

  const nodes = steps.map((step, index) => {
    const row = Math.floor(index / COLS);
    const col = index % COLS;
    const stagger = (index % 2) * Y_STAGGER;
    return {
      nodeId: `n${index + 1}`,
      type: CATEGORY_TO_NODE_TYPE[step.category] || "Custom Process",
      label: step.name,
      x: X_START + col * X_GAP,
      y: Y_START + row * Y_GAP + stagger,
      data: {
        scope: parseScopeNumber(step.scopeType),
        category: step.category,
        scopeType: step.scopeType,
        stepNo: step.step,
        routeType: "CBAM Production Route",
      },
    };
  });

  const edges = steps.slice(1).map((step, index) => ({
    edgeId: `e${index + 1}`,
    source: `n${index + 1}`,
    target: `n${index + 2}`,
    type: "material",
    label: `${steps[index].name.split("(")[0].trim()} → ${step.name.split("(")[0].trim()}`,
  }));

  return {
    name,
    description,
    industryType: "CBAM",
    thumbnail,
    nodes,
    edges,
  };
};

export { CATEGORY_TO_NODE_TYPE, parseScopeNumber, createProductionRouteTemplate };
