import React, { useState, useEffect, useMemo } from "react";
import { ClipboardList, Plus, Pencil, Trash2, Search, X, Save, Loader2, ChevronDown, Send, Eye, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cbamAPI } from "../../utils/api";
import Loader from "../../components/rf/Loader";
import SectionHeader from "../../components/rf/Header";
import EmptyState from "../../components/rf/EmptyState";
import { toast } from "sonner";

// ─── Constants ──────────────────────────────────────────────────────────
const QUARTERS = ["Q1", "Q2", "Q3", "Q4", "Annual"];
const METHODOLOGIES = ["CBAM Methodology", "EU ETS Monitoring", "UN Methodology", "Default Values", "Other MRV System"];
const STATUS_COLORS = {
  draft: "bg-slate-100 text-slate-700",
  submitted: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

// ─── Sector → Emission Templates ────────────────────────────────────────
// Auto-populated when a product is selected, based on its mainCategory & route
const SECTOR_DIRECT_TEMPLATES = {
  Cement: [
    { source: "Kiln fuel combustion", fuelOrMaterial: "", emissionType: "combustion" },
    { source: "Calcination of raw materials", fuelOrMaterial: "Calcium carbonate / MgCO₃", emissionType: "process" },
  ],
  "Iron and steel": {
    _default: [
      { source: "Fuel combustion", fuelOrMaterial: "", emissionType: "combustion" },
      { source: "Process emissions (reduction / oxidation)", fuelOrMaterial: "", emissionType: "process" },
    ],
    "Blast furnace": [
      { source: "Blast furnace coke combustion", fuelOrMaterial: "Coke", emissionType: "combustion" },
      { source: "Sinter plant emissions", fuelOrMaterial: "", emissionType: "process" },
      { source: "Hot metal desulphurisation", fuelOrMaterial: "", emissionType: "process" },
    ],
    "Basic oxygen steelmaking": [
      { source: "BOF converter gas combustion", fuelOrMaterial: "Converter gas", emissionType: "combustion" },
      { source: "Decarburisation process", fuelOrMaterial: "", emissionType: "process" },
    ],
    "Electric arc furnace": [
      { source: "Electrode consumption", fuelOrMaterial: "Graphite electrode", emissionType: "combustion" },
      { source: "Process emissions (oxidation)", fuelOrMaterial: "", emissionType: "process" },
    ],
    DRI: [
      { source: "Natural gas reduction", fuelOrMaterial: "Natural gas", emissionType: "combustion" },
      { source: "Direct reduction process", fuelOrMaterial: "", emissionType: "process" },
    ],
  },
  Aluminium: {
    _default: [
      { source: "Fuel combustion", fuelOrMaterial: "", emissionType: "combustion" },
      { source: "Anode consumption / PFC emissions", fuelOrMaterial: "", emissionType: "process" },
    ],
    "Primary (electrolytic smelting)": [
      { source: "Anode baking furnace", fuelOrMaterial: "Natural gas", emissionType: "combustion" },
      { source: "Electrolysis (anode consumption)", fuelOrMaterial: "Carbon anode", emissionType: "process" },
      { source: "PFC emissions (CF₄ / C₂F₆)", fuelOrMaterial: "", emissionType: "process" },
    ],
    "Secondary (melting/recycling)": [
      { source: "Melting furnace", fuelOrMaterial: "Natural gas", emissionType: "combustion" },
      { source: "Flux decomposition", fuelOrMaterial: "", emissionType: "process" },
    ],
  },
  Fertilisers: {
    _default: [
      { source: "Fuel combustion", fuelOrMaterial: "", emissionType: "combustion" },
      { source: "Process emissions", fuelOrMaterial: "", emissionType: "process" },
    ],
    "Haber-Bosch with steam reforming": [
      { source: "Steam methane reforming", fuelOrMaterial: "Natural gas", emissionType: "combustion" },
      { source: "CO₂ from reforming process", fuelOrMaterial: "", emissionType: "process" },
    ],
    "Nitric acid": [
      { source: "Ammonia oxidation", fuelOrMaterial: "Ammonia", emissionType: "combustion" },
      { source: "N₂O from nitric acid production", fuelOrMaterial: "", emissionType: "process" },
    ],
    Urea: [{ source: "CO₂ from ammonia production", fuelOrMaterial: "", emissionType: "process" }],
  },
  "Chemicals (hydrogen)": {
    _default: [
      { source: "Fuel / feedstock combustion", fuelOrMaterial: "", emissionType: "combustion" },
      { source: "Process emissions", fuelOrMaterial: "", emissionType: "process" },
    ],
    "Steam reforming": [
      { source: "Steam methane reforming", fuelOrMaterial: "Natural gas", emissionType: "combustion" },
      { source: "CO₂ from syngas separation", fuelOrMaterial: "", emissionType: "process" },
    ],
    "Electrolysis of water": [{ source: "No direct emissions (electrolysis)", fuelOrMaterial: "", emissionType: "process" }],
  },
  Electricity: [{ source: "Fuel combustion for power generation", fuelOrMaterial: "", emissionType: "combustion" }],
};

const SECTOR_INDIRECT_TEMPLATES = {
  Cement: [{ electricitySource: "Grid electricity", dataType: "actual" }],
  "Iron and steel": [{ electricitySource: "Grid electricity", dataType: "actual" }],
  Aluminium: [
    { electricitySource: "Grid electricity", dataType: "actual" },
    { electricitySource: "Captive power", dataType: "actual" },
  ],
  Fertilisers: [{ electricitySource: "Grid electricity", dataType: "actual" }],
  "Chemicals (hydrogen)": [{ electricitySource: "Grid electricity", dataType: "actual" }],
  Electricity: [], // No indirect for electricity sector
};

/**
 * Resolve direct emission template rows for a given sector and production route.
 */
const getDirectTemplateRows = (sector, productionRoute) => {
  const tpl = SECTOR_DIRECT_TEMPLATES[sector];
  if (!tpl) return []; // unknown sector
  if (Array.isArray(tpl)) return tpl; // flat array (e.g. Electricity)
  // Object with route-specific + _default keys
  // Try to find a matching route key (partial match for flexibility)
  const routeKey = Object.keys(tpl).find((k) => k !== "_default" && productionRoute?.toLowerCase().includes(k.toLowerCase()));
  return tpl[routeKey] || tpl._default || [];
};

// ─── Empty direct emission row ─────────────────────────────────────────
const emptyDirectRow = {
  source: "",
  fuelOrMaterial: "",
  quantity: "",
  unit: "Tonnes",
  emissionFactor: "",
  co2Emissions: "",
  gasType: "CO₂",
  emissionType: "combustion",
  measurementMethod: "",
};

// ─── Empty indirect emission row ───────────────────────────────────────
const emptyIndirectRow = {
  electricitySource: "",
  electricityConsumed: "",
  unit: "MWh",
  emissionFactor: "",
  co2Emissions: "",
  dataType: "actual",
};

// ─── Production routes from CBAM Excel Template ──────────────────────────
const ALL_PRODUCTION_ROUTES = [
  "All production routes",
  "n.a.",
  "Basic oxygen steelmaking",
  "Electric arc furnace",
  "Other production routes",
  "Unknown production routes",
  "Blast furnace route",
  "Smelting reduction",
  "Steam reforming and partial oxidation",
  "Electrolysis of water",
  "Chlor-Alkali electrolysis and production of chlorates",
  "Haber-Bosch process with steam reforming of natural gas or biogas",
  "Haber-Bosch process with gasification of coal or other fuels",
  "Primary (electrolytic) smelting",
  "Secondary melting (recycling)"
];

// ─── Empty precursor row ───────────────────────────────────────────────
const emptyPrecursorRow = {
  precursorName: "",
  productionRoute: "",
  massPerUnitProduct: "",
  totalMassConsumed: "",
  unit: "Tonnes",
  specificEmbeddedEmissions: "",
  totalEmbeddedEmissions: "",
  origin: "own_installation",
};

// ─── Empty record form ─────────────────────────────────────────────────
const emptyForm = {
  cbamProductId: "",
  cbamInstallationId: "",
  reportingYear: new Date().getFullYear(),
  reportingQuarter: "Q1",
  periodStart: "",
  periodEnd: "",
  productionVolume: "",
  productionUnit: "Tonnes",
  directEmissions: [{ ...emptyDirectRow }],
  indirectEmissions: [{ ...emptyIndirectRow }],
  precursorConsumption: [],
  monitoringMethodology: "CBAM Methodology",
  carbonPricePaid: false,
  carbonPriceAmount: "",
  carbonPriceCurrency: "INR",
};

const CbamProductionRecords = () => {
  const { user } = useAuth();
  const facilityId =
    user?.facilities?.[0]?.facilityId?._id ||
    user?.facilities?.[0]?.facilityId ||
    user?.facilityAssignments?.[0]?.facilityId?._id ||
    user?.facilityAssignments?.[0]?.facilityId ||
    user?.facilityId?._id ||
    user?.facilityId ||
    null;

  // Data
  const [records, setRecords] = useState([]);
  const [products, setProducts] = useState([]);
  const [installations, setInstallations] = useState([]);

  // UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("list"); // list | form | detail
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [submitConfirmId, setSubmitConfirmId] = useState(null);
  const [detailRecord, setDetailRecord] = useState(null);

  // ─── Fetch on mount ──────────────────────────────────────────────
  useEffect(() => {
    Promise.all([fetchRecords(), fetchProducts(), fetchInstallations()]).finally(() => setLoading(false));
  }, [facilityId]);

  const fetchRecords = async () => {
    try {
      const res = await cbamAPI.getProductionRecords(facilityId ? { facilityId } : undefined);
      setRecords(res.data?.data?.records || res.data?.data || []);
    } catch (err) {
      console.error("Failed to load production records", err);
      toast.error("Could not load production records");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await cbamAPI.getProducts(facilityId ? { facilityId } : undefined);
      setProducts(res.data?.data?.products || res.data?.data || []);
    } catch {
      /* non-blocking */
    }
  };

  const fetchInstallations = async () => {
    try {
      const res = await cbamAPI.getInstallations(facilityId ? { facilityId } : undefined);
      setInstallations(res.data?.data?.installations || res.data?.data || []);
    } catch {
      /* non-blocking */
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────
  const getProductName = (id) => {
    const p = products.find((pr) => String(pr._id) === String(id?._id || id));
    return p ? `${p.productName} (${p.cnCode})` : id?.productName ? `${id.productName} (${id.cnCode})` : (id?._id || id || "—");
  };

  const getInstallationName = (id) => {
    const inst = installations.find((i) => String(i._id) === String(id?._id || id));
    return inst ? inst.installationName : id?.installationName || id?._id || id || "—";
  };

  // ─── Filter ────────────────────────────────────────────────────────
  const filteredRecords = useMemo(() => {
    let list = records;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) => getProductName(r.cbamProductId).toLowerCase().includes(q) || getInstallationName(r.cbamInstallationId).toLowerCase().includes(q) || r.reportingQuarter?.toLowerCase().includes(q),
      );
    }
    if (filterStatus) {
      list = list.filter((r) => r.status === filterStatus);
    }
    return list;
  }, [records, searchQuery, filterStatus, products, installations]);

  // ─── Auto-calc CO₂ for a direct emission row ─────────────────────
  const calcDirectCO2 = (row) => {
    const qty = parseFloat(row.quantity) || 0;
    const ef = parseFloat(row.emissionFactor) || 0;
    return +(qty * ef).toFixed(6);
  };

  // ─── Auto-calc CO₂ for an indirect emission row ──────────────────
  const calcIndirectCO2 = (row) => {
    const consumed = parseFloat(row.electricityConsumed) || 0;
    const ef = parseFloat(row.emissionFactor) || 0;
    return +(consumed * ef).toFixed(6);
  };

  // ─── Auto-calc total embedded for a precursor row ─────────────────
  const calcPrecursorTotal = (row) => {
    const mass = parseFloat(row.totalMassConsumed) || 0;
    const see = parseFloat(row.specificEmbeddedEmissions) || 0;
    return +(mass * see).toFixed(6);
  };

  // ─── Form sub-array handlers ──────────────────────────────────────
  const updateSubArray = (field, index, key, value) => {
    setForm((prev) => {
      const arr = [...prev[field]];
      arr[index] = { ...arr[index], [key]: value };

      // Auto-calc CO₂
      if (field === "directEmissions" && (key === "quantity" || key === "emissionFactor")) {
        arr[index].co2Emissions = calcDirectCO2(arr[index]);
      }
      if (field === "indirectEmissions" && (key === "electricityConsumed" || key === "emissionFactor")) {
        arr[index].co2Emissions = calcIndirectCO2(arr[index]);
      }
      if (field === "precursorConsumption" && (key === "totalMassConsumed" || key === "specificEmbeddedEmissions")) {
        arr[index].totalEmbeddedEmissions = calcPrecursorTotal(arr[index]);
      }

      return { ...prev, [field]: arr };
    });
  };

  const addSubRow = (field, template) => {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], { ...template }],
    }));
  };

  const removeSubRow = (field, index) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // ─── Form handlers ────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, directEmissions: [{ ...emptyDirectRow }], indirectEmissions: [{ ...emptyIndirectRow }], precursorConsumption: [] });
    setView("form");
  };

  const openEdit = (record) => {
    setEditingId(record._id);
    setForm({
      cbamProductId: record.cbamProductId?._id || record.cbamProductId || "",
      cbamInstallationId: record.cbamInstallationId?._id || record.cbamInstallationId || "",
      reportingYear: record.reportingYear || new Date().getFullYear(),
      reportingQuarter: record.reportingQuarter || "Q1",
      periodStart: record.periodStart ? record.periodStart.substring(0, 10) : "",
      periodEnd: record.periodEnd ? record.periodEnd.substring(0, 10) : "",
      productionVolume: record.productionVolume ?? "",
      productionUnit: record.productionUnit || "Tonnes",
      directEmissions: record.directEmissions?.length ? record.directEmissions.map((d) => ({ ...emptyDirectRow, ...d })) : [{ ...emptyDirectRow }],
      indirectEmissions: record.indirectEmissions?.length ? record.indirectEmissions.map((d) => ({ ...emptyIndirectRow, ...d })) : [{ ...emptyIndirectRow }],
      precursorConsumption: record.precursorConsumption?.length ? record.precursorConsumption.map((p) => ({ ...emptyPrecursorRow, ...p })) : [],
      monitoringMethodology: record.monitoringMethodology || "CBAM Methodology",
      carbonPricePaid: record.carbonPricePaid || false,
      carbonPriceAmount: record.carbonPriceAmount ?? "",
      carbonPriceCurrency: record.carbonPriceCurrency || "INR",
    });
    setView("form");
  };

  const openDetail = async (record) => {
    try {
      const res = await cbamAPI.getProductionRecordById(record._id);
      setDetailRecord(res.data?.data?.record || res.data?.data || record);
      setView("detail");
    } catch {
      setDetailRecord(record);
      setView("detail");
    }
  };

  const backToList = () => {
    setView("list");
    setEditingId(null);
    setDetailRecord(null);
    setForm({ ...emptyForm });
  };

  // ─── Auto-map emissions when product changes ──────────────────────
  const handleProductChange = (productId) => {
    const product = products.find((p) => p._id === productId);
    if (!product) {
      setForm((prev) => ({ ...prev, cbamProductId: productId }));
      return;
    }

    const sector = product.mainCategory || "";
    const route = product.productionRoute || "";

    // Build direct emission rows from sector template
    const directTemplates = getDirectTemplateRows(sector, route);
    const directEmissions =
      directTemplates.length > 0
        ? directTemplates.map((t) => ({
          ...emptyDirectRow,
          source: t.source || "",
          fuelOrMaterial: t.fuelOrMaterial || "",
          emissionType: t.emissionType || "combustion",
        }))
        : [{ ...emptyDirectRow }];

    // Build indirect emission rows (show only if product requires it)
    const indirectTemplates = SECTOR_INDIRECT_TEMPLATES[sector] || [];
    const showIndirect = product.indirectEmissionsRequired !== false && indirectTemplates.length > 0;
    const indirectEmissions = showIndirect
      ? indirectTemplates.map((t) => ({
        ...emptyIndirectRow,
        electricitySource: t.electricitySource || "",
        dataType: t.dataType || "actual",
      }))
      : [{ ...emptyIndirectRow }];

    // Build precursor rows from the product's precursor list
    const precursorConsumption =
      (product.precursors || []).length > 0
        ? product.precursors.map((name) => ({
          ...emptyPrecursorRow,
          precursorName: name,
        }))
        : [];

    // Set production unit from product definition
    const productionUnit = product.productionUnit || (sector === "Electricity" ? "MWh" : "Tonnes");

    setForm((prev) => ({
      ...prev,
      cbamProductId: productId,
      productionUnit,
      directEmissions,
      indirectEmissions,
      precursorConsumption,
    }));

    toast.info(`Auto-populated emission fields for ${sector} — ${route || "default route"}`);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Intercept product change for auto-mapping
    if (name === "cbamProductId") {
      handleProductChange(value);
      return;
    }
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!form.cbamProductId || !form.reportingYear) {
      toast.error("Product and Reporting Year are required");
      return;
    }
    if (!facilityId) {
      toast.error("No facility assigned for this user");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        cbamProductId: form.cbamProductId,
        cbamInstallationId: form.cbamInstallationId || undefined,
        reportingYear: Number(form.reportingYear),
        reportingQuarter: form.reportingQuarter,
        periodStart: form.periodStart || undefined,
        periodEnd: form.periodEnd || undefined,
        productionVolume: form.productionVolume ? Number(form.productionVolume) : 0,
        productionUnit: form.productionUnit,
        directEmissions: form.directEmissions
          .filter((d) => d.source || d.fuelOrMaterial || d.quantity)
          .map((d) => ({
            ...d,
            quantity: Number(d.quantity) || 0,
            emissionFactor: d.emissionFactor ? Number(d.emissionFactor) : undefined,
            co2Emissions: Number(d.co2Emissions) || 0,
          })),
        indirectEmissions: form.indirectEmissions
          .filter((d) => d.electricitySource || d.electricityConsumed)
          .map((d) => ({
            ...d,
            electricityConsumed: Number(d.electricityConsumed) || 0,
            emissionFactor: d.emissionFactor ? Number(d.emissionFactor) : undefined,
            co2Emissions: Number(d.co2Emissions) || 0,
          })),
        precursorConsumption: form.precursorConsumption
          .filter((p) => p.precursorName || p.totalMassConsumed)
          .map((p) => ({
            ...p,
            productionRoute: p.productionRoute || "",
            massPerUnitProduct: Number(p.massPerUnitProduct) || 0,
            totalMassConsumed: Number(p.totalMassConsumed) || 0,
            specificEmbeddedEmissions: Number(p.specificEmbeddedEmissions) || 0,
            totalEmbeddedEmissions: Number(p.totalEmbeddedEmissions) || 0,
          })),
        monitoringMethodology: form.monitoringMethodology,
        carbonPricePaid: form.carbonPricePaid,
        carbonPriceAmount: form.carbonPricePaid ? Number(form.carbonPriceAmount) || 0 : 0,
        carbonPriceCurrency: form.carbonPriceCurrency,
        facilityId,
      };

      if (editingId) {
        await cbamAPI.updateProductionRecord(editingId, payload);
        toast.success("Production record updated");
      } else {
        await cbamAPI.createProductionRecord(payload);
        toast.success("Production record created");
      }
      await fetchRecords();
      backToList();
    } catch (err) {
      const msg = err.response?.data?.message || "Operation failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await cbamAPI.deleteProductionRecord(id);
      toast.success("Record deleted");
      setDeleteConfirmId(null);
      await fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleSubmitRecord = async (id) => {
    try {
      await cbamAPI.submitProductionRecord(id);
      toast.success("Record submitted for approval");
      setSubmitConfirmId(null);
      await fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Submit failed");
    }
  };

  // ─── Loading state ─────────────────────────────────────────────────
  if (loading) return <Loader />;

  // ═══════════════════════════════════════════════════════════════════
  // DETAIL VIEW
  // ═══════════════════════════════════════════════════════════════════
  if (view === "detail" && detailRecord) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-3 py-3 animate-in fade-in duration-500">
        <button onClick={backToList} className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to records
        </button>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Production Record Detail</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[detailRecord.status] || STATUS_COLORS.draft}`}>{detailRecord.status?.toUpperCase()}</span>
          </div>

          {/* Summary info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-400">Product</p>
              <p className="text-sm font-semibold text-slate-900">{getProductName(detailRecord.cbamProductId)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Period</p>
              <p className="text-sm font-semibold text-slate-900">
                {detailRecord.reportingYear} {detailRecord.reportingQuarter}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Production Volume</p>
              <p className="text-sm font-semibold text-slate-900">
                {detailRecord.productionVolume?.toLocaleString()} {detailRecord.productionUnit}
              </p>
            </div>
          </div>

          {/* Emissions summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 rounded-xl p-4">
            <div>
              <p className="text-xs text-slate-400">Total Direct</p>
              <p className="text-lg font-bold text-emerald-700">
                {detailRecord.totalDirectEmissions?.toFixed(4) || "0"} <span className="text-xs font-normal">tCO₂</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Indirect</p>
              <p className="text-lg font-bold text-blue-700">
                {detailRecord.totalIndirectEmissions?.toFixed(4) || "0"} <span className="text-xs font-normal">tCO₂</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Precursor Emissions</p>
              <p className="text-lg font-bold text-purple-700">
                {detailRecord.totalPrecursorEmissions?.toFixed(4) || "0"} <span className="text-xs font-normal">tCO₂</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Specific Embedded</p>
              <p className="text-lg font-bold text-slate-900">
                {detailRecord.totalSpecificEmbeddedEmissions?.toFixed(4) || "0"} <span className="text-xs font-normal">tCO₂/t</span>
              </p>
            </div>
          </div>

          {/* Direct emissions table */}
          {detailRecord.directEmissions?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-2">Direct Emissions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                      <th className="px-3 py-2">Source</th>
                      <th className="px-3 py-2">Fuel / Material</th>
                      <th className="px-3 py-2">Qty</th>
                      <th className="px-3 py-2">Unit</th>
                      <th className="px-3 py-2">EF</th>
                      <th className="px-3 py-2">tCO₂</th>
                      <th className="px-3 py-2">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {detailRecord.directEmissions.map((d, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{d.source}</td>
                        <td className="px-3 py-2">{d.fuelOrMaterial}</td>
                        <td className="px-3 py-2 font-mono">{d.quantity}</td>
                        <td className="px-3 py-2">{d.unit}</td>
                        <td className="px-3 py-2 font-mono">{d.emissionFactor}</td>
                        <td className="px-3 py-2 font-mono font-semibold">{d.co2Emissions?.toFixed(4)}</td>
                        <td className="px-3 py-2">{d.emissionType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Indirect emissions table */}
          {detailRecord.indirectEmissions?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-2">Indirect Emissions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                      <th className="px-3 py-2">Source</th>
                      <th className="px-3 py-2">Consumed</th>
                      <th className="px-3 py-2">Unit</th>
                      <th className="px-3 py-2">EF</th>
                      <th className="px-3 py-2">tCO₂</th>
                      <th className="px-3 py-2">Data Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {detailRecord.indirectEmissions.map((d, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{d.electricitySource}</td>
                        <td className="px-3 py-2 font-mono">{d.electricityConsumed}</td>
                        <td className="px-3 py-2">{d.unit}</td>
                        <td className="px-3 py-2 font-mono">{d.emissionFactor}</td>
                        <td className="px-3 py-2 font-mono font-semibold">{d.co2Emissions?.toFixed(4)}</td>
                        <td className="px-3 py-2">{d.dataType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Precursors table */}
          {detailRecord.precursorConsumption?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-2">Precursor Consumption</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                      <th className="px-3 py-2">Precursor</th>
                      <th className="px-3 py-2">Route</th>
                      <th className="px-3 py-2">Mass/Unit</th>
                      <th className="px-3 py-2">Total Mass</th>
                      <th className="px-3 py-2">SEE (tCO₂/t)</th>
                      <th className="px-3 py-2">Total tCO₂</th>
                      <th className="px-3 py-2">Origin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {detailRecord.precursorConsumption.map((p, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{p.precursorName}</td>
                        <td className="px-3 py-2">{p.productionRoute}</td>
                        <td className="px-3 py-2 font-mono">{p.massPerUnitProduct}</td>
                        <td className="px-3 py-2 font-mono">{p.totalMassConsumed}</td>
                        <td className="px-3 py-2 font-mono">{p.specificEmbeddedEmissions}</td>
                        <td className="px-3 py-2 font-mono font-semibold">{p.totalEmbeddedEmissions?.toFixed(4)}</td>
                        <td className="px-3 py-2">{p.origin?.replace(/_/g, " ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // FORM VIEW
  // ═══════════════════════════════════════════════════════════════════
  if (view === "form") {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-3 py-3 animate-in fade-in duration-500">
        <button onClick={backToList} className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to records
        </button>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">{editingId ? "Edit Production Record" : "New Production Record"}</h2>
          </div>

          <form onSubmit={handleSubmitForm} className="p-6 space-y-6">
            {/* ── Section 1: General ─────────────────────────────── */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">General Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="cbamProductId"
                    value={form.cbamProductId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.productName} ({p.cnCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Methodology</label>
                  <select
                    name="monitoringMethodology"
                    value={form.monitoringMethodology}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {METHODOLOGIES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="reportingYear"
                    type="number"
                    min="2020"
                    max="2040"
                    value={form.reportingYear}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quarter</label>
                  <select
                    name="reportingQuarter"
                    value={form.reportingQuarter}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {QUARTERS.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Production Volume</label>
                  <input
                    name="productionVolume"
                    type="number"
                    step="any"
                    min="0"
                    value={form.productionVolume}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <select
                    name="productionUnit"
                    value={form.productionUnit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Tonnes">Tonnes</option>
                    <option value="MWh">MWh</option>
                    <option value="kg">kg</option>
                    <option value="m³">m³</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── Section 2: Direct Emissions ───────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-700">Direct Emissions (Scope 1)</h3>
                <button
                  type="button"
                  onClick={() => addSubRow("directEmissions", emptyDirectRow)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                      <th className="px-2 py-2">Source</th>
                      <th className="px-2 py-2">Fuel / Material</th>
                      <th className="px-2 py-2 w-24">Qty</th>
                      <th className="px-2 py-2 w-20">Unit</th>
                      <th className="px-2 py-2 w-24">EF (tCO₂/unit)</th>
                      <th className="px-2 py-2 w-24">tCO₂</th>
                      <th className="px-2 py-2 w-28">Type</th>
                      <th className="px-2 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.directEmissions.map((row, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="px-1 py-1">
                          <input
                            value={row.source}
                            onChange={(e) => updateSubArray("directEmissions", i, "source", e.target.value)}
                            placeholder="Source"
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            value={row.fuelOrMaterial}
                            onChange={(e) => updateSubArray("directEmissions", i, "fuelOrMaterial", e.target.value)}
                            placeholder="Fuel"
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            step="any"
                            value={row.quantity}
                            onChange={(e) => updateSubArray("directEmissions", i, "quantity", e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <select
                            value={row.unit}
                            onChange={(e) => updateSubArray("directEmissions", i, "unit", e.target.value)}
                            className="w-full px-1 py-1.5 text-xs border border-slate-200 rounded bg-white"
                          >
                            <option value="Tonnes">Tonnes</option>
                            <option value="kL">kL</option>
                            <option value="m³">m³</option>
                            <option value="MMBTU">MMBTU</option>
                            <option value="kg">kg</option>
                          </select>
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            step="any"
                            value={row.emissionFactor}
                            onChange={(e) => updateSubArray("directEmissions", i, "emissionFactor", e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            step="any"
                            value={row.co2Emissions}
                            readOnly
                            className="w-full px-2 py-1.5 text-xs border border-slate-100 rounded bg-slate-50 font-mono font-semibold"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <select
                            value={row.emissionType}
                            onChange={(e) => updateSubArray("directEmissions", i, "emissionType", e.target.value)}
                            className="w-full px-1 py-1.5 text-xs border border-slate-200 rounded bg-white"
                          >
                            <option value="combustion">Combustion</option>
                            <option value="process">Process</option>
                          </select>
                        </td>
                        <td className="px-1 py-1">
                          {form.directEmissions.length > 1 && (
                            <button type="button" onClick={() => removeSubRow("directEmissions", i)} className="p-1 text-slate-400 hover:text-red-500">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Section 3: Indirect Emissions ─────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-700">Indirect Emissions (Scope 2 — Electricity)</h3>
                <button
                  type="button"
                  onClick={() => addSubRow("indirectEmissions", emptyIndirectRow)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                      <th className="px-2 py-2">Source</th>
                      <th className="px-2 py-2 w-28">Consumed</th>
                      <th className="px-2 py-2 w-20">Unit</th>
                      <th className="px-2 py-2 w-28">EF (tCO₂/MWh)</th>
                      <th className="px-2 py-2 w-24">tCO₂</th>
                      <th className="px-2 py-2 w-24">Data Type</th>
                      <th className="px-2 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.indirectEmissions.map((row, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="px-1 py-1">
                          <input
                            value={row.electricitySource}
                            onChange={(e) => updateSubArray("indirectEmissions", i, "electricitySource", e.target.value)}
                            placeholder="Grid / Captive"
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            step="any"
                            value={row.electricityConsumed}
                            onChange={(e) => updateSubArray("indirectEmissions", i, "electricityConsumed", e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <select
                            value={row.unit}
                            onChange={(e) => updateSubArray("indirectEmissions", i, "unit", e.target.value)}
                            className="w-full px-1 py-1.5 text-xs border border-slate-200 rounded bg-white"
                          >
                            <option value="MWh">MWh</option>
                            <option value="kWh">kWh</option>
                            <option value="GWh">GWh</option>
                          </select>
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            step="any"
                            value={row.emissionFactor}
                            onChange={(e) => updateSubArray("indirectEmissions", i, "emissionFactor", e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            step="any"
                            value={row.co2Emissions}
                            readOnly
                            className="w-full px-2 py-1.5 text-xs border border-slate-100 rounded bg-slate-50 font-mono font-semibold"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <select
                            value={row.dataType}
                            onChange={(e) => updateSubArray("indirectEmissions", i, "dataType", e.target.value)}
                            className="w-full px-1 py-1.5 text-xs border border-slate-200 rounded bg-white"
                          >
                            <option value="actual">Actual</option>
                            <option value="default">Default</option>
                          </select>
                        </td>
                        <td className="px-1 py-1">
                          {form.indirectEmissions.length > 1 && (
                            <button type="button" onClick={() => removeSubRow("indirectEmissions", i)} className="p-1 text-slate-400 hover:text-red-500">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Section 4: Precursor Consumption ──────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-700">Precursor Consumption</h3>
                <button
                  type="button"
                  onClick={() => addSubRow("precursorConsumption", emptyPrecursorRow)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </button>
              </div>
              {form.precursorConsumption.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No precursors added. Click "Add Row" if applicable.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                        <th className="px-2 py-2">Precursor</th>
                        <th className="px-2 py-2">Route</th>
                        <th className="px-2 py-2 w-24">Mass/Unit</th>
                        <th className="px-2 py-2 w-24">Total Mass</th>
                        <th className="px-2 py-2 w-28">SEE (tCO₂/t)</th>
                        <th className="px-2 py-2 w-24">Total tCO₂</th>
                        <th className="px-2 py-2 w-32">Origin</th>
                        <th className="px-2 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.precursorConsumption.map((row, i) => (
                        <tr key={i} className="border-b border-slate-50">
                          <td className="px-1 py-1">
                            <input
                              value={row.precursorName}
                              onChange={(e) => updateSubArray("precursorConsumption", i, "precursorName", e.target.value)}
                              placeholder="e.g. Clinker"
                              className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-1 py-1">
                            <select
                              value={row.productionRoute}
                              onChange={(e) => updateSubArray("precursorConsumption", i, "productionRoute", e.target.value)}
                              className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                            >
                              <option value="">Select Route</option>
                              {ALL_PRODUCTION_ROUTES.map((route) => (
                                <option key={route} value={route}>{route}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-1 py-1">
                            <input
                              type="number"
                              step="any"
                              value={row.massPerUnitProduct}
                              onChange={(e) => updateSubArray("precursorConsumption", i, "massPerUnitProduct", e.target.value)}
                              className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                            />
                          </td>
                          <td className="px-1 py-1">
                            <input
                              type="number"
                              step="any"
                              value={row.totalMassConsumed}
                              onChange={(e) => updateSubArray("precursorConsumption", i, "totalMassConsumed", e.target.value)}
                              className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                            />
                          </td>
                          <td className="px-1 py-1">
                            <input
                              type="number"
                              step="any"
                              value={row.specificEmbeddedEmissions}
                              onChange={(e) => updateSubArray("precursorConsumption", i, "specificEmbeddedEmissions", e.target.value)}
                              className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                            />
                          </td>
                          <td className="px-1 py-1">
                            <input
                              type="number"
                              step="any"
                              value={row.totalEmbeddedEmissions}
                              readOnly
                              className="w-full px-2 py-1.5 text-xs border border-slate-100 rounded bg-slate-50 font-mono font-semibold"
                            />
                          </td>
                          <td className="px-1 py-1">
                            <select
                              value={row.origin}
                              onChange={(e) => updateSubArray("precursorConsumption", i, "origin", e.target.value)}
                              className="w-full px-1 py-1.5 text-xs border border-slate-200 rounded bg-white"
                            >
                              <option value="own_installation">Own installation</option>
                              <option value="domestic_supplier">Domestic supplier</option>
                              <option value="imported">Imported</option>
                            </select>
                          </td>
                          <td className="px-1 py-1">
                            <button type="button" onClick={() => removeSubRow("precursorConsumption", i)} className="p-1 text-slate-400 hover:text-red-500">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ── Section 5: Carbon Price ───────────────────────── */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">Carbon Price Paid</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="carbonPricePaid" checked={form.carbonPricePaid} onChange={handleChange} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm text-slate-700">Carbon price was paid in country of origin</span>
                </label>
              </div>
              {form.carbonPricePaid && (
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                    <input
                      name="carbonPriceAmount"
                      type="number"
                      step="any"
                      min="0"
                      value={form.carbonPriceAmount}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                    <select
                      name="carbonPriceCurrency"
                      value={form.carbonPriceCurrency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="INR">INR</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* ── Submit ────────────────────────────────────────── */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={backToList} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? "Update" : "Save as Draft"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // LIST VIEW (default)
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-3 py-3 animate-in fade-in duration-500">
      {/* Header */}
      {/* <SectionHeader icon={ClipboardList} title="CBAM Production Records" description="Enter activity-level emission data for each CBAM product per reporting period" /> */}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Record?</h3>
            <p className="text-sm text-slate-500 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit confirm */}
      {submitConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Submit for Approval?</h3>
            <p className="text-sm text-slate-500 mb-6">Once submitted, the record cannot be edited until reviewed.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSubmitConfirmId(null)} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={() => handleSubmitRecord(submitConfirmId)} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Records table */}
      {filteredRecords.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No Production Records"
          description={records.length === 0 ? "No auto-calculated CBAM production records available." : "No records match your current filters."}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-50">
            <h2 className="text-lg font-bold text-slate-900">
              Records <span className="text-sm font-normal text-slate-400 ml-2">({filteredRecords.length})</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Period</th>
                  <th className="px-5 py-3">Volume</th>
                  <th className="px-5 py-3">Direct tCO₂</th>
                  <th className="px-5 py-3">Indirect tCO₂</th>
                  <th className="px-5 py-3">SEE tCO₂/t</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRecords.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">{getProductName(rec.cbamProductId)}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {rec.reportingYear} {rec.reportingQuarter}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 font-mono">
                      {typeof rec.productionVolume === 'number' && rec.productionVolume > 0 ? rec.productionVolume.toLocaleString() : "—"} {rec.productionUnit}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 font-mono">{rec.totalDirectEmissions?.toFixed(2) || "0"}</td>
                    <td className="px-5 py-4 text-sm text-slate-600 font-mono">{rec.totalIndirectEmissions?.toFixed(2) || "0"}</td>
                    <td className="px-5 py-4 text-sm font-mono font-semibold text-slate-900">{rec.totalSpecificEmbeddedEmissions?.toFixed(4) || "0"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CbamProductionRecords;
