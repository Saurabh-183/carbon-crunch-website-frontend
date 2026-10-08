const MONTHS = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];

const MONTH_INDEX = new Map(MONTHS.map((month, index) => [month.toLowerCase(), index]));

const SHEET_CONFIG = {
  "Electricity Generation": {
    module: "rco_electricity_generation",
    scope: "Scope 2",
    section: "RCO - Electricity Generation",
    defaultUnit: "kWh",
  },
  "Fuel Sheet": {
    module: "rco_fuel_sheet",
    scope: "Scope 1",
    section: "RCO - Fuel Sheet",
    defaultUnit: "kg",
  },
  "Electricity Consumption": {
    module: "rco_electricity_consumption",
    scope: "Scope 2",
    section: "RCO - Electricity Consumption",
    defaultUnit: "kWh",
  },
};

const SUMMARY_MONTH_LABELS = new Set(["total", "quarter wise", "q1", "q2", "q3", "q4", ""]);

const normalizeLabel = (value) => String(value || "").trim();

const isFiniteNumber = (value) => {
  if (value === null || value === undefined || value === "") return false;
  return Number.isFinite(Number(value));
};

const parseFiscalYears = (reportingPeriod = "") => {
  const years = String(reportingPeriod || "").match(/\b(20\d{2}|19\d{2})\b/g) || [];
  const startYear = years.length ? Number(years[0]) : new Date().getFullYear();
  const endYear = years.length > 1 ? Number(years[1]) : startYear + 1;
  return { startYear, endYear };
};

const monthToDate = (month, reportingPeriod) => {
  const normalized = normalizeLabel(month);
  const monthIndex = MONTH_INDEX.get(normalized.toLowerCase());
  if (monthIndex === undefined) return new Date().toISOString().split("T")[0];

  const { startYear, endYear } = parseFiscalYears(reportingPeriod);
  const calendarMonth = monthIndex < 9 ? monthIndex + 3 : monthIndex - 9;
  const year = monthIndex < 9 ? startYear : endYear;
  return new Date(Date.UTC(year, calendarMonth, 1)).toISOString().split("T")[0];
};

const classifyElectricityGeneration = (column) => {
  const lower = column.toLowerCase();
  if (lower.includes("grid") || lower.includes("open access")) return "Procurement";
  if (lower.includes("wind") || lower.includes("solar") || lower.includes("wte") || lower.includes("renewable")) return "Renewable";
  if (lower.includes("auxiliary")) return "Auxiliary";
  if (lower.includes("sale")) return "Sale";
  if (lower.includes("loss")) return "Loss";
  if (lower.includes("total") || lower.includes("ex-bus")) return "Calculated";
  return "Generation";
};

const classifyFuel = (column) => {
  const lower = column.toLowerCase();
  if (lower.includes("gcv")) return "GCV";
  if (lower.includes("heat") || lower.includes("weighted")) return "Heat";
  if (lower.includes("total")) return "Summary";
  return "Fuel Consumption";
};

const classifyConsumption = (column) => {
  const lower = column.toLowerCase();
  if (lower.includes("total")) return "Calculated";
  if (lower.includes("utility")) return "Utility";
  if (lower.includes("machine") || lower.includes("m/c") || lower.includes("pulper")) return "Machine";
  return "Department";
};

const inferUnit = (sheetName, column) => {
  const lower = column.toLowerCase();
  if (sheetName === "Fuel Sheet") {
    if (lower.includes("gcv") || lower.includes("weighted")) return "kcal/kg";
    if (lower.includes("heat")) return "kcal";
    if (lower.includes("gas")) return "SCM";
    if (lower.includes("total") || lower.includes("summary")) return "Calculated";
    return "kg";
  }

  if (lower.includes("total") || lower.includes("loss")) return "Calculated";
  return "kWh";
};

const classifyBySheet = (sheetName, column) => {
  if (sheetName === "Electricity Generation") return classifyElectricityGeneration(column);
  if (sheetName === "Fuel Sheet") return classifyFuel(column);
  return classifyConsumption(column);
};

const buildEvidenceLookup = (evidenceMap = []) => {
  const lookup = new Map();
  if (!Array.isArray(evidenceMap)) return lookup;

  evidenceMap.forEach((item) => {
    const key = [
      normalizeLabel(item.target_sheet),
      normalizeLabel(item.target_row),
      normalizeLabel(item.target_column),
    ].join("||");
    lookup.set(key, item);
  });

  return lookup;
};

const evidenceSummary = (evidence) => {
  if (!evidence) return "";
  const parts = [
    evidence.source_file ? `Source file: ${evidence.source_file}` : "",
    evidence.source_sheet ? `sheet ${evidence.source_sheet}` : "",
    evidence.source_cell ? `cell ${evidence.source_cell}` : "",
    evidence.match_method ? `match: ${evidence.match_method}` : "",
  ].filter(Boolean);
  return parts.join("; ");
};

export const parseRcoFilledDataJson = ({ filledData, evidenceMap = [], reportingPeriod = "" }) => {
  const evidenceLookup = buildEvidenceLookup(evidenceMap);
  const entriesByModule = {};
  const stats = {
    sheetCount: 0,
    rowCount: 0,
    entryCount: 0,
    evidenceMatchCount: 0,
    skippedSummaryRows: 0,
  };

  Object.entries(filledData || {}).forEach(([sheetName, rows]) => {
    const config = SHEET_CONFIG[sheetName];
    if (!config || !Array.isArray(rows)) return;

    stats.sheetCount += 1;
    rows.forEach((row) => {
      stats.rowCount += 1;
      const month = normalizeLabel(row.Month);
      const monthKey = month.toLowerCase();
      if (!MONTH_INDEX.has(monthKey)) {
        if (SUMMARY_MONTH_LABELS.has(monthKey)) stats.skippedSummaryRows += 1;
        return;
      }

      Object.entries(row).forEach(([column, value]) => {
        if (column === "Month" || !isFiniteNumber(value)) return;

        const evidenceKey = [sheetName, month, column].join("||");
        const evidence = evidenceLookup.get(evidenceKey);
        if (evidence) stats.evidenceMatchCount += 1;

        const entry = {
          module: config.module,
          scope: config.scope,
          section: config.section,
          date: monthToDate(month, reportingPeriod),
          activityType: classifyBySheet(sheetName, column),
          activityGroup: month,
          activityCategory: sheetName,
          source: column,
          consumption: Number(value),
          unit: inferUnit(sheetName, column) || config.defaultUnit,
          measurementMethod: "RCO Workpaper Import",
          remarks: evidenceSummary(evidence),
          importBatchId: `rco_${Date.now()}`,
        };

        if (!entriesByModule[config.module]) entriesByModule[config.module] = [];
        entriesByModule[config.module].push(entry);
        stats.entryCount += 1;
      });
    });
  });

  return { entriesByModule, stats };
};

export const getRcoImportModules = () => Object.values(SHEET_CONFIG).map((config) => config.module);
