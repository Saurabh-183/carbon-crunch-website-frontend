import React, { useState, useEffect, useMemo } from "react";
import { Link, Package, Search, ChevronDown, Mail, CheckCircle2, Factory, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cbamAPI } from "../../utils/api";
import Loader from "../../components/rf/Loader";
import SectionHeader from "../../components/rf/Header";
import EmptyState from "../../components/rf/EmptyState";
import { toast } from "sonner";

const STATUS_COLORS = {
    pending: "bg-slate-100 text-slate-700",
    sent: "bg-blue-100 text-blue-700",
    received: "bg-emerald-100 text-emerald-700",
};

const CbamSupplyChain = () => {
    const { user } = useAuth();
    const facilityId =
        user?.facilities?.[0]?.facilityId?._id ||
        user?.facilities?.[0]?.facilityId ||
        user?.facilityAssignments?.[0]?.facilityId?._id ||
        user?.facilityAssignments?.[0]?.facilityId ||
        user?.facilityId?._id ||
        user?.facilityId ||
        null;

    // Data
    const [supplyChain, setSupplyChain] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [sendingId, setSendingId] = useState(null);

    // Fetch data
    const fetchSupplyChain = async () => {
        try {
            const res = await cbamAPI.getSupplyChain(facilityId ? { facilityId } : undefined);
            setSupplyChain(res.data?.data || []);
        } catch (err) {
            console.error("Failed to load supply chain", err);
            toast.error("Could not load supply chain data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupplyChain();
    }, [facilityId]);

    // Derived
    const filteredChain = useMemo(() => {
        let list = supplyChain;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (s) =>
                    s.activityGroup?.toLowerCase().includes(q) ||
                    s.source?.toLowerCase().includes(q) ||
                    s.measurementMethod?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [supplyChain, searchQuery]);

    // Handlers
    const handleSendMail = async (productId, supplierId) => {
        setSendingId(supplierId);
        try {
            await cbamAPI.sendSupplierMail(productId, supplierId);
            toast.success("Request sent to supplier!");
            await fetchSupplyChain();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send email");
        } finally {
            setSendingId(null);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search items, methods..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>
            </div>

            {filteredChain.length === 0 ? (
                <EmptyState
                    icon={Package}
                    title="No Scope 3 Data Found"
                    description="No upstream purchased goods and services were found for this facility's current reporting year."
                />
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-50">
                        <h2 className="text-lg font-bold text-slate-900">
                            Upstream Purchased Goods & Services{" "}
                            <span className="text-sm font-normal text-slate-400 ml-2">
                                ({filteredChain.length})
                            </span>
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    <th className="px-5 py-3">Date</th>
                                    <th className="px-5 py-3">Item Name</th>
                                    <th className="px-5 py-3">Data Method</th>
                                    <th className="px-5 py-3 text-right">Consumption</th>
                                    <th className="px-5 py-3">Calc. Method</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredChain.map((s, i) => (
                                    <tr
                                        key={s._id || i}
                                        className="hover:bg-slate-50/80 transition-colors"
                                    >
                                        <td className="px-5 py-4 text-sm text-slate-600 font-medium">
                                            {s.date ? new Date(s.date).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {s.activityGroup || "—"}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            <span className="inline-flex px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wide">
                                                {s.source || "—"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg shadow-sm">
                                                {(s.value || s.consumption || 0).toLocaleString()} <span className="text-xs text-emerald-600/70">{s.unit || ""}</span>
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-500">
                                            {s.measurementMethod || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/*  --- PREVIOUS SUPPLY CHAIN TRACKER UI (Commented out) ---
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search suppliers, precursors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="sent">Request Sent</option>
                            <option value="received">Data Received</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {filteredChain.length === 0 ? (
                <EmptyState
                    icon={Package}
                    title="No Suppliers Found"
                    description={
                        supplyChain.length === 0
                            ? "No suppliers have been tracked. Add suppliers inside your CBAM Product definitions."
                            : "No suppliers match your current filters."
                    }
                    action={
                        supplyChain.length === 0 && (
                            <Link
                                to="/plant/cbam-products"
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                                <Factory className="w-4 h-4" /> Manage Products
                            </Link>
                        )
                    }
                />
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-50">
                        <h2 className="text-lg font-bold text-slate-900">
                            Upstream Supply Chain{" "}
                            <span className="text-sm font-normal text-slate-400 ml-2">
                                ({filteredChain.length})
                            </span>
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    <th className="px-5 py-3">Final Product</th>
                                    <th className="px-5 py-3">Precursor Needed</th>
                                    <th className="px-5 py-3">Supplier Name</th>
                                    <th className="px-5 py-3">Supplier Contact</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredChain.map((s, i) => {
                                    const status = s.status || "pending";
                                    const statusColor = STATUS_COLORS[status];
                                    return (
                                        <tr
                                            key={s._id || i}
                                            className="hover:bg-slate-50/80 transition-colors"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {s.productName}
                                                </p>
                                                <p className="text-xs text-slate-500 font-mono">
                                                    {s.cnCode}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                                {s.precursorName}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {s.supplierName || "—"}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {s.supplierEmail || "—"}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${statusColor}`}
                                                >
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                {status === "received" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Logged
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSendMail(s.productId, s._id)}
                                                        disabled={!s.supplierEmail || sendingId === s._id}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm focus:outline-none"
                                                        title={
                                                            !s.supplierEmail
                                                                ? "Supplier email required"
                                                                : "Send data request"
                                                        }
                                                    >
                                                        {sendingId === s._id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Mail className="w-3.5 h-3.5" />
                                                        )}
                                                        {status === "sent" ? "Resend Mail" : "Request Data"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            */}
        </div>
    );
};

export default CbamSupplyChain;
