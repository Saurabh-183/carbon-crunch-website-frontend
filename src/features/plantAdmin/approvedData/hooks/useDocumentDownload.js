import { useState } from "react";
import api from "../../../../utils/api";

/**
 * Custom hook to handle document downloads for approved data
 * @returns {Object} - Download function and loading state
 */
export const useDocumentDownload = () => {
  const [downloading, setDownloading] = useState(false);

  const downloadDocument = async (entry) => {
    if (!entry?.submissionId) return;

    setDownloading(true);
    try {
      const response = await api.get(`/api/submissions/${entry.submissionId}/supporting-document`, {
        params: {
          scope: entry.scopeKey,
          sectionIndex: entry.sectionIndex ?? 0,
          activityIndex: entry.activityIndex ?? 0,
          sourceIndex: entry.sourceIndex ?? 0,
        },
        responseType: "blob",
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
      alert("Failed to download supporting document.");
    } finally {
      setDownloading(false);
    }
  };

  return {
    downloadDocument,
    downloading,
  };
};
