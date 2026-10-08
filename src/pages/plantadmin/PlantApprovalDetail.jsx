import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, ArrowLeft, MessageSquare } from "lucide-react";
import api from "../../utils/api";

const PlantApprovalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchSubmission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchSubmission = async () => {
    try {
      if (!id) {
        setErrorMessage("Submission ID missing. Please return to approvals.");
        return;
      }
      const res = await api.get(`/api/submissions/${encodeURIComponent(id)}`);
      setSubmission(res.data?.data || null);
      setErrorMessage("");
    } catch (error) {
      const message = error.response?.data?.message || "Unable to load submission.";
      console.error("Error fetching submission:", error);
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!submission?._id) return;
    setProcessing(true);
    try {
      await api.put(`/api/submissions/${submission._id}/approve`);
      navigate("/plant/approvals");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!submission?._id) return;
    if (!rejectionReason.trim()) {
      alert("Please provide a reason or suggestion for rejection");
      return;
    }
    setProcessing(true);
    try {
      await api.put(`/api/submissions/${submission._id}/reject`, {
        reason: rejectionReason,
      });
      navigate("/plant/approvals");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject");
    } finally {
      setProcessing(false);
    }
  };

  const getDisplayPayloads = () => {
    if (!submission) return [];
    const payloads = [];
    if (submission.scope1Data && Object.keys(submission.scope1Data).length > 0) {
      payloads.push({ label: "Scope 1", payload: submission.scope1Data });
    }
    if (submission.scope2Data && Object.keys(submission.scope2Data).length > 0) {
      payloads.push({ label: "Scope 2", payload: submission.scope2Data });
    }
    if (submission.scope3Data && Object.keys(submission.scope3Data).length > 0) {
      payloads.push({ label: "Scope 3", payload: submission.scope3Data });
    }
    if (payloads.length === 0) {
      payloads.push({ label: submission.scope || "Submission", payload: submission.data || {} });
    }
    return payloads;
  };

  const handleDownloadDocument = async (submissionId, row) => {
    if (!submissionId) return;
    try {
      const response = await api.get(
        `/api/submissions/${submissionId}/supporting-document`,
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

  const renderScopeActivities = (payload, scopeLabel) => {
    const sections = Array.isArray(payload.sections) ? payload.sections : [];
    if (!sections.length) {
      const dataEntries = Object.entries(payload || {}).filter(([key, value]) => key !== "sections" && value !== "");
      if (!dataEntries.length) {
        return <p className="text-sm text-gray-500">No activity details provided.</p>;
      }
      return (
        <table className="w-full text-sm">
          <tbody>
            {dataEntries.map(([key, value]) => (
              <tr key={key} className="border-b border-gray-200">
                <td className="py-2 pr-4 font-medium text-gray-600 capitalize">{key}</td>
                <td className="py-2 text-gray-900">{String(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    const rows = [];
    sections.forEach((section, sectionIndex) => {
      (section.activities || []).forEach((activity, activityIndex) => {
        (activity.sources || []).forEach((source, sourceIndex) => {
          rows.push({
            id: `${sectionIndex}-${activityIndex}-${sourceIndex}`,
            activityOrder: activityIndex + 1,
            type: activity.activityType || "-",
            group: activity.activityGroup || "-",
            category: activity.activityCategory || "-",
            source: source.source || "-",
            consumption: source.consumption || "-",
            unit: source.unit || "-",
            method: source.measurementMethod || "-",
            supportingDocument: source.supportingDocument,
            scopeKey:
              scopeLabel === "Scope 1"
                ? "scope1"
                : scopeLabel === "Scope 2"
                ? "scope2"
                : "scope3",
            sectionIndex,
            activityIndex,
            sourceIndex,
          });
        });
      });
    });

    if (!rows.length) {
      return <p className="text-sm text-gray-500">No activity details provided.</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Activity</th>
              <th className="px-3 py-2 text-left font-semibold">Type</th>
              <th className="px-3 py-2 text-left font-semibold">Group</th>
              <th className="px-3 py-2 text-left font-semibold">Category</th>
              <th className="px-3 py-2 text-left font-semibold">Source</th>
              <th className="px-3 py-2 text-left font-semibold">Consumption</th>
              <th className="px-3 py-2 text-left font-semibold">Unit</th>
              <th className="px-3 py-2 text-left font-semibold">Method</th>
              <th className="px-3 py-2 text-left font-semibold">Supporting Doc</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-200">
                <td className="px-3 py-2 text-gray-700">{row.activityOrder}</td>
                <td className="px-3 py-2 text-gray-700">{row.type}</td>
                <td className="px-3 py-2 text-gray-700">{row.group}</td>
                <td className="px-3 py-2 text-gray-700">{row.category}</td>
                <td className="px-3 py-2 text-gray-700">{row.source}</td>
                <td className="px-3 py-2 text-gray-700">{row.consumption}</td>
                <td className="px-3 py-2 text-gray-700">{row.unit}</td>
                <td className="px-3 py-2 text-gray-700">{row.method}</td>
                <td className="px-3 py-2 text-gray-700">
                  {row.supportingDocument?.url || row.supportingDocument?.downloadUrl ? (
                    <button
                      type="button"
                      className="text-green-700 hover:text-green-800 underline"
                      onClick={() => handleDownloadDocument(submission?._id, row)}
                    >
                      {row.supportingDocument?.originalName || "Download"}
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500">{errorMessage || "Submission not found."}</p>
        <Link to="/plant/approvals" className="mt-4 inline-flex items-center gap-2 text-green-700 hover:text-green-800">
          <ArrowLeft className="w-4 h-4" />
          Back to approvals
        </Link>
      </div>
    );
  }

  const payloads = getDisplayPayloads();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/plant/approvals" className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800">
            <ArrowLeft className="w-4 h-4" />
            Back to approvals
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Submission Review</h1>
          <p className="text-gray-600">Review data and approve or reject with suggestions.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{submission.scope || "N/A"}</span>
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Submission</span>
        </div>
        <p className="text-gray-600 text-sm">
          Submitted by: <span className="font-medium">{submission.submittedBy?.username || submission.submittedBy?.email || "N/A"}</span>
        </p>
        <p className="text-gray-400 text-sm">Submitted: {new Date(submission.createdAt || submission.updatedAt || Date.now()).toLocaleDateString()}</p>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Submitted Data:</h4>
          <div className="space-y-4">
            {payloads.map((item) => (
              <div key={item.label}>
                <p className="text-sm font-semibold text-gray-600 mb-2">{item.label}</p>
                {renderScopeActivities(item.payload, item.label)}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          <label className="text-sm font-medium text-gray-700">Rejection reason / suggestions</label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            rows="4"
            placeholder="Enter reason or suggestions if rejecting..."
          />
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button onClick={handleApprove} disabled={processing} className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
            <CheckCircle className="w-4 h-4" />
            Approve
          </button>
          <button onClick={handleReject} disabled={processing} className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50">
            <MessageSquare className="w-4 h-4" />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantApprovalDetail;
