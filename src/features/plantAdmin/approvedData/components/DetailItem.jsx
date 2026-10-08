import React from "react";

/**
 * DetailItem component for displaying key-value pairs in the details modal
 * @param {Object} props - Component props
 * @param {string} props.label - Label text
 * @param {string} props.value - Value text
 * @param {React.Component} props.icon - Icon component
 * @param {boolean} [props.highlight=false] - Whether to highlight the value
 */
const DetailItem = ({ label, value, icon: Icon, highlight = false }) => {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-gray-500">
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
            </div>
            <p
                className={`text-sm font-medium ${highlight
                        ? "text-green-700 bg-green-50 inline-block px-2 py-0.5 rounded-md border border-green-100"
                        : "text-gray-900"
                    }`}
            >
                {value}
            </p>
        </div>
    );
};

export default DetailItem;
