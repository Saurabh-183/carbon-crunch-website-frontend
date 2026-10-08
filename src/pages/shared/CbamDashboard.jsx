import React, { useState, useEffect } from "react";
import { Globe, TrendingUp, Factory, Package, FileText, BarChart3, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cbamAPI } from "../../utils/api";
import Loader from "../../components/rf/Loader";
import SectionHeader from "../../components/rf/Header";
import { toast } from "sonner";

// ─── Stat card ──────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, unit, color = "emerald" }) => {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-50 text-slate-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">
          {value ?? "—"}
          {unit && <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );
};

const CbamDashboard = () => {
  const { user } = useAuth();
  const facilityId =
    user?.facilities?.[0]?.facilityId?._id ||
    user?.facilities?.[0]?.facilityId ||
    user?.facilityAssignments?.[0]?.facilityId?._id ||
    user?.facilityAssignments?.[0]?.facilityId ||
    user?.facilityId?._id ||
    user?.facilityId ||
    null;

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [records, setRecords] = useState([]);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  useEffect(() => {
    Promise.all([fetchSummary(), fetchProducts(), fetchInstallations(), fetchRecords()]).finally(() => setLoading(false));
  }, [facilityId, yearFilter]);

  const fetchSummary = async () => {
    try {
      const res = await cbamAPI.getSummary(facilityId ? { facilityId, year: yearFilter } : { year: yearFilter });
      setSummary(res.data?.data || null);
    } catch {
      /* non-blocking */
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await cbamAPI.getProducts(facilityId ? { facilityId } : undefined);
      setProducts(res.data?.data?.products || res.data?.data || []);
    } catch {
      /* non-blocking */
    }
  };

  const fetchInstallations = async () => {
    try {
      const res = await cbamAPI.getInstallations(facilityId ? { facilityId } : undefined);
      setInstallations(res.data?.data?.installations || res.data?.data || []);
    } catch {
      /* non-blocking */
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await cbamAPI.getProductionRecords(facilityId ? { facilityId } : undefined);
      setRecords(res.data?.data?.records || res.data?.data || []);
    } catch {
      /* non-blocking */
    }
  };

  if (loading) return <Loader />;

  // Compute quick stats
  const totalProducts = products.length;
  const totalInstallations = installations.length;
  const totalRecords = records.length;
  const approvedRecords = records.filter((r) => r.status === "approved").length;
  const pendingRecords = records.filter((r) => r.status === "draft" || r.status === "submitted").length;

  // Compute aggregated emissions from summary or records
  const summaryProducts = summary?.summary || summary?.products || [];
  const totalDirectEmissions = summaryProducts.reduce((sum, p) => sum + (p.totalDirectEmissions || 0), 0);
  const totalIndirectEmissions = summaryProducts.reduce((sum, p) => sum + (p.totalIndirectEmissions || 0), 0);
  const totalProduction = summaryProducts.reduce((sum, p) => sum + (p.totalProduction || 0), 0);

  // Sector distribution
  const sectorMap = {};
  products.forEach((p) => {
    sectorMap[p.mainCategory] = (sectorMap[p.mainCategory] || 0) + 1;
  });

  // Status distribution
  const statusMap = {};
  records.forEach((r) => {
    statusMap[r.status || "draft"] = (statusMap[r.status || "draft"] || 0) + 1;
  });

  const STATUS_COLORS = {
    draft: "bg-slate-200",
    submitted: "bg-amber-400",
    approved: "bg-emerald-500",
    rejected: "bg-red-400",
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-3 py-3 animate-in fade-in duration-500">
      <SectionHeader icon={Globe} title="CBAM Dashboard" description="Overview of CBAM products, installations, and emissions data" />

      {/* Year filter */}
      <div className="flex items-center gap-3 mb-5">
        <label className="text-sm font-medium text-slate-600">Reporting Year:</label>
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(Number(e.target.value))}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          {[2023, 2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={Package} label="Products" value={totalProducts} color="emerald" />
        <StatCard icon={Factory} label="Installations" value={totalInstallations} color="blue" />
        <StatCard icon={FileText} label="Records" value={totalRecords} color="purple" />
        <StatCard icon={TrendingUp} label="Direct Emissions" value={totalDirectEmissions.toFixed(2)} unit="tCO₂" color="amber" />
        <StatCard icon={BarChart3} label="Indirect Emissions" value={totalIndirectEmissions.toFixed(2)} unit="tCO₂" color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Products by CBAM Sector</h3>
          {Object.keys(sectorMap).length === 0 ? (
            <p className="text-sm text-slate-400">No products defined yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(sectorMap)
                .sort(([, a], [, b]) => b - a)
                .map(([sector, count]) => (
                  <div key={sector} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">{sector}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${(count / totalProducts) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Record status breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Records by Status</h3>
          {totalRecords === 0 ? (
            <p className="text-sm text-slate-400">No production records yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(statusMap)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 capitalize">{status}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${STATUS_COLORS[status] || "bg-slate-300"}`}
                          style={{
                            width: `${(count / totalRecords) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Per-product emissions summary */}
        {summaryProducts.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Emissions Summary by Product</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                    <th className="px-4 py-2">Product</th>
                    <th className="px-4 py-2">Records</th>
                    <th className="px-4 py-2">Total Production</th>
                    <th className="px-4 py-2">Direct tCO₂</th>
                    <th className="px-4 py-2">Indirect tCO₂</th>
                    <th className="px-4 py-2">Avg SEE (tCO₂/t)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {summaryProducts.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-semibold text-slate-900">{p.productName || p._id || "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{p.recordCount || p.count || "—"}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{p.totalProduction?.toLocaleString() || "—"}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{p.totalDirectEmissions?.toFixed(2) || "0"}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{p.totalIndirectEmissions?.toFixed(2) || "0"}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-900">{p.avgSpecificEmbedded?.toFixed(4) || p.avgSEE?.toFixed(4) || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CbamDashboard;
