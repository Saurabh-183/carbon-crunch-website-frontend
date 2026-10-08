import React from "react";

/**
 * @param {Object} props
 * @param {Function} props.icon - The icon component to render
 * @param {string} props.title - The main heading text
 * @param {string} [props.description] - Optional subtext/description
 * @param {React.ReactNode} [props.action] - Optional button or action link
 */
const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center shadow-sm transition-all ${className}`}>
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 mb-6">
        <Icon className="w-10 h-10 text-gray-400 stroke-[1.5]" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 leading-tight">
        {title}
      </h3>
      
      {description && (
        <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-8">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;