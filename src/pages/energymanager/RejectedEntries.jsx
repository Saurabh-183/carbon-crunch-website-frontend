import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import api from "../../utils/api";
import { resolveBaseUrl } from "../../utils/baseUrl";
import scope1EF from "../../scope1EF.json";
import scope2EF from "../../scope2EF.json";
import scope3EF from "../../scope3EF.json";
import RejectedScopeTabs from "../../features/energyManager/rejected-entries/RejectedScopeTabs";
import RejectedEntriesTable from "../../features/energyManager/rejected-entries/RejectedEntriesTable";
import RejectedEditModal from "../../features/energyManager/rejected-entries/RejectedEditModal";
import SectionHeader from "../../components/rf/Header";
import { Cross } from "recharts";
import { MinusCircle, AlertCircle } from "lucide-react";
import Loader from "../../components/rf/Loader";

const getScopeFromActivityType = (activityType) => {
  if (!activityType) return "Scope 1";
  if (scope1EF?.[activityType]) return "Scope 1";
  if (scope2EF?.[activityType]) return "Scope 2";
  if (scope3EF?.Upstream?.[activityType]) return "Scope 3";
  if (scope3EF?.Downstream?.[activityType]) return "Scope 3";
  return "Scope 1";
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

const isBulkData = (scopeData) => {
  if (!scopeData) return false;
  if (scopeData.importedFrom === "bulk" || scopeData.importedAt) return true;
  return scopeData.sections?.some((section) => (section.activities || []).some((activity) => (activity.sources || []).some((source) => source?.supportingDocument?.uploadKey?.includes("_bulk"))));
};

const buildBulkScopeData = (entriesForScope, scope, uploadKey) => {
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
      supportingDocument:
        entry.supportingDocument instanceof File && uploadKey
          ? {
              uploadKey,
              originalName: entry.supportingDocument.name,
            }
          : entry.supportingDocument,
    });
  });

  return {
    reportingYear: new Date().getFullYear().toString(),
    reportingPeriod: entriesForScope[0]?.reportingPeriod || "",
    importedFrom: "bulk",
    importedAt: new Date().toISOString(),
    scope3Module: scope === "Scope 3" ? entriesForScope[0]?.scope3Module || null : null,
    sections: [
      {
        name: entriesForScope[0]?.activityType || "Imported Section",
        scope3Module: scope === "Scope 3" ? entriesForScope[0]?.scope3Module || null : null,
        activities: Array.from(grouped.values()),
      },
    ],
  };
};

const buildBulkDraftPayload = (entriesForScope, scope, submissionId) => {
  const supportingFile = entriesForScope.find((entry) => entry.supportingDocument instanceof File)?.supportingDocument || null;
  const uploadKey = supportingFile ? `supportingDocument_${scope.toLowerCase().replace(" ", "")}_bulk` : null;
  const scopeData = buildBulkScopeData(entriesForScope, scope, uploadKey);
  const payload = new FormData();
  if (submissionId) {
    payload.append("submissionId", submissionId);
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

const calculateEmissions = (consumption, unit, source, scope, activityType, scope3Module) => {
  const qty = parseFloat(consumption);
  if (!qty || Number.isNaN(qty) || qty <= 0 || !source || !unit || !scope) return "0.00";

  try {
    const efData = getEmissionDataByScope(scope, scope3Module, activityType);
    if (!efData) {
      return "0.00";
    }

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
                const unitKeyLower = unitKey.toLowerCase();
                const normalizedUnitLower = normalizedUnit.toLowerCase();
                if (unitKeyLower === normalizedUnitLower) {
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

const extractEmissionFactor = (unitData) => {
  if (typeof unitData === "number") return unitData;
  if (typeof unitData === "object" && unitData !== null) {
    return unitData.emissionFactor || unitData.factor || unitData.value || null;
  }
  return null;
};

const RejectedEntries = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [selectedScope, setSelectedScope] = useState("All");
  const [selectedScope3Module, setSelectedScope3Module] = useState("Upstream");
  const [editingEntry, setEditingEntry] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedBulkKeys, setExpandedBulkKeys] = useState(new Set());
  const [deletingEntry, setDeletingEntry] = useState(null);

  useEffect(() => {
    const scopeParam = searchParams.get("scope");
    const scope3Param = searchParams.get("scope3");
    if (scopeParam === "scope2") {
      setSelectedScope("Scope 2");
    } else if (scopeParam === "scope3") {
      setSelectedScope("Scope 3");
      setSelectedScope3Module(scope3Param === "downstream" ? "Downstream" : "Upstream");
    } else if (scopeParam === "scope1") {
      setSelectedScope("Scope 1");
    } else {
      setSelectedScope("All");
    }
  }, [searchParams]);

  useEffect(() => {
    fetchRejectedEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRejectedEntries = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      query.set("status", "rejected");

      const res = await api.get(`/api/submissions?${query.toString()}`);
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
          const sections = data?.sections || data?.section || [];
          if (!sections || !sections.length) return;
          const bulkFlag = isBulkData(data);

          sections.forEach((section, sectionIndex) => {
            section.activities?.forEach((activity, activityIndex) => {
              activity.sources?.forEach((source, sourceIndex) => {
                const hasConsumption = source?.consumption !== undefined && source?.consumption !== null && source?.consumption !== "";
                if (hasConsumption && source?.source) {
                  const resolvedActivityType = activity.activityType || section.name || activity.activityCategory || "";
                  const resolvedScope3Module = data.scope3Module || section.scope3Module || activity.scope3Module || getScope3ModuleByActivityType(resolvedActivityType);
                  const resolvedDate = source.date ? new Date(source.date).toISOString().split("T")[0] : new Date(submission.createdAt).toISOString().split("T")[0];
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
                    status: submission.status || "rejected",
                    rejectionReason: submission.rejectionReason || "",
                    reportingPeriod: data?.reportingPeriod || "",
                    reportingYear: data?.reportingYear || "",
                    isBulk: bulkFlag,
                    bulkKey: bulkFlag ? `${submission._id}-${normalizedScope}` : null,
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

      setEntries(serverEntries);
    } catch (error) {
      console.error("Error fetching rejected entries:", error);
      setEntries([]);
    } finally {
      setLoading(false);
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
    }
  };

  const handleEditEntry = (entry) => {
    if (!entry) return;
    setEditingEntry({
      ...entry,
      supportingDocument: entry.supportingDocument || null,
    });
  };

  const handleEditChange = (field, value) => {
    setEditingEntry((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleEditFileChange = (file) => {
    if (!file) return;
    setEditingEntry((prev) => (prev ? { ...prev, supportingDocument: file } : prev));
  };

  const buildSubmissionPayload = (entry) => {
    const scope = entry.scope || getScopeFromActivityType(entry.activityType);
    const uploadKey = `supportingDocument_${scope.toLowerCase().replace(" ", "")}_0_0_0`;

    const scopeData = {
      reportingYear: entry.reportingYear || new Date().getFullYear().toString(),
      reportingPeriod: entry.reportingPeriod || "",
      scope3Module: scope === "Scope 3" ? entry.scope3Module : null,
      sections: [
        {
          name: entry.activityType || "Default Section",
          scope3Module: scope === "Scope 3" ? entry.scope3Module : null,
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
    payload.append("submissionId", entry.submissionId);
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

    return payload;
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;
    if (!editingEntry.activityType || !editingEntry.source || !editingEntry.consumption || !editingEntry.unit) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setSaving(true);
      const updated = {
        ...editingEntry,
        emissions: calculateEmissions(editingEntry.consumption, editingEntry.unit, editingEntry.source, editingEntry.scope, editingEntry.activityType, editingEntry.scope3Module),
      };

      const token = Cookies.get("accessToken");
      const baseURL = resolveBaseUrl();

      if (updated.isBulk && updated.bulkKey) {
        const groupEntries = entries.filter((item) => item.isBulk && item.bulkKey === updated.bulkKey);
        const nextEntries = groupEntries.map((item) => (item.id === updated.id ? { ...item, ...updated } : item));
        const payload = buildBulkDraftPayload(nextEntries, updated.scope || "Scope 1", updated.submissionId);
        await axios.post(`${baseURL}/api/submissions/draft`, payload, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          withCredentials: true,
        });
      } else {
        const payload = buildSubmissionPayload(updated);
        await axios.post(`${baseURL}/api/submissions/draft`, payload, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          withCredentials: true,
        });
      }

      setEditingEntry(null);
      toast.success("Rejected entry updated.");
      await fetchRejectedEntries();
    } catch (error) {
      console.error("Error updating rejected entry:", error);
      toast.error(error.response?.data?.message || "Failed to update entry.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitEntry = async (entry) => {
    if (!entry) return;
    try {
      setSaving(true);
      const token = Cookies.get("accessToken");
      const baseURL = resolveBaseUrl();

      if (entry.submissionId) {
        await axios.put(`${baseURL}/api/submissions/${entry.submissionId}/submit`, null, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          withCredentials: true,
        });
      } else {
        const payload = buildSubmissionPayload(entry);
        await axios.post(`${baseURL}/api/submissions`, payload, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          withCredentials: true,
        });
      }

      toast.success("Entry submitted for approval.");
      await fetchRejectedEntries();
    } catch (error) {
      console.error("Error submitting rejected entry:", error);
      toast.error(error.response?.data?.message || "Failed to submit entry.");
    } finally {
      setSaving(false);
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

  const handleSubmitBulkGroup = async (group) => {
    if (!group?.entries?.length) return;
    try {
      setSaving(true);
      const token = Cookies.get("accessToken");
      const baseURL = resolveBaseUrl();
      const submissionIds = Array.from(new Set(group.entries.map((item) => item.submissionId).filter(Boolean)));

      for (const submissionId of submissionIds) {
        await axios.put(`${baseURL}/api/submissions/${submissionId}/submit`, null, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          withCredentials: true,
        });
      }

      toast.success("Rejected entries submitted for approval.");
      await fetchRejectedEntries();
    } catch (error) {
      console.error("Error submitting bulk rejected entries:", error);
      toast.error(error.response?.data?.message || "Failed to submit entries.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteEntry = (entry) => {
    if (!entry) return;
    setDeletingEntry(entry);
  };

  const handleDeleteEntry = async () => {
    const entry = deletingEntry;
    if (!entry) return;

    try {
      setSaving(true);
      if (entry.isBulk && entry.bulkKey) {
        const groupEntries = entries.filter((item) => item.isBulk && item.bulkKey === entry.bulkKey);
        const remaining = groupEntries.filter((item) => item.id !== entry.id);
        if (!remaining.length) {
          if (entry.submissionId) {
            await api.delete(`/api/submissions/${entry.submissionId}`);
          }
        } else {
          const payload = buildBulkDraftPayload(remaining, entry.scope || "Scope 1", entry.submissionId);
          const token = Cookies.get("accessToken");
          const baseURL = resolveBaseUrl();
          await axios.post(`${baseURL}/api/submissions/draft`, payload, {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
            withCredentials: true,
          });
        }
      } else if (entry.submissionId) {
        await api.delete(`/api/submissions/${entry.submissionId}`);
      }

      toast.success("Entry deleted.");
      setDeletingEntry(null);
      await fetchRejectedEntries();
    } catch (error) {
      console.error("Error deleting rejected entry:", error);
      toast.error(error.response?.data?.message || "Failed to delete entry.");
    } finally {
      setSaving(false);
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
      if (selectedScope === "All") return true;
      const entryScope = normalizeScopeValue(entry.scope) || normalizeScopeValue(scopeFromKey(entry.scopeKey));
      if (!entryScope) return false;
      const selected = normalizeScopeValue(selectedScope);
      return entryScope === selected;
    };

    if (selectedScope === "Scope 3") {
      return entries.filter((entry) => {
        if (!matchesScope(entry)) return false;
        const module = entry.scope3Module || getScope3ModuleByActivityType(entry.activityType);
        if (!module) return true;
        return module === selectedScope3Module;
      });
    }
    return entries.filter(matchesScope);
  }, [entries, selectedScope, selectedScope3Module]);

  const groupedRows = useMemo(() => {
    const rows = [];
    const bulkGroups = new Map();

    filteredEntries.forEach((entry) => {
      if (entry.isBulk && entry.bulkKey) {
        if (!bulkGroups.has(entry.bulkKey)) {
          bulkGroups.set(entry.bulkKey, {
            bulkKey: entry.bulkKey,
            scope: entry.scope,
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

      rows.push({
        type: "bulk",
        bulkKey: group.bulkKey,
        scope: group.scope,
        entries: entriesForGroup,
        totalEmissions: totalEmissions.toFixed(2),
        totalConsumption,
        unitLabel,
        dateLabel,
      });
    });

    return rows;
  }, [filteredEntries]);

  const handleScopeNav = (scope, scope3Module) => {
    const nextParams = new URLSearchParams(searchParams);
    if (scope === "Scope 2") {
      nextParams.set("scope", "scope2");
      nextParams.delete("scope3");
    } else if (scope === "Scope 3") {
      nextParams.set("scope", "scope3");
      nextParams.set("scope3", scope3Module === "Downstream" ? "downstream" : "upstream");
    } else if (scope === "Scope 1") {
      nextParams.set("scope", "scope1");
      nextParams.delete("scope3");
    } else {
      nextParams.delete("scope");
      nextParams.delete("scope3");
    }
    const nextQuery = nextParams.toString();
    navigate(`${location.pathname}?${nextQuery}`);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-3 space-y-6">
      {/* <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rejected Entries</h1>
          <p className="text-gray-600">Only rejected submissions with reviewer comments.</p>
        </div>
      </div> */}
      <SectionHeader icon={MinusCircle} title="Rejected Entries" description="Only rejected submissions with reviewer comments." />

      <RejectedScopeTabs selectedScope={selectedScope} selectedScope3Module={selectedScope3Module} onScopeNav={handleScopeNav} />

      <RejectedEntriesTable
        groupedRows={groupedRows}
        expandedBulkKeys={expandedBulkKeys}
        toggleBulkKey={toggleBulkKey}
        handleSubmitBulkGroup={handleSubmitBulkGroup}
        handleDownloadDocument={handleDownloadDocument}
        handleEditEntry={handleEditEntry}
        handleDeleteEntry={confirmDeleteEntry}
        handleSubmitEntry={handleSubmitEntry}
        saving={saving}
      />

      <RejectedEditModal
        editingEntry={editingEntry}
        onClose={() => setEditingEntry(null)}
        handleEditChange={handleEditChange}
        handleEditFileChange={handleEditFileChange}
        handleSaveEdit={handleSaveEdit}
        saving={saving}
      />

      {/* Delete Confirmation Modal */}
      {deletingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
              <h3 className="text-lg font-bold text-white">Confirm Deletion</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-50 rounded-full">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Are you sure you want to delete this entry?
                  </p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><span className="font-semibold">Activity:</span> {deletingEntry.activityType}</p>
                    <p><span className="font-semibold">Source:</span> {deletingEntry.source}</p>
                    <p><span className="font-semibold">Consumption:</span> {deletingEntry.consumption} {deletingEntry.unit}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                ⚠️ This action cannot be undone.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingEntry(null)}
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEntry}
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Entry'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RejectedEntries;
