import React from "react";
import { Plus, Upload, FileText, CheckCircle, Clock, AlertCircle, Edit2, Trash2, Download, ChevronDown, ChevronRight, CornerDownRight } from "lucide-react";
import { calculateEmissions } from "./utils";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Select, MenuItem, FormControl } from '@mui/material';
import dayjs from 'dayjs';

const getStatusBadge = (status) => {
  const configs = {
    approved: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", icon: <CheckCircle size={12} /> },
    submitted: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", icon: <CheckCircle size={12} /> },
    rejected: { bg: "bg-red-50", text: "text-red-700", border: "border-red-100", icon: <AlertCircle size={12} /> },
    draft: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", icon: <Clock size={12} /> },
  };
  const config = configs[status] || configs.draft;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-tight ${config.bg} ${config.text} ${config.border}`}>
      {config.icon} {status}
    </span>
  );
};

const renderInputField = (col, value, onChange, disabled = false, dynamicOptions = null) => {
  const baseClass = "w-full px-2 py-1.5 border border-emerald-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all";
  const disabledClass = "disabled:bg-slate-100 disabled:text-slate-400";

  if (col.type === "date") {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={value ? dayjs(value) : null}
          onChange={(newValue) => {
            onChange(col.key, newValue ? newValue.format('YYYY-MM-DD') : '');
          }}
          disabled={disabled}
          slotProps={{
            textField: {
              size: 'small',
              placeholder: 'YYYY-MM-DD',
              sx: {
                width: '12rem',
                '& .MuiInputBase-root': {
                  fontSize: '0.75rem',
                  borderRadius: '0.5rem',
                  backgroundColor: disabled ? '#f1f5f9' : 'white',
                  paddingRight: '4px',
                },
                '& .MuiInputBase-input': {
                  padding: '6px 8px',
                  fontWeight: 500,
                  color: disabled ? '#94a3b8' : 'inherit',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#a7f3d0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#34d399',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#10b981',
                  borderWidth: '2px',
                }
              }
            }
          }}
        />
      </LocalizationProvider>
    );
  }

  const resolvedOptions = dynamicOptions || col.options;

  if (col.type === "select" && resolvedOptions) {
    return (
      <FormControl fullWidth size="small" disabled={disabled}>
        <Select
          displayEmpty
          value={value || ""}
          onChange={(e) => onChange(col.key, e.target.value)}
          sx={{
            width: '100%',
            fontSize: '0.75rem',
            borderRadius: '0.5rem',
            backgroundColor: disabled ? '#f1f5f9' : 'white',
            '& .MuiSelect-select': {
              padding: '6px 8px',
              fontWeight: 500,
              color: disabled ? '#94a3b8' : 'inherit',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#a7f3d0',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#34d399',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#10b981',
              borderWidth: '2px',
            }
          }}
        >
          <MenuItem value="">
            <span style={{ color: '#94a3b8' }}>Select</span>
          </MenuItem>
          {resolvedOptions.map((opt) => {
            const optValue = typeof opt === "string" ? opt : opt.value;
            const optLabel = typeof opt === "string" ? opt : opt.label;
            return (
              <MenuItem key={optValue} value={optValue} sx={{ fontSize: '0.75rem' }}>
                {optLabel}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    );
  }

  if (col.type === "number") {
    return (
      <input
        type="number"
        step="0.01"
        min="0"
        value={value || ""}
        onChange={(e) => {
          let val = e.target.value;
          if (val !== "" && Number(val) < 0) {
            val = "0";
          }
          onChange(col.key, val);
        }}
        placeholder={col.placeholder || "0.00"}
        disabled={disabled}
        className={`${baseClass} ${disabledClass}`}
      />
    );
  }

  // Default: text input
  return (
    <input type="text" value={value || ""} onChange={(e) => onChange(col.key, e.target.value)} placeholder={col.placeholder || ""} disabled={disabled} className={`${baseClass} ${disabledClass}`} />
  );
};

const ModuleEntryTable = ({
  moduleConfig,
  newEntry,
  onFieldChange,
  onFileChange,
  onAddEntry,
  fileInputKey,
  entries,
  groupedRows,
  saving,
  selectedEntryIds,
  toggleEntrySelection,
  onEditEntry,
  onDeleteEntry,
  onSubmitEntry,
  onDownloadDocument,
  isRejectedView,
  editingRowId,
  onEditRowFieldChange,
  onSaveEditRow,
  onCancelEditRow,
  expandedBulkKeys,
  toggleBulkKey,
  onSubmitBulkGroup,
  columnOptions,
  getColumnOptions,
  isCbamEnabled = false,
}) => {
  const columns = (moduleConfig.columns || []).filter((col) => !col.cbamOnly || isCbamEnabled);
  const resolvedColumnOptions = columnOptions || {};
  const rows = groupedRows || entries.map((entry) => ({ type: "entry", entry }));
  const resolveColumnOptions = (colKey, entryOrNull) => {
    if (typeof getColumnOptions === "function") {
      const dynamic = getColumnOptions(colKey, entryOrNull);
      if (Array.isArray(dynamic)) return dynamic;
    }
    return resolvedColumnOptions[colKey];
  };

  const getBulkCellValue = (col, row) => {
    if (col.key === "date") return row.dateLabel || "-";
    if (col.key === "activityType") return `Bulk Upload (${row.entries.length} rows)`;
    if (col.key === "consumption") return row.totalConsumptionLabel || "0";
    if (col.key === "unit") return row.unitLabel || "Mixed";
    return "";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <table className="w-full border-separate border-spacing-0 text-sm" style={{ minWidth: `${columns.length * 140 + 400}px` }}>
          <thead className="sticky top-0 z-30 bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 py-4 w-10 border-b border-slate-200" />
              {columns.map((col) => (
                <th key={col.key} style={{ minWidth: col.width || "130px" }} className="px-3 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">
                  {col.label}
                  {col.required && <span className="text-red-400 ml-0.5">*</span>}
                </th>
              ))}
              <th className="px-3 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200" style={{ minWidth: "120px" }}>
                Emissions (tCO₂e)
              </th>
              <th className="px-3 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200" style={{ minWidth: "100px" }}>
                Status
              </th>
              {isRejectedView && (
                <th className="px-3 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200" style={{ minWidth: "200px" }}>
                  Rejection Reason
                </th>
              )}
              <th className="px-3 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200" style={{ minWidth: "80px" }}>
                Doc
              </th>
              <th className="px-3 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200" style={{ minWidth: "140px" }}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {/* NEW ENTRY INPUT ROW */}
            <tr className="bg-emerald-50/40 sticky top-[52px] z-20 backdrop-blur-sm border-b-2 border-emerald-100">
              <td className="px-3 py-3" />
              {columns.map((col) => (
                <td key={col.key} className="px-2 py-3">
                  {renderInputField(col, newEntry[col.key], onFieldChange, false, resolveColumnOptions(col.key, newEntry))}
                </td>
              ))}
              <td className="px-3 py-3 text-xs font-bold text-emerald-700">
                {calculateEmissions(newEntry.consumption ?? newEntry.value, newEntry.unit, newEntry.source, moduleConfig.scope ?? newEntry.scope, newEntry.activityType, newEntry.scope3Module, newEntry.emissionFactor, newEntry.carbonContent) || "—"}
              </td>
              <td className="px-3 py-3">{getStatusBadge("draft")}</td>
              {isRejectedView && <td className="px-3 py-3">—</td>}
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <label className="p-2 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 cursor-pointer transition-colors shadow-sm group">
                    <input key={fileInputKey} type="file" onChange={onFileChange} className="hidden" />
                    <Upload size={14} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                  </label>
                  {newEntry.supportingDocument && <FileText size={16} className="text-emerald-600 animate-bounce" />}
                </div>
              </td>
              <td className="px-3 py-3">
                <button
                  onClick={onAddEntry}
                  disabled={saving || !newEntry.supportingDocument}
                  className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-30 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {saving ? (
                    "..."
                  ) : (
                    <>
                      <Plus size={14} /> Add
                    </>
                  )}
                </button>
              </td>
            </tr>

            {/* DATA ROWS */}
            {rows.map((row) => {
              if (row.type === "bulk") {
                const isExpanded = expandedBulkKeys?.has(row.bulkKey);
                return (
                  <React.Fragment key={`bulk-${row.bulkKey}`}>
                    <tr className="bg-slate-50/80 border-l-4 border-l-blue-400 group transition-colors">
                      <td className="px-3 py-3 text-center cursor-pointer" onClick={() => toggleBulkKey?.(row.bulkKey)}>
                        {isExpanded ? <ChevronDown size={16} className="text-blue-600" /> : <ChevronRight size={16} className="text-slate-400" />}
                      </td>
                      {columns.map((col) => (
                        <td key={col.key} className="px-2 py-3 text-xs font-medium text-slate-600">
                          {getBulkCellValue(col, row)}
                        </td>
                      ))}
                      <td className="px-3 py-3 font-bold text-slate-700 text-xs">—</td>
                      <td className="px-3 py-3">{getStatusBadge(row.status)}</td>
                      {isRejectedView && <td className="px-3 py-3"></td>}
                      <td className="px-3 py-3"></td>
                      <td className="px-3 py-3 text-right">
                        {row.hasSubmittable && (
                          <button onClick={() => onSubmitBulkGroup?.(row)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-blue-700">
                            Submit
                          </button>
                        )}
                      </td>
                    </tr>

                    {isExpanded &&
                      row.entries.map((entry) => {
                        const isEditing = editingRowId === entry.id;
                        return (
                          <tr key={entry.id} className="hover:bg-blue-50/20 transition-colors">
                            <td className="px-3 py-3 flex justify-end pt-4">
                              <CornerDownRight size={14} className="text-slate-300" />
                            </td>
                            {columns.map((col) => (
                              <td key={col.key} className="px-2 py-3">
                                {isEditing ? (
                                  renderInputField(col, entry[col.key], (key, val) => onEditRowFieldChange(entry.id, key, val), false, resolveColumnOptions(col.key, entry))
                                ) : (
                                  <span className="text-xs text-slate-700 font-medium truncate block">
                                    {col.type === "date" && entry[col.key] ? new Date(entry[col.key]).toLocaleDateString() : entry[col.key] || "—"}
                                  </span>
                                )}
                              </td>
                            ))}
                            <td className="px-3 py-3 text-xs font-bold text-slate-700">
                              {calculateEmissions(entry.consumption ?? entry.value, entry.unit, entry.source, moduleConfig.scope ?? entry.scope, entry.activityType, entry.scope3Module, entry.emissionFactor, entry.carbonContent) || "—"}
                            </td>
                            <td className="px-3 py-3">{getStatusBadge(entry.status)}</td>
                            {isRejectedView && (
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                                  <AlertCircle size={12} /> {entry.rejectionReason || "—"}
                                </div>
                              </td>
                            )}
                            <td className="px-3 py-3 text-center">
                              {entry.supportingDocument?.url ? (
                                <button onClick={() => onDownloadDocument(entry)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                                  <Download size={14} />
                                </button>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center justify-end gap-1.5">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => onSaveEditRow(entry.id)}
                                      className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-700 transition-all"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => onCancelEditRow(entry.id)}
                                      className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase hover:bg-slate-50 transition-all"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => onEditEntry(entry)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                      <Edit2 size={13} />
                                    </button>
                                    <button onClick={() => onDeleteEntry(entry)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                      <Trash2 size={13} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              }

              const entry = row.entry;
              const isEditing = editingRowId === entry.id;
              return (
                <tr key={entry.id} className={`group transition-colors ${isEditing ? "bg-blue-50/50 ring-1 ring-blue-200" : "hover:bg-slate-50/50"}`}>
                  <td className="px-3 py-3 text-center">
                    <input type="checkbox" className="accent-emerald-600 rounded" checked={selectedEntryIds.has(entry.id)} onChange={() => toggleEntrySelection(entry.id)} disabled={!entry.id} />
                  </td>

                  {columns.map((col) => (
                    <td key={col.key} className="px-2 py-3">
                      {isEditing ? (
                        renderInputField(col, entry[col.key], (key, val) => onEditRowFieldChange(entry.id, key, val), false, resolveColumnOptions(col.key, entry))
                      ) : (
                        <span className="text-xs text-slate-700 font-medium truncate block">
                          {col.type === "date" && entry[col.key] ? new Date(entry[col.key]).toLocaleDateString() : entry[col.key] || "—"}
                        </span>
                      )}
                    </td>
                  ))}

                  <td className="px-3 py-3 text-xs font-bold text-slate-700">
                    {calculateEmissions(entry.consumption ?? entry.value, entry.unit, entry.source, moduleConfig.scope ?? entry.scope, entry.activityType, entry.scope3Module, entry.emissionFactor, entry.carbonContent) || "—"}
                  </td>

                  <td className="px-3 py-3">{getStatusBadge(entry.status)}</td>

                  {isRejectedView && (
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                        <AlertCircle size={12} /> {entry.rejectionReason || "—"}
                      </div>
                    </td>
                  )}

                  <td className="px-3 py-3 text-center">
                    {entry.supportingDocument?.url ? (
                      <button onClick={() => onDownloadDocument(entry)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Download size={14} />
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => onSaveEditRow(entry.id)}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-700 transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => onCancelEditRow(entry.id)}
                            className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase hover:bg-slate-50 transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {(entry.status === "draft" || entry.status === "rejected") && (
                            <button
                              onClick={() => onSubmitEntry(entry)}
                              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-700 shadow-sm transition-all"
                            >
                              Submit
                            </button>
                          )}
                          <button onClick={() => onEditEntry(entry)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => onDeleteEntry(entry)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Empty state */}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 5 + (isRejectedView ? 1 : 0)} className="px-6 py-16 text-center">
                  <div className="text-slate-400">
                    <FileText size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-semibold">No entries yet</p>
                    <p className="text-xs mt-1">Add your first {moduleConfig.label} data entry using the form above.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModuleEntryTable;
