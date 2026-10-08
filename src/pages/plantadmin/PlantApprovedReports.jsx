import React, { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import SectionHeader from "../../components/rf/Header";
import Loader from "../../components/rf/Loader";
import { useApprovedData } from "../../features/plantAdmin/approvedData/hooks/useApprovedData";
import { useDocumentDownload } from "../../features/plantAdmin/approvedData/hooks/useDocumentDownload";
import { getUnitColorClass, getEmissionsColorClass } from "../../features/plantAdmin/approvedData/utils/colorUtils";
import EmptyDataState from "../../features/plantAdmin/approvedData/components/EmptyDataState";
import ApprovedDataTable from "../../features/plantAdmin/approvedData/components/ApprovedDataTable";
import DataDetailsModal from "../../features/plantAdmin/approvedData/components/DataDetailsModal";
import ModuleSidebar from "../../features/energyManager/data-entry/ModuleSidebar";
import { MODULES, getModuleByKey } from "../../features/energyManager/data-entry/moduleConfig";

const PlantApprovedReports = () => {
  const [activeModule, setActiveModule] = useState(MODULES[0].key);
  const [selectedRow, setSelectedRow] = useState(null);

  // Fetch approved data with processed scope rows and totals
  const { approvedData, loading, moduleRows } = useApprovedData();

  // Document download functionality
  const { downloadDocument } = useDocumentDownload();

  // Get rows for current scope filter
  const getFilteredRows = () => moduleRows[activeModule] || [];

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <SectionHeader icon={ClipboardCheck} title="Approved Data" description="View approved data by scope." />

      {approvedData.length === 0 ? (
        <EmptyDataState />
      ) : (
        <div className="flex rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white min-h-[600px]">
          <ModuleSidebar
            modules={MODULES}
            activeModule={activeModule}
            onModuleChange={setActiveModule}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-6 pt-5 pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {getModuleByKey(activeModule)?.label || "Approved Data"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Approved entries for the selected module.
              </p>
            </div>

            <div className="flex-1 p-4 overflow-auto">
              <ApprovedDataTable
                rows={getFilteredRows()}
                onRowSelect={setSelectedRow}
                getUnitColorClass={getUnitColorClass}
                getEmissionsColorClass={getEmissionsColorClass}
                activeScope={getModuleByKey(activeModule)?.label || "Module"}
              />
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <DataDetailsModal
        selectedRow={selectedRow}
        onClose={() => setSelectedRow(null)}
        onDownloadDocument={downloadDocument}
      />
    </div>
  );
};

export default PlantApprovedReports;
