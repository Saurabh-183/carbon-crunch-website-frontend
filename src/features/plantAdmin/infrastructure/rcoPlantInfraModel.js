const STORAGE_PREFIX = "ghgv2:rco-approved-infra";

const safeFacilityId = (facilityId) => String(facilityId || "default");

export const getRcoInfraStorageKey = (facilityId) => `${STORAGE_PREFIX}:${safeFacilityId(facilityId)}`;

export const loadApprovedRcoInfraProfile = (facilityId) => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(getRcoInfraStorageKey(facilityId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveApprovedRcoInfraProfile = (facilityId, profile) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getRcoInfraStorageKey(facilityId), JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent("rco-infra-approved", { detail: { facilityId: safeFacilityId(facilityId), profile } }));
};

const splitCsv = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const makeAsset = (type, name, extra = {}) => ({
  id: `${type.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  type,
  name,
  ...extra,
});

export const createDefaultRcoInfraAnswers = () => ({
  hasTurbine: true,
  turbineName: "10 MW TG",
  turbineCapacity: "10 MW",
  hasBoiler: true,
  boilerName: "Boiler #1",
  boilerCapacity: "60 TPH",
  fuels: "Coal, Biomass",
  hasGrid: true,
  gridName: "Grid / Open Access",
  gridCapacity: "5500 KVA",
  hasOpenAccess: false,
  hasSolar: false,
  solarCapacity: "",
  hasWind: true,
  windCapacity: "2.7 MW",
  hasDg: true,
  dgCapacity: "1250 KVA",
  consumptionDepartments: "Paper Machine, Pulp Machine, ETP",
  auxiliaryLoads: "Auxiliary",
});

export const buildRcoInfraProfile = ({ answers, facilityId, orgIndustry }) => {
  const fuels = splitCsv(answers.fuels);
  const departments = splitCsv(answers.consumptionDepartments);
  const auxiliaryLoads = splitCsv(answers.auxiliaryLoads);

  const boilers = answers.hasBoiler
    ? [makeAsset("Boiler", answers.boilerName || "Boiler", { capacity: answers.boilerCapacity || "", fuels })]
    : [];

  const generationAssets = [];
  if (answers.hasTurbine) generationAssets.push(makeAsset("Steam Turbine", answers.turbineName || "TG Set", { capacity: answers.turbineCapacity || "" }));
  if (answers.hasDg) generationAssets.push(makeAsset("Diesel Generator", "DG Set", { capacity: answers.dgCapacity || "" }));
  if (answers.hasGrid) generationAssets.push(makeAsset("Power Grid", answers.gridName || "Grid", { capacity: answers.gridCapacity || "" }));
  if (answers.hasOpenAccess) generationAssets.push(makeAsset("Power Grid", "Open Access", { capacity: answers.openAccessCapacity || "" }));
  if (answers.hasSolar) generationAssets.push(makeAsset("Solar Panel Array", "Captive Solar", { capacity: answers.solarCapacity || "" }));
  if (answers.hasWind) generationAssets.push(makeAsset("Wind Turbine", "Captive Wind", { capacity: answers.windCapacity || "" }));

  const consumptionAssets = departments.map((name) => makeAsset("Consumption Point", name));
  const auxiliaryAssets = auxiliaryLoads.map((name) => makeAsset("Consumption Point", name, { auxiliary: true }));

  const requests = [
    ...generationAssets.map((asset) => ({
      id: `generation-${asset.id}`,
      type: "generation",
      title: `Upload generation data for ${asset.name}`,
      assetName: asset.name,
      details: asset.capacity || "Monthly generation, import, export, or meter data",
      requiredFiles: ["Generation meter sheet", "Monthly power report"],
    })),
    ...boilers.flatMap((boiler) =>
      (boiler.fuels.length ? boiler.fuels : ["Fuel"]).map((fuel) => ({
        id: `fuel-${boiler.id}-${fuel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        type: "fuel",
        title: `Upload fuel data for ${boiler.name} / ${fuel}`,
        assetName: boiler.name,
        details: boiler.capacity || "Fuel consumed and opening/closing stock",
        requiredFiles: ["Fuel consumption sheet", "Fuel receipt or stock register"],
      })),
    ),
    ...boilers.flatMap((boiler) =>
      (boiler.fuels.length ? boiler.fuels : ["Fuel"]).map((fuel) => ({
        id: `gcv-${boiler.id}-${fuel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        type: "gcv",
        title: `Upload GCV / lab data for ${fuel}`,
        assetName: boiler.name,
        details: "Weighted GCV and supporting lab evidence",
        requiredFiles: ["Lab report", "GCV calculation sheet"],
      })),
    ),
    ...consumptionAssets.map((asset) => ({
      id: `consumption-${asset.id}`,
      type: "consumption",
      title: `Upload consumption data for ${asset.name}`,
      assetName: asset.name,
      details: "Monthly department consumption",
      requiredFiles: ["Department meter sheet", "Consumption summary"],
    })),
  ];

  return {
    facilityId: safeFacilityId(facilityId),
    reportType: "RCO",
    orgIndustry: orgIndustry || "",
    status: "approved",
    approvedAt: new Date().toISOString(),
    assets: {
      boilers,
      fuels,
      generation: generationAssets,
      consumption: consumptionAssets,
      auxiliary: auxiliaryAssets,
    },
    requests,
  };
};

export const buildRcoCanvasLayout = (profile) => {
  const nodes = [];
  const edges = [];
  const addNode = (id, type, label, x, y, data = {}) => {
    nodes.push({ nodeId: id, type, label, x, y, data });
    return id;
  };
  const addEdge = (source, target, type = "energy", label = "") => {
    edges.push({ edgeId: `e-${edges.length + 1}`, source, target, type, label: label || type });
  };

  const busId = addNode("rco-bus", "Bus Bar / Distribution Panel", "CPP Bus", 720, 260, { category: "Energy" });

  profile.assets.fuels.forEach((fuel, index) => {
    addNode(`rco-fuel-${index + 1}`, "Fuel Storage", fuel, 80, 120 + index * 130, { category: "Storage" });
  });

  profile.assets.boilers.forEach((boiler, index) => {
    const boilerId = addNode(`rco-boiler-${index + 1}`, "Boiler", boiler.name, 300, 180 + index * 140, { category: "Thermal", capacity: boiler.capacity, capacityUnit: "TPH" });
    profile.assets.fuels.forEach((_, fuelIndex) => addEdge(`rco-fuel-${fuelIndex + 1}`, boilerId, "fuel", "Fuel"));
    profile.assets.generation
      .filter((asset) => asset.type === "Steam Turbine")
      .forEach((asset, turbineIndex) => {
        const turbineId = `rco-turbine-${turbineIndex + 1}`;
        if (!nodes.some((node) => node.nodeId === turbineId)) {
          addNode(turbineId, asset.type, asset.name, 520, 180 + turbineIndex * 140, { category: "Power", capacity: asset.capacity });
        }
        addEdge(boilerId, turbineId, "steam", "Steam");
        addEdge(turbineId, busId, "energy", "Power");
      });
  });

  profile.assets.generation
    .filter((asset) => asset.type !== "Steam Turbine")
    .forEach((asset, index) => {
      const id = `rco-generation-${index + 1}`;
      addNode(id, asset.type, asset.name, 520, 20 + index * 110, { category: "Energy", capacity: asset.capacity });
      addEdge(id, busId, "energy", "Power");
    });

  [...profile.assets.consumption, ...profile.assets.auxiliary].forEach((asset, index) => {
    const id = `rco-consumption-${index + 1}`;
    addNode(id, "Consumption Point", asset.name, 960, 120 + index * 110, { category: asset.auxiliary ? "Auxiliary" : "Consumption" });
    addEdge(busId, id, "energy", "Consumption");
  });

  return { nodes, edges };
};
