import React from "react";
import { Save } from "lucide-react";
import { BOUNDARY_METHODS } from "../../../config/constants";

const BoundaryModal = ({
  showModal,
  moduleLabel,
  siteUnitLabel = "Facility",
  boundaryConfig,
  setBoundaryConfig,
  orgBoundaryMethods,
  orgReportingScopes,
  orgSystemBoundaries,
  projectInput,
  setProjectInput,
  productInput,
  setProductInput,
  saving,
  onSave,
  onClose,
}) => {
  if (!showModal) return null;

  const isAllowed = (method) => orgBoundaryMethods.includes(method);

  // Handler functions
  const handleMethodChange = (method) => {
    setBoundaryConfig((prev) => ({
      ...prev,
      boundaryMethod: method,
      equityShare: 0,
    }));
  };

  const handleScopeToggle = (scope, checked) => {
    setBoundaryConfig((prev) => ({
      ...prev,
      reportingScopes: checked ? [...prev.reportingScopes, scope] : prev.reportingScopes.filter((item) => item !== scope),
    }));
  };

  const handleBoundaryToggle = (boundary, checked) => {
    setBoundaryConfig((prev) => ({
      ...prev,
      systemBoundaries: checked ? [...prev.systemBoundaries, boundary] : prev.systemBoundaries.filter((item) => item !== boundary),
      systemBoundaryProjects: !checked && boundary === "Project level" ? [] : prev.systemBoundaryProjects,
      systemBoundaryProducts: !checked && boundary === "Product level" ? [] : prev.systemBoundaryProducts,
    }));
  };

  const handleAddProject = () => {
    const trimmed = projectInput.trim();
    if (!trimmed || boundaryConfig.systemBoundaryProjects.includes(trimmed)) return;
    setBoundaryConfig((prev) => ({
      ...prev,
      systemBoundaryProjects: [...prev.systemBoundaryProjects, trimmed],
    }));
    setProjectInput("");
  };

  const handleRemoveProject = (project) => {
    setBoundaryConfig((prev) => ({
      ...prev,
      systemBoundaryProjects: prev.systemBoundaryProjects.filter((item) => item !== project),
    }));
  };

  const handleAddProduct = () => {
    const trimmed = productInput.trim();
    if (!trimmed || boundaryConfig.systemBoundaryProducts.includes(trimmed)) return;
    setBoundaryConfig((prev) => ({
      ...prev,
      systemBoundaryProducts: [...prev.systemBoundaryProducts, trimmed],
    }));
    setProductInput("");
  };

  const handleRemoveProduct = (product) => {
    setBoundaryConfig((prev) => ({
      ...prev,
      systemBoundaryProducts: prev.systemBoundaryProducts.filter((item) => item !== product),
    }));
  };

  const hasProjectBoundary = boundaryConfig.systemBoundaries.includes("Project level");
  const hasProductBoundary = boundaryConfig.systemBoundaries.includes("Product level");

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col border border-gray-100">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{moduleLabel} Boundary Settings</h2>
            <p className="text-sm text-gray-500">Configure boundaries for the selected {siteUnitLabel.toLowerCase()}.</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 mx-3 overflow-y-auto pr-2 space-y-8">
          {/* 1. Boundary Method Selector */}
          {orgBoundaryMethods.length > 0 && (
            <div className="tour-boundary-methods">
              <p className="text-md font-medium text-gray-700 mb-2">
                Available Organizational Boundaries <span className="text-gray-400">(Select one)</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {BOUNDARY_METHODS.map(
                  (method) =>
                    isAllowed(method) && (
                      <label
                        key={method}
                        className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          boundaryConfig.boundaryMethod === method ? "border-green-500 bg-green-50/30 ring-4 ring-green-50" : "border-gray-100 bg-white hover:border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="boundaryMethod"
                          className="absolute top-4 right-4 accent-green-600"
                          checked={boundaryConfig.boundaryMethod === method}
                          onChange={() => handleMethodChange(method)}
                        />
                        <span className={`text-sm font-bold ${boundaryConfig.boundaryMethod === method ? "text-green-700" : "text-gray-600"}`}>{method}</span>
                      </label>
                    ),
                )}
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                {boundaryConfig.boundaryMethod === "Equity Share" ? (
                  <>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Equity Share Percentage</label>
                    <div className="relative max-w-[200px]">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={boundaryConfig.equityShare}
                        onChange={(e) =>
                          setBoundaryConfig((prev) => ({
                            ...prev,
                            equityShare: e.target.value,
                          }))
                        }
                        className="w-full pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 font-bold"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Switch to Equity Share to enable a custom percentage for this facility.</p>
                )}
              </div>
            </div>
          )}

          {/* 2. Reporting Period */}
          <div className="tour-boundary-reporting">
            <p className="text-md font-medium text-gray-700 mb-2">
              Reporting Period <span className="text-gray-400">({siteUnitLabel})</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">START DATE</label>
                <input
                  type="date"
                  value={boundaryConfig.reportingPeriod.startDate}
                  onChange={(e) =>
                    setBoundaryConfig((prev) => ({
                      ...prev,
                      reportingPeriod: {
                        ...prev.reportingPeriod,
                        startDate: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={boundaryConfig.reportingPeriod.endDate}
                  onChange={(e) =>
                    setBoundaryConfig((prev) => ({
                      ...prev,
                      reportingPeriod: {
                        ...prev.reportingPeriod,
                        endDate: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Reporting Scopes */}
          {orgReportingScopes.length > 0 && (
            <div>
              <p className="text-md font-medium text-gray-700 mb-3">Available Reporting Scopes</p>
              <div className="flex flex-wrap gap-4 tour-boundary-scopes">
                {orgReportingScopes.map((scope) => {
                  const isChecked = boundaryConfig.reportingScopes.includes(scope);
                  return (
                    <label
                      key={scope}
                      className={`relative flex items-center gap-3 px-5 py-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        isChecked ? "border-green-600 bg-green-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <input type="checkbox" className="sr-only" checked={isChecked} onChange={(e) => handleScopeToggle(scope, e.target.checked)} />
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isChecked ? "bg-green-600 border-green-600" : "border-gray-300"}`}>
                        {isChecked && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{scope}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. System Boundaries */}
          {orgSystemBoundaries.length > 0 && (
            <div className="mt-6 tour-boundary-system">
              <p className="text-md font-medium text-gray-700 mb-3">Available System Boundaries</p>

              {/* Boundary checkboxes */}
              <div className="flex flex-wrap gap-4">
                {orgSystemBoundaries.map((boundary) => {
                  const isChecked = boundaryConfig.systemBoundaries.includes(boundary);
                  return (
                    <label
                      key={boundary}
                      className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        isChecked ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input type="checkbox" className="sr-only" checked={isChecked} onChange={(e) => handleBoundaryToggle(boundary, e.target.checked)} />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                        {isChecked && <span className="w-2 h-2 bg-white rounded-sm" />}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{boundary}</span>
                    </label>
                  );
                })}
              </div>

              {/* Project-level input (conditional) */}
              <div className="mt-5 rounded-xl border border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Projects for this {siteUnitLabel.toLowerCase()}</label>
                  {!hasProjectBoundary && <span className="text-xs italic text-gray-400">Enable "Project level" to add projects.</span>}
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    type="text"
                    value={projectInput}
                    onChange={(e) => setProjectInput(e.target.value)}
                    placeholder="Add a project"
                    disabled={!hasProjectBoundary}
                    className="w-full md:flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700"
                  />
                  <button
                    type="button"
                    onClick={handleAddProject}
                    disabled={!hasProjectBoundary}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                {boundaryConfig.systemBoundaryProjects.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {boundaryConfig.systemBoundaryProjects.map((project) => (
                      <span key={project} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800">
                        {project}
                        <button type="button" onClick={() => handleRemoveProject(project)} className="hover:text-black">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Product-level input (conditional) */}
              <div className="mt-5 rounded-xl border border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Products for this {siteUnitLabel.toLowerCase()}</label>
                  {!hasProductBoundary && <span className="text-xs italic text-gray-400">Enable "Product level" to add products.</span>}
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    type="text"
                    value={productInput}
                    onChange={(e) => setProductInput(e.target.value)}
                    placeholder="Add a product"
                    disabled={!hasProductBoundary}
                    className="w-full md:flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700"
                  />
                  <button
                    type="button"
                    onClick={handleAddProduct}
                    disabled={!hasProductBoundary}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                {boundaryConfig.systemBoundaryProducts.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {boundaryConfig.systemBoundaryProducts.map((product) => (
                      <span key={product} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800">
                        {product}
                        <button type="button" onClick={() => handleRemoveProduct(product)} className="hover:text-black">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:text-white hover:bg-gray-600">
            Close
          </button>
          <button onClick={onSave} disabled={saving} className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 tour-boundary-save">
            {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save className="w-5 h-5" />}
            {saving ? "Saving..." : "Save Boundary Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoundaryModal;
