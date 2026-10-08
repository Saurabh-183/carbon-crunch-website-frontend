import React from "react";
import { useAuth } from "../../context/AuthContext";
import { toUiTerminology } from "../../utils/uiTerminology";

const SectionHeader = ({ icon: Icon, title, description, iconBg = "bg-green-50", iconColor = "text-white", rightContent = null }) => {
  const { user } = useAuth();
  const industry = user?.organizationId?.industry || user?.organizationIndustry || "";
  const role = user?.role || "";

  return (
    <div className="flex mb-4 flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border-2 border-green-700 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`${iconBg} bg-gradient-to-br from-green-200 to-green-700 p-3 rounded-xl`}>{Icon && <Icon className={`w-6 h-6 ${iconColor}`} />}</div>

        <div>
          <h1 className="text-xl font-semibold text-gray-900">{toUiTerminology(title, industry, role)}</h1>
          <p className="text-md text-gray-500">{toUiTerminology(description, industry, role)}</p>
        </div>
      </div>
      {rightContent ? <div className="w-full md:w-auto">{rightContent}</div> : null}
    </div>
  );
};

export default SectionHeader;
