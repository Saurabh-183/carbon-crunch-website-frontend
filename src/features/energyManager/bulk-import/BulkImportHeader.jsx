import React from "react";
import { Import, Download } from "lucide-react";

const BulkImportHeader = ({ importServiceUrl }) => {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center border-green-700 border-2 justify-between gap-4 bg-white p-6 rounded-2xl   shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-green-200 to-green-700 p-3 rounded-xl">
            <Import className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Bulk Import</h1>
            <p className="text-md text-gray-500">Upload Excel files and import multiple draft entries at once.</p>
          </div>
        </div>

        <div className="flex  items-center gap-3">
          <a
            href={`${importServiceUrl}/import/template`}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-200"
          >
            <Download className="w-4 h-4" />
            Download template for bulk entry
          </a>
        </div>
      </div>
    </>
  );
};

export default BulkImportHeader;
