import React from "react";

const DataEntryHeader = ({ selectedPeriod }) => (
  <div className="flex items-center justify-between">
    <div>
      {/* <nav className="text-sm text-gray-500 mb-2">
        Activity Data &gt;{" "}
        {selectedPeriod
          ? new Date(selectedPeriod + "-01").toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          : "Current Period"}
      </nav> */}
      <h1 className="text-3xl font-bold text-gray-900">Fuel & Energy Consumption</h1>
    </div>
  </div>
);

export default DataEntryHeader;
