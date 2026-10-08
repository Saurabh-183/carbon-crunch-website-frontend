import React, { useState, useEffect } from "react";
import { Database, Search, Save, Package } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api, { cbamAPI } from "../../utils/api";
import Loader from "../../components/rf/Loader";
import SectionHeader from "../../components/rf/Header";
import EmptyState from "../../components/rf/EmptyState";
import { toast } from "sonner";

const CbamQuantity = () => {
    const { user } = useAuth();
    const facilityId =
        user?.facilities?.[0]?.facilityId?._id ||
        user?.facilities?.[0]?.facilityId ||
        user?.facilityAssignments?.[0]?.facilityId?._id ||
        user?.facilityAssignments?.[0]?.facilityId ||
        user?.facilityId?._id ||
        user?.facilityId ||
        null;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchQuantities = async () => {
        try {
            const res = await cbamAPI.getProductQuantities(facilityId ? { facilityId } : undefined);
            setProducts(res.data?.data || []);
        } catch (err) {
            console.error("Failed to load quantities", err);
            toast.error("Could not load product quantities");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (facilityId) fetchQuantities();
    }, [facilityId]);

    const handleQuantityChange = (productId, field, value) => {
        const numValue = Math.max(0, Number(value) || 0);
        setProducts(products.map(p => {
            if (p._id !== productId) return p;

            const totalProduced = p.quantityProduced || 0;
            const newP = { ...p, [field]: numValue };

            // Make Self-Use and Sold complementary
            if (field === "quantityInternal") {
                newP.quantitySold = Math.max(0, totalProduced - numValue);
            } else if (field === "quantitySold") {
                newP.quantityInternal = Math.max(0, totalProduced - numValue);
            }

            return newP;
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Build the payload mapping the array
            const payload = {
                facilityId,
                startDate: "2024-01-01",
                endDate: "2024-12-31",
                allocations: products.map(p => ({
                    product: p.productName,
                    // keep percentage around 100 for now if required by schema, or modify backend schema to make it optional
                    percentage: 100,
                    quantityInternal: p.quantityInternal,
                    quantitySold: p.quantitySold
                }))
            };

            await api.post('/api/product-allocations', payload);
            toast.success("Quantities updated successfully");
            await fetchQuantities();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save quantities");
        } finally {
            setSaving(false);
        }
    };

    const filtered = products.filter(p => !searchQuery || p.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) return <Loader />;

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                >
                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Quantities
                </button>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={Database}
                    title="No Products Found"
                    description="No products exist in this facility to track quantities for."
                />
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    <th className="px-5 py-3">Product Name</th>
                                    <th className="px-5 py-3">Units</th>
                                    <th className="px-5 py-3 text-right">Total Produced</th>
                                    <th className="px-5 py-3 text-right">Self-Use</th>
                                    <th className="px-5 py-3 text-right">Sold</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((prod) => (
                                    <tr key={prod._id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                    <Package className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{prod.productName}</p>
                                                    <p className="text-xs text-slate-500 font-mono">{prod.cnCode || "No CN Code"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-500">{prod.productionUnit || "Tonnes"}</td>

                                        <td className="px-5 py-4 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg shadow-sm w-24 text-center">
                                                    {(prod.quantityProduced || 0).toLocaleString()}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Auto-Synced</span>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={prod.quantityInternal || ""}
                                                    onChange={(e) => handleQuantityChange(prod._id, "quantityInternal", e.target.value)}
                                                    className="w-24 px-3 py-1.5 text-sm text-right border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={prod.quantitySold || ""}
                                                    onChange={(e) => handleQuantityChange(prod._id, "quantitySold", e.target.value)}
                                                    className="w-24 px-3 py-1.5 text-sm text-right border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CbamQuantity;
