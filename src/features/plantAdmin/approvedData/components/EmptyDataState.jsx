import React from "react";
import { FileText } from "lucide-react";

/**
 * EmptyDataState component displayed when no approved data is available
 */
const EmptyDataState = () => {
    return (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No approved data yet</p>
            <p className="text-gray-400 mt-2">
                Approved submissions will appear here.
            </p>
        </div>
    );
};

export default EmptyDataState;
