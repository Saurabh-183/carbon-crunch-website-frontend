import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import {
  Eye,
  FileText,
  Building2,
  Factory,
  CheckSquare,
  ClipboardList,
  Shield,
} from "lucide-react";

const AuditorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    organizations: 0,
    facilities: 0,
    submissions: 0,
    approved: 0,
    reports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [orgRes, facRes, subRes, approvedRes, reportRes] = await Promise.allSettled([
          api.get("/api/organizations"),
          api.get("/api/facilities"),
          api.get("/api/submissions"),
          api.get("/api/submissions/approved-data"),
          api.get("/api/reports"),
        ]);

        const len = (r) => {
          if (r.status !== "fulfilled") return 0;
          const d = r.value.data?.data || r.value.data || [];
          return Array.isArray(d) ? d.length : d.organizations?.length || d.facilities?.length || d.submissions?.length || 0;
        };

        setStats({
          organizations: len(orgRes),
          facilities: len(facRes),
          submissions: len(subRes),
          approved: len(approvedRes),
          reports: len(reportRes),
        });
      } catch (err) {
        console.error("Auditor stats error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const StatCard = ({ label, value, icon: Icon, color, bgColor }) => (
    <div className="bg-white p-5 rounded-xl border shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{loading ? "..." : value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Eye className="w-7 h-7 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Auditor Dashboard</h1>
        </div>
        <p className="text-gray-500">
          Read-only access to evidence, compliance data, and reports across the platform.
          Logged in as <span className="font-mono text-indigo-600">{user?.username || user?.email}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Organizations" value={stats.organizations} icon={Building2} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard label="Facilities" value={stats.facilities} icon={Factory} color="text-cyan-600" bgColor="bg-cyan-50" />
        <StatCard label="Submissions" value={stats.submissions} icon={ClipboardList} color="text-purple-600" bgColor="bg-purple-50" />
        <StatCard label="Approved Data" value={stats.approved} icon={CheckSquare} color="text-green-600" bgColor="bg-green-50" />
        <StatCard label="Reports" value={stats.reports} icon={FileText} color="text-orange-600" bgColor="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/auditor/clients"
          className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition flex items-start gap-4"
        >
          <div className="p-3 bg-blue-50 rounded-lg">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Manage Clients</h3>
            <p className="text-sm text-gray-500">
              View organization and facility registry in a read-only client portfolio format.
            </p>
          </div>
        </Link>
        <Link
          to="/auditor/verify-reports"
          className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition flex items-start gap-4"
        >
          <div className="p-3 bg-emerald-50 rounded-lg">
            <CheckSquare className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Verify Reports</h3>
            <p className="text-sm text-gray-500">
              Open reports queued for auditor sign-off and jump directly to detailed review.
            </p>
          </div>
        </Link>
        <Link
          to="/auditor/submissions"
          className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition flex items-start gap-4"
        >
          <div className="p-3 bg-purple-50 rounded-lg">
            <ClipboardList className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">View Submissions</h3>
            <p className="text-sm text-gray-500">
              Browse all emission data submissions and their statuses — approved, rejected, or pending.
            </p>
          </div>
        </Link>
        <Link
          to="/auditor/reports"
          className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition flex items-start gap-4"
        >
          <div className="p-3 bg-orange-50 rounded-lg">
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">View Reports</h3>
            <p className="text-sm text-gray-500">
              Access generated emission reports for any organization or facility.
            </p>
          </div>
        </Link>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-indigo-800">
            <strong>Auditor guidelines:</strong> You have read-only access to all data across organizations.
            You cannot modify, approve, or reject any submission. All access is logged for compliance.
            Contact Platform Admin if you need elevated privileges.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuditorDashboard;
