import React, { useMemo, useState, useEffect } from "react";
import api from "../../utils/api";
import Loader from "../../components/rf/Loader";
import { SCOPE_CONFIGS } from "../../config/constants";
import { calculateEmissions, getScope3ModuleByActivityType } from "../../utils/emission-calculator";
import ApprovalsTable from "../../features/plantAdmin/approvals/ApprovalsTable";
import SubmissionDetailsModal from "../../features/plantAdmin/approvals/SubmissionDetailsModal";
import RejectionModal from "../../features/plantAdmin/approvals/RejectionModal";
import SectionHeader from "../../components/rf/Header";
import { Clock5 } from "lucide-react";

const PlantApprovals = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [submissionToReject, setSubmissionToReject] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await api.get("/api/submissions?status=submitted");
      const list = res.data?.data || [];
      setSubmissions(list.map((item) => ({ ...item, id: item._id || item.id })));
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId) => {
    if (!submissionId) return;
    setProcessingId(submissionId);
    try {
      await api.put(`/api/submissions/${submissionId}/approve`);
      await fetchSubmissions();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (submissionId) => {
    setSubmissionToReject(submissionId);
    setRejectionModalOpen(true);
  };

  const confirmReject = async (reason) => {
    if (!submissionToReject) return;
    setProcessingId(submissionToReject);
    try {
      await api.put(`/api/submissions/${submissionToReject}/reject`, {
        reason: reason.trim(),
      });
      await fetchSubmissions();
      setRejectionModalOpen(false);
      setSubmissionToReject(null);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject");
    } finally {
      setProcessingId(null);
    }
  };

  const rows = useMemo(() => {
    const flattened = [];
    submissions.forEach((submission) => {
      const submissionId = submission._id || submission.id;

      const isBulkData = (scopeData) => {
        if (!scopeData) return false;
        if (["bulk", "bulk-import", "excel", "import"].includes(scopeData.importedFrom)) return true;
        if (scopeData.importedAt) return true;
        if (scopeData.importBatchId) return true;
        return scopeData.sections?.some((section) =>
          (section.activities || []).some((activity) => (activity.sources || []).some((source) => source?.supportingDocument?.uploadKey?.includes("_bulk"))),
        );
      };

      SCOPE_CONFIGS.forEach(({ scope, key, dataKey }) => {
        const data = submission[dataKey];
        if (!data?.sections) return;

        if (isBulkData(data)) {
          const bulkEntries = [];
          data.sections.forEach((section, sectionIndex) => {
            (section.activities || []).forEach((activity, activityIndex) => {
              (activity.sources || []).forEach((source, sourceIndex) => {
                const resolvedScope3Module = data.scope3Module || section.scope3Module || activity.scope3Module || getScope3ModuleByActivityType(activity.activityType || activity.activityCategory);

                const entryDate = source.date ? new Date(source.date).toISOString().split("T")[0] : new Date(submission.createdAt || submission.updatedAt || Date.now()).toISOString().split("T")[0];

                bulkEntries.push({
                  id: `${submissionId}_${key}_${sectionIndex}_${activityIndex}_${sourceIndex}`,
                  date: entryDate,
                  scope,
                  activityType: activity.activityType || activity.activityCategory || "",
                  activityGroup: activity.activityGroup || "",
                  activityCategory: activity.activityCategory || "",
                  source: source.source || "",
                  unit: source.unit || "",
                  consumption: source.consumption || "",
                  measurementMethod: source.measurementMethod || "",
                  emissions: calculateEmissions(source.consumption, source.unit, source.source, scope, activity.activityType, resolvedScope3Module, source.emissionFactor),
                  supportingDocument: source.supportingDocument,
                  submissionId,
                  scopeKey: key,
                  scope3Module: scope === "Scope 3" ? resolvedScope3Module : null,
                  sectionIndex,
                  activityIndex,
                  sourceIndex,
                });
              });
            });
          });

          if (bulkEntries.length) {
            const dates = bulkEntries.map((entry) => new Date(entry.date)).filter((d) => !Number.isNaN(d.getTime()));
            const minDate = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null;
            const maxDate = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;
            const totalEmissions = bulkEntries.reduce((sum, entry) => sum + Number(entry.emissions || 0), 0);
            const totalConsumption = bulkEntries.reduce((sum, entry) => sum + Number(entry.consumption || 0), 0);
            const unitSet = new Set(bulkEntries.map((entry) => entry.unit).filter(Boolean));
            const unitSummary = unitSet.size === 1 ? Array.from(unitSet)[0] : unitSet.size > 1 ? "Mixed" : "-";

            flattened.push({
              id: `${submissionId}_${key}_bulk`,
              dateRange: {
                start: minDate,
                end: maxDate,
              },
              scope,
              entries: bulkEntries,
              totalEmissions: totalEmissions.toFixed(2),
              totalConsumption: totalConsumption.toFixed(2),
              unitSummary,
              submissionId,
              isBulk: true,
            });
          }
          return;
        }

        data.sections.forEach((section, sectionIndex) => {
          (section.activities || []).forEach((activity, activityIndex) => {
            (activity.sources || []).forEach((source, sourceIndex) => {
              const resolvedScope3Module = data.scope3Module || section.scope3Module || activity.scope3Module || getScope3ModuleByActivityType(activity.activityType || activity.activityCategory);

              flattened.push({
                id: `${submissionId}_${key}_${sectionIndex}_${activityIndex}_${sourceIndex}`,
                date: source.date ? new Date(source.date).toISOString().split("T")[0] : new Date(submission.createdAt || submission.updatedAt || Date.now()).toISOString().split("T")[0],
                scope,
                activityType: activity.activityType || activity.activityCategory || "",
                activityGroup: activity.activityGroup || "",
                activityCategory: activity.activityCategory || "",
                source: source.source || "",
                unit: source.unit || "",
                consumption: source.consumption || "",
                measurementMethod: source.measurementMethod || "",
                emissions: calculateEmissions(source.consumption, source.unit, source.source, scope, activity.activityType, resolvedScope3Module, source.emissionFactor),
                supportingDocument: source.supportingDocument,
                submissionId,
                scopeKey: key,
                scope3Module: scope === "Scope 3" ? resolvedScope3Module : null,
                sectionIndex,
                activityIndex,
                sourceIndex,
              });
            });
          });
        });
      });
    });
    return flattened;
  }, [submissions]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      {/* Header */}
      <SectionHeader icon={Clock5} title="Pending Approvals" description="Approve or reject submitted data" />

      {/* Table */}
      <ApprovalsTable rows={rows} processingId={processingId} onApprove={handleApprove} onReject={handleRejectClick} onViewDetails={setSelectedRow} />

      {/* Details Modal */}
      <SubmissionDetailsModal selectedRow={selectedRow} onClose={() => setSelectedRow(null)} />

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={rejectionModalOpen}
        onClose={() => {
          setRejectionModalOpen(false);
          setSubmissionToReject(null);
        }}
        onConfirm={confirmReject}
        processing={processingId === submissionToReject}
      />
    </div>
  );
};

export default PlantApprovals;
