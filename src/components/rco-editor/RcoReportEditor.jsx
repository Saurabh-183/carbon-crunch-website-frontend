import React, { useRef, useEffect, useState, useCallback } from "react";
import { ChevronLeft, Download, FileText, Unlock, Eye } from "lucide-react";
import EditorToolbar from "./EditorToolbar";
import "./rco-editor.css";

/**
 * RcoReportEditor
 *
 * Renders server-generated RCO report HTML inside a contenteditable container
 * with field-level editability rules:
 *   - data-field-type="restricted"      → locked, red indicator (company name, system fields)
 *   - data-field-type="locked-table"    → table is read-only
 *   - data-field-type="editable"        → narrative text, fully editable
 *   - data-field-type="editable-table"  → orange-marked tables, cells are editable
 */
const RcoReportEditor = ({ html, onBack, onExportPdf, onExportDocx, loading = false, title = "Report" }) => {
  const editorRef = useRef(null);
  const [editorReady, setEditorReady] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const prepareEditorHtml = useCallback((rawHtml) => {
    if (!rawHtml) return "";
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, "text/html");
      const styleTexts = [];
      doc.querySelectorAll("style").forEach((node) => {
        const text = node.textContent || "";
        if (text.trim()) styleTexts.push(text);
      });
      const mergedStyles = styleTexts.length
        ? `<style data-rco-template-style="true">\n${styleTexts.join("\n\n")}\n</style>`
        : "";
      return `${mergedStyles}${doc.body?.innerHTML || rawHtml}`;
    } catch {
      return rawHtml;
    }
  }, []);

  // ── Inject HTML and apply editability rules ──
  useEffect(() => {
    if (!editorRef.current || !html) return;
    editorRef.current.innerHTML = prepareEditorHtml(html);
    applyEditRules(editorRef.current, editMode);
    setEditorReady(true);
  }, [html, editMode, prepareEditorHtml]);

  // ── Toggle edit mode ──
  useEffect(() => {
    if (!editorRef.current || !editorReady) return;
    applyEditRules(editorRef.current, editMode);
  }, [editMode, editorReady]);

  // ── Get the current edited HTML for export ──
  const getEditedHtml = useCallback(() => {
    if (!editorRef.current) return html;
    // Clone to strip editor-specific attributes before export
    const clone = editorRef.current.cloneNode(true);
    stripEditorAttrs(clone);
    return clone.innerHTML;
  }, [html]);

  const handleExportPdf = useCallback(() => {
    onExportPdf?.(getEditedHtml());
  }, [onExportPdf, getEditedHtml]);

  const handleExportDocx = useCallback(() => {
    onExportDocx?.(getEditedHtml());
  }, [onExportDocx, getEditedHtml]);

  const handleLinkClick = useCallback(
    (e) => {
      if (editMode) return;
      const anchor = e.target?.closest?.("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      e.preventDefault();
      e.stopPropagation();
      window.open(anchor.href, "_blank", "noopener,noreferrer");
    },
    [editMode],
  );

  // ── Prevent edits in restricted/locked areas via keydown interception ──
  const handleKeyDown = useCallback(
    (e) => {
      if (!editMode) {
        e.preventDefault();
        return;
      }
      const sel = window.getSelection();
      if (!sel?.anchorNode) return;

      const container = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
      if (!container) return;

      // Climb up to check if we're inside a restricted or locked area
      const restricted = container.closest('[data-field-type="restricted"]');
      const locked = container.closest('[data-field-type="locked-table"]');
      if (restricted || locked) {
        // Allow navigation keys only
        const allowedKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown", "Tab", "Escape"];
        if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
        }
      }
    },
    [editMode],
  );

  // ── Prevent paste into restricted areas ──
  const handlePaste = useCallback(
    (e) => {
      if (!editMode) {
        e.preventDefault();
        return;
      }

      const sel = window.getSelection();
      if (!sel?.anchorNode) return;
      const container = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
      if (!container) return;

      const restricted = container.closest('[data-field-type="restricted"]');
      const locked = container.closest('[data-field-type="locked-table"]');
      if (restricted || locked) {
        e.preventDefault();
        return;
      }

      // In editable areas, paste as plain text to prevent HTML injection
      e.preventDefault();
      const text = e.clipboardData?.getData("text/plain") || "";
      document.execCommand("insertText", false, text);
    },
    [editMode],
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex-1" />

          <span className="hidden md:inline text-sm font-semibold text-slate-600">{title}</span>

          {/* Edit / Preview toggle */}
          <button
            onClick={() => setEditMode((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              editMode ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
            }`}
          >
            {editMode ? <Unlock className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {editMode ? "Editing" : "Preview"}
          </button>

          {/* Export buttons */}
          {onExportDocx && (
            <button onClick={handleExportDocx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition">
              <FileText className="w-4 h-4" /> DOCX
            </button>
          )}
          <button onClick={handleExportPdf} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-500 transition">
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>

        {/* Toolbar — only visible in edit mode */}
        {editMode && <EditorToolbar editorRef={editorRef} disabled={!editMode} />}

        {/* Legend bar */}
        {editMode && (
          <div className="flex items-center gap-4 px-4 py-1.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm border-2 border-red-400 bg-red-50" />
              Restricted (non-editable)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm border-2 border-slate-300 bg-slate-50" />
              Locked table
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm border-2 border-emerald-400 bg-emerald-50" />
              Editable text
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm border-2 border-amber-400 bg-amber-50" />
              Editable table
            </span>
          </div>
        )}
      </div>

      {/* ── Editor Canvas ── */}
      <div className="flex-1 flex justify-center py-6">
        <div
          className="rco-editor-canvas bg-white shadow-lg"
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: 0,
            position: "relative",
          }}
        >
          <div
            ref={editorRef}
            className="rco-editor-content"
            contentEditable={editMode}
            suppressContentEditableWarning
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onClickCapture={handleLinkClick}
            spellCheck={editMode}
            style={{
              outline: "none",
              minHeight: "297mm",
            }}
          />
        </div>
      </div>

      {/* Loading toast */}
      {loading && <div className="fixed bottom-4 right-4 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-50">Processing...</div>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// Helper: Apply contenteditable rules based on data-field-type
// ══════════════════════════════════════════════════════════════

function applyEditRules(root, editMode) {
  if (!root) return;

  // Ensure report links never hijack the current app tab.
  root.querySelectorAll("a[href]").forEach((anchor) => {
    if (!anchor.getAttribute("target")) {
      anchor.setAttribute("target", "_blank");
    }
    anchor.setAttribute("rel", "noopener noreferrer");
  });

  // Restricted fields — NEVER editable
  root.querySelectorAll('[data-field-type="restricted"]').forEach((el) => {
    el.contentEditable = "false";
    if (editMode) {
      el.style.outline = "2px dashed #f87171";
      el.style.outlineOffset = "2px";
      el.style.cursor = "not-allowed";
      el.style.position = "relative";
    } else {
      el.style.outline = "";
      el.style.outlineOffset = "";
      el.style.cursor = "";
    }
  });

  // Locked tables — NEVER editable
  root.querySelectorAll('[data-field-type="locked-table"]').forEach((table) => {
    table.contentEditable = "false";
    if (editMode) {
      table.style.outline = "2px dashed #94a3b8";
      table.style.outlineOffset = "2px";
      table.style.cursor = "not-allowed";
    } else {
      table.style.outline = "";
      table.style.outlineOffset = "";
      table.style.cursor = "";
    }
    // Lock every cell
    table.querySelectorAll("td, th").forEach((cell) => {
      cell.contentEditable = "false";
    });
  });

  // Editable text sections
  root.querySelectorAll('[data-field-type="editable"]').forEach((el) => {
    el.contentEditable = editMode ? "true" : "false";
    if (editMode) {
      el.style.outline = "2px solid #34d399";
      el.style.outlineOffset = "2px";
      el.style.cursor = "text";
      el.style.minHeight = "2em";
    } else {
      el.style.outline = "";
      el.style.outlineOffset = "";
      el.style.cursor = "";
      el.style.minHeight = "";
    }
  });

  // Editable tables — cells are editable
  root.querySelectorAll('[data-field-type="editable-table"]').forEach((table) => {
    if (editMode) {
      table.style.outline = "2px solid #fbbf24";
      table.style.outlineOffset = "2px";
    } else {
      table.style.outline = "";
      table.style.outlineOffset = "";
    }
    table.querySelectorAll("td").forEach((cell) => {
      cell.contentEditable = editMode ? "true" : "false";
      if (editMode) {
        cell.style.cursor = "text";
      } else {
        cell.style.cursor = "";
      }
    });
    // Headers remain locked
    table.querySelectorAll("th").forEach((cell) => {
      cell.contentEditable = "false";
    });
  });
}

// ══════════════════════════════════════════════════
// Helper: Strip editor attributes for clean export
// ══════════════════════════════════════════════════

function stripEditorAttrs(root) {
  root.querySelectorAll("[contenteditable]").forEach((el) => {
    el.removeAttribute("contenteditable");
  });
  root.querySelectorAll("[data-field-type]").forEach((el) => {
    // Keep data-field-type for potential re-import, just remove visual styles
    el.style.outline = "";
    el.style.outlineOffset = "";
    el.style.cursor = "";
    el.style.minHeight = "";
  });
}

export default RcoReportEditor;
