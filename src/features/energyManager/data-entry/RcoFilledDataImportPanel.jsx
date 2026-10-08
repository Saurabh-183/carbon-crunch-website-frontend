import React from "react";
import * as XLSX from "xlsx";
import { AlertTriangle, CheckCircle2, ClipboardList, Database, ExternalLink, FolderUp, Search, Upload, X } from "lucide-react";
import { resolveServiceBaseUrl } from "../../../utils/baseUrl";

const SHEET_TABS = ["Electricity Generation", "Fuel Sheet", "Electricity Consumption"];
const REVIEW_TABS = ["Workbook", "Warnings", "Data Registry", "Evidence Register"];
const GUIDED_SECTIONS = [
  {
    key: "generation",
    step: "Step 1",
    title: "Generation files",
    helper: "Turbines, solar, wind, DG generation, CPP bus, and generation meter sheets.",
  },
  {
    key: "fuel",
    step: "Step 2",
    title: "Fuel files",
    helper: "Boiler fuels, DG fuels, coal, biomass, sludge, HSD, and fuel receipt sheets.",
  },
  {
    key: "gcv",
    step: "Step 3",
    title: "GCV / lab files",
    helper: "Lab reports, quality reports, weighted GCV, and fuel test certificates.",
  },
  {
    key: "consumption",
    step: "Step 4",
    title: "Consumption files",
    helper: "Department consumption, auxiliary, ex-bus, sale, and loss files.",
  },
  {
    key: "rec",
    step: "Step 5",
    title: "REC / sales / banking files",
    helper: "Use only if REC certificates, sales, or banking are applicable.",
    optional: true,
  },
];

const formatValue = (value) => {
  if (typeof value === "number") {
    return Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 3 });
  }
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

const groupMissingData = (missing = []) => {
  const grouped = new Map();
  missing.forEach((item) => {
    const key = `${item.sheet || ""}||${item.field || ""}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        sheet: item.sheet || "",
        field: item.field || "",
        months: [],
        reason: item.reason || "",
        expectedSource: item.expected_source || item.expectedSource || "",
      });
    }
    const record = grouped.get(key);
    if (item.month && !record.months.includes(item.month)) record.months.push(item.month);
  });
  return Array.from(grouped.values());
};

const warningSeverity = (item) => {
  const text = `${item.field || ""} ${item.expectedSource || ""} ${item.reason || ""}`.toLowerCase();
  if (text.includes("gcv") || text.includes("auxiliary") || text.includes("ex-bus") || text.includes("fuel")) return "High";
  if (text.includes("heat") || text.includes("weighted") || text.includes("consumption")) return "Medium";
  return "Low";
};

const warningFix = (item) => {
  const source = item.expectedSource || "";
  if (source) return `Upload or map ${source}`;
  if ((item.field || "").toLowerCase().includes("gcv")) return "Attach fuel quality or lab GCV evidence";
  if ((item.field || "").toLowerCase().includes("generation")) return "Attach monthly generation meter sheet";
  if ((item.field || "").toLowerCase().includes("consumption")) return "Attach department consumption sheet";
  return "Review source workbook and provide supporting evidence";
};

const buildWarnings = (missingData = []) =>
  groupMissingData(missingData).map((item) => ({
    ...item,
    severity: warningSeverity(item),
    suggestedFix: warningFix(item),
    status: "Open",
  }));

const detectCategory = (text = "") => {
  const value = text.toLowerCase();
  if (value.includes("fuel") || value.includes("gcv") || value.includes("boiler")) return "Fuel / Boiler";
  if (value.includes("consumption") || value.includes("auxiliary") || value.includes("sale")) return "Consumption";
  if (value.includes("generation") || value.includes("turbine") || value.includes("dg") || value.includes("grid")) return "Generation";
  return "Mixed";
};

const buildDataRegistry = ({ evidenceMap = [], rawFiles = [], serviceRegistry = null } = {}) => {
  const rows = new Map();
  const touchRow = (fileName, defaults = {}) => {
    if (!fileName) return null;
    if (!rows.has(fileName)) {
      rows.set(fileName, {
        fileName,
        category: defaults.category || detectCategory(fileName),
        months: new Set(),
        evidenceCount: 0,
        sourceSheets: new Set(),
        sizeBytes: defaults.sizeBytes || null,
        status: defaults.status || "Processed",
      });
    }
    return rows.get(fileName);
  };

  (serviceRegistry?.accepted_files || []).forEach((item) => {
    touchRow(item.file_name || item.name, {
      sizeBytes: item.size_bytes,
      status: item.status || "Processed",
    });
  });

  rawFiles.forEach((file) => {
    touchRow(file.webkitRelativePath || file.name, {
      sizeBytes: file.size,
      status: "Selected",
    });
  });

  evidenceMap.forEach((item) => {
    const row = touchRow(item.source_file || "Evidence map");
    if (!row) return;
    row.evidenceCount += 1;
    row.category = detectCategory(`${row.category} ${item.target_sheet || ""} ${item.target_column || ""}`);
    if (item.target_row) row.months.add(item.target_row);
    if (item.source_sheet) row.sourceSheets.add(item.source_sheet);
    row.status = "Mapped";
  });

  (serviceRegistry?.skipped_files || []).forEach((fileName) => {
    rows.set(fileName, {
      fileName,
      category: "Unsupported",
      months: new Set(),
      evidenceCount: 0,
      sourceSheets: new Set(),
      sizeBytes: null,
      status: "Skipped",
    });
  });

  return Array.from(rows.values()).map((row) => ({
    ...row,
    months: Array.from(row.months),
    sourceSheets: Array.from(row.sourceSheets),
  }));
};

const hasCellEvidence = (evidenceMap = [], sheetName, month, column) =>
  evidenceMap.some((item) => item.target_sheet === sheetName && item.target_row === month && item.target_column === column);

const columnLetter = (index) => {
  let value = index + 1;
  let label = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }
  return label;
};

const findCellEvidence = (evidenceMap = [], sheetName, month, column) =>
  evidenceMap.find((item) => item.target_sheet === sheetName && item.target_row === month && item.target_column === column) || null;

const basename = (path = "") => String(path).split(/[\\/]/).pop();

const findUploadedWorkbookFile = (files = [], sourceFile = "") => {
  const targetBase = basename(sourceFile).toLowerCase();
  const targetFull = String(sourceFile || "").toLowerCase();
  return files.find((file) => {
    const fileName = String(file.name || "").toLowerCase();
    const relativePath = String(file.webkitRelativePath || "").toLowerCase();
    return fileName === targetBase || relativePath === targetFull || relativePath.endsWith(`/${targetBase}`);
  }) || null;
};

const normalizeHeaderText = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/mw|kva|kv|tp[h]?|generation|consumption|grid|open access|captive|total|electricity|auxiliary|sale|loss|ex-bus|wte|tg|dg/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const compactHeaderText = (value = "") => String(value).toLowerCase().replace(/[^a-z0-9]+/g, "");

const expectedRcoHeadersFromInfra = (profile) => {
  if (!profile?.assets) return [];
  const headers = [];
  const add = (label, asset, type, aliases = []) => {
    headers.push({
      label,
      assetName: asset?.name || label,
      type,
      aliases: [label, asset?.name, asset?.capacity, ...aliases].filter(Boolean),
    });
  };

  (profile.assets.generation || []).forEach((asset) => {
    const capacity = asset.capacity || "";
    if (asset.type === "Steam Turbine") {
      add(`${asset.name} Generation`, asset, "generation", [`${capacity} TG Generation`, `${compactHeaderText(capacity)}tgeneration`, "TG Generation"]);
    } else if (asset.type === "Diesel Generator") {
      add(`${capacity || asset.name} DG Generation`, asset, "generation", [`${capacity} DG Generation`, "DG Generation"]);
    } else if (asset.type === "Power Grid") {
      add(`${asset.name} Consumption${capacity ? ` (${capacity})` : ""}`, asset, "generation", [`Grid Consumption ${capacity}`, "Grid Consumption", "Open Access"]);
    } else if (asset.type === "Wind Turbine") {
      add(`${capacity || asset.name} Wind Generation`, asset, "generation", [`${capacity} Wind Generation`, "Wind Generation"]);
    } else if (asset.type === "Solar Panel Array") {
      add(`${capacity || asset.name} Solar Generation`, asset, "generation", [`${capacity} Solar Generation`, "Solar Generation"]);
    } else {
      add(`${asset.name} Generation`, asset, "generation");
    }
  });

  (profile.assets.boilers || []).forEach((boiler) => {
    (boiler.fuels || []).forEach((fuel) => {
      add(`${boiler.name} / ${fuel}`, boiler, "fuel", [fuel, `${fuel} GCV`, `${fuel} Consumption`]);
    });
  });

  [...(profile.assets.consumption || []), ...(profile.assets.auxiliary || [])].forEach((asset) => {
    add(asset.name, asset, asset.auxiliary ? "auxiliary" : "consumption", [`${asset.name} Consumption`]);
  });

  ["T Generated", "Total Electricity", "Loss", "Auxiliary", "Sale", "Total Ex-Bus"].forEach((label) => {
    add(label, { name: label }, "calculated", [label]);
  });

  return headers;
};

const inferAssetTypeFromHeader = (column = "") => {
  const text = column.toLowerCase();
  if (text.includes("dg")) return "Diesel Generator";
  if (text.includes("wte")) return "WTE Generator";
  if (text.includes("wind")) return "Wind Turbine";
  if (text.includes("solar")) return "Solar Panel Array";
  if (text.includes("grid") || text.includes("open access")) return "Power Grid";
  if (text.includes("tg") || text.includes("turbine")) return "Steam Turbine";
  if (text.includes("auxiliary")) return "Auxiliary Load";
  if (text.includes("consumption")) return "Consumption Point";
  return "Generation Asset";
};

const cleanAssetNameFromHeader = (column = "") =>
  String(column)
    .replace(/\bGeneration\b/gi, "")
    .replace(/\bConsumption\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

const makeProposedHeaderAsset = (column) => {
  const assetType = inferAssetTypeFromHeader(column);
  const assetName = cleanAssetNameFromHeader(column) || column;
  const type = assetType === "Consumption Point" || assetType === "Auxiliary Load" ? "consumption" : "generation";
  return {
    label: `${assetName} ${type === "generation" ? "Generation" : ""}`.trim(),
    assetName,
    type,
    aliases: [column, assetName],
    proposed: true,
    assetType,
  };
};

const matchWorkbookHeaderToInfra = (column, expectedHeaders = [], manualMappings = {}) => {
  if (column === "Month") return { status: "system", label: "Reporting month" };
  if (manualMappings[column]) {
    const mapped = expectedHeaders.find((item) => item.label === manualMappings[column]);
    if (mapped) return { status: mapped.proposed ? "proposed" : "matched", label: mapped.assetName, type: mapped.type, expected: mapped.label, manual: true };
  }

  const compactColumn = compactHeaderText(column);
  const normalizedColumn = normalizeHeaderText(column);

  let best = null;
  expectedHeaders.forEach((expected) => {
    const candidates = expected.aliases.map((alias) => ({
      raw: String(alias),
      compact: compactHeaderText(alias),
      normalized: normalizeHeaderText(alias),
    }));

    let score = 0;
    candidates.forEach((candidate) => {
      if (!candidate.compact) return;
      if (compactColumn === candidate.compact) score = Math.max(score, 100);
      if (compactColumn.includes(candidate.compact) || candidate.compact.includes(compactColumn)) score = Math.max(score, 80);
      const tokens = candidate.normalized.split(" ").filter(Boolean);
      const matchedTokens = tokens.filter((token) => normalizedColumn.includes(token));
      if (tokens.length) score = Math.max(score, Math.round((matchedTokens.length / tokens.length) * 70));
    });

    if (!best || score > best.score) best = { ...expected, score };
  });

  if (best?.score >= 55) return { status: "matched", label: best.assetName, type: best.type, expected: best.label };
  if (["T Generated", "Total Electricity", "Loss", "Auxiliary", "Sale", "Total Ex-Bus"].includes(column)) {
    return { status: "calculated", label: "RCO calculated field", type: "calculated" };
  }
  return { status: "unmatched", label: "Not connected to plant infra" };
};

const buildHeaderAlignment = (columns = [], profile, manualMappings = {}) => {
  const expected = [...expectedRcoHeadersFromInfra(profile)];
  Object.entries(manualMappings).forEach(([column, label]) => {
    if (label?.startsWith("__new__:")) {
      const proposed = makeProposedHeaderAsset(column);
      expected.push({ ...proposed, label });
    }
  });
  const matches = columns.map((column) => ({ column, ...matchWorkbookHeaderToInfra(column, expected, manualMappings) }));
  const matchedExpectedLabels = new Set(matches.filter((match) => match.status === "matched" || match.status === "proposed").map((match) => match.expected));
  const missingInfra = expected.filter((item) => !item.proposed && item.type !== "calculated" && !matchedExpectedLabels.has(item.label));
  return { expected, matches, missingInfra };
};

const RawWorkbookPicker = ({ files, onChange }) => (
  <label className="block rounded-lg border border-blue-200 bg-blue-50 p-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 text-sm font-black text-blue-950">
          <FolderUp size={16} />
          Upload all files
        </div>
        <div className="mt-1 text-xs font-semibold text-blue-700">
          Add a folder or select many files together. The system classifies generation, fuel, GCV, consumption, DG, grid, and open access files.
        </div>
      </div>
      <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">Default</span>
    </div>
    <input
      type="file"
      accept=".xlsx,.xlsm"
      multiple
      onChange={(event) => onChange(Array.from(event.target.files || []))}
      className="mt-3 block w-full text-xs text-blue-800 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-800"
    />
    {!!files.length && <div className="mt-2 text-[11px] font-semibold text-blue-800">{files.length} workbook{files.length === 1 ? "" : "s"} selected</div>}
  </label>
);

const Stat = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
    <div className="text-base font-black text-slate-900">{value ?? "-"}</div>
    <div className="text-[11px] font-semibold text-slate-500">{label}</div>
  </div>
);

const UploadModeSelector = ({ value, onChange }) => {
  const options = [
    {
      key: "smart",
      title: "Do you want to upload everything together?",
      body: "Best default when they have many separate files.",
      badge: "Upload all files",
    },
    {
      key: "guided",
      title: "Or upload section by section?",
      body: "Best fallback when auto-classification misses something.",
      badge: "Start guided upload",
    },
  ];

  return (
    <div className="grid gap-2 md:grid-cols-2">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className={`rounded-lg border p-3 text-left transition ${
            value === option.key
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-black text-slate-900">{option.title}</div>
            <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${
              value === option.key ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
            }`}>
              {option.badge}
            </span>
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-600">{option.body}</div>
        </button>
      ))}
    </div>
  );
};

const GuidedUploadSteps = ({ filesBySection, onChange }) => (
  <div className="space-y-2">
    {GUIDED_SECTIONS.map((section) => {
      const files = filesBySection[section.key] || [];
      const ready = files.length > 0;
      return (
        <label key={section.key} className="block rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">{section.step}</span>
                <span className="text-sm font-black text-slate-900">{section.title}</span>
                {section.optional && <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">Optional</span>}
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-500">{section.helper}</div>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${
              ready ? "bg-emerald-50 text-emerald-700" : section.optional ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-700"
            }`}>
              {ready ? `${files.length} file${files.length === 1 ? "" : "s"}` : section.optional ? "If applicable" : "Needed"}
            </span>
          </div>
          <input
            type="file"
            accept=".xlsx,.xlsm"
            multiple
            onChange={(event) => onChange(section.key, Array.from(event.target.files || []))}
            className="mt-3 block w-full text-xs text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700"
          />
          {ready && (
            <div className="mt-2 truncate text-[11px] font-semibold text-slate-500">
              {files.map((file) => file.name).join(", ")}
            </div>
          )}
        </label>
      );
    })}
  </div>
);

const ExcelProofModal = ({ proof, workbookFiles, onClose }) => {
  const [state, setState] = React.useState({ loading: true, error: "", rows: [], sheetName: "", target: null });

  React.useEffect(() => {
    let cancelled = false;

    const loadProof = async () => {
      if (!proof?.source_file) {
        setState({ loading: false, error: "No source file is linked to this evidence.", rows: [], sheetName: "", target: null });
        return;
      }

      const file = findUploadedWorkbookFile(workbookFiles, proof.source_file);
      if (!file) {
        setState({
          loading: false,
          error: `Source workbook "${proof.source_file}" is not available in the current upload selection. Re-upload that file to preview it here.`,
          rows: [],
          sheetName: proof.source_sheet || "",
          target: null,
        });
        return;
      }

      try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
        const sheetName = proof.source_sheet && workbook.Sheets[proof.source_sheet] ? proof.source_sheet : workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });
        const target = proof.source_cell ? XLSX.utils.decode_cell(proof.source_cell) : null;

        if (!cancelled) {
          setState({ loading: false, error: "", rows, sheetName, target });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ loading: false, error: error.message || "Could not open this workbook.", rows: [], sheetName: proof.source_sheet || "", target: null });
        }
      }
    };

    setState({ loading: true, error: "", rows: [], sheetName: "", target: null });
    loadProof();
    return () => {
      cancelled = true;
    };
  }, [proof, workbookFiles]);

  if (!proof) return null;

  const startRow = state.target ? Math.max(0, state.target.r - 8) : 0;
  const visibleRows = state.rows.slice(startRow, startRow + 28);
  const maxColumns = Math.min(16, Math.max(...visibleRows.map((row) => row.length), 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="flex max-h-[86vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <div className="text-sm font-black text-slate-900">Source proof</div>
            <div className="mt-1 truncate text-xs font-semibold text-slate-500">
              {proof.source_file || "Source file"} {state.sheetName ? `/ ${state.sheetName}` : ""} {proof.source_cell ? `/ ${proof.source_cell}` : ""}
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
            <X size={18} />
          </button>
        </div>

        {state.loading && <div className="p-6 text-sm font-semibold text-slate-600">Opening workbook...</div>}
        {state.error && (
          <div className="m-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
            {state.error}
          </div>
        )}

        {!state.loading && !state.error && (
          <>
            <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-900">
              Evidence value: <span className="font-black">{formatValue(proof.value)}</span>
              {proof.source_cell && <span className="ml-2">Mapped cell: <span className="font-black">{proof.source_cell}</span></span>}
            </div>
            <div className="overflow-auto">
              <table className="border-separate border-spacing-0 text-xs">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th className="sticky left-0 z-20 min-w-12 border-b border-r border-slate-300 bg-slate-200 px-2 py-2 text-center font-black text-slate-500" />
                    {Array.from({ length: maxColumns }).map((_, index) => (
                      <th key={index} className="min-w-[130px] border-b border-r border-slate-300 bg-slate-200 px-2 py-2 text-center font-black text-slate-600">
                        {columnLetter(index)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, rowOffset) => {
                    const absoluteRow = startRow + rowOffset;
                    return (
                      <tr key={absoluteRow}>
                        <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-100 px-2 py-2 text-center font-bold text-slate-500">
                          {absoluteRow + 1}
                        </td>
                        {Array.from({ length: maxColumns }).map((_, columnIndex) => {
                          const isTarget = state.target?.r === absoluteRow && state.target?.c === columnIndex;
                          return (
                            <td
                              key={columnIndex}
                              className={`min-w-[130px] whitespace-nowrap border-b border-r px-2 py-2 text-slate-800 ${
                                isTarget
                                  ? "border-emerald-500 bg-emerald-100 font-black ring-2 ring-inset ring-emerald-500"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              {formatValue(row?.[columnIndex])}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const HeaderAlignmentSummary = ({ alignment }) => {
  if (!alignment.expected.length) {
    return (
      <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
        Plant infra is not approved yet, so workbook headers are not being checked against asset names.
      </div>
    );
  }

  const matched = alignment.matches.filter((item) => item.status === "matched").length;
  const proposed = alignment.matches.filter((item) => item.status === "proposed").length;
  const unmatched = alignment.matches.filter((item) => item.status === "unmatched").length;

  return (
    <div className="mb-3 rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-black uppercase tracking-wide text-slate-500">Workbook header to plant infra check</div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">{matched} matched</span>
          {!!proposed && <span className="rounded-full bg-purple-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-purple-700">{proposed} proposed</span>}
          <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">{unmatched} workbook-only</span>
          <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-red-700">{alignment.missingInfra.length} infra missing</span>
        </div>
      </div>
      {!!alignment.missingInfra.length && (
        <div className="mt-2 flex flex-wrap gap-1">
          {alignment.missingInfra.slice(0, 8).map((item) => (
            <span key={`${item.type}-${item.label}`} className="rounded-md bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700">
              Missing: {item.label}
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-1">
        {alignment.expected.filter((item) => item.type !== "calculated").slice(0, 12).map((item) => (
          <span key={`${item.type}-${item.label}`} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600">
            {item.type}: {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const headerStatusClass = (status) => {
  if (status === "matched") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "proposed") return "bg-purple-50 text-purple-700 border-purple-200";
  if (status === "calculated" || status === "system") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
};

const DiagramNode = ({ title, subtitle, tone = "slate" }) => {
  const tones = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    red: "border-red-200 bg-red-50 text-red-900",
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    purple: "border-purple-200 bg-purple-50 text-purple-900",
    slate: "border-slate-200 bg-white text-slate-900",
  };

  return (
    <div className={`rounded-lg border px-3 py-2 shadow-sm ${tones[tone] || tones.slate}`}>
      <div className="text-xs font-black">{title}</div>
      {subtitle && <div className="mt-0.5 text-[10px] font-semibold opacity-70">{subtitle}</div>}
    </div>
  );
};

const PlantInfraDiagram = ({ alignment }) => {
  const generation = alignment.expected.filter((item) => item.type === "generation" && !item.proposed);
  const proposed = alignment.expected.filter((item) => item.proposed);
  const fuel = alignment.expected.filter((item) => item.type === "fuel");
  const consumption = alignment.expected.filter((item) => item.type === "consumption");
  const auxiliary = alignment.expected.filter((item) => item.type === "auxiliary");
  const boilers = Array.from(new Set(fuel.map((item) => item.assetName))).filter(Boolean);
  const fuels = fuel.map((item) => item.label.split("/").pop()?.trim()).filter(Boolean);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-xs font-black uppercase tracking-wide text-slate-500">Plant infra diagram</div>
        {!!proposed.length && <span className="rounded-full bg-purple-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-purple-700">{proposed.length} proposed</span>}
      </div>

      <div className="min-w-[720px] overflow-x-auto rounded-lg bg-white p-4">
        <div className="grid grid-cols-[1fr_32px_1fr_32px_1fr_32px_1fr] items-center gap-2">
          <div className="space-y-2">
            <div className="text-center text-[10px] font-black uppercase tracking-wide text-slate-400">Fuels</div>
            {fuels.length ? fuels.slice(0, 5).map((fuelName) => <DiagramNode key={fuelName} title={fuelName} tone="amber" />) : <DiagramNode title="No fuel configured" />}
          </div>

          <div className="text-center text-xl font-black text-slate-300">→</div>

          <div className="space-y-2">
            <div className="text-center text-[10px] font-black uppercase tracking-wide text-slate-400">Boilers</div>
            {boilers.length ? boilers.map((boiler) => <DiagramNode key={boiler} title={boiler} tone="red" />) : <DiagramNode title="No boiler configured" />}
          </div>

          <div className="text-center text-xl font-black text-slate-300">→</div>

          <div className="space-y-2">
            <div className="text-center text-[10px] font-black uppercase tracking-wide text-slate-400">Generation sources</div>
            {generation.map((item) => <DiagramNode key={item.label} title={item.assetName} subtitle={item.label} tone="blue" />)}
            {proposed.map((item) => <DiagramNode key={item.label} title={item.assetName} subtitle="Proposed new asset" tone="purple" />)}
            {!generation.length && !proposed.length && <DiagramNode title="No generation source" />}
          </div>

          <div className="text-center text-xl font-black text-slate-300">→</div>

          <div className="space-y-2">
            <div className="text-center text-[10px] font-black uppercase tracking-wide text-slate-400">CPP Bus / Consumption</div>
            <DiagramNode title="CPP Bus" subtitle="Power distribution" tone="emerald" />
            {consumption.slice(0, 5).map((item) => <DiagramNode key={item.label} title={item.assetName} tone="slate" />)}
            {auxiliary.slice(0, 2).map((item) => <DiagramNode key={item.label} title={item.assetName} subtitle="Auxiliary" tone="amber" />)}
          </div>
        </div>
      </div>
    </div>
  );
};

const HeaderConnectionModal = ({ column, alignment, onConnect, onCreate, onClose }) => {
  if (!column) return null;

  const grouped = alignment.expected.reduce((acc, item) => {
    acc[item.type] = acc[item.type] || [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const sections = [
    ["generation", "Generation assets"],
    ["fuel", "Boilers / fuels"],
    ["consumption", "Consumption departments"],
    ["auxiliary", "Auxiliary loads"],
    ["calculated", "RCO calculated fields"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[88vh] w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
          <div>
            <div className="text-sm font-black text-slate-900">Connect workbook header to plant infra</div>
            <div className="mt-1 text-xs font-semibold text-slate-500">
              Workbook header: <span className="font-black text-slate-800">{column}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
            <X size={18} />
          </button>
        </div>

        {!alignment.expected.length ? (
          <div className="m-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
            No approved plant infra is available. Approve RCO plant infra first, then connect workbook headers.
          </div>
        ) : (
          <div className="max-h-[74vh] overflow-auto p-4">
            <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-900">
              Review the approved plant infra, then connect this workbook header to an existing asset or create a missing asset for Plant Admin follow-up.
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
              <PlantInfraDiagram alignment={alignment} />
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => onCreate(column)}
                  className="w-full rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-left hover:bg-purple-100"
                >
                  <div className="text-sm font-black text-purple-900">Create new asset from this header</div>
                  <div className="mt-1 text-xs font-semibold text-purple-700">
                    Add proposed {inferAssetTypeFromHeader(column)}: {cleanAssetNameFromHeader(column)}
                  </div>
                </button>

                <div className="grid gap-3 md:grid-cols-2">
                  {sections.map(([key, title]) => (
                    <div key={key} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">{title}</div>
                      <div className="space-y-2">
                        {(grouped[key] || []).map((item) => (
                          <button
                            key={`${item.type}-${item.label}`}
                            type="button"
                            onClick={() => onConnect(column, item.label)}
                            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left hover:border-emerald-300 hover:bg-emerald-50"
                          >
                            <div className="text-xs font-black text-slate-900">{item.label}</div>
                            <div className="mt-0.5 text-[11px] font-semibold text-slate-500">{item.assetName}</div>
                          </button>
                        ))}
                        {!grouped[key]?.length && <div className="text-xs font-semibold text-slate-400">No plant infra item</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const WorkbookPreview = ({ filledData, evidenceMap, workbookFiles, onOpenProof, infraProfile }) => {
  const [activeSheet, setActiveSheet] = React.useState(SHEET_TABS[0]);
  const [selectedCell, setSelectedCell] = React.useState(null);
  const [manualMappings, setManualMappings] = React.useState({});
  const [connectingColumn, setConnectingColumn] = React.useState(null);
  const rows = Array.isArray(filledData?.[activeSheet]) ? filledData[activeSheet] : [];
  const columns = React.useMemo(() => {
    const set = new Set();
    rows.forEach((row) => Object.keys(row || {}).forEach((key) => set.add(key)));
    return Array.from(set);
  }, [rows]);
  const alignment = React.useMemo(() => buildHeaderAlignment(columns, infraProfile, manualMappings), [columns, infraProfile, manualMappings]);
  const alignmentByColumn = React.useMemo(() => {
    const map = new Map();
    alignment.matches.forEach((item) => map.set(item.column, item));
    return map;
  }, [alignment]);

  React.useEffect(() => {
    setSelectedCell(null);
  }, [activeSheet]);

  const handleConnectHeader = (column, expectedLabel) => {
    setManualMappings((current) => ({ ...current, [column]: expectedLabel }));
    setConnectingColumn(null);
  };

  const handleCreateHeaderAsset = (column) => {
    setManualMappings((current) => ({ ...current, [column]: `__new__:${column}` }));
    setConnectingColumn(null);
  };

  return (
    <>
    <HeaderAlignmentSummary alignment={alignment} />
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2">
        <div className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-black text-slate-600">
          {selectedCell?.address || "A1"}
        </div>
        <div className="flex-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700">
          {selectedCell ? `${selectedCell.column}: ${formatValue(selectedCell.value)}` : "Select a cell to inspect value and evidence"}
        </div>
        {selectedCell?.evidence && (
          <div className="rounded bg-emerald-100 px-2 py-1 text-[11px] font-black text-emerald-700">Evidence linked</div>
        )}
      </div>

      <div className="max-h-[470px] overflow-auto bg-white">
        <table className="border-separate border-spacing-0 text-xs">
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="sticky left-0 z-30 h-8 min-w-12 border-b border-r border-slate-300 bg-slate-200 text-center font-black text-slate-500" />
              {columns.map((column, columnIndex) => (
                <th key={column} className="h-8 min-w-[150px] border-b border-r border-slate-300 bg-slate-200 px-2 text-center font-black text-slate-600">
                  {columnLetter(columnIndex)}
                </th>
              ))}
            </tr>
            <tr>
              <th className="sticky left-0 z-30 h-10 min-w-12 border-b border-r border-slate-300 bg-slate-100 text-center font-black text-slate-500">#</th>
              {columns.map((column) => (
                <th key={column} className="h-10 min-w-[150px] border-b border-r border-slate-300 bg-slate-50 px-2 text-left font-black text-slate-700">
                  <div>{column}</div>
                  {alignmentByColumn.get(column) && (
                    <button
                      type="button"
                      onClick={() => alignmentByColumn.get(column).status === "unmatched" && setConnectingColumn(column)}
                      className={`mt-1 inline-flex max-w-[135px] rounded border px-1.5 py-0.5 text-left text-[9px] font-black uppercase tracking-wide ${headerStatusClass(alignmentByColumn.get(column).status)} ${
                        alignmentByColumn.get(column).status === "unmatched" ? "cursor-pointer hover:ring-2 hover:ring-amber-200" : "cursor-default"
                      }`}
                      title={alignmentByColumn.get(column).status === "unmatched" ? "Connect this header to plant infra" : alignmentByColumn.get(column).expected || alignmentByColumn.get(column).label}
                    >
                      <span className="truncate">{alignmentByColumn.get(column).label}</span>
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 120).map((row, rowIndex) => (
              <tr key={`${row.Month || "row"}-${rowIndex}`}>
                <td className="sticky left-0 z-10 h-9 min-w-12 border-b border-r border-slate-200 bg-slate-100 text-center font-bold text-slate-500">
                  {rowIndex + 1}
                </td>
                {columns.map((column, columnIndex) => {
                  const evidence = column !== "Month" ? findCellEvidence(evidenceMap, activeSheet, row.Month, column) : null;
                  const address = `${columnLetter(columnIndex)}${rowIndex + 1}`;
                  const isSelected = selectedCell?.address === address;
                  return (
                    <td
                      key={column}
                      onClick={() => setSelectedCell({ address, sheet: activeSheet, row: row.Month, column, value: row[column], evidence })}
                      className={`h-9 min-w-[150px] cursor-cell whitespace-nowrap border-b border-r px-2 text-slate-800 ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50 ring-2 ring-inset ring-emerald-500"
                          : evidence
                            ? "border-slate-200 bg-emerald-50/40"
                            : "border-slate-200 bg-white hover:bg-blue-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={column === "Month" ? "font-bold text-slate-900" : ""}>{formatValue(row[column])}</span>
                        {evidence && <span className="h-2 w-2 rounded-full bg-emerald-500" title="Evidence linked" />}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCell?.evidence && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          <div className="min-w-0 truncate">
            <span className="font-black">{selectedCell.address}</span>
            <span className="mx-2 text-emerald-500">|</span>
            {selectedCell.evidence.source_file || "Source file unavailable"}
            {selectedCell.evidence.source_sheet ? ` / ${selectedCell.evidence.source_sheet}` : ""}
            {selectedCell.evidence.source_cell ? ` / ${selectedCell.evidence.source_cell}` : ""}
          </div>
          <button
            type="button"
            onClick={() => onOpenProof?.(selectedCell.evidence)}
            className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-black text-emerald-700 shadow-sm hover:bg-emerald-100"
          >
            <ExternalLink size={12} />
            View proof
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-100 px-3 py-2">
        <div className="flex min-w-0 flex-wrap gap-1">
          {SHEET_TABS.map((sheet) => (
            <button
              key={sheet}
              type="button"
              onClick={() => setActiveSheet(sheet)}
              className={`rounded-t-md border px-3 py-1.5 text-xs font-bold ${
                activeSheet === sheet
                  ? "border-emerald-500 bg-white text-emerald-700"
                  : "border-slate-300 bg-slate-200 text-slate-600 hover:bg-white"
              }`}
            >
              {sheet}
            </button>
          ))}
        </div>
        <div className="shrink-0 text-[11px] font-semibold text-slate-500">
          {rows.length > 120 ? "Showing first 120 rows" : `${rows.length} rows`}
        </div>
      </div>
    </div>
    <HeaderConnectionModal
      column={connectingColumn}
      alignment={alignment}
      onConnect={handleConnectHeader}
      onCreate={handleCreateHeaderAsset}
      onClose={() => setConnectingColumn(null)}
    />
    </>
  );
};

const WarningsReview = ({ missingData }) => {
  const warnings = buildWarnings(missingData);
  if (!warnings.length) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
        No warnings found in the current RCO workspace.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <div className="text-sm font-black text-slate-900">Warnings</div>
        <div className="text-xs font-bold text-slate-500">{warnings.length} open item{warnings.length === 1 ? "" : "s"}</div>
      </div>
      <div className="max-h-[420px] overflow-auto">
        <table className="min-w-full text-xs">
          <thead className="sticky top-0 bg-slate-50">
            <tr>
              {["Severity", "Area", "Missing / suspicious item", "Months", "Required document", "Suggested fix", "Status"].map((header) => (
                <th key={header} className="border-b border-slate-200 px-3 py-2 text-left font-black text-slate-600">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {warnings.map((item) => (
              <tr key={`${item.sheet}-${item.field}`} className="border-b border-slate-100">
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${
                    item.severity === "High"
                      ? "bg-red-100 text-red-700"
                      : item.severity === "Medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                  }`}>
                    {item.severity}
                  </span>
                </td>
                <td className="px-3 py-2 font-semibold text-slate-800">{item.sheet}</td>
                <td className="px-3 py-2 text-slate-700">{item.field}</td>
                <td className="px-3 py-2 text-slate-700">{item.months.join(", ") || "-"}</td>
                <td className="px-3 py-2 text-slate-700">{item.expectedSource || "-"}</td>
                <td className="px-3 py-2 text-slate-700">{item.suggestedFix}</td>
                <td className="px-3 py-2">
                  <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-red-700">{item.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DataRegistry = ({ rows }) => {
  if (!rows.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600">
        No file registry is available yet. Extract from Excel or load evidence mapping to populate it.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-black text-slate-900">
          <Database size={15} />
          Data registry
        </div>
        <div className="text-xs font-bold text-slate-500">{rows.length} file{rows.length === 1 ? "" : "s"} tracked</div>
      </div>
      <div className="max-h-[420px] overflow-auto">
        <table className="min-w-full text-xs">
          <thead className="sticky top-0 bg-slate-50">
            <tr>
              {["File", "Detected category", "Months", "Source sheets", "Evidence links", "Size", "Status"].map((header) => (
                <th key={header} className="border-b border-slate-200 px-3 py-2 text-left font-black text-slate-600">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.fileName} className="border-b border-slate-100">
                <td className="max-w-[320px] truncate px-3 py-2 font-semibold text-slate-800">{item.fileName}</td>
                <td className="px-3 py-2 text-slate-700">{item.category}</td>
                <td className="max-w-[240px] truncate px-3 py-2 text-slate-700">{item.months.join(", ") || "-"}</td>
                <td className="max-w-[240px] truncate px-3 py-2 text-slate-700">{item.sourceSheets.join(", ") || "-"}</td>
                <td className="px-3 py-2 text-slate-700">{item.evidenceCount}</td>
                <td className="px-3 py-2 text-slate-700">{item.sizeBytes ? `${Math.round(item.sizeBytes / 1024).toLocaleString()} KB` : "-"}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${
                    item.status === "Skipped"
                      ? "bg-red-50 text-red-700"
                      : item.status === "Selected"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-emerald-50 text-emerald-700"
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EvidenceRegister = ({ evidenceMap }) => {
  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return evidenceMap || [];
    return (evidenceMap || []).filter((item) => JSON.stringify(item).toLowerCase().includes(q));
  }, [evidenceMap, query]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2">
        <Search size={14} className="text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search evidence"
          className="w-full bg-transparent text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>
      <div className="max-h-[420px] overflow-auto">
        <table className="min-w-full text-xs">
          <thead className="sticky top-0 bg-slate-50">
            <tr>
              {["Target", "Value", "Source file", "Source cell", "Confidence"].map((header) => (
                <th key={header} className="border-b border-slate-200 px-3 py-2 text-left font-black text-slate-600">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 200).map((item, index) => (
              <tr key={`${item.target_sheet}-${item.target_row}-${item.target_column}-${index}`} className="border-b border-slate-100">
                <td className="px-3 py-2 font-semibold text-slate-800">{item.target_sheet} / {item.target_row} / {item.target_column}</td>
                <td className="px-3 py-2 text-slate-700">{formatValue(item.value)}</td>
                <td className="max-w-[280px] truncate px-3 py-2 text-slate-700">{item.source_file || "-"}</td>
                <td className="px-3 py-2 text-slate-700">{item.source_sheet || "-"} {item.source_cell || ""}</td>
                <td className="px-3 py-2 text-slate-700">{item.confidence ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length > 200 && <div className="border-t border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-500">Showing first 200 evidence rows.</div>}
    </div>
  );
};

const RcoFilledDataImportPanel = ({ visible, saving, onImport, infraProfile = null }) => {
  const [uploadMode, setUploadMode] = React.useState("smart");
  const [rawWorkbookFiles, setRawWorkbookFiles] = React.useState([]);
  const [guidedFiles, setGuidedFiles] = React.useState({});
  const [filledData, setFilledData] = React.useState(null);
  const [evidenceMap, setEvidenceMap] = React.useState([]);
  const [missingData, setMissingData] = React.useState([]);
  const [preview, setPreview] = React.useState(null);
  const [activeReviewTab, setActiveReviewTab] = React.useState(REVIEW_TABS[0]);
  const [error, setError] = React.useState("");
  const [extracting, setExtracting] = React.useState(false);
  const [serviceRegistry, setServiceRegistry] = React.useState(null);
  const [proofEvidence, setProofEvidence] = React.useState(null);

  if (!visible) return null;

  const guidedWorkbookFiles = Object.values(guidedFiles).flat();
  const workbookFiles = uploadMode === "guided" ? guidedWorkbookFiles : rawWorkbookFiles;
  const requiredGuidedSectionsReady = GUIDED_SECTIONS.filter((section) => !section.optional).every((section) => (guidedFiles[section.key] || []).length);
  const registryRows = buildDataRegistry({ evidenceMap, rawFiles: workbookFiles, serviceRegistry });

  const handleGuidedFilesChange = (sectionKey, files) => {
    setGuidedFiles((current) => ({
      ...current,
      [sectionKey]: files,
    }));
  };

  const handleServiceExtract = async () => {
    setError("");
    setPreview(null);
    if (!workbookFiles.length) {
      setError(uploadMode === "guided" ? "Add files for at least one guided upload section first." : "Choose a folder or one or more raw RCO Excel files first.");
      return;
    }

    if (uploadMode === "guided" && !requiredGuidedSectionsReady) {
      setError("Add generation, fuel, GCV / lab, and consumption files before extracting guided upload.");
      return;
    }

    try {
      setExtracting(true);
      const formData = new FormData();
      workbookFiles.forEach((file) => formData.append("files", file, file.webkitRelativePath || file.name));

      const serviceUrl = resolveServiceBaseUrl("rcoexcel");
      const response = await fetch(`${serviceUrl}/workpaper/extract`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.detail || detail?.message || "RCO service extraction failed.");
      }

      const result = await response.json();
      const data = result?.data || {};
      const nextFilledData = data.filled_data || {};
      const nextMissingData = Array.isArray(data.missing_data) ? data.missing_data : [];
      const nextEvidenceMap = Array.isArray(data.evidence_map) ? data.evidence_map : [];

      setFilledData(nextFilledData);
      setMissingData(nextMissingData);
      setEvidenceMap(nextEvidenceMap);
      setServiceRegistry(result?.registry || null);

      const parsed = await onImport({ filledData: nextFilledData, evidenceMap: nextEvidenceMap, dryRun: true });
      setPreview(parsed?.stats || null);
      setActiveReviewTab("Workbook");
    } catch (err) {
      const message = err instanceof TypeError && /fetch/i.test(err.message || "")
        ? "RCO Excel service is not running on port 8004. Start the service, then click Extract from Excel again."
        : err.message || "Could not extract RCO workbook data.";
      setError(message);
    } finally {
      setExtracting(false);
    }
  };

  const handleImport = async () => {
    setError("");
    try {
      const result = await onImport({ filledData, evidenceMap, dryRun: false });
      setPreview(result?.stats || null);
    } catch (err) {
      setError(err.message || "Import failed.");
    }
  };

  const loaded = Boolean(filledData && preview);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900">
            <ClipboardList size={17} />
            RCO workpaper workspace
          </div>
          <p className="mt-1 text-xs font-medium text-slate-600">
            Review Streamlit-generated RCO workpaper outputs before converting approved rows into platform draft entries.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleServiceExtract} disabled={saving || extracting} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60">
            <Upload size={14} />
            {extracting ? "Extracting..." : "Extract from Excel"}
          </button>
          <button type="button" onClick={handleImport} disabled={saving || extracting || !loaded} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
            <Upload size={14} />
            Import reviewed drafts
          </button>
        </div>
      </div>

      <div className="mt-4">
        <UploadModeSelector value={uploadMode} onChange={setUploadMode} />
      </div>

      <div className="mt-3">
        {uploadMode === "smart" ? (
          <RawWorkbookPicker files={rawWorkbookFiles} onChange={setRawWorkbookFiles} />
        ) : (
          <GuidedUploadSteps filesBySection={guidedFiles} onChange={handleGuidedFilesChange} />
        )}
      </div>

      {preview && (
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
          <Stat label="Sheets loaded" value={preview.sheetCount} />
          <Stat label="Rows read" value={preview.rowCount} />
          <Stat label="Draft rows" value={preview.entryCount} />
          <Stat label="Evidence matches" value={preview.evidenceMatchCount} />
          <Stat label="Summary skipped" value={preview.skippedSummaryRows} />
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      {loaded && (
        <div className="mt-4">
          <div className="mb-2 flex flex-wrap gap-1">
            {REVIEW_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveReviewTab(tab)}
                className={`rounded-lg px-3 py-2 text-xs font-bold ${activeReviewTab === tab ? "bg-blue-600 text-white" : "bg-white text-slate-700 hover:bg-slate-100"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeReviewTab === "Workbook" && <WorkbookPreview filledData={filledData} evidenceMap={evidenceMap} workbookFiles={workbookFiles} onOpenProof={setProofEvidence} infraProfile={infraProfile} />}
          {activeReviewTab === "Warnings" && <WarningsReview missingData={missingData} />}
          {activeReviewTab === "Data Registry" && <DataRegistry rows={registryRows} />}
          {activeReviewTab === "Evidence Register" && <EvidenceRegister evidenceMap={evidenceMap} />}

          <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-800">
            <CheckCircle2 size={14} />
            Review the workbook, warnings, data registry, and evidence register, then import reviewed drafts.
          </div>
        </div>
      )}

      {!loaded && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-3 text-xs font-semibold text-slate-500">
          <FolderUp size={14} />
          Upload RCO Excel files and click Extract from Excel to preview the workbook here.
        </div>
      )}

      <ExcelProofModal proof={proofEvidence} workbookFiles={workbookFiles} onClose={() => setProofEvidence(null)} />
    </div>
  );
};

export default RcoFilledDataImportPanel;
