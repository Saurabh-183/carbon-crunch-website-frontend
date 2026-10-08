import { useState, useEffect, useMemo } from "react";
import api from "../utils/api";
import { transformSubmissionsToRows } from "../utils/plantAdmin/submissionTransformer";

export const useSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    try {
      const res = await api.get("/api/submissions?status=submitted");
      const list = res.data?.data || [];
      setSubmissions(
        list.map((item) => ({ ...item, id: item._id || item.id }))
      );
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const rows = useMemo(() => {
    return transformSubmissionsToRows(submissions);
  }, [submissions]);

  return { submissions, rows, loading, refetchSubmissions: fetchSubmissions };
};

export const useDocumentDownload = () => {
  const handleDownload = async (row) => {
    if (!row?.submissionId) return;

    try {
      const response = await api.get(
        `/api/submissions/${row.submissionId}/supporting-document`,
        {
          params: {
            scope: row.scopeKey,
            sectionIndex: row.sectionIndex ?? 0,
            activityIndex: row.activityIndex ?? 0,
            sourceIndex: row.sourceIndex ?? 0,
          },
          responseType: "blob",
        }
      );

      const contentDisposition = response.headers["content-disposition"];
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename =
        filenameMatch?.[1] ||
        row.supportingDocument?.originalName ||
        "supporting-document";

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
      alert("Failed to download supporting document.");
    }
  };

  return { handleDownload };
};

export const useApprovalActions = (refetchSubmissions) => {
  const [processingId, setProcessingId] = useState(null);

  const handleApprove = async (submissionId) => {
    if (!submissionId) return;

    setProcessingId(submissionId);
    try {
      await api.put(`/api/submissions/${submissionId}/approve`);
      await refetchSubmissions();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (submissionId, reason) => {
    if (!submissionId || !reason) return;

    setProcessingId(submissionId);
    try {
      await api.put(`/api/submissions/${submissionId}/reject`, {
        reason: reason.trim(),
      });
      await refetchSubmissions();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject");
      throw error;
    } finally {
      setProcessingId(null);
    }
  };

  return { processingId, handleApprove, handleReject };
};