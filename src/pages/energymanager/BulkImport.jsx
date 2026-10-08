import React, { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "sonner";
import axios from "axios";
import api from "../../utils/api";
import { resolveBaseUrl, resolveServiceBaseUrl } from "../../utils/baseUrl";
import { useAuth } from "../../context/AuthContext";
import mapping from "../../config/mapping.json";
import scope1EF from "../../scope1EF.json";
import scope2EF from "../../scope2EF.json";
import scope3EF from "../../scope3EF.json";
import BulkImportHeader from "../../features/energyManager/bulk-import/BulkImportHeader";
import BulkImportUploadPanel from "../../features/energyManager/bulk-import/BulkImportUploadPanel";
import BulkImportImportedDrafts from "../../features/energyManager/bulk-import/BulkImportImportedDrafts";

const detectScopeFromFileName = (fileName = "") => {
  const name = fileName.toLowerCase();
  const containsAny = (haystack, values = []) => values.some((value) => haystack.includes(value));
  if (containsAny(name, mapping.scopeKeywords?.scope3 || []) || name.includes("scope 3") || name.includes("scope3") || name.includes("scope_3")) {
    return "Scope 3";
  }
  if (containsAny(name, mapping.scopeKeywords?.scope2 || [])) {
    return "Scope 2";
  }
  if (containsAny(name, mapping.scopeKeywords?.scope1 || [])) {
    return "Scope 1";
  }
  return "Scope 1";
};

const detectSourceTerm = (fileName = "") => {
  const name = fileName.toLowerCase();
  const sourceKeywords = mapping.sourceKeywords || {};
  const match = Object.entries(sourceKeywords).find(([, keywords]) => keywords.some((keyword) => name.includes(keyword)));
  return match ? match[0] : "fuel";
};

const normalizeScopeValue = (value) => {
  if (!value) return "";
  const text = value.toString().toLowerCase().replace(/\s+/g, "");
  if (text === "scope1" || text === "1") return "Scope 1";
  if (text === "scope2" || text === "2") return "Scope 2";
  if (text === "scope3" || text === "3") return "Scope 3";
  if (text.includes("scope1")) return "Scope 1";
  if (text.includes("scope2")) return "Scope 2";
  if (text.includes("scope3")) return "Scope 3";
  return value;
};

const getScope3ModuleByActivityType = (activityType) => {
  if (scope3EF?.Upstream?.[activityType]) return "Upstream";
  if (scope3EF?.Downstream?.[activityType]) return "Downstream";
  return null;
};

const getEmissionDataByScope = (scope, scope3Module, activityType) => {
  if (scope === "Scope 1") return scope1EF;
  if (scope === "Scope 2") return scope2EF;
  if (scope === "Scope 3") {
    const resolvedModule = scope3Module || getScope3ModuleByActivityType(activityType) || "Upstream";
    return scope3EF?.[resolvedModule] || {};
  }
  return null;
};

const extractEmissionFactor = (unitData) => {
  if (typeof unitData === "number") return unitData;
  if (typeof unitData === "object" && unitData !== null) {
    return unitData.emissionFactor || unitData.factor || unitData.value || null;
  }
  return null;
};

const getActivityTypeOptionsFromEf = (scope, scope3Module) => {
  if (!scope) return [];
  const buildOptions = (efData, scopeLabel) =>
    Object.keys(efData || {})
      .filter((key) => key !== "scope" && key.toLowerCase() !== "scope")
      .map((key) => ({ value: key, label: key, scope: scopeLabel }));

  if (scope === "Scope 1") return buildOptions(scope1EF, "Scope 1");
  if (scope === "Scope 2") return buildOptions(scope2EF, "Scope 2");
  if (scope === "Scope 3") {
    const scope3Data = getEmissionDataByScope("Scope 3", scope3Module);
    return buildOptions(scope3Data, "Scope 3");
  }
  return [];
};

const getGroupOptions = (activityType, scope, scope3Module) => {
  if (!activityType || !scope) return [];
  const efData = getEmissionDataByScope(scope, scope3Module, activityType);
  const activityData = efData?.[activityType];
  if (!activityData || typeof activityData !== "object") return [];

  return Object.keys(activityData).map((groupKey) => ({
    value: groupKey,
    label: activityData[groupKey]?.label || groupKey,
  }));
};

const getCategoryOptions = (activityType, scope, groupKey, scope3Module) => {
  if (!activityType || !scope || !groupKey) return [];
  const efData = getEmissionDataByScope(scope, scope3Module, activityType);
  const activityData = efData?.[activityType];
  const groupData = activityData?.[groupKey];
  if (!groupData || typeof groupData !== "object") return [];

  const categories = groupData.categories || groupData;
  if (!categories || typeof categories !== "object") return [];

  return Object.keys(categories).map((categoryKey) => ({
    value: categoryKey,
    label: categoryKey.replace(/_/g, " "),
  }));
};

const getSourceOptions = (activityType, scope, groupKey, categoryKey, scope3Module) => {
  if (!activityType || !scope || !groupKey || !categoryKey) return [];
  const efData = getEmissionDataByScope(scope, scope3Module, activityType);
  const categoryData = efData?.[activityType]?.[groupKey]?.categories?.[categoryKey] || efData?.[activityType]?.[groupKey]?.[categoryKey];
  if (!categoryData || typeof categoryData !== "object") return [];

  return Object.keys(categoryData).map((sourceKey) => ({
    value: sourceKey,
    label: sourceKey,
  }));
};

const getUnitOptions = (activityType, scope, groupKey, categoryKey, source, scope3Module) => {
  if (!activityType || !scope || !groupKey || !categoryKey || !source) return [];
  const efData = getEmissionDataByScope(scope, scope3Module, activityType);
  const sourceData = efData?.[activityType]?.[groupKey]?.categories?.[categoryKey]?.[source] || efData?.[activityType]?.[groupKey]?.[categoryKey]?.[source];
  if (!sourceData || typeof sourceData !== "object") return [];

  return Object.keys(sourceData).map((unitKey) => ({
    value: unitKey,
    label: unitKey,
  }));
};

const calculateEmissions = (consumption, unit, source, scope, activityType, scope3Module) => {
  const qty = parseFloat(consumption);
  if (!qty || isNaN(qty) || qty <= 0 || !source || !unit || !scope) return "0.00";

  try {
    const efData = getEmissionDataByScope(scope, scope3Module, activityType);
    if (!efData) return "0.00";

    const normalizedFuel = source.trim();
    const normalizedUnit = unit.trim();
    const activityKeys = Object.keys(efData).filter((key) => key !== "scope" && key.toLowerCase() !== "scope");

    for (const activityKey of activityKeys) {
      const activityData = efData[activityKey];
      if (typeof activityData !== "object" || activityData === null) continue;

      for (const groupKey of Object.keys(activityData)) {
        const groupData = activityData[groupKey];
        if (typeof groupData !== "object" || groupData === null) continue;

        let categories = groupData;
        if (groupData.categories && typeof groupData.categories === "object") {
          categories = groupData.categories;
        }
        if (typeof categories !== "object" || categories === null) continue;

        for (const categoryKey of Object.keys(categories)) {
          const categoryData = categories[categoryKey];
          if (typeof categoryData !== "object" || categoryData === null) continue;

          for (const fuelKey of Object.keys(categoryData)) {
            const fuelKeyLower = fuelKey.toLowerCase();
            const normalizedFuelLower = normalizedFuel.toLowerCase();
            const isExactMatch = fuelKeyLower === normalizedFuelLower;
            const isPartialMatch = fuelKeyLower.includes(normalizedFuelLower) || normalizedFuelLower.includes(fuelKeyLower);

            if (isExactMatch || isPartialMatch) {
              const fuelData = categoryData[fuelKey];
              if (typeof fuelData !== "object" || fuelData === null) continue;

              if (fuelData[normalizedUnit]) {
                const factor = extractEmissionFactor(fuelData[normalizedUnit]);
                if (factor !== null && factor > 0) {
                  return ((qty * factor) / 1000).toFixed(2);
                }
              }

              for (const unitKey of Object.keys(fuelData)) {
                if (unitKey.toLowerCase() === normalizedUnit.toLowerCase()) {
                  const factor = extractEmissionFactor(fuelData[unitKey]);
                  if (factor !== null && factor > 0) {
                    return ((qty * factor) / 1000).toFixed(2);
                  }
                }
              }

              if (isExactMatch) {
                for (const unitKey of Object.keys(fuelData)) {
                  const unitKeyLower = unitKey.toLowerCase();
                  const normalizedUnitLower = normalizedUnit.toLowerCase();
                  if (unitKeyLower.includes(normalizedUnitLower) || normalizedUnitLower.includes(unitKeyLower)) {
                    const factor = extractEmissionFactor(fuelData[unitKey]);
                    if (factor !== null && factor > 0) {
                      return ((qty * factor) / 1000).toFixed(2);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return "0.00";
  } catch (error) {
    console.error("Error calculating emissions:", error);
    return "0.00";
  }
};

const BulkImport = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const importServiceUrl = resolveServiceBaseUrl("excel");

  const [selectedFacility, setSelectedFacility] = useState(null);
  const [reportingPeriodStart, setReportingPeriodStart] = useState(null);
  const [reportingPeriodEnd, setReportingPeriodEnd] = useState(null);
  const [bulkPreview, setBulkPreview] = useState([]);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Load preview data from localStorage on mount
  useEffect(() => {
    const savedPreview = localStorage.getItem("bulkPreviewData");
    if (savedPreview) {
      try {
        const parsed = JSON.parse(savedPreview);
        setBulkPreview(parsed);
      } catch (error) {
        console.error("Error loading saved preview:", error);
        localStorage.removeItem("bulkPreviewData");
      }
    }
  }, []);

  // Save preview data to localStorage whenever it changes
  useEffect(() => {
    if (bulkPreview.length > 0) {
      localStorage.setItem("bulkPreviewData", JSON.stringify(bulkPreview));
    }
  }, [bulkPreview]);
  const [scope3Module, setScope3Module] = useState("Upstream");
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());
  const [editingRowId, setEditingRowId] = useState(null);
  const [editSnapshots, setEditSnapshots] = useState({});
  const [importedBatches, setImportedBatches] = useState([]);
  const allowedScopes = useMemo(() => (selectedFacility?.reportingScopes || []).map((scope) => normalizeScopeValue(scope)).filter(Boolean), [selectedFacility?.reportingScopes]);
  const hasScope3 = !allowedScopes.length || allowedScopes.includes("Scope 3");
  const [importedLoading, setImportedLoading] = useState(false);
  const [selectedImportedRowIds, setSelectedImportedRowIds] = useState(new Set());
  const [editingImportedRowId, setEditingImportedRowId] = useState(null);
  const [editImportedSnapshots, setEditImportedSnapshots] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const userFacilityId = user?.facilities?.[0]?.facilityId?._id || user?.facilities?.[0]?.facilityId;
      if (userFacilityId) {
        await fetchFacilityById(userFacilityId);
      }
    };
    init();
  }, [user]);

  useEffect(() => {
    fetchImportedBatches();
  }, [selectedFacility?._id]);

  const fetchFacilityById = async (facilityId) => {
    try {
      const facilityRes = await api.get(`/api/facilities/${facilityId}`);
      const facilityData = facilityRes.data?.data || facilityRes.data;
      setSelectedFacility(facilityData);
      if (facilityData?.reportingPeriod?.startDate) {
        setReportingPeriodStart(new Date(facilityData.reportingPeriod.startDate));
      }
      if (facilityData?.reportingPeriod?.endDate) {
        setReportingPeriodEnd(new Date(facilityData.reportingPeriod.endDate));
      }
    } catch (error) {
      console.error("Error fetching facility:", error);
      toast.error("Failed to load facility");
    }
  };

  const fetchImportedBatches = async () => {
    try {
      if (!selectedFacility?._id) {
        setImportedBatches([]);
        return;
      }
      setImportedLoading(true);
      const queryParams = [];
      if (selectedFacility?._id) {
        queryParams.push(`facilityId=${selectedFacility._id}`);
      }
      const res = await api.get(`/api/submissions${queryParams.length ? `?${queryParams.join("&")}` : ""}`);
      const submissions = res.data?.data || [];

      const serverEntries = [];
      submissions.forEach((submission) => {
        const payloads = [
          { scope: "Scope 1", data: submission.scope1Data },
          { scope: "Scope 2", data: submission.scope2Data },
          { scope: "Scope 3", data: submission.scope3Data },
        ];
        if (submission.scope && submission.data?.sections?.length) {
          payloads.push({ scope: submission.scope, data: submission.data });
        }

        payloads.forEach(({ scope, data }) => {
          const normalizedScope = normalizeScopeValue(scope || submission.scope || "");
          if (!normalizedScope) return;
          if (!data) return;
          const hasBulkMarker = data.importedFrom === "bulk" || data.importedAt;
          const sections = data?.sections || data?.section || [];
          const hasBulkUploadKey = sections.some((section) =>
            (section.activities || []).some((activity) => (activity.sources || []).some((source) => source?.supportingDocument?.uploadKey?.includes("_bulk"))),
          );
          if (!hasBulkMarker && !hasBulkUploadKey) return;
          if (!sections || !sections.length) return;

          sections.forEach((section, sectionIndex) => {
            section.activities?.forEach((activity, activityIndex) => {
              activity.sources?.forEach((source, sourceIndex) => {
                const hasConsumption = source?.consumption !== undefined && source?.consumption !== null && source?.consumption !== "";
                if (hasConsumption) {
                  const resolvedActivityType = activity.activityType || section.name || activity.activityCategory || "";
                  const resolvedScope3Module = data.scope3Module || section.scope3Module || activity.scope3Module || getScope3ModuleByActivityType(resolvedActivityType);
                  const resolvedDate = source.date ? new Date(source.date).toISOString().split("T")[0] : new Date(submission.createdAt).toISOString().split("T")[0];
                  serverEntries.push({
                    _rowId: `${submission._id}_${normalizedScope}_${sectionIndex}_${activityIndex}_${sourceIndex}_${resolvedDate}`,
                    date: resolvedDate,
                    activityType: resolvedActivityType,
                    activityGroup: activity.activityGroup || "",
                    activityCategory: activity.activityCategory || "",
                    source: source.source,
                    consumption: source.consumption,
                    unit: source.unit,
                    measurementMethod: source.measurementMethod || "",
                    assetId: source.assetId || "",
                    gcv: source.gcv ?? null,
                    gcvUnit: source.gcvUnit || "",
                    assetEfficiency: source.assetEfficiency ?? null,
                    emissionFactor: source.emissionFactor ?? null,
                    operatingHours: source.operatingHours ?? null,
                    capacityUtilization: source.capacityUtilization ?? null,
                    refillAmount: source.refillAmount ?? null,
                    scope: normalizedScope,
                    scope3Module: normalizedScope === "Scope 3" ? resolvedScope3Module : null,
                    status: submission.status || "draft",
                    supportingDocument: source.supportingDocument,
                    submissionId: submission._id,
                    scopeKey: normalizedScope === "Scope 1" ? "scope1" : normalizedScope === "Scope 2" ? "scope2" : "scope3",
                    sectionIndex,
                    activityIndex,
                    sourceIndex,
                  });
                }
              });
            });
          });
        });
      });

      const grouped = new Map();
      serverEntries.forEach((entry) => {
        const fileLabel = entry.supportingDocument?.originalName || entry.supportingDocument?.name || `Submission ${entry.submissionId}`;
        const groupKey = `${entry.submissionId}-${entry.scope}-${fileLabel}`;
        if (!grouped.has(groupKey)) {
          grouped.set(groupKey, {
            batchId: groupKey,
            fileName: fileLabel,
            scope: entry.scope,
            entries: [],
          });
        }
        grouped.get(groupKey).entries.push(entry);
      });

      setImportedBatches(Array.from(grouped.values()));
    } catch (error) {
      console.error("Error fetching imported drafts:", error);
    } finally {
      setImportedLoading(false);
    }
  };

  const resetBulkImport = () => {
    setBulkPreview([]);
    setBulkImporting(false);
    setPreviewLoading(false);
    setSelectedRowIds(new Set());
    setEditingRowId(null);
    setEditSnapshots({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Clear localStorage
    localStorage.removeItem("bulkPreviewData");
  };

  const getReportingPeriodBounds = () => {
    return { start: reportingPeriodStart, end: reportingPeriodEnd };
  };

  const handleBulkFilesSelected = async (files) => {
    if (!files || files.length === 0) return;
    setPreviewLoading(true);
    const { start, end } = getReportingPeriodBounds();
    const importBaseUrl = importServiceUrl;
    const payload = new FormData();
    files.forEach((file) => payload.append("files", file));
    if (start) payload.append("reportingPeriodStart", start.toISOString().split("T")[0]);
    if (end) payload.append("reportingPeriodEnd", end.toISOString().split("T")[0]);
    if (selectedFacility?.facilityName || selectedFacility?.name) payload.append("facilityName", selectedFacility.facilityName || selectedFacility.name);
    if (selectedFacility?.reportingScopes?.length) payload.append("reportingScopes", JSON.stringify(selectedFacility.reportingScopes));
    if (selectedFacility?.systemBoundaries?.length) payload.append("systemBoundaries", JSON.stringify(selectedFacility.systemBoundaries));
    if (selectedFacility?.systemBoundaryProjects?.length) payload.append("systemBoundaryProjects", JSON.stringify(selectedFacility.systemBoundaryProjects));
    if (selectedFacility?.systemBoundaryProducts?.length) payload.append("systemBoundaryProducts", JSON.stringify(selectedFacility.systemBoundaryProducts));

    try {
      const token = Cookies.get("accessToken");
      const response = await axios.post(`${importBaseUrl}/import/preview`, payload, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        withCredentials: true,
      });
      const rawItems = response.data?.data || response.data || [];
      const fileMap = new Map(files.map((file) => [file.name, file]));
      let batchCounter = 0;
      const batchSeed = Date.now();
      const parsed = rawItems.map((item) => {
        const fileName = item.fileName || item.file_name || "";
        const originalFileName = item.originalFileName || item.originalFile || fileName;
        const supportingFile = fileMap.get(originalFileName) || fileMap.get(fileName) || null;
        const importBatchId = `${batchSeed}-${batchCounter++}`;
        return {
          fileName,
          originalFileName,
          scope: item.scope,
          sourceTerm: item.sourceTerm,
          importBatchId,
          entries: (item.entries || []).map((entry, idx) => ({
            ...entry,
            _rowId: `${fileName}-${idx}-${Date.now()}`,
            supportingDocument: supportingFile,
            importBatchId,
            section: entry.section || item.section,
            module: entry.module || item.module,
          })),
          warnings: item.warnings || [],
        };
      });
      setBulkPreview(parsed);
    } catch (error) {
      const statusCode = error.response?.status;
      const serverDetail = error.response?.data?.detail || error.response?.data?.message;
      const templateHint = "Please use the provided template for bulk import.";
      const fallback = files.map((file) => ({
        fileName: file.name,
        scope: detectScopeFromFileName(file.name),
        sourceTerm: detectSourceTerm(file.name),
        entries: [],
        warnings: [serverDetail || error.message || "Failed to parse file.", templateHint],
      }));
      setBulkPreview(fallback);
      if (statusCode === 400) {
        toast.error(serverDetail || "Request failed with status code 400 for this file.");
      } else {
        toast.error(templateHint);
      }
    } finally {
      setPreviewLoading(false);
    }
  };

  const resolveScope3ModuleForEntries = (entriesForScope) => {
    const modules = new Set(entriesForScope.map((entry) => entry.scope3Module || getScope3ModuleByActivityType(entry.activityType)).filter(Boolean));
    if (modules.size === 1) return Array.from(modules)[0];
    return null;
  };

  const buildBulkScopeData = (entriesForScope, scope, uploadKey, scope3ModuleOverride = null) => {
    const grouped = new Map();
    entriesForScope.forEach((entry) => {
      const key = `${entry.activityType}||${entry.activityGroup}||${entry.activityCategory}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          activityType: entry.activityType,
          activityGroup: entry.activityGroup,
          activityCategory: entry.activityCategory,
          sources: [],
        });
      }
      grouped.get(key).sources.push({
        source: entry.source,
        consumption: entry.consumption,
        unit: entry.unit,
        measurementMethod: entry.measurementMethod,
        date: entry.date,
        ...(entry.assetId ? { assetId: entry.assetId } : {}),
        ...(entry.gcv !== undefined && entry.gcv !== "" ? { gcv: entry.gcv } : {}),
        ...(entry.gcvUnit ? { gcvUnit: entry.gcvUnit } : {}),
        ...(entry.assetEfficiency !== undefined && entry.assetEfficiency !== "" ? { assetEfficiency: entry.assetEfficiency } : {}),
        ...(entry.operatingHours !== undefined && entry.operatingHours !== "" ? { operatingHours: entry.operatingHours } : {}),
        ...(entry.capacityUtilization !== undefined && entry.capacityUtilization !== "" ? { capacityUtilization: entry.capacityUtilization } : {}),
        ...(entry.refillAmount !== undefined && entry.refillAmount !== "" ? { refillAmount: entry.refillAmount } : {}),
        supportingDocument:
          entry.supportingDocument instanceof File && uploadKey
            ? {
                uploadKey,
                originalName: entry.supportingDocument.name,
              }
            : entry.supportingDocument,
      });
    });

    const resolvedScope3Module = scope === "Scope 3" ? scope3ModuleOverride || resolveScope3ModuleForEntries(entriesForScope) : null;
    const resolvedImportBatchId = entriesForScope[0]?.importBatchId || null;
    const resolvedImportedAt = entriesForScope[0]?.importedAt || new Date().toISOString();

    return {
      reportingYear: new Date().getFullYear().toString(),
      reportingPeriod: reportingPeriodStart && reportingPeriodEnd ? `${reportingPeriodStart.toISOString().split("T")[0]}_to_${reportingPeriodEnd.toISOString().split("T")[0]}` : "",
      importedFrom: "bulk",
      importedAt: resolvedImportedAt,
      importBatchId: resolvedImportBatchId,
      scope3Module: resolvedScope3Module,
      sections: [
        {
          name: entriesForScope[0]?.section || entriesForScope[0]?.activityType || "Imported Section",
          scope3Module: resolvedScope3Module,
          activities: Array.from(grouped.values()),
        },
      ],
    };
  };

  const saveBulkEntries = async (entriesForScope, scope, scope3ModuleOverride = null) => {
    if (scope === "Scope 3" && !scope3ModuleOverride) {
      const entriesByModule = entriesForScope.reduce((acc, entry) => {
        const module = entry.scope3Module || getScope3ModuleByActivityType(entry.activityType) || "Upstream";
        if (!acc[module]) acc[module] = [];
        acc[module].push(entry);
        return acc;
      }, {});

      const moduleKeys = Object.keys(entriesByModule);
      if (moduleKeys.length > 1) {
        for (const module of moduleKeys) {
          await saveBulkEntries(entriesByModule[module], scope, module);
        }
        return;
      }
    }

    const supportingFile = entriesForScope.find((entry) => entry.supportingDocument instanceof File)?.supportingDocument || null;
    const uploadKey = supportingFile ? `supportingDocument_${scope.toLowerCase().replace(" ", "")}_bulk` : null;
    const scopeData = buildBulkScopeData(entriesForScope, scope, uploadKey, scope3ModuleOverride);
    const payload = new FormData();
    if (selectedFacility?._id) {
      payload.append("facilityId", selectedFacility._id);
    }
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

    const token = Cookies.get("accessToken");
    const baseURL = resolveBaseUrl();
    await axios.post(`${baseURL}/api/submissions/draft`, payload, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      withCredentials: true,
    });
  };

  const handleBulkImport = async () => {
    const entriesToImport = bulkPreview.flatMap((item) => item.entries || []);
    if (!entriesToImport.length) {
      toast.error("No rows available for import.");
      return;
    }

    try {
      setBulkImporting(true);
      const batches = bulkPreview.filter((item) => (item.entries || []).length > 0);
      for (const batch of batches) {
        const entriesByScope = (batch.entries || []).reduce((acc, entry) => {
          const scope = entry.scope || batch.scope || "Scope 1";
          if (!acc[scope]) acc[scope] = [];
          acc[scope].push(entry);
          return acc;
        }, {});

        for (const [scope, entriesForScope] of Object.entries(entriesByScope)) {
          await saveBulkEntries(entriesForScope, scope);
        }
      }

      resetBulkImport();
      toast.success(`Imported ${entriesToImport.length} draft entries.`);
      fetchImportedBatches();
    } catch (error) {
      toast.error(error.message || "Bulk import failed.");
    } finally {
      setBulkImporting(false);
    }
  };

  const toggleRowSelection = (rowId) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const deleteSelectedRows = () => {
    if (selectedRowIds.size === 0) return;
    setBulkPreview((prev) =>
      prev
        .map((file) => ({
          ...file,
          entries: file.entries.filter((entry) => !selectedRowIds.has(entry._rowId)),
        }))
        .filter((file) => file.entries.length > 0 || file.warnings?.length),
    );
    setSelectedRowIds(new Set());
  };

  const deleteRow = (rowId) => {
    setBulkPreview((prev) =>
      prev
        .map((file) => ({
          ...file,
          entries: file.entries.filter((entry) => entry._rowId !== rowId),
        }))
        .filter((file) => file.entries.length > 0 || file.warnings?.length),
    );
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      next.delete(rowId);
      return next;
    });
    if (editingRowId === rowId) {
      setEditingRowId(null);
    }
  };

  const toggleImportedRowSelection = (rowId) => {
    setSelectedImportedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const deleteSelectedImportedRows = async () => {
    if (selectedImportedRowIds.size === 0) return;
    const rowsToDelete = [];
    importedBatches.forEach((batch) => {
      batch.entries.forEach((entry) => {
        if (selectedImportedRowIds.has(entry._rowId)) {
          rowsToDelete.push(entry);
        }
      });
    });
    const uniqueSubmissionIds = Array.from(new Set(rowsToDelete.map((entry) => entry.submissionId).filter(Boolean)));
    let deleteCount = 0;
    for (const submissionId of uniqueSubmissionIds) {
      try {
        await api.delete(`/api/submissions/${submissionId}`);
        deleteCount++;
      } catch (error) {
        console.error("Error deleting submission:", error);
        toast.error("Failed to delete draft");
      }
    }
    if (deleteCount > 0) {
      toast.success(`Deleted ${deleteCount} draft${deleteCount > 1 ? "s" : ""} successfully`);
    }
    setSelectedImportedRowIds(new Set());
    fetchImportedBatches();
  };

  const submitImportedEntries = async (entries, submissionIdsToDelete = []) => {
    if (!entries || entries.length === 0) return;
    const scope = entries[0]?.scope || "Scope 1";
    if (scope === "Scope 3") {
      const entriesByModule = entries.reduce((acc, entry) => {
        const module = entry.scope3Module || getScope3ModuleByActivityType(entry.activityType) || "Upstream";
        if (!acc[module]) acc[module] = [];
        acc[module].push(entry);
        return acc;
      }, {});
      const moduleKeys = Object.keys(entriesByModule);
      if (moduleKeys.length > 1) {
        for (const module of moduleKeys) {
          await submitImportedEntries(entriesByModule[module], submissionIdsToDelete);
        }
        return;
      }
    }
    const supportingFile = entries.find((entry) => entry.supportingDocument instanceof File)?.supportingDocument || null;
    const uploadKey = supportingFile ? `supportingDocument_${scope.toLowerCase().replace(" ", "")}_bulk` : null;
    const scope3ModuleOverride = scope === "Scope 3" ? resolveScope3ModuleForEntries(entries) : null;
    const scopeData = buildBulkScopeData(entries, scope, uploadKey, scope3ModuleOverride);
    const payload = new FormData();
    if (selectedFacility?._id) {
      payload.append("facilityId", selectedFacility._id);
    }
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

    const token = Cookies.get("accessToken");
    const baseURL = resolveBaseUrl();
    await axios.post(`${baseURL}/api/submissions`, payload, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      withCredentials: true,
    });

    const uniqueSubmissionIds = Array.from(new Set(submissionIdsToDelete)).filter(Boolean);
    for (const submissionId of uniqueSubmissionIds) {
      try {
        await api.delete(`/api/submissions/${submissionId}`);
      } catch (error) {
        console.error("Error deleting draft submission:", error);
      }
    }
  };

  const submitImportedBatch = async (batch) => {
    try {
      const draftEntries = batch.entries.filter((entry) => (entry.status || "draft") === "draft" || entry.status === "rejected");
      if (!draftEntries.length) return;
      const draftSubmissionIds = batch.entries.map((entry) => entry.submissionId).filter(Boolean);
      await submitImportedEntries(draftEntries, draftSubmissionIds);
      fetchImportedBatches();
    } catch (error) {
      console.error("Error submitting batch:", error);
    }
  };

  const deleteImportedBatch = async (batch) => {
    const uniqueSubmissionIds = Array.from(new Set(batch.entries.map((entry) => entry.submissionId).filter(Boolean)));
    let deleteCount = 0;
    for (const submissionId of uniqueSubmissionIds) {
      try {
        await api.delete(`/api/submissions/${submissionId}`);
        deleteCount++;
      } catch (error) {
        console.error("Error deleting submission:", error);
        toast.error("Failed to delete draft batch");
      }
    }
    if (deleteCount > 0) {
      toast.success("Batch deleted successfully");
    }
    fetchImportedBatches();
  };

  const deleteImportedRow = async (entry) => {
    if (!entry?.submissionId) return;
    try {
      await api.delete(`/api/submissions/${entry.submissionId}`);
      toast.success("Draft deleted successfully");
      fetchImportedBatches();
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast.error("Failed to delete draft");
    }
  };

  const startEditImportedRow = (entry) => {
    setEditingImportedRowId(entry._rowId);
    setEditImportedSnapshots((prev) => ({
      ...prev,
      [entry._rowId]: { ...entry },
    }));
  };

  const cancelEditImportedRow = (rowId) => {
    const snapshot = editImportedSnapshots[rowId];
    if (snapshot) {
      setImportedBatches((prev) =>
        prev.map((batch) => ({
          ...batch,
          entries: batch.entries.map((entry) => (entry._rowId === rowId ? snapshot : entry)),
        })),
      );
    }
    setEditingImportedRowId(null);
    setEditImportedSnapshots((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };

  const saveEditImportedRow = (rowId) => {
    setEditingImportedRowId(null);
    setEditImportedSnapshots((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };

  const updateImportedRowField = (rowId, field, value) => {
    setImportedBatches((prev) =>
      prev.map((batch) => ({
        ...batch,
        entries: batch.entries.map((entry) => (entry._rowId === rowId ? { ...entry, [field]: value } : entry)),
      })),
    );
  };

  const startEditRow = (entry) => {
    setEditingRowId(entry._rowId);
    setEditSnapshots((prev) => ({
      ...prev,
      [entry._rowId]: { ...entry },
    }));
  };

  const cancelEditRow = (rowId) => {
    const snapshot = editSnapshots[rowId];
    if (snapshot) {
      setBulkPreview((prev) =>
        prev.map((file) => ({
          ...file,
          entries: file.entries.map((entry) => (entry._rowId === rowId ? snapshot : entry)),
        })),
      );
    }
    setEditingRowId(null);
    setEditSnapshots((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };

  const saveEditRow = (rowId) => {
    setEditingRowId(null);
    setEditSnapshots((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };

  const updateRowField = (rowId, field, value) => {
    setBulkPreview((prev) =>
      prev.map((file) => ({
        ...file,
        entries: file.entries.map((entry) => (entry._rowId === rowId ? { ...entry, [field]: value } : entry)),
      })),
    );
  };

  const updatePreviewBatchField = (fileName, field, value) => {
    setBulkPreview((prev) =>
      prev.map((file) => {
        if (file.fileName !== fileName) return file;
        return {
          ...file,
          entries: file.entries.map((entry) => ({
            ...entry,
            [field]: value,
          })),
        };
      }),
    );
  };

  const updatePreviewBatchFields = (fileName, updates) => {
    setBulkPreview((prev) =>
      prev.map((file) => {
        if (file.fileName !== fileName) return file;
        return {
          ...file,
          entries: file.entries.map((entry) => ({
            ...entry,
            ...updates,
          })),
        };
      }),
    );
  };

  const previewSummary = useMemo(() => {
    const totalFiles = bulkPreview.length;
    const totalRows = bulkPreview.reduce((acc, item) => acc + (item.entries?.length || 0), 0);
    const totalWarnings = bulkPreview.reduce((acc, item) => acc + (item.warnings?.length || 0), 0);
    return { totalFiles, totalRows, totalWarnings };
  }, [bulkPreview]);

  return (
    <div className="p-6 space-y-6">
      <BulkImportHeader importServiceUrl={importServiceUrl} />

      <BulkImportUploadPanel
        fileInputRef={fileInputRef}
        handleBulkFilesSelected={handleBulkFilesSelected}
        resetBulkImport={resetBulkImport}
        hasScope3={hasScope3}
        previewLoading={previewLoading}
        bulkPreview={bulkPreview}
        previewSummary={previewSummary}
        selectedRowIds={selectedRowIds}
        deleteSelectedRows={deleteSelectedRows}
        updatePreviewBatchFields={updatePreviewBatchFields}
        updatePreviewBatchField={updatePreviewBatchField}
        getActivityTypeOptionsFromEf={getActivityTypeOptionsFromEf}
        getGroupOptions={getGroupOptions}
        getCategoryOptions={getCategoryOptions}
        getSourceOptions={getSourceOptions}
        getUnitOptions={getUnitOptions}
        calculateEmissions={calculateEmissions}
        editingRowId={editingRowId}
        updateRowField={updateRowField}
        toggleRowSelection={toggleRowSelection}
        startEditRow={startEditRow}
        saveEditRow={saveEditRow}
        cancelEditRow={cancelEditRow}
        deleteRow={deleteRow}
        bulkImporting={bulkImporting}
        handleBulkImport={handleBulkImport}
      />

      <BulkImportImportedDrafts
        importedLoading={importedLoading}
        importedBatches={importedBatches}
        selectedImportedRowIds={selectedImportedRowIds}
        deleteSelectedImportedRows={deleteSelectedImportedRows}
        submitImportedBatch={submitImportedBatch}
        deleteImportedBatch={deleteImportedBatch}
        toggleImportedRowSelection={toggleImportedRowSelection}
        editingImportedRowId={editingImportedRowId}
        updateImportedRowField={updateImportedRowField}
        startEditImportedRow={startEditImportedRow}
        saveEditImportedRow={saveEditImportedRow}
        cancelEditImportedRow={cancelEditImportedRow}
        deleteImportedRow={deleteImportedRow}
        calculateEmissions={calculateEmissions}
      />
    </div>
  );
};

export default BulkImport;
