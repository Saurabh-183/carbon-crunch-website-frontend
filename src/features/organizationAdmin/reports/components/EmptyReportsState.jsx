import React from "react";
import { FileText } from "lucide-react";

/**
 * EmptyReportsState component displays when no reports are available
 */
const EmptyReportsState = () => {
    return (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No reports generated yet</p>
            <p className="text-gray-400 mt-2">
                Generate consolidated reports to see them here.
            </p>
        </div>
    );
};

export default EmptyReportsState;
