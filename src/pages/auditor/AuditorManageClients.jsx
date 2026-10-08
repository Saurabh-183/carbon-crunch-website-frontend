import React, { useEffect, useMemo, useState } from "react";
import { Building2, Factory, Search, RefreshCcw, Users, ChevronRight } from "lucide-react";
import api from "../../utils/api";

const AuditorManageClients = () => {
  const [organizations, setOrganizations] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orgRes, facilityRes] = await Promise.all([
        api.get("/api/organizations"),
        api.get("/api/facilities"),
      ]);

      const orgData = orgRes.data?.data || orgRes.data || [];
      const facilityData = facilityRes.data?.data || facilityRes.data || [];

      setOrganizations(Array.isArray(orgData) ? orgData : orgData.organizations || []);
      setFacilities(Array.isArray(facilityData) ? facilityData : facilityData.facilities || []);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      setOrganizations([]);
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const facilityCountByOrg = useMemo(() => {
    const map = new Map();
    facilities.forEach((facility) => {
      const orgId = facility.organizationId?._id || facility.organizationId;
      if (!orgId) return;
      map.set(orgId, (map.get(orgId) || 0) + 1);
    });
    return map;
  }, [facilities]);

  const filteredOrganizations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return organizations;

    return organizations.filter((org) => {
      const name = String(org.companyName || org.name || "").toLowerCase();
      const code = String(org.companyCode || org.code || "").toLowerCase();
      const email = String(org.email || "").toLowerCase();
      return name.includes(term) || code.includes(term) || email.includes(term);
    });
  }, [organizations, search]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Manage Clients</h1>
          </div>
          <p className="text-sm text-gray-500">
            Auditor read-only client registry for organizations and facilities.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
        >
          <RefreshCcw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations by name, code, or email"
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">Total Organizations</p>
          <p className="text-2xl font-bold text-blue-700">{loading ? "..." : organizations.length}</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">Total Facilities</p>
          <p className="text-2xl font-bold text-cyan-700">{loading ? "..." : facilities.length}</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">Visible Clients</p>
          <p className="text-2xl font-bold text-indigo-700">{loading ? "..." : filteredOrganizations.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredOrganizations.length === 0 ? (
        <div className="bg-white rounded-xl border shadow-sm p-10 text-center text-gray-400">
          No organizations found for this search.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrganizations.map((org) => {
            const orgId = org._id;
            const facilityCount = facilityCountByOrg.get(orgId) || 0;

            return (
              <div key={orgId} className="bg-white rounded-xl border shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-lg">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {org.companyName || org.name || "Unnamed Organization"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Code: {org.companyCode || org.code || "N/A"}
                        {" · "}
                        Email: {org.email || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 font-medium">
                      <Factory className="w-3.5 h-3.5" /> {facilityCount} facilities
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                      <Users className="w-3.5 h-3.5" /> client
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                      View <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AuditorManageClients;
