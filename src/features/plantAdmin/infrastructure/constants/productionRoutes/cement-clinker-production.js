export const route_cement_clinker_production = {
    name: "Cement Clinker Production",
    description: "Cement clinker production with quarrying, raw meal preparation, kiln processing, and downstream cement use",
    industryType: "CBAM",
    thumbnail: "🏭",
    nodes: [
      // Cycle groups
      { nodeId: "g1", type: "Group", label: "Raw Material Cycle", x: 80, y: 120, data: { text: "Raw Material Cycle", width: 960, height: 420, groupTint: "#EF4444" } },
      { nodeId: "g2", type: "Group", label: "Raw Material Preparation Cycle", x: 1120, y: 120, data: { text: "Raw Material Preparation Cycle", width: 960, height: 420, groupTint: "#F59E0B" } },
      {
        nodeId: "g3",
        type: "Group",
        label: "Core Production Cycle (Clinker Formation)",
        x: 80,
        y: 620,
        data: { text: "Core Production Cycle (Clinker Formation)", width: 960, height: 420, groupTint: "#3B82F6" },
      },
      { nodeId: "g4", type: "Group", label: "Product Finishing Cycle", x: 1120, y: 620, data: { text: "Product Finishing Cycle", width: 960, height: 420, groupTint: "#10B981" } },
      { nodeId: "g5", type: "Group", label: "Energy Consumption Cycle", x: 80, y: 1120, data: { text: "Energy Consumption Cycle", width: 960, height: 420, groupTint: "#6366F1" } },
      {
        nodeId: "g6",
        type: "Group",
        label: "End-of-Life / Downstream Use Cycle",
        x: 1120,
        y: 1120,
        data: { text: "End-of-Life / Downstream Use Cycle", width: 960, height: 420, groupTint: "#A855F7" },
      },

      // 1) Raw Material Cycle
      {
        nodeId: "n1",
        type: "Material Extraction",
        label: "Limestone Quarrying",
        x: 140,
        y: 280,
        data: { scope: 3, category: "Storage & Materials", scopeType: "Scope 3", stepNo: 1, routeType: "CBAM Production Route" },
      },
      {
        nodeId: "n2",
        type: "Material Extraction",
        label: "Clay / Shale Mining",
        x: 320,
        y: 180,
        data: { scope: 3, category: "Storage & Materials", scopeType: "Scope 3", stepNo: 2, routeType: "CBAM Production Route" },
      },
      {
        nodeId: "n3",
        type: "Material Extraction",
        label: "Corrective Materials (Iron Ore / Sand)",
        x: 320,
        y: 360,
        data: { scope: 3, category: "Storage & Materials", scopeType: "Scope 3", stepNo: 3, routeType: "CBAM Production Route" },
      },
      {
        nodeId: "n4",
        type: "Material Transport",
        label: "Raw Material Logistics to Cement Plant",
        x: 570,
        y: 280,
        data: { scope: 3, category: "Transport", scopeType: "Scope 3", stepNo: 4, routeType: "CBAM Production Route" },
      },
      {
        nodeId: "n5",
        type: "Raw Material Storage",
        label: "Limestone Yard / Additive Storage",
        x: 820,
        y: 280,
        data: { scope: 1, category: "Storage & Materials", scopeType: "Scope 1", stepNo: 5, routeType: "CBAM Production Route" },
      },

      // 2) Raw Material Preparation Cycle
      {
        nodeId: "n6",
        type: "Material Processing",
        label: "Limestone Crushing",
        x: 1190,
        y: 180,
        data: { scope: 1, category: "Processing", scopeType: "Scope 1", stepNo: 6, routeType: "CBAM Production Route" },
      },
      {
        nodeId: "n7",
        type: "Material Processing",
        label: "Raw Material Grinding (Raw Mill)",
        x: 1410,
        y: 180,
        data: { scope: 1, category: "Processing", scopeType: "Scope 1", stepNo: 7, routeType: "CBAM Production Route" },
      },
      {
        nodeId: "n8",
        type: "Material Mixing System",
        label: "Raw Meal Blending & Homogenization",
        x: 1410,
        y: 360,
        data: { scope: 1, category: "Processing", scopeType: "Scope 1", stepNo: 8, routeType: "CBAM Production Route" },
      },
      {
        nodeId: "n9",
        type: "Material Transport",
        label: "Raw Meal Transfer to Preheater",
        x: 1790,
        y: 280,
        data: { scope: 1, category: "Transport", scopeType: "Scope 1", stepNo: 9, routeType: "CBAM Production Route" },
      },

      // 3) Core Production Cycle (Clinker Formation)
      {
        nodeId: "n10",
        type: "Thermal Processing Unit",
        label: "Preheater / Precalciner",
        x: 150,
        y: 780,
        data: { scope: 1, category: "Thermal / Combustion", scopeType: "Scope 1", stepNo: 10, routeType: "CBAM Production Route" },
      },
      {
        nodeId: "n11",
        type: "Thermal Processing Unit",
        label: "Rotary Kiln (Clinker Formation)",
        x: 360,
        y: 780,
        data: { scope: 1, category: "Thermal / Combustion", scopeType: "Scope 1", stepNo: 11, routeType: "CBAM Production Route" },
      },
      {
        nodeId: "n12",
        type: "Material Formation",
        label: "Clinker Formation",
        x: 570,
        y: 780,
        data: { scope: 1, category: "Processing", scopeType: "Scope 1", stepNo: 12, routeType: "CBAM Production Route" },
      },
      {
        nodeId: "n13",
        type: "By-product Separation",
        label: "Kiln Dust & Gas Emissions",
        x: 780,
        y: 780,
        data: { scope: 1, category: "Processing", scopeType: "Scope 1", stepNo: 13, routeType: "CBAM Production Route" },
      },

      // 4) Product Finishing Cycle
      {
        nodeId: "n14",
        type: "Cooling System",
        label: "Clinker Cooler",
        x: 1190,
        y: 780,
        data: { scope: 2, category: "Cooling & Utilities", scopeType: "Scope 2", stepNo: 14, routeType: "CBAM Production Route" },
      },
      {
        nodeId: "n15",
        type: "Material Processing",
        label: "Clinker Crushing / Handling",
        x: 1410,
        y: 780,
        data: { scope: 1, category: "Processing", scopeType: "Scope 1", stepNo: 15, routeType: "CBAM Production Route" },
      },
      {
        nodeId: "n16",
        type: "Finished Product Storage",
        label: "Clinker Storage Silo",
        x: 1630,
        y: 780,
        data: { scope: 1, category: "Storage & Materials", scopeType: "Scope 1", stepNo: 16, routeType: "CBAM Production Route" },
      },
      {
        nodeId: "n17",
        type: "Material Transport",
        label: "Clinker Transport to Cement Grinding Unit",
        x: 1850,
        y: 780,
        data: { scope: 3, category: "Transport", scopeType: "Scope 3", stepNo: 17, routeType: "CBAM Production Route" },
      },

      // 5) Energy Consumption Cycle
      {
        nodeId: "n18",
        type: "Electricity Supply",
        label: "Grid / Captive Power",
        x: 140,
        y: 1280,
        data: { scope: 2, category: "Energy Sources & Grid", scopeType: "Scope 2", stepNo: 18, routeType: "CBAM Production Route" },
      },
      {
        nodeId: "n19",
        type: "Fuel Combustion System",
        label: "Coal / Petcoke Combustion in Kiln",
        x: 340,
        y: 1280,
        data: { scope: 1, category: "Thermal / Combustion", scopeType: "Scope 1", stepNo: 19, routeType: "CBAM Production Route" },
      },
      {
        nodeId: "n20",
        type: "Process Gas Handling",
        label: "Waste Heat Recovery / Kiln Gas Handling",
        x: 540,
        y: 1280,
        data: { scope: 1, category: "Energy Sources & Grid", scopeType: "Scope 1", stepNo: 20, routeType: "CBAM Production Route" },
      },
      {
        nodeId: "n21",
        type: "Compressed Air System",
        label: "Air Compressors",
        x: 740,
        y: 1200,
        data: { scope: 2, category: "Power & Electrical", scopeType: "Scope 2", stepNo: 21, routeType: "CBAM Production Route" },
      },
      {
        nodeId: "n22",
        type: "Cooling Water System",
        label: "Water Circulation System",
        x: 740,
        y: 1360,
        data: { scope: 2, category: "Cooling & Utilities", scopeType: "Scope 2", stepNo: 22, routeType: "CBAM Production Route" },
      },

      // 6) End-of-Life / Downstream Use Cycle
      {
        nodeId: "n23",
        type: "Downstream Processing",
        label: "Cement Grinding (Clinker + Gypsum)",
        x: 1240,
        y: 1280,
        data: { scope: 3, category: "Processing", scopeType: "Scope 3", stepNo: 23, routeType: "CBAM Production Route" },
      },
      {
        nodeId: "n24",
        type: "Downstream Use",
        label: "Concrete Production / Construction Use",
        x: 1460,
        y: 1280,
        data: { scope: 3, category: "Other", scopeType: "Scope 3", stepNo: 24, routeType: "CBAM Production Route" },
      },
      {
        nodeId: "n25",
        type: "Recycling Process",
        label: "Concrete Recycling / Aggregate Recovery",
        x: 1680,
        y: 1280,
        data: { scope: 3, category: "Processing", scopeType: "Scope 3", stepNo: 25, routeType: "CBAM Production Route" },
      },
    ],
    edges: [
      // Raw Material Cycle
      { edgeId: "e1", source: "n1", target: "n4", type: "material", label: "Limestone" },
      { edgeId: "e2", source: "n2", target: "n4", type: "material", label: "Clay / Shale" },
      { edgeId: "e3", source: "n3", target: "n4", type: "material", label: "Correctives" },
      { edgeId: "e4", source: "n4", target: "n5", type: "material", label: "Raw Material Logistics" },

      // Raw Material Preparation Cycle
      { edgeId: "e5", source: "n5", target: "n6", type: "material", label: "Limestone Feed" },
      { edgeId: "e6", source: "n6", target: "n7", type: "material", label: "Crushed Mix" },
      { edgeId: "e7", source: "n7", target: "n8", type: "material", label: "Ground Raw Meal" },
      { edgeId: "e8", source: "n8", target: "n9", type: "material", label: "Homogenized Raw Meal" },

      // Core Production Cycle (Clinker Formation)
      { edgeId: "e9", source: "n9", target: "n10", type: "material", label: "Preheater Feed" },
      { edgeId: "e10", source: "n10", target: "n11", type: "material", label: "Calcined Meal" },
      { edgeId: "e11", source: "n11", target: "n12", type: "material", label: "Clinker Nodules" },
      { edgeId: "e12", source: "n12", target: "n13", type: "gas", label: "Dust & Gas Separation" },

      // Product Finishing Cycle
      { edgeId: "e13", source: "n12", target: "n14", type: "material", label: "Hot Clinker" },
      { edgeId: "e14", source: "n14", target: "n15", type: "material", label: "Cooled Clinker" },
      { edgeId: "e15", source: "n15", target: "n16", type: "material", label: "Processed Clinker" },
      { edgeId: "e16", source: "n16", target: "n17", type: "material", label: "Clinker Dispatch" },

      // Utilities into process
      { edgeId: "e17", source: "n18", target: "n7", type: "electrical", label: "Grinding Power" },
      { edgeId: "e18", source: "n18", target: "n11", type: "electrical", label: "Kiln Drives" },
      { edgeId: "e19", source: "n19", target: "n11", type: "energy", label: "Kiln Fuel" },
      { edgeId: "e20", source: "n20", target: "n10", type: "gas", label: "Kiln Gas Handling" },
      { edgeId: "e21", source: "n21", target: "n10", type: "electrical", label: "Compressed Air" },
      { edgeId: "e22", source: "n22", target: "n14", type: "water", label: "Cooling Water" },

      // End-of-Life / Downstream Use Cycle
      { edgeId: "e23", source: "n17", target: "n23", type: "material", label: "Clinker to Grinding" },
      { edgeId: "e24", source: "n23", target: "n24", type: "material", label: "Cement to Concrete Use" },
      { edgeId: "e25", source: "n24", target: "n25", type: "material", label: "Demolition Material" },
    ],
  };
