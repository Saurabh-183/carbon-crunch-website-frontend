import React, { useState, useRef, useEffect } from "react";
import { Bold, Italic, Underline, Type, Palette, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Undo2, Redo2, Minus, Plus } from "lucide-react";

const FONT_FAMILIES = ["Segoe UI", "Arial", "Helvetica Neue", "Times New Roman", "Georgia", "Courier New", "Calibri", "Cambria"];

const FONT_SIZES = ["8", "9", "10", "11", "12", "14", "16", "18", "20", "24", "28", "32"];

const PRESET_COLORS = ["#000000", "#333333", "#666666", "#999999", "#0f5c8f", "#0f766e", "#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#2563eb", "#7c3aed"];

const ToolbarButton = ({ onClick, active, title, children, disabled }) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault(); // prevent stealing focus from contenteditable
      if (!disabled) onClick();
    }}
    title={title}
    disabled={disabled}
    className={`p-1.5 rounded transition-colors ${active ? "bg-blue-100 text-blue-700" : disabled ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
  >
    {children}
  </button>
);

const ToolbarSeparator = () => <div className="w-px h-6 bg-slate-200 mx-1" />;

const EditorToolbar = ({ editorRef, disabled = false }) => {
  const [activeFormats, setActiveFormats] = useState({});
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fontMenuRef = useRef(null);
  const sizeMenuRef = useRef(null);
  const colorRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target)) setShowFontMenu(false);
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(e.target)) setShowSizeMenu(false);
      if (colorRef.current && !colorRef.current.contains(e.target)) setShowColorPicker(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Poll for current formatting state
  useEffect(() => {
    const interval = setInterval(() => {
      if (!editorRef?.current) return;
      const doc = editorRef.current.ownerDocument || document;
      setActiveFormats({
        bold: doc.queryCommandState("bold"),
        italic: doc.queryCommandState("italic"),
        underline: doc.queryCommandState("underline"),
      });
    }, 300);
    return () => clearInterval(interval);
  }, [editorRef]);

  const exec = (command, value = null) => {
    if (disabled) return;
    const doc = editorRef?.current?.ownerDocument || document;
    doc.execCommand(command, false, value);
    editorRef?.current?.focus();
  };

  const applyFontFamily = (font) => {
    exec("fontName", font);
    setShowFontMenu(false);
  };

  const applyFontSize = (size) => {
    // execCommand fontSize only supports 1-7, use CSS span workaround
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      setShowSizeMenu(false);
      return;
    }

    const span = document.createElement("span");
    span.style.fontSize = `${size}px`;
    try {
      range.surroundContents(span);
    } catch {
      // If range spans multiple elements, use execCommand fallback
      exec("fontSize", "7");
      const doc = editorRef?.current?.ownerDocument || document;
      const fontElements = editorRef.current.querySelectorAll('font[size="7"]');
      fontElements.forEach((el) => {
        el.removeAttribute("size");
        el.style.fontSize = `${size}px`;
      });
    }
    setShowSizeMenu(false);
  };

  const applyColor = (color) => {
    exec("foreColor", color);
    setShowColorPicker(false);
  };

  return (
    <div className="flex items-center gap-0.5 flex-wrap px-3 py-2 bg-white border-b border-slate-200">
      {/* Undo / Redo */}
      <ToolbarButton onClick={() => exec("undo")} title="Undo" disabled={disabled}>
        <Undo2 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => exec("redo")} title="Redo" disabled={disabled}>
        <Redo2 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Font Family */}
      <div className="relative" ref={fontMenuRef}>
        <ToolbarButton
          onClick={() => {
            setShowFontMenu((v) => !v);
            setShowSizeMenu(false);
            setShowColorPicker(false);
          }}
          title="Font Family"
          disabled={disabled}
        >
          <Type className="w-4 h-4" />
        </ToolbarButton>
        {showFontMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 w-48 max-h-60 overflow-y-auto">
            {FONT_FAMILIES.map((font) => (
              <button
                key={font}
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFontFamily(font);
                }}
                className="block w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50 transition"
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Font Size */}
      <div className="relative" ref={sizeMenuRef}>
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => {
              setShowSizeMenu((v) => !v);
              setShowFontMenu(false);
              setShowColorPicker(false);
            }}
            title="Font Size"
            disabled={disabled}
          >
            <span className="text-xs font-medium w-4 text-center">A</span>
          </ToolbarButton>
        </div>
        {showSizeMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 w-24 max-h-60 overflow-y-auto">
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFontSize(size);
                }}
                className="block w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50 transition"
              >
                {size}px
              </button>
            ))}
          </div>
        )}
      </div>

      <ToolbarSeparator />

      {/* Bold / Italic / Underline */}
      <ToolbarButton onClick={() => exec("bold")} active={activeFormats.bold} title="Bold (Ctrl+B)" disabled={disabled}>
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => exec("italic")} active={activeFormats.italic} title="Italic (Ctrl+I)" disabled={disabled}>
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => exec("underline")} active={activeFormats.underline} title="Underline (Ctrl+U)" disabled={disabled}>
        <Underline className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Text Color */}
      <div className="relative" ref={colorRef}>
        <ToolbarButton
          onClick={() => {
            setShowColorPicker((v) => !v);
            setShowFontMenu(false);
            setShowSizeMenu(false);
          }}
          title="Text Color"
          disabled={disabled}
        >
          <Palette className="w-4 h-4" />
        </ToolbarButton>
        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-2 w-40">
            <div className="grid grid-cols-4 gap-1.5">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyColor(color);
                  }}
                  className="w-7 h-7 rounded border border-slate-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100">
              <label className="text-xs text-slate-500">Custom</label>
              <input type="color" className="w-full h-7 mt-1 cursor-pointer" onInput={(e) => applyColor(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      <ToolbarSeparator />

      {/* Alignment */}
      <ToolbarButton onClick={() => exec("justifyLeft")} title="Align Left" disabled={disabled}>
        <AlignLeft className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => exec("justifyCenter")} title="Align Center" disabled={disabled}>
        <AlignCenter className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => exec("justifyRight")} title="Align Right" disabled={disabled}>
        <AlignRight className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Lists */}
      <ToolbarButton onClick={() => exec("insertUnorderedList")} title="Bullet List" disabled={disabled}>
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => exec("insertOrderedList")} title="Numbered List" disabled={disabled}>
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
};

export default EditorToolbar;
