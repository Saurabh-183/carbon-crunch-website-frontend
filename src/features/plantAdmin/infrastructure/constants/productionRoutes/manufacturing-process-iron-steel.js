import { createProductionRouteTemplate } from "./routeHelpers";

export const route_manufacturing_process_iron_steel = createProductionRouteTemplate({
    name: "Manufacturing Process of Iron & Steel",
    description: "End-to-end iron and steel production route for CBAM mapping",
    thumbnail: "🏭",
    steps: [
      { step: 1, name: "Raw Materials (Iron Ore / Scrap / Coal / Limestone)", category: "Storage & Materials", scopeType: "Scope 3" },
      { step: 2, name: "Iron Making", category: "Thermal / Combustion", scopeType: "Scope 1" },
      { step: 3, name: "Steel Making", category: "Processing", scopeType: "Scope 1" },
      { step: 4, name: "Continuous Casting", category: "Processing", scopeType: "Scope 1" },
      { step: 5, name: "Rolling Mills", category: "Processing", scopeType: "Scope 1" },
      { step: 6, name: "Finishing / Surface Treatment", category: "Heat Treatment", scopeType: "Scope 1" },
      { step: 7, name: "Basic Steel Products", category: "Quality & Output", scopeType: "Scope 3" },
    ],
  });
