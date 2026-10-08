import React, { useState, useEffect, useCallback } from "react";
import { Network, Save, RotateCcw, Maximize2, Lock, Unlock, Layout, Loader2, Download, Trash2, ImageDown, Route } from "lucide-react";
import { toPng } from "html-to-image";
import { useAuth } from "../../context/AuthContext";
import api, { infraLayoutAPI } from "../../utils/api";
import Loader from "../../components/rf/Loader";
import SectionHeader from "../../components/rf/Header";
import { toast } from "sonner";
import { InfraCanvas, AssetPalette, PropertiesPanel, PresetSelector, useInfraCanvas, INDUSTRY_PRESETS, PRODUCTION_ROUTE_PRESETS } from "../../features/plantAdmin/infrastructure";

const normalizeLayout = (layout) => ({
  nodes: layout?.nodes || [],
  edges: layout?.edges || [],
});

const CBAM_ELIGIBLE_INDUSTRIES = ["iron and steel", "aluminium", "cement"];
const normalizeIndustryKey = (value = "") => String(value).trim().toLowerCase().replace(/&/g, "and").replace(/\s+/g, " ");
const isCbamEligibleIndustry = (industry = "") => CBAM_ELIGIBLE_INDUSTRIES.includes(normalizeIndustryKey(industry));

const PlantInfrastructure = () => {
  const { user } = useAuth();
  const organizationId = user?.organizationId?._id || user?.organizationId || null;
  const facilityId =
    user?.facilities?.[0]?.facilityId?._id ||
    user?.facilities?.[0]?.facilityId ||
    user?.facilityAssignments?.[0]?.facilityId?._id ||
    user?.facilityAssignments?.[0]?.facilityId ||
    user?.facilityId?._id ||
    user?.facilityId ||
    null;

  // ─── State ─────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("custom"); // 'custom' | 'production_route'
  const [customLayout, setCustomLayout] = useState(null);
  const [productionRouteLayout, setProductionRouteLayout] = useState(null);
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTemplateReplaceConfirm, setShowTemplateReplaceConfirm] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState(null);
  const [orgCbamEnabled, setOrgCbamEnabled] = useState(false);
  const [orgIndustry, setOrgIndustry] = useState("");
  const [customTemplates, setCustomTemplates] = useState({});
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateForm, setTemplateForm] = useState({ name: "", description: "" });

  const currentLayout = activeTab === "production_route" ? productionRouteLayout : customLayout;
  const currentLayoutId = currentLayout?._id;
  const isReadOnly = Boolean(currentLayout?.isLocked);

  // Merge system presets with custom templates
  const activePresets = activeTab === "production_route" ? PRODUCTION_ROUTE_PRESETS : { ...customTemplates, ...INDUSTRY_PRESETS };

  const canUseProductionRoute = orgCbamEnabled && isCbamEligibleIndustry(orgIndustry);

  const canvas = useInfraCanvas({ readOnly: isReadOnly });

  const hasUnsavedCanvasChanges = useCallback(() => {
    const currentCanvas = normalizeLayout(canvas.exportLayout());
    const persistedLayout = normalizeLayout(currentLayout);
    return JSON.stringify(currentCanvas) !== JSON.stringify(persistedLayout);
  }, [canvas, currentLayout]);

  // ─── Load layouts on mount ─────────────────────────────────────
  useEffect(() => {
    loadLayouts();
  }, [facilityId]);

  useEffect(() => {
    const fetchOrganizationEligibility = async () => {
      if (!organizationId) {
        setOrgCbamEnabled(false);
        setOrgIndustry("");
        return;
      }

      if (typeof user?.organizationId === "object") {
        const modules = user.organizationId?.complianceSettings?.enabledModules || [];
        setOrgCbamEnabled(modules.includes("CBAM"));
        setOrgIndustry(user.organizationId?.industry || "");
        return;
      }

      try {
        const res = await api.get(`/api/organizations/${organizationId}`);
        const org = res.data?.data || {};
        const modules = org?.complianceSettings?.enabledModules || [];
        setOrgCbamEnabled(modules.includes("CBAM"));
        setOrgIndustry(org?.industry || "");
      } catch (err) {
        setOrgCbamEnabled(false);
        setOrgIndustry("");
      }
    };

    fetchOrganizationEligibility();
  }, [organizationId, user?.organizationId]);

  const loadLayouts = async () => {
    if (!facilityId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await infraLayoutAPI.getAll({ facilityId });
      const layouts = res.data?.data?.layouts || [];
      const custom = layouts.find((l) => l.mode === "custom");
      const productionRoute = layouts.find((l) => l.mode === "production_route");
      const templates = layouts.filter((l) => l.mode === "template");

      setCustomLayout(custom || null);
      setProductionRouteLayout(productionRoute || null);

      // Map loaded templates into our dictionary format
      const templateDict = {};
      templates.forEach((t) => {
        templateDict[t._id] = {
          name: t.name,
          description: t.description || "Custom saved template",
          industryType: t.industryType || "Custom",
          nodes: t.nodes || [],
          edges: t.edges || [],
          isCustom: true, // flag to differentiate in the UI
        };
      });
      setCustomTemplates(templateDict);

      if (custom) {
        canvas.loadLayout(custom);
        setActiveTab("custom");
      } else if (productionRoute) {
        canvas.loadLayout(productionRoute);
        setActiveTab("production_route");
      } else {
        canvas.resetCanvas();
      }
    } catch (err) {
      console.error("Failed to load layouts", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Tab switching ─────────────────────────────────────────────
  const switchTab = useCallback(
    (tab) => {
      if (tab === "production_route" && !canUseProductionRoute) {
        toast.error("Production Route is available only for CBAM-enabled Iron and Steel, Aluminum, or Cement organizations");
        return;
      }
      setActiveTab(tab);
      if (tab === "custom" && customLayout) {
        canvas.loadLayout(customLayout);
      } else if (tab === "production_route" && productionRouteLayout) {
        canvas.loadLayout(productionRouteLayout);
      } else {
        canvas.resetCanvas();
      }
    },
    [customLayout, productionRouteLayout, canvas, canUseProductionRoute],
  );

  useEffect(() => {
    if (!canUseProductionRoute && activeTab === "production_route") {
      switchTab("custom");
    }
  }, [canUseProductionRoute, activeTab, switchTab]);

  const applyTemplateNow = useCallback(
    async (presetKey, presetData) => {
      try {
        setSaving(true);

        const mode = activeTab;
        const payload = {
          name: currentLayout?.name || (mode === "production_route" ? "Production Route" : "My Infrastructure"),
          description: currentLayout?.description || presetData.description,
          facilityId,
          mode,
          isLocked: Boolean(currentLayout?.isLocked),
          industryType: presetData.industryType,
          presetKey,
          nodes: presetData.nodes || [],
          edges: presetData.edges || [],
        };

        const existingId = currentLayout?._id;
        let layout;

        if (existingId) {
          const res = await infraLayoutAPI.update(existingId, payload);
          layout = res.data?.data;
        } else {
          const res = await infraLayoutAPI.create(payload);
          layout = res.data?.data;
        }

        if (mode === "production_route") {
          setProductionRouteLayout(layout);
        } else {
          setCustomLayout(layout);
        }

        canvas.loadLayout(layout);
        setTimeout(() => canvas.fitView(), 100);
        toast.success(`Template "${presetData.name}" applied`);
        return true;
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to apply template");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [facilityId, activeTab, canvas, currentLayout],
  );

  // ─── Apply template (replace canvas with confirmation) ─────────
  const handleApplyTemplate = useCallback(
    async (presetKey, presetData) => {
      if (!facilityId) {
        toast.error("No facility assigned");
        return false;
      }

      // If it's a custom template, we should *append*, not replace.
      // But let's clarify that append vs replace could be a user choice.
      // For now, if they select a custom template, append it. Otherwise replace.
      if (presetData.isCustom) {
        // Just append directly
        canvas.appendTemplate(presetData.nodes, presetData.edges);
        setShowPresetSelector(false);
        toast.success(`Appended template "${presetData.name}"`);
        return true;
      }

      if (hasUnsavedCanvasChanges()) {
        setPendingTemplate({ presetKey, presetData });
        setShowTemplateReplaceConfirm(true);
        return false;
      }

      return applyTemplateNow(presetKey, presetData);
    },
    [facilityId, hasUnsavedCanvasChanges, applyTemplateNow],
  );

  const confirmTemplateReplace = useCallback(async () => {
    if (!pendingTemplate) return;
    const success = await applyTemplateNow(pendingTemplate.presetKey, pendingTemplate.presetData);
    if (success) {
      setShowPresetSelector(false);
      setShowTemplateReplaceConfirm(false);
      setPendingTemplate(null);
    }
  }, [pendingTemplate, applyTemplateNow]);

  const cancelTemplateReplace = useCallback(() => {
    setShowTemplateReplaceConfirm(false);
    setPendingTemplate(null);
  }, []);

  // ─── Save current layout ───────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!facilityId) {
      toast.error("No facility assigned");
      return;
    }
    if (isReadOnly) return;

    setSaving(true);
    try {
      const { nodes, edges } = canvas.exportLayout();
      const payload = {
        name: currentLayout?.name || (activeTab === "production_route" ? "Production Route" : "My Infrastructure"),
        description: currentLayout?.description || "",
        facilityId,
        mode: activeTab,
        isLocked: Boolean(currentLayout?.isLocked),
        nodes,
        edges,
      };

      let layout;
      if (currentLayout?._id) {
        const res = await infraLayoutAPI.update(currentLayout._id, payload);
        layout = res.data?.data;
      } else {
        const res = await infraLayoutAPI.create(payload);
        layout = res.data?.data;
      }
      if (activeTab === "production_route") {
        setProductionRouteLayout(layout);
      } else {
        setCustomLayout(layout);
      }
      toast.success("Infrastructure layout saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }, [facilityId, isReadOnly, canvas, currentLayout, activeTab]);

  // ─── Save as Template ───────────────────────────────────────
  const handleSaveAsTemplate = useCallback(async () => {
    if (!facilityId) {
      toast.error("No facility assigned");
      return;
    }
    if (!templateForm.name.trim()) {
      toast.error("Template name is required");
      return;
    }

    setSaving(true);
    try {
      const { nodes, edges } = canvas.exportLayout();
      const payload = {
        name: templateForm.name.trim(),
        description: templateForm.description.trim(),
        facilityId,
        mode: "template",
        industryType: orgIndustry || "Custom",
        nodes,
        edges,
      };

      const res = await infraLayoutAPI.create(payload);
      const newTemplate = res.data?.data;

      setCustomTemplates((prev) => ({
        ...prev,
        [newTemplate._id]: {
          name: newTemplate.name,
          description: newTemplate.description,
          industryType: newTemplate.industryType,
          nodes: newTemplate.nodes,
          edges: newTemplate.edges,
          isCustom: true,
        },
      }));

      setShowSaveTemplateModal(false);
      setTemplateForm({ name: "", description: "" });
      toast.success("Saved as custom template");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  }, [facilityId, canvas, templateForm, orgIndustry]);

  // ─── Toggle lock for current tab ──────────────────────────────
  const handleToggleLock = useCallback(async () => {
    if (!facilityId) {
      toast.error("No facility assigned");
      return;
    }

    const targetLockedState = !Boolean(currentLayout?.isLocked);
    const layoutData = canvas.exportLayout();

    try {
      setSaving(true);
      const payload = {
        name: currentLayout?.name || (activeTab === "production_route" ? "Production Route" : "My Infrastructure"),
        description: currentLayout?.description || "",
        facilityId,
        mode: activeTab,
        isLocked: targetLockedState,
        nodes: layoutData.nodes,
        edges: layoutData.edges,
      };

      let layout;
      if (currentLayout?._id) {
        const res = await infraLayoutAPI.update(currentLayout._id, payload);
        layout = res.data?.data;
      } else {
        const res = await infraLayoutAPI.create(payload);
        layout = res.data?.data;
      }

      if (activeTab === "production_route") {
        setProductionRouteLayout(layout);
      } else {
        setCustomLayout(layout);
      }

      toast.success(targetLockedState ? "Layout locked" : "Layout unlocked for editing");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update lock state");
    } finally {
      setSaving(false);
    }
  }, [facilityId, currentLayout, canvas, activeTab]);

  // ─── Clear canvas ─────────────────────────────────────────────
  const handleClear = useCallback(() => {
    if (isReadOnly) return;
    canvas.resetCanvas();
    toast.info("Canvas cleared");
  }, [isReadOnly, canvas]);

  // ─── Delete layout ────────────────────────────────────────────
  const handleDeleteLayout = useCallback(async () => {
    if (!currentLayoutId) return;
    try {
      await infraLayoutAPI.delete(currentLayoutId);
      if (activeTab === "production_route") {
        setProductionRouteLayout(null);
      } else {
        setCustomLayout(null);
      }
      canvas.resetCanvas();
      setShowDeleteConfirm(false);
      toast.success("Layout deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  }, [currentLayoutId, activeTab, canvas]);

  // ─── Export as JSON ───────────────────────────────────────────
  const handleExport = useCallback(() => {
    const data = canvas.exportLayout();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `infrastructure-layout-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [canvas]);

  // ─── Save as Image (PNG) ──────────────────────────────────────
  const handleSaveAsImage = useCallback(async () => {
    const canvasEl = canvas.canvasRef?.current;
    if (!canvasEl) {
      toast.error("Canvas not found");
      return;
    }

    const originalBackgroundColor = canvasEl.style.backgroundColor;
    const originalBackgroundImage = canvasEl.style.backgroundImage;
    const gridElements = Array.from(canvasEl.querySelectorAll("[data-export-hide-grid]"));
    const originalGridDisplays = gridElements.map((el) => el.style.display);

    try {
      toast.info("Generating image…");

      // Force a clean export surface: high-contrast white background with no dotted grid.
      canvasEl.style.backgroundColor = "#ffffff";
      canvasEl.style.backgroundImage = "none";
      gridElements.forEach((el) => {
        el.style.display = "none";
      });

      const exportPixelRatio = Math.min(4, Math.max(2, (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1) * 2));
      const dataUrl = await toPng(canvasEl, {
        backgroundColor: "#ffffff",
        pixelRatio: exportPixelRatio,
        cacheBust: true,
        filter: (node) => {
          return !(node instanceof Element && node.hasAttribute("data-export-ignore"));
        },
      });
      const link = document.createElement("a");
      link.download = `infrastructure-diagram-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Image saved");
    } catch (err) {
      console.error("Image export failed", err);
      toast.error("Failed to export image");
    } finally {
      canvasEl.style.backgroundColor = originalBackgroundColor;
      canvasEl.style.backgroundImage = originalBackgroundImage;
      gridElements.forEach((el, index) => {
        el.style.display = originalGridDisplays[index] || "";
      });
    }
  }, [canvas]);

  if (loading) return <Loader />;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col animate-in fade-in duration-500">
      {/* ─── Header ─── */}
      <div className="shrink-0 px-4 sm:px-6 lg:px-3 pt-3">
        <SectionHeader icon={Network} title="Infrastructure Canvas" description="Visual layout of your facility's infrastructure and process flow" />
      </div>

      {/* ─── Toolbar ─── */}
      <div className="shrink-0 mx-4 sm:mx-6 lg:mx-3 mb-2 bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left: Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => switchTab("custom")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200
                ${activeTab === "custom" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Unlock className="w-3.5 h-3.5" />
              My Infrastructure
            </button>
            {canUseProductionRoute && (
              <button
                onClick={() => switchTab("production_route")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200
                  ${activeTab === "production_route" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <Route className="w-3.5 h-3.5" />
                Production Route
              </button>
            )}
          </div>

          {/* Center: Info */}
          <div className="hidden md:flex items-center gap-2">
            {isReadOnly && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-[11px] font-medium text-amber-700">
                <Lock className="w-3 h-3" /> Locked — read-only
              </span>
            )}
            {!isReadOnly && (
              <span className="text-[11px] font-medium text-slate-400">
                {canvas.nodes.length} nodes · {canvas.edges.length} connections
              </span>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowPresetSelector(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              title="Apply template"
            >
              <Layout className="w-3.5 h-3.5" /> Templates
            </button>

            <button onClick={() => canvas.fitView()} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors" title="Fit to view">
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleLock}
              disabled={saving}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${isReadOnly ? "text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100" : "text-slate-600 border-slate-200 hover:bg-slate-50"}`}
              title={isReadOnly ? "Unlock for editing" : "Lock this layout"}
            >
              {isReadOnly ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {isReadOnly ? "Unlock" : "Lock"}
            </button>

            {!isReadOnly && (
              <>
                <button onClick={handleClear} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors" title="Clear canvas">
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button onClick={handleExport} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors" title="Export JSON">
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSaveAsImage}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Save as Image"
                >
                  <ImageDown className="w-3.5 h-3.5" /> Image
                </button>

                {currentLayoutId && (
                  <button onClick={() => setShowDeleteConfirm(true)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete layout">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setShowSaveTemplateModal(true)}
                  disabled={saving || canvas.nodes.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                  title="Save current canvas as a reusable template"
                >
                  Save as Template
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Canvas Area ─── */}
      <div className="flex-1 flex mx-4 sm:mx-6 lg:mx-3 mb-3 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
        {/* Left: Asset Palette */}
        <AssetPalette readOnly={isReadOnly} />

        {/* Center: Canvas */}
        <InfraCanvas
          nodes={canvas.nodes}
          edges={canvas.edges}
          viewport={canvas.viewport}
          selectedId={canvas.selectedId}
          connecting={canvas.connecting}
          canvasRef={canvas.canvasRef}
          readOnly={isReadOnly}
          onCanvasMouseDown={canvas.onCanvasMouseDown}
          onMouseMove={canvas.onMouseMove}
          onMouseUp={canvas.onMouseUp}
          onWheel={canvas.onWheel}
          onNodeMouseDown={canvas.onNodeMouseDown}
          onPortMouseDown={canvas.onPortMouseDown}
          onPortMouseUp={canvas.onPortMouseUp}
          onEdgeControlMouseDown={canvas.onEdgeControlMouseDown}
          onResizeMouseDown={canvas.onResizeMouseDown}
          onDragOver={canvas.onDragOver}
          onDrop={canvas.onDrop}
          setSelectedId={canvas.setSelectedId}
          removeNode={canvas.removeNode}
          removeEdge={canvas.removeEdge}
          onUpdateNodeData={canvas.updateNodeData}
        />

        {/* Right: Properties Panel */}
        <PropertiesPanel
          selectedId={canvas.selectedId}
          nodes={canvas.nodes}
          edges={canvas.edges}
          readOnly={isReadOnly}
          onUpdateNode={canvas.updateNodeData}
          onUpdateEdge={canvas.updateEdge}
          onRemoveNode={canvas.removeNode}
          onRemoveEdge={canvas.removeEdge}
          onClose={() => canvas.setSelectedId(null)}
        />
      </div>

      {/* ─── Preset Selector Modal ─── */}
      <PresetSelector
        isOpen={showPresetSelector}
        onClose={() => setShowPresetSelector(false)}
        onApply={handleApplyTemplate}
        presets={activePresets}
        title={activeTab === "production_route" ? "Choose Production Route Template" : "Choose Infrastructure Template"}
        subtitle={
          activeTab === "production_route" ? "Apply a CBAM production route. Existing nodes are preserved and duplicates are skipped." : "Select an industry-specific layout to get started quickly"
        }
      />

      {/* ─── Delete Confirm Modal ─── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Layout?</h3>
            <p className="text-sm text-slate-500 mb-6">This will remove the saved layout. You can always create a new one.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteLayout} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showTemplateReplaceConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Replace Current Canvas?</h3>
            <p className="text-sm text-slate-500 mb-6">You have unsaved changes. Applying this template will clear the current canvas and unsaved work will be lost.</p>
            <div className="flex justify-end gap-3">
              <button onClick={cancelTemplateReplace} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={confirmTemplateReplace}
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Applying..." : "Replace & Apply"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Save Custom Template Modal ─── */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Save Custom Template</h3>
            <p className="text-sm text-slate-500 mb-4">Save your current canvas layout so you can reuse or append it later.</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="e.g., My Blast Furnace Setup"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none min-h-[80px]"
                  placeholder="Optional details about this template..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSaveTemplateModal(false);
                  setTemplateForm({ name: "", description: "" });
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsTemplate}
                disabled={saving || !templateForm.name.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantInfrastructure;
