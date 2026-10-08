import React, { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Save, Calendar, Sheet } from "lucide-react";
import api from "../../utils/api";
import { resolveBaseUrl } from "../../utils/baseUrl";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import DataEntryTable from "../../features/energyManager/data-entry/DataEntryTable";
import DataEntryFiltersBar from "../../features/energyManager/data-entry/DataEntryFiltersBar";
import DataEntrySummaryActions from "../../features/energyManager/data-entry/DataEntrySummaryActions";
import DataEntryQuickSearch from "../../features/energyManager/data-entry/DataEntryQuickSearch";
import {
  buildBulkDraftPayload,
  buildBulkScopeData,
  buildSearchIndex,
  calculateEmissions,
  detectScopeFromFileName,
  detectSourceTerm,
  expandReportingScopes,
  getActivityTypeOptionsFromEf,
  getCategoryOptions,
  getGroupOptions,
  getScopeFromActivityType,
  getScope3ModuleByActivityType,
  getSourceOptions,
  getUnitOptions,
  isBulkData,
  normalizeScopeValue,
  normalizeSearchText,
} from "../../features/energyManager/data-entry/utils";
import SectionHeader from "../../components/rf/Header";
import Loader from "../../components/rf/Loader";

const MOCK_ENTRIES = [
  {
    id: "mock_1",
    date: new Date().toISOString().split("T")[0],
    activityType: "Electricity",
    activityGroup: "Grid Electricity",
    activityCategory: "India (Average)",
    source: "Grid Electricity",
    consumption: "15000",
    unit: "kWh",
    measurementMethod: "Utility Bill",
    emissions: "10740",
    scope: "Scope 2",
    scope3Module: null,
    status: "draft",
    isBulk: false,
    submissionId: null,
    scopeKey: "scope2",
  },
  {
    id: "mock_2",
    date: new Date().toISOString().split("T")[0],
    activityType: "Travel",
    activityGroup: "Roadway Travel",
    activityCategory: "Company Vehicle (Diesel)",
    source: "Diesel Vehicle",
    consumption: "1200",
    unit: "km",
    measurementMethod: "Logbook",
    emissions: "201.6",
    scope: "Scope 1",
    scope3Module: null,
    status: "draft",
    isBulk: false,
    submissionId: null,
    scopeKey: "scope1",
  },
  {
    id: "mock_3",
    date: new Date().toISOString().split("T")[0],
    activityType: "Utility Losses",
    activityGroup: "Water Usage",
    activityCategory: "Water Supply",
    source: "Mains Water",
    consumption: "5000",
    unit: "m3",
    measurementMethod: "Meter Reading",
    emissions: "745",
    scope: "Scope 3",
    scope3Module: "Upstream",
    status: "draft",
    isBulk: false,
    submissionId: null,
    scopeKey: "scope3",
  },
  {
    id: "mock_4",
    date: new Date().toISOString().split("T")[0],
    activityType: "Gas & Fuel",
    activityGroup: "Cooking Fuel",
    activityCategory: "LPG",
    source: "LPG Cylinders",
    consumption: "150",
    unit: "kg",
    measurementMethod: "Purchase Records",
    emissions: "439.5",
    scope: "Scope 1",
    scope3Module: null,
    status: "approved",
    isBulk: false,
    submissionId: null,
    scopeKey: "scope1",
  },
  {
    id: "mock_5",
    date: new Date().toISOString().split("T")[0],
    activityType: "Waste",
    activityGroup: "Paper Waste",
    activityCategory: "Recycling",
    source: "Office Paper",
    consumption: "2",
    unit: "tonne",
    measurementMethod: "Waste Transfer Note",
    emissions: "42.58",
    scope: "Scope 3",
    scope3Module: "Upstream",
    status: "draft",
    isBulk: false,
    submissionId: null,
    scopeKey: "scope3",
  },
  {
    id: "mock_6",
    date: new Date().toISOString().split("T")[0],
    activityType: "Professional Services",
    activityGroup: "Accounting & Auditing",
    activityCategory: "Spend-based",
    source: "Accounting Firm",
    consumption: "500000",
    unit: "₹",
    measurementMethod: "Invoices",
    emissions: "750",
    scope: "Scope 3",
    scope3Module: "Upstream",
    status: "draft",
    isBulk: false,
    submissionId: null,
    scopeKey: "scope3",
  }
];

const DataEntry = ({ statusOverride } = {}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const statusFilter = statusOverride || searchParams.get("status");
  const isRejectedView = statusFilter === "rejected";
  const isStatusForced = Boolean(statusOverride);
  const [facilityInfo, setFacilityInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedScope, setSelectedScope] = useState("Scope 1");
  const [selectedScope3Module, setSelectedScope3Module] = useState("Upstream");
  const [quickSearch, setQuickSearch] = useState("");
  const skipScopeResetCountRef = useRef(0);
  const [selectedEntryIds, setSelectedEntryIds] = useState(new Set());
  const [expandedBulkKeys, setExpandedBulkKeys] = useState(new Set());
  const [editingBulkKey, setEditingBulkKey] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editSnapshots, setEditSnapshots] = useState({});
  const allowedScopes = useMemo(() => (selectedFacility?.reportingScopes || []).map((scope) => normalizeScopeValue(scope)).filter(Boolean), [selectedFacility?.reportingScopes]);
  const isScopeAllowed = !allowedScopes.length || allowedScopes.includes(normalizeScopeValue(selectedScope));
  const reportingPeriodStart = selectedFacility?.reportingPeriod?.startDate ? new Date(selectedFacility.reportingPeriod.startDate) : null;
  const reportingPeriodEnd = selectedFacility?.reportingPeriod?.endDate ? new Date(selectedFacility.reportingPeriod.endDate) : null;

  useEffect(() => {
    if (reportingPeriodStart && reportingPeriodEnd) {
      const startIso = reportingPeriodStart.toISOString().split("T")[0];
      const endIso = reportingPeriodEnd.toISOString().split("T")[0];
      setSelectedPeriod(`${startIso}_to_${endIso}`);
    }
  }, [selectedFacility?._id]);

  // Table data entries
  const [entries, setEntries] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  // New entry form state
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split("T")[0],
    activityType: "",
    activityGroup: "",
    activityCategory: "",
    source: "",
    unit: "",
    consumption: "",
    measurementMethod: "",
    supportingDocument: null,
    status: "draft",
    scope: "Scope 1",
  });

  // Activity type options built from emission factor data
  const activityTypeOptions = useMemo(() => getActivityTypeOptionsFromEf(selectedScope, selectedScope3Module), [selectedScope, selectedScope3Module]);

  const searchIndex = useMemo(() => buildSearchIndex(), []);

  const quickSearchResults = useMemo(() => {
    const term = normalizeSearchText(quickSearch);
    if (!term || term.length < 2) return [];
    const matches = searchIndex.filter((item) => item.searchText.includes(term));
    const scoped = matches.filter((item) => item.scope === selectedScope);
    const scopedWithModule = scoped.filter((item) => item.scope !== "Scope 3" || item.scope3Module === selectedScope3Module);
    const primary = selectedScope === "Scope 3" ? scopedWithModule : scoped;
    return primary.slice(0, 8);
  }, [quickSearch, searchIndex, selectedScope, selectedScope3Module]);

  useEffect(() => {
    const scopeParam = searchParams.get("scope");
    const scope3Param = searchParams.get("scope3");
    if (scopeParam === "scope2") {
      setSelectedScope("Scope 2");
    } else if (scopeParam === "scope3") {
      setSelectedScope("Scope 3");
      setSelectedScope3Module(scope3Param === "downstream" ? "Downstream" : "Upstream");
    } else {
      setSelectedScope("Scope 1");
    }
  }, [searchParams]);

  // Removed auto-switching logic - disabled scopes are now handled in the sidebar

  useEffect(() => {
    if (skipScopeResetCountRef.current > 0) {
      skipScopeResetCountRef.current = 0;
      return;
    }
    setNewEntry((prev) => ({
      ...prev,
      activityType: "",
      activityGroup: "",
      activityCategory: "",
      source: "",
      unit: "",
      consumption: "",
      measurementMethod: "",
      supportingDocument: null,
      scope: selectedScope,
    }));
    setEditingIndex(null);
  }, [selectedScope, selectedScope3Module]);

  useEffect(() => {
    setQuickSearch("");
  }, [selectedScope, selectedScope3Module]);

  useEffect(() => {
    // Load facility from user context
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
  useEffect(() => {
    if (!selectedFacility?._id) {
      setEntries([]);
      return;
    }
    fetchExistingEntries();
  }, [selectedFacility?._id]);

  const buildUniqueEntries = (rawEntries) => {
    const unique = new Map();
    rawEntries.forEach((entry) => {
      const key = [entry.submissionId, entry.scope, entry.date, entry.activityType, entry.activityGroup, entry.activityCategory, entry.source, entry.unit, entry.consumption]
        .map((value) => value ?? "")
        .join("|");
      if (!unique.has(key)) {
        unique.set(key, entry);
      }
    });
    return Array.from(unique.values());
  };

  const extractEntriesFromSubmission = (submission) => {
    const serverEntries = [];
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
      const sections = data?.sections || data?.section || [];
      if (!sections || !sections.length) return;
      const bulkFlag = isBulkData(data);
      const importBatchId = data?.importBatchId || data?.importedAt || null;

      sections.forEach((section, sectionIndex) => {
        section.activities?.forEach((activity, activityIndex) => {
          activity.sources?.forEach((source, sourceIndex) => {
            const hasConsumption = source?.consumption !== undefined && source?.consumption !== null && source?.consumption !== "";
            if (hasConsumption && source?.source) {
              const resolvedActivityType = activity.activityType || section.name || activity.activityCategory || "";
              const inferredScope3Module = getScope3ModuleByActivityType(resolvedActivityType);
              const resolvedScope3Module = inferredScope3Module || data.scope3Module || section.scope3Module || activity.scope3Module;
              const resolvedDate = source.date ? new Date(source.date).toISOString().split("T")[0] : new Date(submission.createdAt).toISOString().split("T")[0];
              const bulkKeySuffix = normalizedScope === "Scope 3" ? resolvedScope3Module || "unknown" : "default";
              serverEntries.push({
                id: `${submission._id}_${normalizedScope}_${sectionIndex}_${activityIndex}_${sourceIndex}_${resolvedDate}`,
                date: resolvedDate,
                activityType: resolvedActivityType,
                activityGroup: activity.activityGroup || "",
                activityCategory: activity.activityCategory || "",
                source: source.source,
                consumption: source.consumption,
                unit: source.unit,
                measurementMethod: source.measurementMethod || "",
                emissions: calculateEmissions(source.consumption, source.unit, source.source, normalizedScope, resolvedActivityType, resolvedScope3Module),
                scope: normalizedScope,
                scope3Module: normalizedScope === "Scope 3" ? resolvedScope3Module : null,
                status: submission.status || "draft",
                rejectionReason: submission.rejectionReason || "",
                isBulk: bulkFlag,
                bulkKey: bulkFlag ? `${submission._id}-${normalizedScope}-${bulkKeySuffix}` : null,
                importBatchId,
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

    return serverEntries;
  };

  const fetchExistingEntries = async () => {
    try {
      if (!selectedFacility?._id) {
        setEntries([]);
        return [];
      }
      // Fetch draft and verified submissions
      const queryParams = [];
      if (selectedFacility?._id) {
        queryParams.push(`facilityId=${selectedFacility._id}`);
      }
      const res = await api.get(`/api/submissions${queryParams.length ? `?${queryParams.join("&")}` : ""}`);
      const submissions = res.data?.data || [];

      const serverEntries = submissions.flatMap((submission) => extractEntriesFromSubmission(submission));
      const uniqueEntries = buildUniqueEntries(serverEntries);
      const combinedEntries = [...uniqueEntries, ...MOCK_ENTRIES];
      setEntries(combinedEntries);
      return combinedEntries;
    } catch (error) {
      console.error("Error fetching existing entries:", error);
      return [];
    }
  };

  const handleActivityTypeChange = (value) => {
    const activity = activityTypeOptions.find((a) => a.value === value);
    const scope = selectedScope || activity?.scope || getScopeFromActivityType(value);
    setNewEntry((prev) => ({
      ...prev,
      activityType: value,
      activityGroup: "",
      activityCategory: "",
      source: "",
      unit: "",
      consumption: "",
      measurementMethod: "",
      scope,
    }));
  };

  const handleGroupChange = (value) => {
    setNewEntry((prev) => ({
      ...prev,
      activityGroup: value,
      activityCategory: "",
      source: "",
      unit: "",
      consumption: "",
    }));
  };

  const handleCategoryChange = (value) => {
    setNewEntry((prev) => ({
      ...prev,
      activityCategory: value,
      source: "",
      unit: "",
      consumption: "",
    }));
  };

  const handleSourceChange = (value) => {
    const scope = newEntry.scope || getScopeFromActivityType(newEntry.activityType);
    const unitOptions = getUnitOptions(newEntry.activityType, scope, newEntry.activityGroup, newEntry.activityCategory, value, selectedScope3Module);
    setNewEntry((prev) => ({
      ...prev,
      source: value,
      unit: unitOptions[0]?.value || prev.unit,
    }));
  };

  const applyQuickSearchResult = (result) => {
    if (!result) return;
    const resolvedScope = result.scope || selectedScope;
    if (allowedScopes.length && resolvedScope && !allowedScopes.includes(normalizeScopeValue(resolvedScope))) {
      setMessage({ type: "error", text: `${resolvedScope} is not enabled for this facility.` });
      return;
    }
    let skipCount = 0;
    if (result.scope && result.scope !== selectedScope) {
      skipCount += 1;
      setSelectedScope(result.scope);
    }
    if (result.scope === "Scope 3" && result.scope3Module) {
      if (result.scope3Module !== selectedScope3Module) {
        skipCount += 1;
        setSelectedScope3Module(result.scope3Module);
      }
    }
    if (skipCount > 0) {
      skipScopeResetCountRef.current = 1;
    }

    const resolvedUnitOptions = getUnitOptions(result.activityType, resolvedScope, result.groupKey, result.categoryKey, result.sourceKey, result.scope3Module || selectedScope3Module);
    const resolvedUnit = result.unitKey || resolvedUnitOptions[0]?.value || "";

    setNewEntry((prev) => ({
      ...prev,
      activityType: result.activityType || "",
      activityGroup: result.groupKey || "",
      activityCategory: result.categoryKey || "",
      source: result.sourceKey || "",
      unit: resolvedUnit,
      consumption: "",
      measurementMethod: "",
      scope: resolvedScope,
    }));
  };

  const getReportingPeriodBounds = () => {
    if (reportingPeriodStart && reportingPeriodEnd) {
      return { start: reportingPeriodStart, end: reportingPeriodEnd };
    }
    if (selectedPeriod && selectedPeriod.includes("_to_")) {
      const [startRaw, endRaw] = selectedPeriod.split("_to_");
      const start = new Date(startRaw);
      const end = new Date(endRaw);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        return { start, end };
      }
    }
    return { start: null, end: null };
  };

  const resetEntryForm = () => {
    setNewEntry({
      date: newEntry.date,
      activityType: "",
      activityGroup: "",
      activityCategory: "",
      source: "",
      unit: "",
      consumption: "",
      measurementMethod: "",
      supportingDocument: null,
      status: "draft",
      scope: selectedScope,
    });
    setEditingIndex(null);
    setEditingBulkKey(null);
  };

  const startEditRow = (entry) => {
    if (!entry) return;
    setEditingRowId(entry.id);
    setEditSnapshots((prev) => ({ ...prev, [entry.id]: { ...entry } }));
  };

  const cancelEditRow = (rowId) => {
    setEntries((prev) => prev.map((entry) => (entry.id === rowId ? editSnapshots[rowId] || entry : entry)));
    setEditSnapshots((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
    setEditingRowId(null);
  };

  const updateRowField = (rowId, field, value) => {
    setEntries((prev) => prev.map((entry) => (entry.id === rowId ? { ...entry, [field]: value } : entry)));
  };

  const updateRowActivityType = (rowId, value) => {
    const scope = getScopeFromActivityType(value);
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === rowId
          ? {
              ...entry,
              activityType: value,
              activityGroup: "",
              activityCategory: "",
              source: "",
              unit: "",
              scope: scope || entry.scope,
              scope3Module: scope === "Scope 3" ? getScope3ModuleByActivityType(value) || selectedScope3Module : null,
            }
          : entry,
      ),
    );
  };

  const updateRowGroup = (rowId, value) => {
    setEntries((prev) => prev.map((entry) => (entry.id === rowId ? { ...entry, activityGroup: value, activityCategory: "", source: "", unit: "" } : entry)));
  };

  const updateRowCategory = (rowId, value) => {
    setEntries((prev) => prev.map((entry) => (entry.id === rowId ? { ...entry, activityCategory: value, source: "", unit: "" } : entry)));
  };

  const updateRowSource = (rowId, value) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== rowId) return entry;
        const scope = entry.scope || getScopeFromActivityType(entry.activityType);
        const unitOptions = getUnitOptions(entry.activityType, scope, entry.activityGroup, entry.activityCategory, value, entry.scope3Module || selectedScope3Module);
        return {
          ...entry,
          source: value,
          unit: unitOptions[0]?.value || entry.unit,
        };
      }),
    );
  };

  const saveEditRow = async (rowId) => {
    const entry = entries.find((item) => item.id === rowId);
    if (!entry) return;
    if (!entry.activityType || !entry.activityGroup || !entry.activityCategory || !entry.source || !entry.consumption || !entry.unit || !entry.measurementMethod) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }
    try {
      setSaving(true);
      if (entry.isBulk) {
        const groupEntries = entries.filter((item) => item.isBulk && item.bulkKey === entry.bulkKey);
        const scope3Module = entry.scope === "Scope 3" ? entry.scope3Module || null : null;
        const payload = buildBulkDraftPayload(groupEntries, entry.scope || "Scope 1", entry.submissionId, {
          selectedPeriod,
          scope3Module,
          importBatchId: entry.importBatchId || null,
        });
        await api.post("/api/submissions/draft", payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await saveEntry(entry);
      }
      await fetchExistingEntries();
      setMessage({ type: "success", text: "Draft updated." });
      setEditingRowId(null);
      setEditSnapshots((prev) => {
        const next = { ...prev };
        delete next[rowId];
        return next;
      });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to update entry." });
    } finally {
      setSaving(false);
    }
  };

  const handleAddEntry = async () => {
    if (!isScopeAllowed) {
      setMessage({ type: "error", text: "This scope is not enabled for the selected facility." });
      return;
    }
    const entryScope = newEntry.scope || getScopeFromActivityType(newEntry.activityType);
    if (allowedScopes.length && entryScope && !allowedScopes.includes(normalizeScopeValue(entryScope))) {
      setMessage({ type: "error", text: `${entryScope} is not enabled for this facility.` });
      return;
    }
    // Validate required fields
    if (!newEntry.activityType || !newEntry.activityGroup || !newEntry.activityCategory || !newEntry.source || !newEntry.consumption || !newEntry.unit || !newEntry.measurementMethod) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }

    if (reportingPeriodStart && reportingPeriodEnd) {
      const entryDate = new Date(newEntry.date);
      if (entryDate < reportingPeriodStart || entryDate > reportingPeriodEnd) {
        setMessage({
          type: "error",
          text: `Date must be within the reporting period (${reportingPeriodStart.toLocaleDateString()} - ${reportingPeriodEnd.toLocaleDateString()}).`,
        });
        return;
      }
    }

    // Removed supporting document check

    setMessage({ type: "", text: "" });

    // Calculate emissions
    const scope = newEntry.scope || getScopeFromActivityType(newEntry.activityType);
    const emissions = calculateEmissions(newEntry.consumption, newEntry.unit, newEntry.source, scope, newEntry.activityType, selectedScope3Module);

    const entry = {
      ...newEntry,
      emissions,
      scope,
      scope3Module: scope === "Scope 3" ? selectedScope3Module : null,
      status: "draft",
      scopeKey: scope === "Scope 1" ? "scope1" : scope === "Scope 2" ? "scope2" : "scope3",
      sectionIndex: 0,
      activityIndex: 0,
      sourceIndex: 0,
    };

    try {
      setSaving(true);
      if (editingBulkKey) {
        const groupEntries = entries.filter((item) => item.isBulk && item.bulkKey === editingBulkKey);
        const updatedEntries = groupEntries.map((item) => (item.id === entry.id ? { ...item, ...entry } : item));
        const scope3Module = entry.scope === "Scope 3" ? entry.scope3Module || null : null;
        const payload = buildBulkDraftPayload(updatedEntries, entry.scope || "Scope 1", entry.submissionId, {
          selectedPeriod,
          scope3Module,
          importBatchId: entry.importBatchId || null,
        });
        const token = Cookies.get("accessToken");
        const baseURL = resolveBaseUrl();
        await axios.post(`${baseURL}/api/submissions/draft`, payload, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          withCredentials: true,
        });
      } else {
        const saved = await saveEntry(entry);
        const savedSubmission = saved?.data || saved?.submission || saved?.data?.submission || null;
        const refreshed = await fetchExistingEntries();
        let newEntriesList = refreshed || [];
        if (savedSubmission) {
          const newExtracted = extractEntriesFromSubmission(savedSubmission);
          newEntriesList = buildUniqueEntries([...newExtracted, ...newEntriesList]);
        }
        setEntries(newEntriesList);
      }
      if (editingBulkKey) {
        await fetchExistingEntries();
      }
      resetEntryForm();
      setMessage({
        type: "success",
        text: editingIndex !== null ? "Draft updated." : "Draft saved.",
      });
      if (isRejectedView && !isStatusForced) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("status");
        navigate(`${location.pathname}${nextParams.toString() ? `?${nextParams.toString()}` : ""}`, { replace: true });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to save draft.",
      });
    } finally {
      setSaving(false);
    }
  };

  const buildSubmissionPayload = (entry) => {
    const scope = entry.scope || selectedScope || getScopeFromActivityType(entry.activityType);
    const uploadKey = `supportingDocument_${scope.toLowerCase().replace(" ", "")}_0_0_0`;

    const scopeData = {
      reportingYear: new Date().getFullYear().toString(),
      reportingPeriod: selectedPeriod,
      scope3Module: scope === "Scope 3" ? selectedScope3Module : null,
      sections: [
        {
          name: entry.activityType || "Default Section",
          scope3Module: scope === "Scope 3" ? selectedScope3Module : null,
          activities: [
            {
              activityType: entry.activityType,
              activityGroup: entry.activityGroup,
              activityCategory: entry.activityCategory,
              sources: [
                {
                  source: entry.source,
                  consumption: entry.consumption,
                  unit: entry.unit,
                  measurementMethod: entry.measurementMethod,
                  date: entry.date,
                  supportingDocument:
                    entry.supportingDocument instanceof File
                      ? {
                          uploadKey,
                          originalName: entry.supportingDocument.name,
                        }
                      : entry.supportingDocument,
                },
              ],
            },
          ],
        },
      ],
    };

    const payload = new FormData();
    if (selectedFacility?._id) {
      payload.append("facilityId", selectedFacility._id);
    }
    if (entry.submissionId) {
      payload.append("submissionId", entry.submissionId);
    }
    payload.append("scope", scope);

    if (scope === "Scope 1") {
      payload.append("scope1Data", JSON.stringify(scopeData));
    } else if (scope === "Scope 2") {
      payload.append("scope2Data", JSON.stringify(scopeData));
    } else if (scope === "Scope 3") {
      payload.append("scope3Data", JSON.stringify(scopeData));
    }

    if (entry.supportingDocument instanceof File) {
      payload.append(uploadKey, entry.supportingDocument);
    }

    return { payload, scope };
  };

  const saveEntry = async (entry) => {
    try {
      const { payload } = buildSubmissionPayload(entry);

      // For FormData uploads, use axios directly to avoid default Content-Type header
      // axios will automatically set multipart/form-data with boundary
      const token = Cookies.get("accessToken");
      const baseURL = resolveBaseUrl();

      const response = await axios.post(`${baseURL}/api/submissions/draft`, payload, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          // Don't set Content-Type - axios will set it automatically for FormData
        },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      console.error("Error saving entry:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to save entry";
      throw new Error(errorMessage);
    }
  };

  const submitEntry = async (entry) => {
    try {
      const { payload } = buildSubmissionPayload(entry);

      // Pass old draft ID so backend cleans it up atomically
      if (entry.submissionId) {
        payload.append("replaceDraftIds", JSON.stringify([entry.submissionId]));
      }

      const token = Cookies.get("accessToken");
      const baseURL = resolveBaseUrl();

      const response = await axios.post(`${baseURL}/api/submissions`, payload, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      console.error("Error submitting entry:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to submit entry";
      throw new Error(errorMessage);
    }
  };

  const handleSubmitEntry = async (entry) => {
    if (!entry) return;
    const entryIndex = entries.findIndex((item) => item.id === entry.id);
    if (entryIndex === -1) return;

    try {
      setSaving(true);
      await submitEntry(entry);
      setEntries((prev) => prev.map((item, idx) => (idx === entryIndex ? { ...item, status: "submitted" } : item)));
      setMessage({ type: "success", text: "Entry submitted for approval." });
      await fetchExistingEntries();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to submit entry.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitAllDrafts = async () => {
    const draftEntries = filteredEntries.filter((entry) => entry.status === "draft" || entry.status === "rejected");
    if (!draftEntries.length) {
      setMessage({ type: "error", text: "No drafts to submit." });
      return;
    }

    try {
      setSaving(true);
      for (let i = 0; i < draftEntries.length; i += 1) {
        await submitEntry(draftEntries[i]);
      }
      setMessage({
        type: "success",
        text: "All drafts submitted for approval.",
      });
      await fetchExistingEntries();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to submit drafts.",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleEntrySelection = (entryId) => {
    if (!entryId) return;
    setSelectedEntryIds((prev) => {
      const next = new Set(prev);
      if (next.has(entryId)) {
        next.delete(entryId);
      } else {
        next.add(entryId);
      }
      return next;
    });
  };

  const handleSubmitSelected = async () => {
    const selectedEntries = filteredEntries.filter((entry) => selectedEntryIds.has(entry.id));
    if (!selectedEntries.length) {
      setMessage({ type: "error", text: "No entries selected." });
      return;
    }
    try {
      setSaving(true);
      for (let i = 0; i < selectedEntries.length; i += 1) {
        await submitEntry(selectedEntries[i]);
      }
      setSelectedEntryIds(new Set());
      setMessage({
        type: "success",
        text: "Selected entries submitted for approval.",
      });
      await fetchExistingEntries();
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
    const selectedEntries = filteredEntries.filter((entry) => selectedEntryIds.has(entry.id));
    if (!selectedEntries.length) {
      setMessage({ type: "error", text: "No entries selected." });
      return;
    }
    if (!window.confirm("Are you sure you want to delete selected entries?")) return;
    try {
      setSaving(true);
      for (let i = 0; i < selectedEntries.length; i += 1) {
        if (selectedEntries[i].submissionId) {
          try {
            await api.delete(`/api/submissions/${selectedEntries[i].submissionId}`);
          } catch (error) {
            console.error("Error deleting entry from server:", error);
          }
        }
      }
      setEntries((prev) => prev.filter((entry) => !selectedEntryIds.has(entry.id)));
      setSelectedEntryIds(new Set());
      setMessage({ type: "success", text: "Selected entries deleted." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (entry) => {
    if (!entry) return;
    if (entry.isBulk && entry.bulkKey) {
      await handleDeleteBulkEntry(entry);
      return;
    }
    if (window.confirm("Are you sure you want to delete this entry?")) {
      // If entry has a submissionId, delete from server first
      if (entry.submissionId) {
        try {
          await api.delete(`/api/submissions/${entry.submissionId}`);
        } catch (error) {
          console.error("Error deleting entry from server:", error);
          setMessage({
            type: "error",
            text: error.response?.data?.message || "Failed to delete entry.",
          });
          return;
        }
      }

      setEntries((prev) => prev.filter((item) => item.id !== entry.id));
      setMessage({ type: "success", text: "Entry deleted" });
    }
  };

  const toggleBulkKey = (bulkKey) => {
    if (!bulkKey) return;
    setExpandedBulkKeys((prev) => {
      const next = new Set(prev);
      if (next.has(bulkKey)) {
        next.delete(bulkKey);
      } else {
        next.add(bulkKey);
      }
      return next;
    });
  };

  const buildBulkSubmitPayload = (entriesForScope, scope, scope3Module) => {
    const supportingFile = entriesForScope.find((entry) => entry.supportingDocument instanceof File)?.supportingDocument || null;
    const uploadKey = supportingFile ? `supportingDocument_${scope.toLowerCase().replace(" ", "")}_bulk` : null;
    const scopeData = buildBulkScopeData(entriesForScope, scope, {
      selectedPeriod,
      scope3Module: scope3Module,
      uploadKey,
    });
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

    return payload;
  };

  const handleSubmitBulkGroup = async (group) => {
    if (!group?.entries?.length) return;
    const submittable = group.entries.filter((item) => item.status === "draft" || item.status === "rejected");
    if (!submittable.length) return;

    try {
      setSaving(true);
      const scope = group.scope || "Scope 1";
      const scope3Module = scope === "Scope 3" ? group.scope3Module || null : null;
      const payload = buildBulkSubmitPayload(submittable, scope, scope3Module);

      // Tell the backend which draft submissions to clean up
      const draftIds = Array.from(new Set(group.entries.map((item) => item.submissionId).filter(Boolean)));
      if (draftIds.length) {
        payload.append("replaceDraftIds", JSON.stringify(draftIds));
      }

      const token = Cookies.get("accessToken");
      const baseURL = resolveBaseUrl();
      await axios.post(`${baseURL}/api/submissions`, payload, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        withCredentials: true,
      });

      setMessage({ type: "success", text: "Bulk entries submitted for approval." });
      await fetchExistingEntries();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to submit bulk entries." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBulkEntry = async (entry) => {
    if (!entry?.bulkKey) return;
    if (!window.confirm("Delete this entry from the bulk draft?")) return;
    const groupEntries = entries.filter((item) => item.isBulk && item.bulkKey === entry.bulkKey);
    const remaining = groupEntries.filter((item) => item.id !== entry.id);
    const scope = entry.scope || "Scope 1";
    const submissionId = entry.submissionId;
    const scope3Module = scope === "Scope 3" ? entry.scope3Module || null : null;

    try {
      setSaving(true);
      if (!remaining.length) {
        if (submissionId) {
          await api.delete(`/api/submissions/${submissionId}`);
        }
      } else {
        const payload = buildBulkDraftPayload(remaining, scope, submissionId, {
          selectedPeriod,
          scope3Module,
          importBatchId: entry.importBatchId || null,
        });
        const token = Cookies.get("accessToken");
        const baseURL = resolveBaseUrl();
        await axios.post(`${baseURL}/api/submissions/draft`, payload, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          withCredentials: true,
        });
      }
      setMessage({ type: "success", text: "Entry removed from bulk draft." });
      await fetchExistingEntries();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to delete entry." });
    } finally {
      setSaving(false);
    }
  };

  const handleEditEntry = (entry) => {
    startEditRow(entry);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setMessage({ type: "error", text: "File size must be less than 5MB" });
        return;
      }
      setNewEntry((prev) => ({ ...prev, supportingDocument: file }));
    }
  };

  const handleDownloadDocument = async (entry) => {
    if (!entry?.submissionId) return;
    const token = Cookies.get("accessToken");
    const baseURL = resolveBaseUrl();
    const scopeKey = entry.scopeKey || (entry.scope === "Scope 1" ? "scope1" : entry.scope === "Scope 2" ? "scope2" : "scope3");

    try {
      const response = await axios.get(`${baseURL}/api/submissions/${entry.submissionId}/supporting-document`, {
        params: {
          scope: scopeKey,
          sectionIndex: entry.sectionIndex ?? 0,
          activityIndex: entry.activityIndex ?? 0,
          sourceIndex: entry.sourceIndex ?? 0,
        },
        responseType: "blob",
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
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
      console.error("Error downloading supporting document:", error);
      setMessage({
        type: "error",
        text: "Failed to download supporting document.",
      });
    }
  };

  const filteredEntries = useMemo(() => {
    const scopeFromKey = (scopeKey) => {
      if (scopeKey === "scope1") return "Scope 1";
      if (scopeKey === "scope2") return "Scope 2";
      if (scopeKey === "scope3") return "Scope 3";
      return "";
    };

    const matchesScope = (entry) => {
      const entryScope = normalizeScopeValue(entry.scope) || normalizeScopeValue(scopeFromKey(entry.scopeKey));
      if (!entryScope) return false;
      const selected = normalizeScopeValue(selectedScope);
      return entryScope === selected;
    };

    const matchesStatus = (entry) => (isRejectedView ? entry.status === "rejected" : true);

    if (selectedScope === "Scope 3") {
      return entries.filter((entry) => {
        if (!matchesScope(entry)) return false;
        const module = entry.scope3Module || getScope3ModuleByActivityType(entry.activityType);
        if (!module) return matchesStatus(entry);
        return module === selectedScope3Module && matchesStatus(entry);
      });
    }
    return entries.filter((entry) => matchesScope(entry) && matchesStatus(entry));
  }, [entries, selectedScope, selectedScope3Module, isRejectedView]);

  const groupedRows = useMemo(() => {
    const rows = [];
    const bulkGroups = new Map();

    filteredEntries.forEach((entry) => {
      if (entry.isBulk && entry.bulkKey) {
        if (!bulkGroups.has(entry.bulkKey)) {
          bulkGroups.set(entry.bulkKey, {
            bulkKey: entry.bulkKey,
            scope: entry.scope,
            scope3Module: entry.scope === "Scope 3" ? entry.scope3Module || null : null,
            entries: [],
          });
        }
        bulkGroups.get(entry.bulkKey).entries.push(entry);
      } else {
        rows.push({ type: "entry", entry });
      }
    });

    bulkGroups.forEach((group) => {
      const entriesForGroup = group.entries;
      const totalEmissions = entriesForGroup.reduce((acc, item) => acc + Number(item.emissions || 0), 0);
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
        scope: group.scope,
        entries: entriesForGroup,
        totalEmissions: totalEmissions.toFixed(2),
        totalConsumption,
        unitLabel,
        dateLabel,
        status: groupStatus,
        hasSubmittable,
      });
    });

    return rows;
  }, [filteredEntries]);

  useEffect(() => {
    setSelectedEntryIds(new Set());
  }, [selectedScope, selectedScope3Module]);

  useEffect(() => {
    setSelectedEntryIds((prev) => {
      if (!prev.size) return prev;
      const next = new Set();
      filteredEntries.forEach((entry) => {
        if (prev.has(entry.id)) {
          next.add(entry.id);
        }
      });
      return next;
    });
  }, [filteredEntries]);

  const approvedCount = filteredEntries.filter((e) => e.status === "approved").length;
  const draftCount = filteredEntries.filter((e) => e.status === "draft" || e.status === "rejected").length;

  if (loading) {
    return <Loader />;
  }

  // Data entry is always available for energy managers

  const scopeForEntry = newEntry.scope || getScopeFromActivityType(newEntry.activityType);
  const groupOptions = getGroupOptions(newEntry.activityType, scopeForEntry, selectedScope3Module);
  const categoryOptions = getCategoryOptions(newEntry.activityType, scopeForEntry, newEntry.activityGroup, selectedScope3Module);
  const sourceOptions = getSourceOptions(newEntry.activityType, scopeForEntry, newEntry.activityGroup, newEntry.activityCategory, selectedScope3Module);
  const unitOptions = getUnitOptions(newEntry.activityType, scopeForEntry, newEntry.activityGroup, newEntry.activityCategory, newEntry.source, selectedScope3Module);

  return (
    <div className="p-3 space-y-6">
      <SectionHeader icon={Sheet} title="Data Entry" subtitle="Enter and manage your energy consumption data for accurate emissions tracking." />

      <DataEntryFiltersBar selectedFacility={selectedFacility} reportingPeriodStart={reportingPeriodStart} reportingPeriodEnd={reportingPeriodEnd} />

      <DataEntrySummaryActions
        approvedCount={approvedCount}
        draftCount={draftCount}
        isRejectedView={isRejectedView}
        saving={saving}
        selectedEntryIdsSize={selectedEntryIds.size}
        onToggleRejected={() => {
          const nextParams = new URLSearchParams(searchParams);
          if (isRejectedView) {
            nextParams.delete("status");
          } else {
            nextParams.set("status", "rejected");
          }
          const basePath = isStatusForced ? "/energy/data-entry" : location.pathname;
          const nextQuery = nextParams.toString();
          navigate(`${basePath}${nextQuery ? `?${nextQuery}` : ""}`);
        }}
        onSubmitAll={handleSubmitAllDrafts}
        onSubmitSelected={handleSubmitSelected}
        onDeleteSelected={handleDeleteSelected}
      />

      <DataEntryQuickSearch quickSearch={quickSearch} setQuickSearch={setQuickSearch} quickSearchResults={quickSearchResults} applyQuickSearchResult={applyQuickSearchResult} />

      {/* Message */}
      {message.text && <div className={`p-4 rounded-lg ${message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{message.text}</div>}

      <DataEntryTable
        newEntry={newEntry}
        setNewEntry={setNewEntry}
        reportingPeriodStart={reportingPeriodStart}
        reportingPeriodEnd={reportingPeriodEnd}
        activityTypeOptions={activityTypeOptions}
        groupOptions={groupOptions}
        categoryOptions={categoryOptions}
        sourceOptions={sourceOptions}
        unitOptions={unitOptions}
        handleActivityTypeChange={handleActivityTypeChange}
        handleGroupChange={handleGroupChange}
        handleCategoryChange={handleCategoryChange}
        handleSourceChange={handleSourceChange}
        handleFileChange={handleFileChange}
        handleAddEntry={handleAddEntry}
        saving={saving}
        editingIndex={editingIndex}
        selectedScope3Module={selectedScope3Module}
        isRejectedView={isRejectedView}
        groupedRows={groupedRows}
        expandedBulkKeys={expandedBulkKeys}
        toggleBulkKey={toggleBulkKey}
        handleSubmitBulkGroup={handleSubmitBulkGroup}
        handleDownloadDocument={handleDownloadDocument}
        handleEditEntry={handleEditEntry}
        handleDeleteEntry={handleDeleteEntry}
        handleSubmitEntry={handleSubmitEntry}
        selectedEntryIds={selectedEntryIds}
        toggleEntrySelection={toggleEntrySelection}
        calculateEmissions={calculateEmissions}
        getScopeFromActivityType={getScopeFromActivityType}
        editingRowId={editingRowId}
        startEditRow={startEditRow}
        saveEditRow={saveEditRow}
        cancelEditRow={cancelEditRow}
        updateRowField={updateRowField}
        updateRowActivityType={updateRowActivityType}
        updateRowGroup={updateRowGroup}
        updateRowCategory={updateRowCategory}
        updateRowSource={updateRowSource}
        getActivityTypeOptionsFromEf={getActivityTypeOptionsFromEf}
        getGroupOptions={getGroupOptions}
        getCategoryOptions={getCategoryOptions}
        getSourceOptions={getSourceOptions}
        getUnitOptions={getUnitOptions}
      />

      {/* Keyboard Shortcuts */}
    </div>
  );
};

export default DataEntry;
