import React from "react";

/**
 * ScopeFilterTabs component for filtering data by scope
 * @param {Object} props - Component props
 * @param {string} props.activeScope - Currently active scope filter
 * @param {Function} props.onScopeChange - Handler for scope change
 * @param {Object} props.scopeRows - Scope rows data
 */
const ScopeFilterTabs = ({ activeScope, onScopeChange, scopeRows }) => {
    const scopes = ["All", "Scope 1", "Scope 2", "Scope 3"];

    const getCount = (scope) => {
        if (scope === "All") {
            return (
                (scopeRows["Scope 1"]?.length || 0) +
                (scopeRows["Scope 2"]?.length || 0) +
                (scopeRows["Scope 3"]?.length || 0)
            );
        }
        return scopeRows[scope]?.length || 0;
    };

    return (
        <div className="flex flex-wrap gap-2">
            {scopes.map((scope) => (
                <button
                    key={scope}
                    onClick={() => onScopeChange(scope)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeScope === scope
                            ? "bg-green-600 text-white shadow-lg shadow-green-200"
                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                >
                    {scope} ({getCount(scope)})
                </button>
            ))}
        </div>
    );
};

export default ScopeFilterTabs;
