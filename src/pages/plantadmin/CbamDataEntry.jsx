import React, { useState } from "react";
import { Database, Package, GitMerge, Mail } from "lucide-react";
import ModuleSidebar from "../../features/energyManager/data-entry/ModuleSidebar";
import CbamProducts from "./CbamProducts";
import CbamProductionProcesses from "./CbamProductionProcesses";
import CbamSupplyChain from "./CbamSupplyChain";
import CbamProductionRecords from "./CbamProductionRecords";
import CbamQuantity from "./CbamQuantity";

const MODULES = [
    { key: "records", label: "CBAM Records", icon: "ClipboardList", description: "Monitor facility CBAM emissions imported from approved energy submissions." },
    { key: "quantity", label: "Product Quantities", icon: "Database", description: "Track production volumes, exports, sold, and internal usage." },
    { key: "products", label: "Product Definitions", icon: "Package", description: "Define products mapped to EU CBAM CN codes." },
    { key: "processes", label: "Production Processes", icon: "GitMerge", description: "Map out valid CBAM production routes for the goods defined." },
    { key: "supply", label: "Supply Chain Tracker", icon: "Mail", description: "Monitor upstream precursor supply emissions and request data from your suppliers." },
];

const CbamDataEntry = () => {
    const [activeModule, setActiveModule] = useState(MODULES[0].key);
    const activeModuleConfig = MODULES.find((m) => m.key === activeModule) || MODULES[0];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100/50 rounded-xl">
                        <Database className="w-6 h-6 text-emerald-600" />
                    </div>
                    CBAM
                </h1>
                <p className="text-slate-500 mt-2 text-sm ml-11">
                    Manage all your Plant's CBAM definitions, internal process configurations, and supply chains in one place.
                </p>
            </div>

            {/* Main layout: Sidebar + Content */}
            <div className="flex rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white min-h-[600px]">
                {/* Module Sidebar */}
                <ModuleSidebar modules={MODULES} activeModule={activeModule} onModuleChange={setActiveModule} />

                {/* Content area */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
                    {/* Module header + description */}
                    <div className="px-6 pt-5 pb-3 border-b border-slate-100 bg-white">
                        <h2 className="text-lg font-bold text-slate-800">{activeModuleConfig.label}</h2>
                        <p className="text-xs text-slate-400 mt-0.5">{activeModuleConfig.description}</p>
                    </div>

                    {/* Module Render */}
                    <div className="flex-1 overflow-x-hidden p-6">
                        {activeModule === "records" && <CbamProductionRecords />}
                        {activeModule === "quantity" && <CbamQuantity />}
                        {activeModule === "products" && <CbamProducts />}
                        {activeModule === "processes" && <CbamProductionProcesses />}
                        {activeModule === "supply" && <CbamSupplyChain />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CbamDataEntry;
