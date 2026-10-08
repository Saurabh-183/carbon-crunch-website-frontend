/**
 * Infrastructure Canvas — Node types, edge types, and preset templates.
 * Inspired by BEE Steel Industry Calculator (sidhiee.beeindia.gov.in).
 */

// ─── Node type definitions ──────────────────────────────────────────────────
// Every draggable asset type with icon name, color, and emission scope
export const NODE_TYPES = {
  // ── Raw Materials & Storage ────────────────────────
  "Raw Material Storage": { icon: "Package", color: "#8B5CF6", bg: "#EDE9FE", scope: 3, group: "Storage" },
  "Fuel Storage": { icon: "Fuel", color: "#F59E0B", bg: "#FEF3C7", scope: 1, group: "Storage" },
  "Warehouse/Finished Product Storage": { icon: "Warehouse", color: "#6366F1", bg: "#E0E7FF", scope: null, group: "Storage" },

  // ── Combustion / Thermal (Scope 1) ─────────────────
  Boiler: { icon: "Flame", color: "#EF4444", bg: "#FEE2E2", scope: 1, group: "Thermal" },
  Furnace: { icon: "Flame", color: "#EF4444", bg: "#FEE2E2", scope: 1, group: "Thermal" },
  "Reheating Furnace": { icon: "Flame", color: "#DC2626", bg: "#FEE2E2", scope: 1, group: "Thermal" },
  "Induction Furnace": { icon: "Zap", color: "#DC2626", bg: "#FEE2E2", scope: null, group: "Thermal" },
  Kiln: { icon: "Flame", color: "#EF4444", bg: "#FEE2E2", scope: 1, group: "Thermal" },
  Oven: { icon: "Flame", color: "#F97316", bg: "#FFEDD5", scope: 1, group: "Thermal" },
  Heater: { icon: "Thermometer", color: "#F97316", bg: "#FFEDD5", scope: 1, group: "Thermal" },
  Incinerator: { icon: "Flame", color: "#B91C1C", bg: "#FEE2E2", scope: 1, group: "Thermal" },
  "Flare Stack": { icon: "Flame", color: "#B91C1C", bg: "#FEE2E2", scope: 1, group: "Thermal" },

  // ── Processing / Manufacturing ─────────────────────
  "Rolling Mill": { icon: "Settings", color: "#3B82F6", bg: "#DBEAFE", scope: null, group: "Processing" },
  "Forging Press": { icon: "Hammer", color: "#3B82F6", bg: "#DBEAFE", scope: null, group: "Processing" },
  "Casting Machine": { icon: "Box", color: "#3B82F6", bg: "#DBEAFE", scope: null, group: "Processing" },
  "Continuous Caster": { icon: "ArrowDown", color: "#3B82F6", bg: "#DBEAFE", scope: null, group: "Processing" },
  Ladle: { icon: "Container", color: "#F59E0B", bg: "#FEF3C7", scope: null, group: "Processing" },
  Moulding: { icon: "Square", color: "#6366F1", bg: "#E0E7FF", scope: null, group: "Processing" },
  Machining: { icon: "Wrench", color: "#64748B", bg: "#F1F5F9", scope: null, group: "Processing" },
  Shearing: { icon: "Scissors", color: "#64748B", bg: "#F1F5F9", scope: null, group: "Processing" },

  // ── Heat Treatment ─────────────────────────────────
  "Heat Treatment": { icon: "Thermometer", color: "#F59E0B", bg: "#FEF3C7", scope: null, group: "Treatment" },
  "Cooling Bed": { icon: "Snowflake", color: "#06B6D4", bg: "#CFFAFE", scope: null, group: "Treatment" },
  Quenching: { icon: "Droplets", color: "#06B6D4", bg: "#CFFAFE", scope: null, group: "Treatment" },

  // ── Power & Electrical ─────────────────────────────
  Turbine: { icon: "Zap", color: "#10B981", bg: "#D1FAE5", scope: null, group: "Power" },
  "Steam Turbine": { icon: "Zap", color: "#10B981", bg: "#D1FAE5", scope: null, group: "Power" },
  Generator: { icon: "Zap", color: "#10B981", bg: "#D1FAE5", scope: 1, group: "Power" },
  Transformer: { icon: "Zap", color: "#10B981", bg: "#D1FAE5", scope: null, group: "Power" },
  "Solar Panel Array": { icon: "Sun", color: "#F59E0B", bg: "#FEF3C7", scope: null, group: "Power" },

  // ── Energy Sources & Grid ─────────────────────────
  "Power Grid": { icon: "Zap", color: "#6366F1", bg: "#E0E7FF", scope: 2, group: "Energy" },
  "Wind Turbine": { icon: "Wind", color: "#0EA5E9", bg: "#E0F2FE", scope: null, group: "Energy" },
  "Diesel Generator": { icon: "Zap", color: "#DC2626", bg: "#FEE2E2", scope: 1, group: "Energy" },
  "Energy Source": { icon: "Zap", color: "#F59E0B", bg: "#FEF3C7", scope: null, group: "Energy" },
  "Electricity Output": { icon: "Zap", color: "#10B981", bg: "#D1FAE5", scope: null, group: "Energy" },
  "Consumption Point": { icon: "Zap", color: "#8B5CF6", bg: "#EDE9FE", scope: null, group: "Energy" },
  "Battery Storage": { icon: "Battery", color: "#10B981", bg: "#D1FAE5", scope: null, group: "Energy" },
  Inverter: { icon: "Zap", color: "#6366F1", bg: "#E0E7FF", scope: null, group: "Energy" },
  Substation: { icon: "Zap", color: "#4F46E5", bg: "#E0E7FF", scope: null, group: "Energy" },
  "Smart Meter": { icon: "Gauge", color: "#0EA5E9", bg: "#E0F2FE", scope: null, group: "Energy" },
  Motor: { icon: "Settings", color: "#64748B", bg: "#F1F5F9", scope: null, group: "Energy" },
  "Biogas Plant": { icon: "Leaf", color: "#16A34A", bg: "#DCFCE7", scope: 1, group: "Energy" },
  "Biomass Unit": { icon: "Leaf", color: "#16A34A", bg: "#DCFCE7", scope: 1, group: "Energy" },
  "CHP / Cogeneration": { icon: "Zap", color: "#F59E0B", bg: "#FEF3C7", scope: 1, group: "Energy" },
  "Captive Power Plant": { icon: "Zap", color: "#DC2626", bg: "#FEE2E2", scope: 1, group: "Energy" },

  // ── Cooling & HVAC ────────────────────────────────
  "Cooling Tower": { icon: "Droplets", color: "#06B6D4", bg: "#CFFAFE", scope: null, group: "Utilities" },
  Chiller: { icon: "Snowflake", color: "#06B6D4", bg: "#CFFAFE", scope: null, group: "Utilities" },
  "HVAC System": { icon: "Wind", color: "#06B6D4", bg: "#CFFAFE", scope: null, group: "Utilities" },
  Compressor: { icon: "Wind", color: "#64748B", bg: "#F1F5F9", scope: null, group: "Utilities" },
  Pump: { icon: "Droplets", color: "#3B82F6", bg: "#DBEAFE", scope: null, group: "Utilities" },

  // ── Water & Effluent ───────────────────────────────
  "Water Treatment Plant": { icon: "Droplets", color: "#0EA5E9", bg: "#E0F2FE", scope: null, group: "Utilities" },
  "Effluent Treatment Plant": { icon: "Droplets", color: "#0EA5E9", bg: "#E0F2FE", scope: null, group: "Utilities" },

  // ── Transport ──────────────────────────────────────
  Vehicle: { icon: "Truck", color: "#64748B", bg: "#F1F5F9", scope: 1, group: "Transport" },
  Conveyor: { icon: "ArrowRight", color: "#64748B", bg: "#F1F5F9", scope: null, group: "Transport" },

  // ── Quality & Output ───────────────────────────────
  "Quality Inspection": { icon: "CheckCircle", color: "#10B981", bg: "#D1FAE5", scope: null, group: "Output" },
  Finishing: { icon: "Star", color: "#F59E0B", bg: "#FEF3C7", scope: null, group: "Output" },
  Packaging: { icon: "Package", color: "#8B5CF6", bg: "#EDE9FE", scope: null, group: "Output" },
  Dispatch: { icon: "Truck", color: "#10B981", bg: "#D1FAE5", scope: 3, group: "Output" },

  // ── Generic ────────────────────────────────────────
  "Custom Process": { icon: "Settings", color: "#64748B", bg: "#F1F5F9", scope: null, group: "Other" },

  // ── Production Route Specific ──────────────────────
  "Material Extraction": { icon: "Trash", color: "#64748B", bg: "#F1F5F9", scope: 3, group: "Processing" },
  "Thermal Processing Unit": { icon: "Flame", color: "#EF4444", bg: "#FEE2E2", scope: 1, group: "Thermal" },
  "Material Agglomeration": { icon: "Settings", color: "#3B82F6", bg: "#DBEAFE", scope: 1, group: "Processing" },
  "Material Preparation": { icon: "Settings", color: "#3B82F6", bg: "#DBEAFE", scope: 1, group: "Processing" },
  "Material Charging System": { icon: "ArrowDown", color: "#3B82F6", bg: "#DBEAFE", scope: 1, group: "Processing" },
  "Electrolytic Reactor": { icon: "Zap", color: "#6366F1", bg: "#E0E7FF", scope: 2, group: "Power" },
  "Electric Smelting Furnace": { icon: "Zap", color: "#6366F1", bg: "#E0E7FF", scope: 2, group: "Power" },
  "Material Mixing System": { icon: "Settings", color: "#3B82F6", bg: "#DBEAFE", scope: 1, group: "Processing" },
  "Material Formation": { icon: "Box", color: "#3B82F6", bg: "#DBEAFE", scope: 1, group: "Processing" },
  "Process Gas Handling": { icon: "Wind", color: "#10B981", bg: "#D1FAE5", scope: 1, group: "Energy" },
  "Material Collection": { icon: "Package", color: "#8B5CF6", bg: "#EDE9FE", scope: 3, group: "Storage" },
  "Electric Melting Furnace": { icon: "Zap", color: "#6366F1", bg: "#E0E7FF", scope: 2, group: "Power" },
  "Melting Furnace": { icon: "Flame", color: "#EF4444", bg: "#FEE2E2", scope: 1, group: "Thermal" },
  "Off-Gas Recovery System": { icon: "Wind", color: "#10B981", bg: "#D1FAE5", scope: 1, group: "Energy" },
  "Pre-Reduction Reactor": { icon: "Flame", color: "#EF4444", bg: "#FEE2E2", scope: 1, group: "Thermal" },
  "Reduction Reactor": { icon: "Flame", color: "#EF4444", bg: "#FEE2E2", scope: 1, group: "Thermal" },
  "Combustion Heating System": { icon: "Flame", color: "#EF4444", bg: "#FEE2E2", scope: 1, group: "Thermal" },
  "Smelting Reactor": { icon: "Flame", color: "#EF4444", bg: "#FEE2E2", scope: 1, group: "Thermal" },
  "Metal Formation": { icon: "Hammer", color: "#3B82F6", bg: "#DBEAFE", scope: 1, group: "Processing" },
  "By-product Separation": { icon: "Scissors", color: "#64748B", bg: "#F1F5F9", scope: 1, group: "Processing" },
  "Molten Metal Handling": { icon: "Container", color: "#F59E0B", bg: "#FEF3C7", scope: 1, group: "Processing" },
  "Casting Unit": { icon: "Box", color: "#3B82F6", bg: "#DBEAFE", scope: 1, group: "Processing" },
  "Cooling System": { icon: "Snowflake", color: "#06B6D4", bg: "#CFFAFE", scope: 2, group: "Utilities" },
  "Material/Product Transport": { icon: "Truck", color: "#64748B", bg: "#F1F5F9", scope: 3, group: "Transport" },
  "Electricity Supply": { icon: "Zap", color: "#6366F1", bg: "#E0E7FF", scope: 2, group: "Energy" },
  "Fuel Combustion System": { icon: "Flame", color: "#EF4444", bg: "#FEE2E2", scope: 1, group: "Thermal" },
  "Process Gas Recovery": { icon: "Wind", color: "#10B981", bg: "#D1FAE5", scope: 1, group: "Utilities" },
  "Compressed Air System": { icon: "Wind", color: "#64748B", bg: "#F1F5F9", scope: 2, group: "Utilities" },
  "Cooling Water System": { icon: "Droplets", color: "#06B6D4", bg: "#CFFAFE", scope: 2, group: "Utilities" },
  "Material Transport": { icon: "Truck", color: "#64748B", bg: "#F1F5F9", scope: 3, group: "Transport" },
  "Material Handling": { icon: "Truck", color: "#64748B", bg: "#F1F5F9", scope: 1, group: "Transport" },
  "Refining Reactor": { icon: "Flame", color: "#EF4444", bg: "#FEE2E2", scope: 1, group: "Thermal" },
  "Secondary Metallurgy": { icon: "Settings", color: "#3B82F6", bg: "#DBEAFE", scope: 1, group: "Processing" },
  "Material Processing": { icon: "Settings", color: "#3B82F6", bg: "#DBEAFE", scope: 1, group: "Processing" },
  "Finished Product Storage": { icon: "Warehouse", color: "#6366F1", bg: "#E0E7FF", scope: 1, group: "Storage" },
  "Product Transport": { icon: "Truck", color: "#64748B", bg: "#F1F5F9", scope: 3, group: "Transport" },
  "Downstream Use": { icon: "Star", color: "#64748B", bg: "#F1F5F9", scope: 3, group: "Other" },
  "By-product Utilization": { icon: "RefreshCw", color: "#16A34A", bg: "#DCFCE7", scope: 3, group: "Other" },
  "Downstream Processing": { icon: "Settings", color: "#3B82F6", bg: "#DBEAFE", scope: 3, group: "Processing" },
  "Scrap Generation": { icon: "Trash", color: "#64748B", bg: "#F1F5F9", scope: 3, group: "Output" },
  "Recycling Process": { icon: "RefreshCw", color: "#10B981", bg: "#D1FAE5", scope: 3, group: "Processing" },

  // ── Annotation ────────────────────────────────────
  Textbox: { icon: "Type", color: "#475569", bg: "#F8FAFC", scope: null, group: "Annotation" },
  Group: { icon: "Square", color: "#94A3B8", bg: "#F8FAFC", scope: null, group: "Annotation" },
};

// ─── Grouped for palette sidebar ────────────────────────────────────────────
export const NODE_GROUPS = [
  { key: "Storage", label: "Storage & Materials", icon: "Package" },
  { key: "Thermal", label: "Thermal / Combustion", icon: "Flame" },
  { key: "Processing", label: "Processing", icon: "Settings" },
  { key: "Treatment", label: "Heat Treatment", icon: "Thermometer" },
  { key: "Power", label: "Power & Electrical", icon: "Zap" },
  { key: "Energy", label: "Energy Sources & Grid", icon: "Zap" },
  { key: "Utilities", label: "Cooling & Utilities", icon: "Droplets" },
  { key: "Transport", label: "Transport", icon: "Truck" },
  { key: "Output", label: "Quality & Output", icon: "CheckCircle" },
  { key: "Other", label: "Other", icon: "Settings" },
  { key: "Annotation", label: "Annotation", icon: "Type" },
];

// ─── Edge / Connection types ────────────────────────────────────────────────
export const EDGE_TYPES = {
  material: { color: "#64748B", label: "Material Flow", dash: "" },
  energy: { color: "#F59E0B", label: "Energy", dash: "8 4" },
  steam: { color: "#EF4444", label: "Steam", dash: "4 4" },
  water: { color: "#3B82F6", label: "Water", dash: "6 3" },
  gas: { color: "#10B981", label: "Gas", dash: "10 5" },
  electrical: { color: "#8B5CF6", label: "Electrical", dash: "3 3" },
};

// ─── Auto-infer edge type from source → target node types ───────────────────
const ELECTRICAL_SOURCES = new Set([
  "Transformer",
  "Power Grid",
  "Substation",
  "Inverter",
  "Generator",
  "Solar Panel Array",
  "Wind Turbine",
  "Diesel Generator",
  "Battery Storage",
  "Electricity Output",
  "Captive Power Plant",
  "Smart Meter",
  "Turbine",
  "Electricity Supply",
]);
const STEAM_SOURCES = new Set(["Boiler", "Steam Turbine", "CHP / Cogeneration"]);
const WATER_SOURCES = new Set(["Cooling Tower", "Water Treatment Plant", "Effluent Treatment Plant", "Pump", "Chiller", "Cooling System", "Cooling Water System"]);
const GAS_SOURCES = new Set(["Compressor", "Biogas Plant", "Flare Stack", "Process Gas Recovery", "Compressed Air System"]);
const ENERGY_SOURCES = new Set(["Fuel Storage", "Energy Source", "Biomass Unit"]);

export function inferEdgeType(sourceType, targetType) {
  if (ELECTRICAL_SOURCES.has(sourceType)) return "electrical";
  if (STEAM_SOURCES.has(sourceType)) return "steam";
  if (WATER_SOURCES.has(sourceType)) return "water";
  if (GAS_SOURCES.has(sourceType)) return "gas";
  if (ENERGY_SOURCES.has(sourceType)) return "energy";
  // Reverse: if target is an electrical consumer fed by non-specific source
  if (ELECTRICAL_SOURCES.has(targetType)) return "electrical";
  return "material";
}

