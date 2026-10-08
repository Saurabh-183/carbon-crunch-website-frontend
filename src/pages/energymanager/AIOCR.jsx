import React, { useMemo, useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { resolveBaseUrl, resolveServiceBaseUrl } from "../../utils/baseUrl";
import { MODULES, getModuleByKey, buildEmptyEntry, buildModuleSubmissionPayload } from "../../features/energyManager/data-entry/moduleConfig";
import SectionHeader from "../../components/rf/Header";
import { File as FileIcon, ScanLine, ChevronDown, AlertCircle, CheckCircle, Loader2, FileClock, FileText, Calendar, Activity, Database, Inbox } from "lucide-react";

const MODULE_KEYS = new Set(MODULES.map((moduleItem) => moduleItem.key));

const inferModuleFromRow = (row, fallbackScope) => {
  const rowModule = row?.module;
  if (rowModule && MODULE_KEYS.has(rowModule)) return rowModule;

  const scopeValue = row?.scope || fallbackScope;
  if (scopeValue === "Scope 2") return "electrical_power";
  if (scopeValue === "Scope 3") return "scope3_value_chain";

  const activityType = (row?.activityType || "").toLowerCase();
  if (activityType.includes("transport") || activityType.includes("travel") || activityType.includes("commute") || activityType.includes("logistics")) {
    return "logistics_transportation";
  }
  if (activityType.includes("process") || activityType.includes("fugitive") || activityType.includes("refrigerant")) {
    return "process_fugitive";
  }
  return "stationary_combustion";
};

const getDefaultModuleFromScope = (scopeValue) => {
  if (scopeValue === "Scope 2") return "electrical_power";
  if (scopeValue === "Scope 3") return "scope3_value_chain";
  return "stationary_combustion";
};

const AIOCR = () => {
  const { user } = useAuth();
  const facilityId = user?.facilities?.[0]?.facilityId?._id || user?.facilities?.[0]?.facilityId || null;
  const [files, setFiles] = useState([]);
  const [scope, setScope] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [message, setMessage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [drafts, setDrafts] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [reportingPeriod, setReportingPeriod] = useState(null);
  const scanAbortRef = useRef(null);

  const baseURL = resolveBaseUrl();
  const serviceUrl = resolveServiceBaseUrl("ocr");

  const isFile = (value) => typeof globalThis !== "undefined" && globalThis.File && value instanceof globalThis.File;

  const activeDraft = drafts[activeIndex] || {};
  const activeFile = files[activeIndex] || null;
  const activeModule = useMemo(() => getModuleByKey(activeDraft.module), [activeDraft.module]);
  const activeModuleColumns = useMemo(() => (activeModule?.columns || []).filter((column) => column.key !== "assetId"), [activeModule]);

  const getColumnConfig = (moduleKey, fieldKey) => {
    const moduleConfig = getModuleByKey(moduleKey);
    return (moduleConfig?.columns || []).find((column) => column.key === fieldKey);
  };

  const mapToModuleOptionValue = (moduleKey, fieldKey, rawValue) => {
    if (rawValue === undefined || rawValue === null || rawValue === "") return "";
    const column = getColumnConfig(moduleKey, fieldKey);
    const options = column?.options || [];
    if (!options.length) return rawValue;

    const normalizedRaw = String(rawValue).trim().toLowerCase();
    const exact = options.find((option) => String(option).trim().toLowerCase() === normalizedRaw);
    if (exact) return exact;

    const partial = options.find((option) => {
      const normalizedOption = String(option).trim().toLowerCase();
      return normalizedOption.includes(normalizedRaw) || normalizedRaw.includes(normalizedOption);
    });
    return partial || "";
  };

  const fetchOcrDrafts = async () => {
    try {
      const queryParams = [];
      if (facilityId) {
        queryParams.push(`facilityId=${facilityId}`);
      }
      const token = Cookies.get("accessToken");
      const response = await axios.get(`${baseURL}/api/submissions${queryParams.length ? `?${queryParams.join("&")}` : ""}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        withCredentials: true,
      });
      const submissions = response.data?.data || [];
      const drafts = [];
      submissions.forEach((submission) => {
        const isDraft = (submission.status || "draft") === "draft" || submission.status === "rejected";
        if (!isDraft) return;
        const scopePayloads = [
          { scope: "Scope 1", data: submission.scope1Data },
          { scope: "Scope 2", data: submission.scope2Data },
          { scope: "Scope 3", data: submission.scope3Data },
        ];
        scopePayloads.forEach(({ scope, data }) => {
          if (!data) return;
          const isOcrScope =
            data.importedFrom === "ocr" ||
            String(data.importBatchId || "")
              .toLowerCase()
              .startsWith("ocr-");
          const sections = data.sections || [];
          sections.forEach((section) => {
            (section.activities || []).forEach((activity) => {
              (activity.sources || []).forEach((source) => {
                const hasDocument = Boolean(source?.supportingDocument?.originalName);
                if (!isOcrScope && !hasDocument) return;
                drafts.push({
                  fileName: source?.supportingDocument?.originalName || "",
                  scope,
                  activityType: activity.activityType || section.name || "",
                  activityGroup: activity.activityGroup || "",
                  activityCategory: activity.activityCategory || "",
                  source: source.source || "",
                  consumption: source.consumption,
                  unit: source.unit || "",
                  date: source.date || "",
                });
              });
            });
          });
        });
      });
      setSavedDrafts(drafts);
    } catch (error) {
      console.error("Failed to fetch OCR drafts:", error);
    }
  };

  const fetchFacilityReportingPeriod = async () => {
    if (!facilityId) return;
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(`${baseURL}/api/facilities/${facilityId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        withCredentials: true,
      });
      const facility = response.data?.data;
      if (facility?.reportingPeriod) {
        setReportingPeriod(facility.reportingPeriod);
      }
    } catch (error) {
      console.error("Failed to fetch facility reporting period:", error);
    }
  };

  const isDateWithinReportingPeriod = (dateString) => {
    if (!reportingPeriod?.startDate || !reportingPeriod?.endDate || !dateString) {
      return true; // If no reporting period set, allow any date
    }
    const date = new Date(dateString);
    const start = new Date(reportingPeriod.startDate);
    const end = new Date(reportingPeriod.endDate);
    return date >= start && date <= end;
  };

  const getDefaultDate = (extractedDate) => {
    if (extractedDate && isDateWithinReportingPeriod(extractedDate)) {
      return extractedDate;
    }
    // Use reporting period start date as default if available
    if (reportingPeriod?.startDate) {
      return normalizeDateValue(reportingPeriod.startDate);
    }
    return new Date().toISOString().split("T")[0];
  };

  useEffect(() => {
    if (!activeFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(activeFile);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [activeFile]);

  useEffect(() => {
    fetchOcrDrafts();
    fetchFacilityReportingPeriod();
  }, [facilityId]);

  const handleFilesChange = (event) => {
    const selected = Array.from(event.target.files || []);
    const MAX_SIZE = 1 * 1024 * 1024; // 1 MB
    const oversized = selected.filter((f) => f.size > MAX_SIZE);
    if (oversized.length) {
      const names = oversized.map((f) => f.name).join(", ");
      toast.error(`File size must be under 1 MB. Too large: ${names}`);
      event.target.value = "";
      return;
    }
    setFiles(selected);
    setResults([]);
    setMessage(null);
    setModalOpen(false);
    setDrafts([]);
  };

  const getDefaultMeasurementMethod = (moduleKey) => {
    const measurementMethodColumn = getColumnConfig(moduleKey, "measurementMethod");
    return measurementMethodColumn?.options?.[0] || "";
  };

  const normalizeDateValue = (value) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().split("T")[0];
  };

  const buildDraftFromResult = (row, file) => {
    const inferredModule = inferModuleFromRow(row, scope === "auto" ? "Scope 2" : scope);
    const baseEntry = buildEmptyEntry(inferredModule);
    const entryDate = normalizeDateValue(row?.date) || "";

    const extracted = {
      module: inferredModule,
      activityType: row?.activityType || "",
      activityGroup: row?.activityGroup || "",
      activityCategory: row?.activityCategory || "",
      source: row?.source || "",
      consumption: row?.totalConsumption ?? "",
      unit: row?.unit || "",
      date: row?.date || "",
      measurementMethod: row?.measurementMethod || "",
      matchedLine: row?.matchedLine || "",
    };

    const draft = {
      ...baseEntry,
      fileName: row?.fileName || file?.name || "",
      module: inferredModule,
      activityType: mapToModuleOptionValue(inferredModule, "activityType", row?.activityType) || row?.activityType || "",
      activityGroup: mapToModuleOptionValue(inferredModule, "activityGroup", row?.activityGroup) || row?.activityGroup || "",
      activityCategory: mapToModuleOptionValue(inferredModule, "activityCategory", row?.activityCategory) || row?.activityCategory || "",
      source: mapToModuleOptionValue(inferredModule, "source", row?.source) || row?.source || "",
      unit: mapToModuleOptionValue(inferredModule, "unit", row?.unit) || row?.unit || "",
      consumption: row?.totalConsumption ?? "",
      date: entryDate,
      measurementMethod: mapToModuleOptionValue(inferredModule, "measurementMethod", row?.measurementMethod) || row?.measurementMethod || getDefaultMeasurementMethod(inferredModule),
      supportingDocument: file || null,
      extracted,
      extractedSelections: {
        module: Boolean(extracted.module),
        activityType: Boolean(extracted.activityType),
        activityGroup: Boolean(extracted.activityGroup),
        activityCategory: Boolean(extracted.activityCategory),
        source: Boolean(extracted.source),
        consumption: extracted.consumption !== "" && extracted.consumption !== null && extracted.consumption !== undefined,
        unit: Boolean(extracted.unit),
        date: Boolean(extracted.date),
        measurementMethod: Boolean(extracted.measurementMethod),
      },
    };

    return draft;
  };

  const buildEmptyDraft = (file) => {
    const initialModule = getDefaultModuleFromScope(scope === "auto" ? "Scope 2" : scope);
    const baseEntry = buildEmptyEntry(initialModule);
    return {
      ...baseEntry,
      fileName: file?.name || "",
      module: initialModule,
      supportingDocument: file || null,
      extracted: {
        module: "",
        activityType: "",
        activityGroup: "",
        activityCategory: "",
        source: "",
        consumption: "",
        unit: "",
        date: "",
        measurementMethod: "",
        matchedLine: "",
      },
      extractedSelections: {
        module: false,
        activityType: false,
        activityGroup: false,
        activityCategory: false,
        source: false,
        consumption: false,
        unit: false,
        date: false,
        measurementMethod: false,
      },
    };
  };

  const handleScan = async () => {
    if (!files.length) {
      toast.error("Please select at least one file.");
      return;
    }
    setLoading(true);
    setActiveIndex(0);
    setModalOpen(true);
    setDrafts(files.map((file) => buildEmptyDraft(file)));

    if (scanAbortRef.current) {
      scanAbortRef.current.abort();
    }
    const controller = new AbortController();
    scanAbortRef.current = controller;

    const payload = new FormData();
    files.forEach((file) => payload.append("files", file));
    if (scope !== "auto") payload.append("scope", scope);

    try {
      const response = await axios.post(`${serviceUrl}/ocr/extract`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
        signal: controller.signal,
      });
      const rows = response.data?.data || [];
      setResults(rows);
      const nextDrafts = rows.map((row, index) => buildDraftFromResult(row, files[index] || null));
      setDrafts(nextDrafts);
      toast.success(`Successfully scanned ${rows.length} file${rows.length > 1 ? "s" : ""}`);
    } catch (error) {
      if (error.name === "CanceledError") {
        toast.error("Scan canceled.");
        return;
      }
      toast.error(error.response?.data?.detail || error.message || "Failed to process files.");
    } finally {
      if (scanAbortRef.current === controller) {
        scanAbortRef.current = null;
      }
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (scanAbortRef.current) {
      scanAbortRef.current.abort();
      scanAbortRef.current = null;
    }
    setLoading(false);
    setModalOpen(false);
  };

  const updateDraftField = (field, value) => {
    setDrafts((prev) =>
      prev.map((draft, index) =>
        index === activeIndex
          ? {
              ...draft,
              [field]: value,
            }
          : draft,
      ),
    );
  };

  const updateModule = (moduleKey) => {
    const baseEntry = buildEmptyEntry(moduleKey);
    setDrafts((prev) =>
      prev.map((draft, index) =>
        index === activeIndex
          ? {
              ...baseEntry,
              ...draft,
              module: moduleKey,
              measurementMethod: draft.measurementMethod || getDefaultMeasurementMethod(moduleKey),
            }
          : draft,
      ),
    );
  };

  const toggleExtractedField = (field) => {
    setDrafts((prev) =>
      prev.map((draft, index) => {
        if (index !== activeIndex) return draft;
        const nextSelections = {
          ...(draft.extractedSelections || {}),
          [field]: !(draft.extractedSelections || {})[field],
        };
        const extracted = draft.extracted || {};
        let next = { ...draft, extractedSelections: nextSelections };

        if (nextSelections.module && extracted.module && MODULE_KEYS.has(extracted.module)) {
          const updatedBase = buildEmptyEntry(extracted.module);
          next = {
            ...updatedBase,
            ...next,
            module: extracted.module,
            supportingDocument: draft.supportingDocument,
            fileName: draft.fileName,
            extracted: draft.extracted,
            extractedSelections: nextSelections,
          };
        }

        if (nextSelections.activityType && extracted.activityType) {
          next.activityType = mapToModuleOptionValue(next.module, "activityType", extracted.activityType) || extracted.activityType;
        }
        if (nextSelections.activityGroup && extracted.activityGroup) {
          next.activityGroup = mapToModuleOptionValue(next.module, "activityGroup", extracted.activityGroup) || extracted.activityGroup;
        }
        if (nextSelections.activityCategory && extracted.activityCategory) {
          next.activityCategory = mapToModuleOptionValue(next.module, "activityCategory", extracted.activityCategory) || extracted.activityCategory;
        }
        if (nextSelections.source && extracted.source) {
          next.source = mapToModuleOptionValue(next.module, "source", extracted.source) || extracted.source;
        }
        if (nextSelections.unit && extracted.unit) {
          next.unit = mapToModuleOptionValue(next.module, "unit", extracted.unit) || extracted.unit;
        }
        if (nextSelections.measurementMethod && extracted.measurementMethod) {
          next.measurementMethod = mapToModuleOptionValue(next.module, "measurementMethod", extracted.measurementMethod) || extracted.measurementMethod;
        }
        if (nextSelections.consumption && extracted.consumption !== "" && extracted.consumption !== null && extracted.consumption !== undefined) {
          next.consumption = extracted.consumption;
        }
        if (nextSelections.date && extracted.date) {
          next.date = normalizeDateValue(extracted.date) || next.date;
        }

        next.measurementMethod = next.measurementMethod || getDefaultMeasurementMethod(next.module);
        return next;
      }),
    );
  };

  const buildSubmissionPayload = (entry) => {
    const moduleConfig = getModuleByKey(entry.module);
    if (!moduleConfig) return null;
    const normalizedEntry = {
      ...entry,
      date: getDefaultDate(entry.date),
    };
    const payload = buildModuleSubmissionPayload(normalizedEntry, moduleConfig, facilityId, "");
    const scopeKey = moduleConfig.scopeKey || "scope1";
    const scopeDataField = `${scopeKey}Data`;
    const rawScopeData = payload.get(scopeDataField);

    if (typeof rawScopeData === "string") {
      try {
        const parsedScopeData = JSON.parse(rawScopeData);
        const nowIso = new Date().toISOString();
        const importBatchId = `ocr-${Date.now()}`;
        parsedScopeData.importedFrom = "ocr";
        parsedScopeData.importedAt = nowIso;
        parsedScopeData.importBatchId = importBatchId;

        (parsedScopeData.sections || []).forEach((section) => {
          (section.activities || []).forEach((activity) => {
            (activity.sources || []).forEach((source) => {
              source.importedFrom = "ocr";
              source.importedAt = nowIso;
              source.importBatchId = importBatchId;
            });
          });
        });

        payload.set(scopeDataField, JSON.stringify(parsedScopeData));
      } catch (error) {
        console.error("Failed to attach OCR metadata to draft payload:", error);
      }
    }

    return payload;
  };

  const handleAddDraft = async () => {
    const entry = drafts[activeIndex];
    if (!entry) return;

    const moduleConfig = getModuleByKey(entry.module);
    if (!moduleConfig) {
      toast.error("Please select a valid module.");
      return;
    }

    const missingFields = moduleConfig.columns
      .filter((column) => column.required)
      .filter((column) => entry[column.key] === undefined || entry[column.key] === null || entry[column.key] === "")
      .map((column) => column.label);

    if (missingFields.length) {
      toast.error(`Please complete required fields: ${missingFields.join(", ")}.`);
      return;
    }

    // Validate date is within reporting period
    if (!isDateWithinReportingPeriod(entry.date)) {
      const periodStr =
        reportingPeriod?.startDate && reportingPeriod?.endDate
          ? `${new Date(reportingPeriod.startDate).toLocaleDateString()} - ${new Date(reportingPeriod.endDate).toLocaleDateString()}`
          : "the facility's reporting period";
      toast.error(`Entry date must be within ${periodStr}. Please update the date before saving.`);
      return;
    }

    try {
      setLoading(true);
      const payload = buildSubmissionPayload(entry);
      if (!payload) {
        toast.error("Failed to create draft payload.");
        return;
      }
      const token = Cookies.get("accessToken");
      await axios.post(`${baseURL}/api/submissions/draft`, payload, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        withCredentials: true,
      });
      setSavedDrafts((prev) => [
        {
          fileName: entry.fileName || entry.supportingDocument?.name || "",
          scope: moduleConfig.scope || "Scope 1",
          activityType: entry.activityType,
          activityGroup: entry.activityGroup,
          activityCategory: entry.activityCategory,
          source: entry.source,
          consumption: entry.consumption,
          unit: entry.unit,
          date: entry.date,
        },
        ...prev,
      ]);
      toast.success("Draft saved successfully from OCR.");
      await fetchOcrDrafts();
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to save draft.");
    } finally {
      setLoading(false);
    }
  };

  const renderModalField = (column) => {
    const value = activeDraft[column.key] ?? "";

    if (column.type === "select" && column.options) {
      return (
        <div key={column.key}>
          <label className="text-xs text-gray-500">{column.label}</label>
          <select value={value} onChange={(e) => updateDraftField(column.key, e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg">
            <option value="">Select {column.label.toLowerCase()}</option>
            {column.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (column.type === "number") {
      return (
        <div key={column.key}>
          <label className="text-xs text-gray-500">{column.label}</label>
          <input
            type="number"
            value={value}
            onChange={(e) => updateDraftField(column.key, e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded-lg"
            placeholder={column.placeholder || ""}
          />
        </div>
      );
    }

    if (column.type === "date") {
      return (
        <div key={column.key}>
          <label className="text-xs text-gray-500">{column.label}</label>
          <input type="date" value={value} onChange={(e) => updateDraftField(column.key, e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg" />
        </div>
      );
    }

    return (
      <div key={column.key}>
        <label className="text-xs text-gray-500">{column.label}</label>
        <input type="text" value={value} onChange={(e) => updateDraftField(column.key, e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg" placeholder={column.placeholder || ""} />
      </div>
    );
  };

  return (
    <div className="p-3 space-y-6">
      <SectionHeader icon={FileIcon} title="AI-OCR" description="Scan invoices to extract total consumption for Scope 1 and Scope 2." />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 min-w-0">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              multiple
              onChange={handleFilesChange}
              className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2.5 file:px-4
          file:rounded-xl file:border-0
          file:text-sm file:font-semibold
          file:bg-green-200 file:text-green-700
          file:cursor-pointer hover:file:bg-green-100
          file:transition-colors cursor-pointer"
            />
            <p className="mt-1 text-[11px] text-gray-400">PDF, PNG, JPG — max 1 MB per file</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Scope Select */}
            <div className="relative flex-1 md:flex-none">
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full md:w-48 appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all cursor-pointer"
              >
                <option value="auto">Auto detect</option>
                <option value="Scope 1">Scope 1</option>
                <option value="Scope 2">Scope 2</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Scan Button */}
            <button
              type="button"
              onClick={handleScan}
              disabled={loading}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200 hover:shadow-xl active:scale-95 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <ScanLine className="w-4 h-4" />
                  <span>Scan Files</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {message && (
          <div
            className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-1 ${
              message.type === "error" ? "bg-red-50 text-red-700 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"
            }`}
          >
            {message.type === "error" ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
            {message.text}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3 bg-white">
          <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
            <FileClock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Saved Drafts</h2>
            <p className="text-xs text-gray-500 font-medium">Session history from OCR scans</p>
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="max-h-[360px] overflow-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <table className="min-w-[900px] w-full border-collapse">
            <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">File</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Scope</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Activity</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Source</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Consumption</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Unit</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {savedDrafts.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <Inbox className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">No drafts saved yet</p>
                      <p className="text-xs text-gray-500 mt-1 max-w-[200px]">Scanned data that you save will appear here for this session.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                savedDrafts.map((row, idx) => (
                  <tr key={`${row.fileName}-${idx}`} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[140px]" title={row.fileName}>
                          {row.fileName || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                          row.scope === "Scope 1"
                            ? "bg-orange-50 text-orange-700 border-orange-100"
                            : row.scope === "Scope 2"
                              ? "bg-purple-50 text-purple-700 border-purple-100"
                              : row.scope === "Scope 3"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : "bg-gray-50 text-gray-600 border-gray-100"
                        }`}
                      >
                        {row.scope || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Activity className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate max-w-[120px]">{row.activityType || "-"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{row.source || "-"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900 tabular-nums">{row.consumption ?? "-"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-gray-500 bg-gray-50/50 rounded-lg">{row.unit || "-"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {row.date || "-"}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="max-h-[520px] overflow-auto">
          <table className="min-w-[900px] w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scope</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Consumption</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matched Line</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    No results yet.
                  </td>
                </tr>
              ) : (
                results.map((row) => (
                  <tr key={row.fileName}>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.fileName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.scope || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.totalConsumption ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.unit || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{row.matchedLine || row.error || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div> */}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-[95vw] max-w-6xl h-[90vh] max-h-[90vh] rounded-xl shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">OCR Review</h2>
                <p className="text-sm text-gray-500">Edit details and add as draft.</p>
              </div>
              <button type="button" onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                Close
              </button>
            </div>

            <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
              <div className="w-full lg:w-1/2 p-6 space-y-4 border-b lg:border-b-0 lg:border-r overflow-auto">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-gray-500">
                    File {activeIndex + 1} of {drafts.length}
                  </div>
                  <select value={activeIndex} onChange={(e) => setActiveIndex(Number(e.target.value))} className="px-3 py-2 border rounded-lg text-sm">
                    {drafts.map((draft, index) => (
                      <option key={draft.fileName || index} value={index}>
                        {draft.fileName || `Document ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">Extracted details</h3>
                      <p className="text-xs text-gray-500">Select fields to auto-fill below.</p>
                    </div>
                  </div>
                  {loading ? (
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
                      Extracting details…
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {[
                        { key: "module", label: "Module", value: activeDraft.extracted?.module || "-" },
                        { key: "activityType", label: "Activity type", value: activeDraft.extracted?.activityType || "-" },
                        { key: "activityGroup", label: "Activity group", value: activeDraft.extracted?.activityGroup || "-" },
                        { key: "activityCategory", label: "Category", value: activeDraft.extracted?.activityCategory || "-" },
                        { key: "source", label: "Source", value: activeDraft.extracted?.source || "-" },
                        { key: "consumption", label: "Consumption", value: activeDraft.extracted?.consumption ?? "-" },
                        { key: "unit", label: "Unit", value: activeDraft.extracted?.unit || "-" },
                        { key: "date", label: "Date", value: activeDraft.extracted?.date || "-" },
                        { key: "measurementMethod", label: "Method", value: activeDraft.extracted?.measurementMethod || "-" },
                      ].map((item) => (
                        <label key={item.key} className="flex items-start gap-2 p-2 bg-white border rounded-lg">
                          <input type="checkbox" checked={Boolean(activeDraft.extractedSelections?.[item.key])} onChange={() => toggleExtractedField(item.key)} className="mt-1" />
                          <div>
                            <div className="text-xs text-gray-500">{item.label}</div>
                            <div className="text-sm text-gray-900 break-words">{item.value}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">Entry fields</h3>
                    <p className="text-xs text-gray-500">Fill fields based on the selected module design.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">Module</label>
                      <select value={activeDraft.module || ""} onChange={(e) => updateModule(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg">
                        {MODULES.map((moduleItem) => (
                          <option key={moduleItem.key} value={moduleItem.key}>
                            {moduleItem.shortLabel} - {moduleItem.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {activeModuleColumns.map((column) => renderModalField(column))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 border rounded-lg">
                    Cancel
                  </button>
                  <button type="button" onClick={handleAddDraft} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? "Saving..." : "Add as draft"}
                  </button>
                </div>
              </div>

              <div className="w-full lg:w-1/2 p-6 bg-gray-50 overflow-auto">
                {previewUrl ? (
                  activeFile?.type?.startsWith("image/") ? (
                    <img src={previewUrl} alt={activeDraft.fileName || "OCR preview"} className="w-full h-full object-contain bg-white rounded-lg border" />
                  ) : (
                    <iframe title="OCR preview" src={previewUrl} className="w-full h-full bg-white rounded-lg border" />
                  )
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 border rounded-lg bg-white">No preview available.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIOCR;
