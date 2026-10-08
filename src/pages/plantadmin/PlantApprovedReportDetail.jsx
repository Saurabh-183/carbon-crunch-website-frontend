import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import api from "../../utils/api";
import Header from "../../components/rf/Header";

const PlantApprovedReportDetail = () => {
  const { id } = useParams();
  const [approvedData, setApprovedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchSubmission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchSubmission = async () => {
    try {
      if (!id) {
        setErrorMessage("Approved data ID missing. Please return to approved data.");
        return;
      }
      const res = await api.get(`/api/submissions/approved-data/${encodeURIComponent(id)}`);
      setApprovedData(res.data?.data || null);
      setErrorMessage("");
    } catch (error) {
      const message = error.response?.data?.message || "Unable to load approved data.";
      console.error("Error fetching approved submission:", error);
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };
  const rows = useMemo(() => approvedData?.detailedBreakdown || [], [approvedData]);
  const totalEmissions = useMemo(() => Number(approvedData?.totalEmissions || 0), [approvedData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!approvedData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500">{errorMessage || "Approved data not found."}</p>
        <Link to="/plant/approved-reports" className="mt-4 inline-flex items-center gap-2 text-green-700 hover:text-green-800">
          <ArrowLeft className="w-4 h-4" />
          Back to approved data
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Header
        icon={FileText}
        title="Approved Data Details"
        description="View approved emission data and detailed breakdown"
      />

      <div className="mb-4">
        <Link to="/plant/approved-reports" className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800">
          <ArrowLeft className="w-4 h-4" />
          Back to approved data
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{approvedData.scope || "N/A"}</span>
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Approved Data</span>
        </div>
        <p className="text-gray-400 text-sm">Approved: {new Date(approvedData.approvedAt || approvedData.createdAt || Date.now()).toLocaleDateString()}</p>

        <div className="flex items-center gap-2 text-sm text-gray-700">
          <FileText className="w-4 h-4" />
          Total emissions: <span className="font-semibold">{totalEmissions.toFixed(2)}</span>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-gray-500">No activity details provided.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Scope</th>
                  <th className="px-3 py-2 text-left font-semibold">Source</th>
                  <th className="px-3 py-2 text-left font-semibold">Consumption</th>
                  <th className="px-3 py-2 text-left font-semibold">EF</th>
                  <th className="px-3 py-2 text-left font-semibold">Emissions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row.source}-${index}`} className="border-b border-gray-200">
                    <td className="px-3 py-2 text-gray-700">{row.category || "-"}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[13px] font-bold text-gray-800 text-left">
                          {row.isBulk ? "Bulk Import" : (row.activityGroup || row.activityCategory || row.activityType || "Entry Data")}
                        </span>

                        {row.activityGroup && row.activityType && (
                          <span className="text-[11px] font-medium text-gray-500 text-left max-w-[180px] truncate leading-tight" title={row.activityType}>
                            {row.activityType}
                          </span>
                        )}

                        {row.source && row.source !== "-" && (
                          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase max-w-[150px] truncate text-left mt-0.5" title={row.source}>
                            {row.isBulk ? `${row.entries?.length || 0} entries` : row.source}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {row.consumption || "-"} {row.consumptionUnit || ""}
                    </td>
                    <td className="px-3 py-2 text-gray-700">{row.emissionFactor ?? "-"}</td>
                    <td className="px-3 py-2 text-gray-700">{row.calculatedEmission ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantApprovedReportDetail;
