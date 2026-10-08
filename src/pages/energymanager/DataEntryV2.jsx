import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Sheet, Send, Trash2, CheckCircle, Clock, AlertCircle, SendHorizontal, Building2, Info, X } from "lucide-react";
import api from "../../utils/api";
import { resolveBaseUrl } from "../../utils/baseUrl";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import ModuleSidebar from "../../features/energyManager/data-entry/ModuleSidebar";
import ModuleEntryTable from "../../features/energyManager/data-entry/ModuleEntryTable";
import {
  MODULES,
  SERVICE_SECTOR_MODULES,
  CONSOLIDATED_SERVICE_SECTOR_MODULES,
  SCOPE1_REFRIGERANT_FACTOR_ROWS,
  getModuleByKey,
  buildEmptyEntry,
  buildModuleSubmissionPayload,
  extractModuleEntries,
  MODULE_ASSET_CATEGORIES,
  ASSET_FUEL_CONTEXT,
} from "../../features/energyManager/data-entry/moduleConfig";
import { buildBulkDraftPayload, buildBulkScopeData, expandReportingScopes } from "../../features/energyManager/data-entry/utils";
import SectionHeader from "../../components/rf/Header";
import Loader from "../../components/rf/Loader";
import { isServiceSectorIndustry } from "../../utils/uiTerminology";

const MOCK_ENTRIES_V2 = [
  // Module A: stationary_combustion
  { id: "e8b4a1f2", module: "stationary_combustion", date: new Date().toISOString().split("T")[0], source: "Diesel", consumption: 500, unit: "Litres", measurementMethod: "Invoice", status: "draft", scope: "Scope 1", scopeKey: "scope1", emissions: 1340 },
  { id: "c7d3b2e1", module: "stationary_combustion", date: new Date().toISOString().split("T")[0], source: "Natural Gas", consumption: 1200, unit: "m³", measurementMethod: "Meter", status: "draft", scope: "Scope 1", scopeKey: "scope1", emissions: 2424 },

  // Module B: electrical_power
  { id: "a1f2b3c4", module: "electrical_power", date: new Date().toISOString().split("T")[0], activityType: "Purchased", activityGroup: "Grid", consumption: 15000, unit: "kWh", measurementMethod: "EB Bill", status: "draft", scope: "Scope 2", scopeKey: "scope2", emissions: 10740 },

  // Module C: production_activity
  { id: "9d8e7f6a", module: "production_activity", date: new Date().toISOString().split("T")[0], activityType: "Cement", consumption: 5000, unit: "Tonnes", measurementMethod: "ERP", status: "draft", scope: null, scopeKey: "scope1", emissions: 0 },

  // Module D: logistics_transportation
  { id: "5b6c7d8e", module: "logistics_transportation", date: new Date().toISOString().split("T")[0], activityType: "Company Owned", activityGroup: "Road", activityCategory: "Car", source: "Fuel-Based", consumption: 200, unit: "Litres", measurementMethod: "Invoice", status: "draft", scope: "Scope 1", scopeKey: "scope1", emissions: 536 },

  // Module E: scope3_value_chain
  { id: "1a2b3c4d", module: "scope3_value_chain", date: new Date().toISOString().split("T")[0], activityType: "1 - Purchased Goods & Services", activityGroup: "Raw Steel", source: "Quantity-Based", consumption: 50, unit: "Tonnes", measurementMethod: "Supplier Data", status: "draft", scope: "Scope 3", scopeKey: "scope3", emissions: 95000 },

  // Module F: process_fugitive
  { id: "f1e2d3c4", module: "process_fugitive", date: new Date().toISOString().split("T")[0], activityType: "Fugitive Emission", source: "CH₄", consumption: 15, unit: "kg", measurementMethod: "Estimate", status: "draft", scope: "Scope 1", scopeKey: "scope1", emissions: 420 },

  // Service Sector - Electricity
  { id: "b2c3d4e5", module: "electricity_grid", date: new Date().toISOString().split("T")[0], consumption: 8000, unit: "kWh", measurementMethod: "EB Bill", status: "draft", scope: "Scope 2", scopeKey: "scope2", emissions: 5760 },
  { id: "e5d4c3b2", module: "electricity_renewable", date: new Date().toISOString().split("T")[0], activityType: "Solar", consumption: 2000, unit: "kWh", measurementMethod: "Meter", status: "draft", scope: "Scope 2", scopeKey: "scope2", emissions: 0 },
  { id: "8f7e6d5c", module: "electricity_diesel_generator", date: new Date().toISOString().split("T")[0], source: "Diesel", consumption: 300, unit: "Litres", measurementMethod: "Invoice", status: "draft", scope: "Scope 1", scopeKey: "scope1", emissions: 804 },
  
  // Service Sector - Travel
  { id: "4a5b6c7d", module: "travel_personal_vehicle", date: new Date().toISOString().split("T")[0], activityType: "Car", source: "Distance-Based", consumption: 45, unit: "km", measurementMethod: "Claim", status: "draft", scope: "Scope 1", scopeKey: "scope1", emissions: 8.5 },
  { id: "7d6c5b4a", module: "travel_air", date: new Date().toISOString().split("T")[0], activityType: "Economy", activityGroup: "Domestic", consumption: 1200, unit: "km", measurementMethod: "Ticket", status: "draft", scope: "Scope 3", scopeKey: "scope3", emissions: 295 },
  { id: "1f2e3d4c", module: "travel_railway", date: new Date().toISOString().split("T")[0], activityType: "Intercity", consumption: 400, unit: "km", measurementMethod: "Ticket", status: "draft", scope: "Scope 3", scopeKey: "scope3", emissions: 14 },
  { id: "4c3d2e1f", module: "travel_roadways", date: new Date().toISOString().split("T")[0], activityType: "Cab", consumption: 35, unit: "km", measurementMethod: "Invoice", status: "draft", scope: "Scope 3", scopeKey: "scope3", emissions: 6.5 },
  { id: "9a8b7c6d", module: "travel_hotel_stay", date: new Date().toISOString().split("T")[0], activityType: "Hotel", activityGroup: "4 Star", consumption: 2, unit: "Night", measurementMethod: "Invoice", status: "draft", scope: "Scope 3", scopeKey: "scope3", emissions: 60 },
  { id: "d6c7b8a9", module: "travel", date: new Date().toISOString().split("T")[0], travelType: "Air Travel", activityType: "Economy", activityGroup: "Domestic", source: "Distance-Based", consumption: 1200, unit: "km", measurementMethod: "Ticket", status: "draft", scope: "Scope 3", scopeKey: "scope3", emissions: 295 },
  
  // Service Sector - Gas & Fuel
  { id: "3e4f5g6h", module: "gas_fuel_cooking", date: new Date().toISOString().split("T")[0], source: "LPG", consumption: 45, unit: "kg", measurementMethod: "Invoice", status: "draft", scope: "Scope 1", scopeKey: "scope1", emissions: 131.85 },
  { id: "6h5g4f3e", module: "gas_fuel_gases", date: new Date().toISOString().split("T")[0], activityType: "Residential A/C (Window Unit)", source: "R32", activityGroup: "Annual Leak Rate", unit: "%/year", consumption: 2, measurementMethod: "Estimate", status: "draft", scope: "Scope 1", scopeKey: "scope1", emissions: 13.5 },
  
  // Service Sector - Office Supplies
  { id: "8i7u6y5t", module: "office_supplies_paper", date: new Date().toISOString().split("T")[0], source: "Paper (Exam/Audit)", consumption: 15, unit: "kg", measurementMethod: "Invoice", status: "draft", scope: "Scope 3", scopeKey: "scope3", emissions: 14 },
  { id: "5t6y7u8i", module: "office_supplies_it_hardware", date: new Date().toISOString().split("T")[0], source: "IT Hardware", consumption: 5, unit: "unit", measurementMethod: "Invoice", status: "draft", scope: "Scope 3", scopeKey: "scope3", emissions: 1200 },
  
  // Service Sector - Waste
  { id: "9p0o1i2u", module: "waste_paper", date: new Date().toISOString().split("T")[0], activityType: "Recycled", consumption: 10, unit: "kg", measurementMethod: "Estimate", status: "draft", scope: "Scope 3", scopeKey: "scope3", emissions: 0.2 },
  { id: "2u1i0o9p", module: "waste", date: new Date().toISOString().split("T")[0], wasteType: "Paper Waste", activityType: "Recycled", consumption: 10, unit: "kg", measurementMethod: "Estimate", status: "draft", scope: "Scope 3", scopeKey: "scope3", emissions: 0.2 },
  
  // Service Sector - Prof Services
  { id: "7q8w9e0r", module: "professional_services", date: new Date().toISOString().split("T")[0], serviceType: "Memberships/Fees", consumption: 50000, unit: "INR", measurementMethod: "Invoice", status: "draft", scope: "Scope 3", scopeKey: "scope3", emissions: 60 },
];

const toUniqueList = (values = []) => Array.from(new Set(values.filter(Boolean)));
const normalizeCategoryKey = (value = "") => String(value).trim().toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-");
const listSignature = (values) => (Array.isArray(values) ? values.map((v) => String(v)).sort().join("|") : "");
const EXCLUDED_SERVICE_SECTOR_MODULE_KEYS = new Set();
const EMPTY_MODULE_KEYS = Object.freeze([]);
const NET_METERING_MODULE_KEY = "electricity_net_metering";
const DEFAULT_GRID_EF = 0.72;
const SCOPE1_REFRIGERANT_MODULE_KEY = "gas_fuel_gases";
const SCOPE1_REFRIGERANT_FIELD_ORDER = ["activityType", "source", "activityGroup", "activityCategory", "unit"];
const PERSONAL_VEHICLE_INPUT_METHOD_OPTIONS = Object.freeze(["Fuel-Based", "Distance-Based"]);
const PERSONAL_VEHICLE_UNIT_OPTIONS_BY_METHOD = Object.freeze({
  "Fuel-Based": ["Litres", "Gallons"],
  "Distance-Based": ["km", "Miles"],
});
const PERSONAL_VEHICLE_ALL_UNIT_OPTIONS = Object.freeze([
  ...PERSONAL_VEHICLE_UNIT_OPTIONS_BY_METHOD["Fuel-Based"],
  ...PERSONAL_VEHICLE_UNIT_OPTIONS_BY_METHOD["Distance-Based"],
]);

const toFiniteNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getScope1RefrigerantColumnOptions = (columnKey, entry = {}) => {
  if (!SCOPE1_REFRIGERANT_FIELD_ORDER.includes(columnKey)) return null;

  const fieldIndex = SCOPE1_REFRIGERANT_FIELD_ORDER.indexOf(columnKey);
  const prerequisiteFields = SCOPE1_REFRIGERANT_FIELD_ORDER.slice(0, fieldIndex);

  const matchingRows = SCOPE1_REFRIGERANT_FACTOR_ROWS.filter((row) =>
    prerequisiteFields.every((field) => {
      const selected = String(entry?.[field] || "").trim();
      if (!selected) return true;
      return String(row[field] || "").trim() === selected;
    }),
  );

  const scopedRows = matchingRows.length ? matchingRows : SCOPE1_REFRIGERANT_FACTOR_ROWS;
  return toUniqueList(scopedRows.map((row) => row[columnKey]));
};

const applyScope1RefrigerantCascade = (entry = {}, changedKey = "", moduleKey = "") => {
  if (moduleKey !== SCOPE1_REFRIGERANT_MODULE_KEY) return entry;
  if (!SCOPE1_REFRIGERANT_FIELD_ORDER.includes(changedKey)) return entry;

  const next = { ...entry };
  const changedIndex = SCOPE1_REFRIGERANT_FIELD_ORDER.indexOf(changedKey);

  SCOPE1_REFRIGERANT_FIELD_ORDER.slice(changedIndex + 1).forEach((field) => {
    next[field] = "";
  });
  next.emissionFactor = "";

  // Auto-select constrained downstream fields when only one valid option remains.
  SCOPE1_REFRIGERANT_FIELD_ORDER.slice(changedIndex + 1).forEach((field) => {
    const options = getScope1RefrigerantColumnOptions(field, next);
    if (Array.isArray(options) && options.length === 1) {
      next[field] = options[0];
    }
  });

  const matchedRow = SCOPE1_REFRIGERANT_FACTOR_ROWS.find((row) =>
    SCOPE1_REFRIGERANT_FIELD_ORDER.every((field) => String(row[field] || "").trim() === String(next[field] || "").trim()),
  );

  if (matchedRow && Number.isFinite(Number(matchedRow.emissionFactor))) {
    next.emissionFactor = Number(matchedRow.emissionFactor);
  }

  return next;
};

const deriveNetMeteringEffectiveUnits = (entry = {}) => {
  const totalUnits = toFiniteNumber(entry.consumption, 0);
  const importFromGrid = toFiniteNumber(entry.importFromGridKwh, totalUnits);
  const exportToGrid = toFiniteNumber(entry.exportToGridKwh, 0);
  const renewablePurchased = toFiniteNumber(entry.renewablePurchasedKwh, 0);
  const meteringType = String(entry.netMeteringType || "No Renewable (Grid Only)");

  switch (meteringType) {
    case "Net Metering (One-to-One)":
      return Math.max(0, importFromGrid - exportToGrid);
    case "With Renewable Purchases":
      return Math.max(0, importFromGrid - renewablePurchased);
    case "Net Billing":
    case "Gross Metering":
    case "No Renewable (Grid Only)":
    default:
      return importFromGrid;
  }
};

const applyNetMeteringDerivedValues = (entry = {}, moduleKey = "") => {
  if (moduleKey !== NET_METERING_MODULE_KEY) return entry;

  const gridEf = toFiniteNumber(entry.displayEmissionFactor, DEFAULT_GRID_EF);
  const totalUnits = toFiniteNumber(entry.consumption, 0);
  const effectiveUnits = deriveNetMeteringEffectiveUnits(entry);
  const effectiveEf = totalUnits > 0 ? (effectiveUnits * gridEf) / totalUnits : gridEf;

  return {
    ...entry,
    source: "Grid Electricity",
    displayEmissionFactor: Number.isFinite(gridEf) ? String(Number(gridEf.toFixed(6))) : String(DEFAULT_GRID_EF),
    emissionFactor: Number.isFinite(effectiveEf) ? Number(effectiveEf.toFixed(6)) : "",
  };
};

const normalizeEnergyProfiles = (asset = {}) => {
  const explicit = Array.isArray(asset.energyProfiles) ? asset.energyProfiles : [];
  const normalizedExplicit = explicit
    .map((item) => ({
      sourceType: String(item?.sourceType || "").trim(),
      unit: String(item?.unit || "").trim(),
    }))
    .filter((item) => item.sourceType);

  if (normalizedExplicit.length) return normalizedExplicit;

  const fuelSources = Array.isArray(asset.fuelSources)
    ? asset.fuelSources
    : String(asset.fuelSources || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

  if (!fuelSources.length) return [];
  const unit = String(asset.capacityUnit || "").trim();
  return fuelSources.map((sourceType) => ({ sourceType, unit }));
};

const REFRIGERANT_FINDER_DATA = {
  "Air Conditioner": {
    Daikin: "R32, R410A",
    LG: "R32",
    Voltas: "R32, R410A, R22",
    "Blue Star": "R32, R410A, R290 blend",
    Hitachi: "R410A, R32",
    Carrier: "R410A, R32",
    Samsung: "R32",
    Godrej: "R32, R290",
    Panasonic: "R32",
    Lloyd: "R32",
    "O General": "R410A, R32",
    Haier: "R32, R410A",
    Cruise: "R32",
    Mitsubishi: "R32",
  },
  Refrigerator: {
    LG: "R600a",
    Samsung: "R600a",
    Whirlpool: "R600a",
    Haier: "R600a, R290",
    Godrej: "R600a, R290",
    Panasonic: "R600a",
    Bosch: "R600a",
    Electrolux: "R600a",
    Hitachi: "R600a",
    Videocon: "R600a",
    IFB: "R600a",
    Kelvinator: "R600a",
    "Blue Star": "R290, R290A, R600a",
    Voltas: "R290, R134a",
  },
};

const DataEntry = ({ statusOverride, includeModuleKeys = null, excludeModuleKeys = EMPTY_MODULE_KEYS, hideModuleSidebar = false } = {}) => {
  const { user } = useAuth();
  const userIndustry = user?.organizationId?.industry || user?.organizationIndustry || "";
  const [resolvedIndustry, setResolvedIndustry] = useState(userIndustry);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const statusFilter = statusOverride || searchParams.get("status");
  const selectedCategory = searchParams.get("category") || "";
  const selectedScope = searchParams.get("scope") || "";
  const rawRejectedView = statusFilter === "rejected";
  const isStatusForced = Boolean(statusOverride);

  // Facility & loading
  const [facilityInfo, setFacilityInfo] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Reporting period
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
  const reportingPeriodStart = selectedFacility?.reportingPeriod?.startDate ? new Date(selectedFacility.reportingPeriod.startDate) : null;
  const reportingPeriodEnd = selectedFacility?.reportingPeriod?.endDate ? new Date(selectedFacility.reportingPeriod.endDate) : null;

  useEffect(() => {
    if (reportingPeriodStart && reportingPeriodEnd) {
      const startIso = reportingPeriodStart.toISOString().split("T")[0];
      const endIso = reportingPeriodEnd.toISOString().split("T")[0];
      setSelectedPeriod(`${startIso}_to_${endIso}`);
    }
  }, [selectedFacility?._id]);

  const isServiceSector = isServiceSectorIndustry(resolvedIndustry || userIndustry);
  const isRejectedView = !isServiceSector && rawRejectedView;
  const includeModuleKeysSignature = useMemo(() => listSignature(includeModuleKeys), [includeModuleKeys]);
  const excludeModuleKeysSignature = useMemo(() => listSignature(excludeModuleKeys), [excludeModuleKeys]);
  const moduleSet = useMemo(() => {
    let baseSet;
    if (isServiceSector) {
      const sourceSet = user?.dataEntryStyle === "scope" ? CONSOLIDATED_SERVICE_SECTOR_MODULES : SERVICE_SECTOR_MODULES;
      baseSet = sourceSet.filter((mod) => !EXCLUDED_SERVICE_SECTOR_MODULE_KEYS.has(mod.key));
    } else {
      baseSet = MODULES;
    }

    const includedSet = Array.isArray(includeModuleKeys) && includeModuleKeys.length ? baseSet.filter((mod) => includeModuleKeys.includes(mod.key)) : baseSet;

    if (Array.isArray(excludeModuleKeys) && excludeModuleKeys.length) {
      return includedSet.filter((mod) => !excludeModuleKeys.includes(mod.key));
    }

    return includedSet;
  }, [isServiceSector, includeModuleKeysSignature, excludeModuleKeysSignature, user?.dataEntryStyle]);

  // ─── Dynamic modules filtered by boundary scopes ────────────
  const enabledModules = useMemo(() => {
    if (isServiceSector) {
      if (user?.dataEntryStyle === "scope") {
        const activeScope = selectedScope || "Scope 1";
        const filteredByScope = moduleSet.filter((mod) => (mod.scope || "Scope 3") === activeScope);
        return filteredByScope.length ? filteredByScope : moduleSet;
      } else {
        if (!selectedCategory) return moduleSet;
        const filteredByCategory = moduleSet.filter((mod) => normalizeCategoryKey(mod.category) === selectedCategory);
        return filteredByCategory.length ? filteredByCategory : moduleSet;
      }
    }

    const facilityScopes = expandReportingScopes(selectedFacility?.reportingScopes || []);
    // If no scopes configured yet, show all modules (graceful fallback)
    if (!facilityScopes.length) return moduleSet;
    return moduleSet.filter((mod) => {
      // Modules with scope:null (e.g. Production Activity) always visible
      if (!mod.scope) return true;
      return facilityScopes.includes(mod.scope);
    });
  }, [selectedFacility?.reportingScopes, isServiceSector, moduleSet, selectedCategory, selectedScope, user?.dataEntryStyle]);

  // Active module tab
  const [activeModule, setActiveModule] = useState(moduleSet[0].key);
  const activeModuleConfig = useMemo(() => getModuleByKey(activeModule, moduleSet) || moduleSet[0], [activeModule, moduleSet]);

  // If active module gets hidden when scopes change, fallback to first visible
  useEffect(() => {
    if (enabledModules.length && !enabledModules.some((m) => m.key === activeModule)) {
      setActiveModule(enabledModules[0].key);
    }
  }, [enabledModules, activeModule]);

  // All entries from the server
  const [allEntries, setAllEntries] = useState(MOCK_ENTRIES_V2);

  // New entry form state (per active module)
  const [newEntry, setNewEntry] = useState(() => applyNetMeteringDerivedValues(buildEmptyEntry(moduleSet[0].key, moduleSet), moduleSet[0].key));

  // Force mock data injection (helpful for Hot Reloads where useState preserves empty state)
  useEffect(() => {
    if (allEntries.length === 0) {
      setAllEntries(MOCK_ENTRIES_V2);
    }
  }, [allEntries.length]);

  // Editing state
  const [editingRowId, setEditingRowId] = useState(null);
  const [editSnapshots, setEditSnapshots] = useState({});
  const [selectedEntryIds, setSelectedEntryIds] = useState(new Set());
  const [expandedBulkKeys, setExpandedBulkKeys] = useState(new Set());
  const [assetOptions, setAssetOptions] = useState([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [showGasesInfo, setShowGasesInfo] = useState(false);
  const [showRefrigerantFinder, setShowRefrigerantFinder] = useState(false);
  const [finderAppliance, setFinderAppliance] = useState("");
  const [finderBrand, setFinderBrand] = useState("");
  const gasesInfoButtonRef = useRef(null);
  const [gasesInfoPopoverPos, setGasesInfoPopoverPos] = useState({ top: 100, left: 100 });

  const finderBrandOptions = useMemo(() => {
    if (!finderAppliance) return [];
    return Object.keys(REFRIGERANT_FINDER_DATA[finderAppliance] || {});
  }, [finderAppliance]);

  const finderProbableRefrigerant = useMemo(() => {
    if (!finderAppliance || !finderBrand) return "";
    return REFRIGERANT_FINDER_DATA[finderAppliance]?.[finderBrand] || "";
  }, [finderAppliance, finderBrand]);

  // Dynamic Product Options (from Org Admin)
  const productOptions = useMemo(() => {
    if (!selectedFacility?.systemBoundaryProducts) return [];
    return selectedFacility.systemBoundaryProducts.map((p) => ({ value: p, label: p }));
  }, [selectedFacility?.systemBoundaryProducts]);

  // Reset form when module changes
  useEffect(() => {
    setNewEntry(applyNetMeteringDerivedValues(buildEmptyEntry(activeModule, moduleSet), activeModule));
    setEditingRowId(null);
    setEditSnapshots({});
    setSelectedEntryIds(new Set());
    setExpandedBulkKeys(new Set());
    setFileInputKey((prev) => prev + 1);
  }, [activeModule, moduleSet]);

  useEffect(() => {
    const fetchOrganizationIndustry = async () => {
      const orgId = user?.organizationId?._id || user?.organizationId;
      if (!orgId) return;

      try {
        const res = await api.get(`/api/organizations/${orgId}`);
        const org = res.data?.data || res.data;
        if (org?.industry) setResolvedIndustry(org.industry);
      } catch (error) {
        console.error("Error fetching organization industry:", error);
      }
    };

    fetchOrganizationIndustry();
  }, [user?.organizationId]);

  // Auto-dismiss messages
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ------ Facility Loading ------
  useEffect(() => {
    const userFacilityId = user?.facilities?.[0]?.facilityId?._id || user?.facilities?.[0]?.facilityId;
    if (userFacilityId) {
      fetchFacilityById(userFacilityId);
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFacilityById = async (facilityId) => {
    try {
      const facilityRes = await api.get(`/api/facilities/${facilityId}`);
      const facilityData = facilityRes.data?.data || facilityRes.data;
      setFacilityInfo(facilityData);
      setSelectedFacility(facilityData);
    } catch (error) {
      console.error("Error fetching facility:", error);
      setMessage({ type: "error", text: "Failed to load facility" });
    } finally {
      setLoading(false);
    }
  };

  // ------ Data Fetching ------
  useEffect(() => {
    if (!selectedFacility?._id) {
      setAllEntries([]);
      return;
    }
    fetchEntries();
    fetchAssets();
  }, [selectedFacility?._id, moduleSet]);

  const fetchEntries = async () => {
    try {
      if (!selectedFacility?._id) {
        setAllEntries(MOCK_ENTRIES_V2);
        return;
      }
      const queryParams = selectedFacility._id ? `?facilityId=${selectedFacility._id}` : "";
      const res = await api.get(`/api/submissions${queryParams}`);
      const submissions = res.data?.data || [];
      const entries = submissions.flatMap((sub) => extractModuleEntries(sub, moduleSet));
      // Deduplicate
      const unique = new Map();
      entries.forEach((e) => {
        const key = `${e.submissionId}-${e.scopeKey}-${e.sectionIndex}-${e.activityIndex}-${e.sourceIndex}`;
        if (!unique.has(key)) unique.set(key, e);
      });
      const combinedEntries = [...Array.from(unique.values()), ...MOCK_ENTRIES_V2];
      setAllEntries(combinedEntries);
    } catch (error) {
      console.error("Error fetching entries:", error);
      setAllEntries(MOCK_ENTRIES_V2);
    }
  };

  const fetchAssets = async () => {
    try {
      if (!selectedFacility?._id) {
        setAssetOptions([]);
        return;
      }
      // Fetch entities from the infrastructure canvas layout
      const res = await api.get(`/api/infra-layouts/entities?facilityId=${selectedFacility._id}`);
      const assets = res.data?.data?.assets || [];
      const options = [
        { value: "Other", label: "Other" },
        ...assets.map((asset) => {
          const label = asset.capacityUnit ? `${asset.assetName} (${asset.category}${asset.capacity ? ` – ${asset.capacity} ${asset.capacityUnit}` : ""})` : asset.assetName || asset.category;
          return {
            value: asset.assetId || asset._id,
            label,
            scope: asset.scope || null,
            category: asset.category || "",
            energyProfiles: normalizeEnergyProfiles(asset),
          };
        }),
      ];
      setAssetOptions(options);
    } catch (error) {
      console.error("Error fetching assets from infra canvas:", error);
      setAssetOptions([{ value: "Other", label: "Other" }]);
    }
  };

  // ------ Filtered entries for active module ------
  const filteredEntries = useMemo(() => {
    const scopedEntries = allEntries.filter((entry) => {
      const matchesModule = entry.module === activeModule;
      const matchesStatus = isRejectedView ? entry.status === "rejected" : true;
      return matchesModule && matchesStatus;
    });

    if (!isServiceSector) return scopedEntries;

    return scopedEntries.map((entry) => {
      if (entry.status === "approved") {
        return { ...entry, status: "submitted" };
      }
      if (entry.status === "rejected") {
        return { ...entry, status: "draft" };
      }
      return entry;
    });
  }, [allEntries, activeModule, isRejectedView]);

  const scopedAssetOptions = useMemo(() => {
    const moduleScope = activeModuleConfig?.scope || null;
    const allowedCategories = MODULE_ASSET_CATEGORIES[activeModule] || null;

    const filtered = assetOptions.filter((opt) => {
      if (opt.value === "Other") return true;
      // Filter by scope when module has one
      if (moduleScope && opt.scope && opt.scope !== moduleScope) return false;
      // Filter by asset category when module has a category whitelist
      if (allowedCategories && opt.category && !allowedCategories.has(opt.category)) return false;
      return true;
    });

    return filtered.length ? filtered : [{ value: "Other", label: "Other" }];
  }, [assetOptions, activeModuleConfig?.scope, activeModule]);

  const assetMetaById = useMemo(() => {
    const map = new Map();
    assetOptions.forEach((option) => {
      if (option?.value) map.set(option.value, option);
    });
    return map;
  }, [assetOptions]);

  const getEntrySpecificColumnOptions = useCallback(
    (columnKey, entry) => {
      const baseOptions = activeModule === "production_activity" && columnKey === "activityType" ? productOptions : columnKey === "assetId" ? scopedAssetOptions : undefined;

      if (activeModule === SCOPE1_REFRIGERANT_MODULE_KEY) {
        const refrigerantOptions = getScope1RefrigerantColumnOptions(columnKey, entry);
        if (Array.isArray(refrigerantOptions)) return refrigerantOptions;
      }

      if (activeModule === "travel_personal_vehicle") {
        if (columnKey === "source") {
          return PERSONAL_VEHICLE_INPUT_METHOD_OPTIONS;
        }
        if (columnKey === "unit") {
          const selectedMethod = String(entry?.source || "").trim();
          const unitOptions = PERSONAL_VEHICLE_UNIT_OPTIONS_BY_METHOD[selectedMethod];
          return Array.isArray(unitOptions) && unitOptions.length ? unitOptions : PERSONAL_VEHICLE_ALL_UNIT_OPTIONS;
        }
      }

      const selectedAssetId = entry?.assetId;
      if (!selectedAssetId || selectedAssetId === "Other") return baseOptions;

      const asset = assetMetaById.get(selectedAssetId);
      const profiles = Array.isArray(asset?.energyProfiles) ? asset.energyProfiles : [];
      if (!profiles.length) return baseOptions;

      const sourceOptions = toUniqueList(profiles.map((profile) => profile.sourceType));
      const unitsForSelectedSource = toUniqueList(profiles.filter((profile) => !entry?.source || profile.sourceType === entry.source).map((profile) => profile.unit));
      const allUnits = toUniqueList(profiles.map((profile) => profile.unit));

      if (columnKey === "source") {
        return sourceOptions.length ? sourceOptions : baseOptions;
      }

      if (columnKey === "unit") {
        const preferred = unitsForSelectedSource.length ? unitsForSelectedSource : allUnits;
        return preferred.length ? preferred : baseOptions;
      }

      return baseOptions;
    },
    [activeModule, productOptions, scopedAssetOptions, assetMetaById],
  );

  useEffect(() => {
    const currentAsset = newEntry.assetId;
    if (!currentAsset) return;
    const allowed = scopedAssetOptions.some((opt) => opt.value === currentAsset);
    if (!allowed) {
      setNewEntry((prev) => ({ ...prev, assetId: "" }));
    }
  }, [scopedAssetOptions, newEntry.assetId]);

  const groupedRows = useMemo(() => {
    const rows = [];
    const bulkGroups = new Map();

    filteredEntries.forEach((entry) => {
      if (entry.isBulk && entry.bulkKey) {
        if (!bulkGroups.has(entry.bulkKey)) {
          bulkGroups.set(entry.bulkKey, {
            bulkKey: entry.bulkKey,
            entries: [],
            scope: entry.scope,
          });
        }
        bulkGroups.get(entry.bulkKey).entries.push(entry);
      } else {
        rows.push({ type: "entry", entry });
      }
    });

    bulkGroups.forEach((group) => {
      const entriesForGroup = group.entries;
      const totalConsumption = entriesForGroup.reduce((acc, item) => acc + Number(item.consumption || 0), 0);
      const unitSet = new Set(entriesForGroup.map((item) => item.unit).filter(Boolean));
      const unitLabel = unitSet.size === 1 ? Array.from(unitSet)[0] : "Mixed";
      const dates = entriesForGroup.map((item) => new Date(item.date)).filter((d) => !Number.isNaN(d.getTime()));
      const minDate = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null;
      const maxDate = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;
      const dateLabel =
        minDate && maxDate
          ? minDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
            (minDate.getTime() === maxDate.getTime() ? "" : ` - ${maxDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`)
          : "-";
      const groupStatus = entriesForGroup[0]?.status || "draft";
      const hasSubmittable = entriesForGroup.some((item) => item.status === "draft" || item.status === "rejected");

      rows.push({
        type: "bulk",
        bulkKey: group.bulkKey,
        entries: entriesForGroup,
        totalConsumptionLabel: Number(totalConsumption || 0).toLocaleString(),
        unitLabel,
        dateLabel,
        status: groupStatus,
        hasSubmittable,
      });
    });

    return rows;
  }, [filteredEntries]);

  // Counts (from all entries for the active module)
  const moduleAllEntries = allEntries.filter((e) => e.module === activeModule);
  const approvedCount = moduleAllEntries.filter((e) => e.status === "approved" || (isServiceSector && e.status === "submitted")).length;
  const submittedCount = moduleAllEntries.filter((e) => e.status === "submitted").length;
  const draftCount = moduleAllEntries.filter((e) => e.status === "draft" || (!isServiceSector && e.status === "rejected")).length;

  // ------ Form Handlers ------
  const handleFieldChange = useCallback(
    (key, value) => {
      setNewEntry((prev) => {
        let next = { ...prev, [key]: value };
        const sourceOptions = getEntrySpecificColumnOptions("source", next);
        const unitOptions = getEntrySpecificColumnOptions("unit", next);

        if (Array.isArray(sourceOptions) && next.source && !sourceOptions.includes(next.source)) {
          next.source = "";
        }
        if (Array.isArray(unitOptions) && next.unit && !unitOptions.includes(next.unit)) {
          next.unit = "";
        }
        if (key === "assetId") {
          next.source = "";
          next.unit = "";
        }
        if (key === "source") {
          next.unit = "";
        }

        next = applyScope1RefrigerantCascade(next, key, activeModule);

        next = applyNetMeteringDerivedValues(next, activeModule);

        return next;
      });
    },
    [activeModule, getEntrySpecificColumnOptions],
  );

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "File size must be less than 5MB" });
        return;
      }
      setNewEntry((prev) => ({ ...prev, supportingDocument: file }));
    }
  }, []);

  const handleAddEntry = async () => {
    // Validate required fields
    const missingFields = activeModuleConfig.columns.filter((col) => col.required && !newEntry[col.key]).map((col) => col.label);

    if (missingFields.length > 0) {
      setMessage({
        type: "error",
        text: `Please fill: ${missingFields.join(", ")}`,
      });
      return;
    }

    // removed supporting document mandatory check

    // Validate date is within reporting period
    if (reportingPeriodStart && reportingPeriodEnd && newEntry.date) {
      const entryDate = new Date(newEntry.date);
      if (entryDate < reportingPeriodStart || entryDate > reportingPeriodEnd) {
        setMessage({
          type: "error",
          text: `Date must be within reporting period (${reportingPeriodStart.toLocaleDateString()} – ${reportingPeriodEnd.toLocaleDateString()}).`,
        });
        return;
      }
    }

    try {
      setSaving(true);
      const payload = buildModuleSubmissionPayload(newEntry, activeModuleConfig, selectedFacility?._id, selectedPeriod);

      const token = Cookies.get("accessToken");
      const baseURL = resolveBaseUrl();
      await axios.post(`${baseURL}/api/submissions/draft`, payload, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
        withCredentials: true,
      });

      setMessage({ type: "success", text: "Draft saved successfully." });
      setNewEntry(applyNetMeteringDerivedValues(buildEmptyEntry(activeModule, moduleSet), activeModule));
      setFileInputKey((prev) => prev + 1);
      await fetchEntries();

      if (isRejectedView && !isStatusForced) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("status");
        navigate(`${location.pathname}${nextParams.toString() ? `?${nextParams.toString()}` : ""}`, { replace: true });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || error.message || "Failed to save entry.",
      });
    } finally {
      setSaving(false);
    }
  };

  // ------ Submit single entry ------
  const handleSubmitEntry = async (entry) => {
    if (!entry) return;
    const mod = getModuleByKey(entry.module) || activeModuleConfig;
    try {
      setSaving(true);
      const payload = buildModuleSubmissionPayload(entry, mod, selectedFacility?._id, selectedPeriod);

      // Pass old draft ID so backend cleans it up atomically
      if (entry.submissionId) {
        payload.append("replaceDraftIds", JSON.stringify([entry.submissionId]));
      }

      const token = Cookies.get("accessToken");
      const baseURL = resolveBaseUrl();
      await axios.post(`${baseURL}/api/submissions`, payload, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
        withCredentials: true,
      });

      setMessage({ type: "success", text: "Entry submitted." });
      await fetchEntries();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to submit entry.",
      });
    } finally {
      setSaving(false);
    }
  };

  // ------ Delete entry ------
  const handleDeleteEntry = async (entry) => {
    if (!entry) return;
    if (entry.isBulk && entry.bulkKey) {
      await handleDeleteBulkEntry(entry);
      return;
    }
    if (!window.confirm("Delete this entry?")) return;

    if (entry.submissionId) {
      try {
        await api.delete(`/api/submissions/${entry.submissionId}`);
      } catch (error) {
        setMessage({
          type: "error",
          text: error.response?.data?.message || "Failed to delete.",
        });
        return;
      }
    }

    setAllEntries((prev) => prev.filter((e) => e.id !== entry.id));
    setMessage({ type: "success", text: "Entry deleted." });
  };

  const handleDeleteBulkEntry = async (entry) => {
    if (!entry?.bulkKey) return;
    if (!window.confirm("Delete this entry from the bulk draft?")) return;

    const groupEntries = allEntries.filter((item) => item.isBulk && item.bulkKey === entry.bulkKey);
    const remaining = groupEntries.filter((item) => item.id !== entry.id);
    const mod = getModuleByKey(entry.module) || activeModuleConfig;

    try {
      setSaving(true);
      if (!remaining.length) {
        if (entry.submissionId) {
          await api.delete(`/api/submissions/${entry.submissionId}`);
        }
      } else {
        const payload = buildBulkDraftPayload(remaining, mod.scope || "Scope 1", entry.submissionId, { selectedPeriod });
        const token = Cookies.get("accessToken");
        const baseURL = resolveBaseUrl();
        await axios.post(`${baseURL}/api/submissions/draft`, payload, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
          withCredentials: true,
        });
      }
      setMessage({ type: "success", text: "Entry removed from bulk draft." });
      await fetchEntries();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to delete entry." });
    } finally {
      setSaving(false);
    }
  };

  // ------ Edit row inline ------
  const handleEditEntry = (entry) => {
    setEditingRowId(entry.id);
    setEditSnapshots((prev) => ({ ...prev, [entry.id]: { ...entry } }));
  };

  const handleEditRowFieldChange = (rowId, key, value) => {
    setAllEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== rowId) return entry;
        let next = { ...entry, [key]: value };
        const sourceOptions = getEntrySpecificColumnOptions("source", next);
        const unitOptions = getEntrySpecificColumnOptions("unit", next);

        if (Array.isArray(sourceOptions) && next.source && !sourceOptions.includes(next.source)) {
          next.source = "";
        }
        if (Array.isArray(unitOptions) && next.unit && !unitOptions.includes(next.unit)) {
          next.unit = "";
        }
        if (key === "assetId") {
          next.source = "";
          next.unit = "";
        }
        if (key === "source") {
          next.unit = "";
        }

        next = applyScope1RefrigerantCascade(next, key, entry.module);

        next = applyNetMeteringDerivedValues(next, entry.module);
        return next;
      }),
    );
  };

  const handleSaveEditRow = async (rowId) => {
    const entry = allEntries.find((e) => e.id === rowId);
    if (!entry) return;

    const mod = getModuleByKey(entry.module) || activeModuleConfig;
    const missingFields = mod.columns.filter((col) => col.required && !entry[col.key]).map((col) => col.label);

    if (missingFields.length > 0) {
      setMessage({
        type: "error",
        text: `Please fill: ${missingFields.join(", ")}`,
      });
      return;
    }

    try {
      setSaving(true);
      const token = Cookies.get("accessToken");
      const baseURL = resolveBaseUrl();

      if (entry.isBulk && entry.bulkKey) {
        const groupEntries = allEntries.filter((item) => item.isBulk && item.bulkKey === entry.bulkKey);
        const payload = buildBulkDraftPayload(groupEntries, mod.scope || "Scope 1", entry.submissionId, { selectedPeriod });
        await axios.post(`${baseURL}/api/submissions/draft`, payload, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
          withCredentials: true,
        });
      } else {
        const payload = buildModuleSubmissionPayload(entry, mod, selectedFacility?._id, selectedPeriod);
        await axios.post(`${baseURL}/api/submissions/draft`, payload, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
          withCredentials: true,
        });
      }

      setMessage({ type: "success", text: "Entry updated." });
      setEditingRowId(null);
      setEditSnapshots((prev) => {
        const next = { ...prev };
        delete next[rowId];
        return next;
      });
      await fetchEntries();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update entry.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEditRow = (rowId) => {
    setAllEntries((prev) => prev.map((e) => (e.id === rowId ? editSnapshots[rowId] || e : e)));
    setEditSnapshots((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
    setEditingRowId(null);
  };

  // ------ Selection & bulk actions ------
  const toggleEntrySelection = (entryId) => {
    setSelectedEntryIds((prev) => {
      const next = new Set(prev);
      if (next.has(entryId)) next.delete(entryId);
      else next.add(entryId);
      return next;
    });
  };

  const handleSubmitAllDrafts = async () => {
    const drafts = filteredEntries.filter((e) => e.status === "draft" || e.status === "rejected");
    if (!drafts.length) {
      setMessage({ type: "error", text: "No drafts to submit." });
      return;
    }
    try {
      setSaving(true);
      for (const entry of drafts) {
        const mod = getModuleByKey(entry.module) || activeModuleConfig;
        const payload = buildModuleSubmissionPayload(entry, mod, selectedFacility?._id, selectedPeriod);
        // Pass old draft ID so backend cleans it up atomically
        if (entry.submissionId) {
          payload.append("replaceDraftIds", JSON.stringify([entry.submissionId]));
        }
        const token = Cookies.get("accessToken");
        const baseURL = resolveBaseUrl();
        await axios.post(`${baseURL}/api/submissions`, payload, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
          withCredentials: true,
        });
      }
      setMessage({ type: "success", text: "All drafts submitted." });
      await fetchEntries();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to submit drafts.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitSelected = async () => {
    const selected = filteredEntries.filter((e) => selectedEntryIds.has(e.id));
    if (!selected.length) {
      setMessage({ type: "error", text: "No entries selected." });
      return;
    }
    try {
      setSaving(true);
      for (const entry of selected) {
        const mod = getModuleByKey(entry.module) || activeModuleConfig;
        const payload = buildModuleSubmissionPayload(entry, mod, selectedFacility?._id, selectedPeriod);
        // Pass old draft ID so backend cleans it up atomically
        if (entry.submissionId) {
          payload.append("replaceDraftIds", JSON.stringify([entry.submissionId]));
        }
        const token = Cookies.get("accessToken");
        const baseURL = resolveBaseUrl();
        await axios.post(`${baseURL}/api/submissions`, payload, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
          withCredentials: true,
        });
      }
      setSelectedEntryIds(new Set());
      setMessage({ type: "success", text: "Selected entries submitted." });
      await fetchEntries();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to submit selected entries.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSelected = async () => {
    const selected = filteredEntries.filter((e) => selectedEntryIds.has(e.id));
    if (!selected.length) {
      setMessage({ type: "error", text: "No entries selected." });
      return;
    }
    if (!window.confirm("Delete selected entries?")) return;
    try {
      setSaving(true);
      for (const entry of selected) {
        if (entry.submissionId) {
          try {
            await api.delete(`/api/submissions/${entry.submissionId}`);
          } catch (_) {}
        }
      }
      setAllEntries((prev) => prev.filter((e) => !selectedEntryIds.has(e.id)));
      setSelectedEntryIds(new Set());
      setMessage({ type: "success", text: "Selected entries deleted." });
    } finally {
      setSaving(false);
    }
  };

  const toggleBulkKey = (bulkKey) => {
    if (!bulkKey) return;
    setExpandedBulkKeys((prev) => {
      const next = new Set(prev);
      if (next.has(bulkKey)) next.delete(bulkKey);
      else next.add(bulkKey);
      return next;
    });
  };

  const buildBulkSubmitPayload = (entriesForScope, scope) => {
    const supportingFile = entriesForScope.find((entry) => entry.supportingDocument instanceof File)?.supportingDocument || null;
    const uploadKey = supportingFile ? `supportingDocument_${scope.toLowerCase().replace(" ", "")}_bulk` : null;

    const scopeData = buildBulkScopeData(entriesForScope, scope, {
      selectedPeriod,
      uploadKey,
    });

    const payload = new FormData();
    if (selectedFacility?._id) payload.append("facilityId", selectedFacility._id);
    payload.append("scope", scope);

    if (scope === "Scope 1") {
      payload.append("scope1Data", JSON.stringify(scopeData));
    } else if (scope === "Scope 2") {
      payload.append("scope2Data", JSON.stringify(scopeData));
    } else if (scope === "Scope 3") {
      payload.append("scope3Data", JSON.stringify(scopeData));
    }

    if (supportingFile && uploadKey) {
      payload.append(uploadKey, supportingFile);
    }

    return payload;
  };

  const handleSubmitBulkGroup = async (group) => {
    if (!group?.entries?.length) return;
    const submittable = group.entries.filter((item) => item.status === "draft" || item.status === "rejected");
    if (!submittable.length) return;

    try {
      setSaving(true);
      const scope = group.entries[0]?.scope || "Scope 1";
      const payload = buildBulkSubmitPayload(submittable, scope);

      // Tell the backend which draft submissions to clean up
      const draftIds = Array.from(new Set(group.entries.map((item) => item.submissionId).filter(Boolean)));
      if (draftIds.length) {
        payload.append("replaceDraftIds", JSON.stringify(draftIds));
      }

      const token = Cookies.get("accessToken");
      const baseURL = resolveBaseUrl();
      await axios.post(`${baseURL}/api/submissions`, payload, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
        withCredentials: true,
      });

      setMessage({ type: "success", text: "Bulk entries submitted." });
      await fetchEntries();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to submit bulk entries." });
    } finally {
      setSaving(false);
    }
  };

  // ------ Download document ------
  const handleDownloadDocument = async (entry) => {
    if (!entry?.submissionId) return;
    const token = Cookies.get("accessToken");
    const baseURL = resolveBaseUrl();
    const scopeKey = entry.scopeKey || "scope1";

    try {
      const response = await axios.get(`${baseURL}/api/submissions/${entry.submissionId}/supporting-document`, {
        params: {
          scope: scopeKey,
          sectionIndex: entry.sectionIndex ?? 0,
          activityIndex: entry.activityIndex ?? 0,
          sourceIndex: entry.sourceIndex ?? 0,
        },
        responseType: "blob",
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
        withCredentials: true,
      });

      const contentDisposition = response.headers["content-disposition"];
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || entry.supportingDocument?.originalName || "supporting-document";

      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to download supporting document.",
      });
    }
  };

  // ------ Reset selection on tab change ------
  useEffect(() => {
    setSelectedEntryIds(new Set());
  }, [activeModule]);

  useEffect(() => {
    if (activeModule !== "gas_fuel_gases") {
      setShowGasesInfo(false);
      setShowRefrigerantFinder(false);
    }
  }, [activeModule]);

  const updateGasesInfoPopoverPosition = useCallback(() => {
    const trigger = gasesInfoButtonRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const panelWidth = 380;
    const panelHeight = 480;
    const gap = 10;

    let left = rect.right + gap;
    if (left + panelWidth > window.innerWidth - 12) {
      left = rect.left - panelWidth - gap;
    }
    if (left < 12) {
      left = 12;
    }

    let top = rect.top - 16;
    if (top + panelHeight > window.innerHeight - 12) {
      top = window.innerHeight - panelHeight - 12;
    }
    if (top < 12) {
      top = 12;
    }

    setGasesInfoPopoverPos({ top, left });
  }, []);

  useEffect(() => {
    if (!showGasesInfo) return;

    updateGasesInfoPopoverPosition();

    const handleReposition = () => updateGasesInfoPopoverPosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [showGasesInfo, updateGasesInfoPopoverPosition]);

  // ------ Loading state ------
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-3 space-y-4">
      <SectionHeader icon={Sheet} title="Data Entry" subtitle="Enter and manage your facility data across all emission modules." />

      {/* Main layout: Sidebar + Content */}
      <div className="flex rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white h-[calc(100vh-130px)]">
        {/* Module Sidebar (left tabs) — filtered by boundary scopes */}
        {!hideModuleSidebar && <ModuleSidebar modules={enabledModules} activeModule={activeModule} onModuleChange={setActiveModule} hideHeader={isServiceSector} hideCategoryTitle={isServiceSector} />}

        {/* Content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Module header + description */}
          <div className="px-6 pt-5 pb-3 border-b border-slate-100 relative">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">{activeModuleConfig.label}</h2>
              {activeModule === "gas_fuel_gases" && (
                <div className="relative inline-flex items-center">
                  <button
                    ref={gasesInfoButtonRef}
                    type="button"
                    aria-label="Gases module info"
                    onClick={() => {
                      const next = !showGasesInfo;
                      setShowGasesInfo(next);
                      if (next) updateGasesInfoPopoverPosition();
                    }}
                    className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{activeModuleConfig.description}</p>
          </div>

          {activeModule === "gas_fuel_gases" && showGasesInfo && (
            <div className="fixed z-[60] w-[360px] rounded-2xl border border-sky-200 bg-white shadow-xl p-4" style={{ top: `${gasesInfoPopoverPos.top}px`, left: `${gasesInfoPopoverPos.left}px` }}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-slate-700 leading-relaxed flex-1">You can find the refrigerant type on a label as shown below on the back or side of your appliance.</p>
                <button
                  type="button"
                  aria-label="Close gases info"
                  onClick={() => setShowGasesInfo(false)}
                  className="inline-flex items-center justify-center h-6 w-6 rounded-full border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-3 rounded-xl overflow-hidden border border-slate-200">
                <img src="/refrigerant-reference.png" alt="Refrigerant label example showing refrigerant charge type" className="w-full h-auto object-contain" />
              </div>

              <p className="mt-3 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-100 rounded-lg px-3 py-2">
                Use this reference table to find your probable refrigerant type. Click{" "}
                <button type="button" onClick={() => setShowRefrigerantFinder(true)} className="underline font-bold text-sky-700 hover:text-sky-900">
                  here
                </button>
                .
              </p>
            </div>
          )}

          {/* Summary & Actions bar */}
          <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="text-xs font-bold uppercase tracking-tight">{isServiceSector ? `${submittedCount} Submitted` : `${approvedCount} Approved`}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-bold uppercase tracking-tight">{draftCount} Drafts</span>
              </div>
              {!isServiceSector && (
                <button
                  type="button"
                  onClick={() => {
                    const nextParams = new URLSearchParams(searchParams);
                    if (isRejectedView) nextParams.delete("status");
                    else nextParams.set("status", "rejected");
                    const basePath = isStatusForced ? "/energy/data-entry" : location.pathname;
                    navigate(`${basePath}${nextParams.toString() ? `?${nextParams}` : ""}`);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-tight border transition-all ${
                    isRejectedView ? "bg-red-600 text-white border-red-700 shadow-md shadow-red-100" : "border-red-200 text-red-600 hover:bg-red-50 bg-red-50"
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  Rejected
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSubmitAllDrafts}
                disabled={saving}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                Submit All
              </button>
              <div className="w-px h-5 bg-slate-200" />
              <button
                type="button"
                onClick={handleSubmitSelected}
                disabled={saving || selectedEntryIds.size === 0}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all shadow-sm disabled:opacity-30"
              >
                <SendHorizontal className="w-3 h-3 text-emerald-400" />
                Submit Selected ({selectedEntryIds.size})
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={saving || selectedEntryIds.size === 0}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-50 transition-all disabled:opacity-30"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>

          {/* Message */}
          {message.text && <div className={`mx-6 mt-3 p-3 rounded-lg text-sm font-medium ${message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{message.text}</div>}

          {/* Table */}
          <div className="flex-1 p-4 flex flex-col min-h-0">
            <ModuleEntryTable
              moduleConfig={activeModuleConfig}
              newEntry={newEntry}
              onFieldChange={handleFieldChange}
              onFileChange={handleFileChange}
              onAddEntry={handleAddEntry}
              fileInputKey={fileInputKey}
              entries={filteredEntries}
              groupedRows={groupedRows}
              saving={saving}
              selectedEntryIds={selectedEntryIds}
              toggleEntrySelection={toggleEntrySelection}
              onEditEntry={handleEditEntry}
              onDeleteEntry={handleDeleteEntry}
              onSubmitEntry={handleSubmitEntry}
              onDownloadDocument={handleDownloadDocument}
              isRejectedView={isRejectedView}
              editingRowId={editingRowId}
              onEditRowFieldChange={handleEditRowFieldChange}
              onSaveEditRow={handleSaveEditRow}
              onCancelEditRow={handleCancelEditRow}
              expandedBulkKeys={expandedBulkKeys}
              toggleBulkKey={toggleBulkKey}
              onSubmitBulkGroup={handleSubmitBulkGroup}
              columnOptions={{
                assetId: scopedAssetOptions,
                ...(activeModule === "production_activity" ? { activityType: productOptions } : {}),
                ...(activeModule === "stationary_combustion"
                  ? (() => {
                      const fuelSet = new Set();
                      const canvasCategories = assetOptions.filter((o) => o.value !== "Other").map((o) => o.category);
                      canvasCategories.forEach((cat) => {
                        (ASSET_FUEL_CONTEXT[cat] || []).forEach((fuel) => fuelSet.add(fuel));
                      });
                      if (fuelSet.size) {
                        fuelSet.add("Other");
                        return { source: Array.from(fuelSet) };
                      }
                      return {};
                    })()
                  : {}),
              }}
              getColumnOptions={getEntrySpecificColumnOptions}
              isCbamEnabled={selectedFacility?.cbam?.cbamImpacted}
            />
          </div>
        </div>
      </div>

      {showRefrigerantFinder && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Refrigerant Type Finder</h3>
              <button
                type="button"
                aria-label="Close refrigerant finder"
                onClick={() => setShowRefrigerantFinder(false)}
                className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Appliance</label>
                <select
                  value={finderAppliance}
                  onChange={(e) => {
                    setFinderAppliance(e.target.value);
                    setFinderBrand("");
                  }}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                >
                  <option value="">Select appliance</option>
                  {Object.keys(REFRIGERANT_FINDER_DATA).map((appliance) => (
                    <option key={appliance} value={appliance}>
                      {appliance}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Brand</label>
                <select
                  value={finderBrand}
                  onChange={(e) => setFinderBrand(e.target.value)}
                  disabled={!finderAppliance}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">Select brand</option>
                  {finderBrandOptions.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Probable Refrigerant Type</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{finderProbableRefrigerant || "Select appliance and brand to view probable refrigerant."}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataEntry;
