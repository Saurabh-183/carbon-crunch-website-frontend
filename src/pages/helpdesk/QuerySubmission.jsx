import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import {
  MessageSquare,
  AlertCircle,
  FileText,
  UploadCloud,
  X,
  CheckCircle,
  Clock,
  Info,
  ChevronRight,
  LifeBuoy
} from "lucide-react";
import { Select, MenuItem, FormControl } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";
import { getSiteUnitLabel } from "../../utils/uiTerminology";

const CATEGORIES = [
  "Scope 1",
  "Scope 2",
  "Scope 3",
  "Emission Factors",
  "Activity Data",
  "Reporting Methodology",
  "Data Uploads",
  "Verification Issues",
  "Compliance Requirements",
  "Platform Usage",
  "Other"
];

const MODULES = [
  { value: "gas_fuel_gases", label: "Stationary Combustion / Fuel / Gases" },
  { value: "electricity_grid", label: "Grid Electricity" },
  { value: "renewable_energy", label: "Renewable Energy" },
  { value: "transport", label: "Transportation" },
  { value: "waste", label: "Waste Generation" },
  { value: "water", label: "Water Consumption" }
];

const GUIDANCE_CARDS = {
  "Scope 1": {
    title: "Scope 1 Direct Emissions",
    desc: "Scope 1 covers direct emissions from owned or controlled sources. Common issues involve correct fuel GCV (Gross Calorific Value) and refrigerant leakage rates. Check the 'Refrigerant Finder' if you are unsure of gas types."
  },
  "Scope 2": {
    title: "Scope 2 Indirect Emissions",
    desc: "Scope 2 covers indirect emissions from purchased electricity, steam, heating, and cooling. Ensure you are using the correct grid emission factor for your region and reporting year."
  },
  "Scope 3": {
    title: "Scope 3 Value Chain Emissions",
    desc: "Scope 3 includes all other indirect emissions. Complexities often arise in boundary settings and supplier data collection. Specify the exact Category (e.g., Category 6: Business Travel) in your query."
  },
  "Emission Factors": {
    title: "Emission Factor Selection",
    desc: "Emission factors define the CO2 equivalent per unit of activity. If you cannot find a localized factor, ask the support team to recommend an EPA, Defra, or IPCC alternative."
  },
  "Reporting Methodology": {
    title: "Methodology Alignment",
    desc: "Our platform aligns with the GHG Protocol Corporate Standard. If your local compliance (e.g., BRSR, SECR) requires a different consolidation approach, let us know."
  }
};

const QuerySubmission = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    priority: "Medium",
    category: "",
    subCategory: "",
    reportingYear: dayjs(),
    officeBranch: user?.facilityId?._id || "",
    calculationModule: "",
    description: ""
  });

  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Facility list could be fetched if user is ORG_ADMIN, but for simplicity we allow text or rely on their bounded ID
  const siteUnitLabel = getSiteUnitLabel(user?.organizationId?.industry);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (newDate) => {
    setFormData((prev) => ({ ...prev, reportingYear: newDate }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // limit to 5
    if (attachments.length + files.length > 5) {
      setMessage({ type: "error", text: "Maximum 5 attachments allowed." });
      return;
    }
    setAttachments((prev) => [...prev, ...files]);
    e.target.value = null; // reset
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (isDraft = false) => {
    if (!isDraft && (!formData.title || !formData.category || !formData.description)) {
      setMessage({ type: "error", text: "Please fill in all required fields (Title, Category, Description) to submit." });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "reportingYear") {
          if (formData[key]) payload.append(key, formData[key].format ? formData[key].format("YYYY-MM-DD") : formData[key]);
        } else if (formData[key]) {
          payload.append(key, formData[key]);
        }
      });
      payload.append("isDraft", isDraft);

      attachments.forEach((file) => {
        payload.append("attachments", file);
      });

      await api.post(`/api/queries`, payload, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setMessage({ type: "success", text: isDraft ? "Query saved as draft." : "Support request submitted successfully." });
      if (!isDraft) {
        setTimeout(() => navigate(-1), 2000); // go back
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to submit query." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl flex items-center justify-center">
            <LifeBuoy className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Helpdesk & Support</h1>
            <p className="text-sm text-slate-500 mt-1">Submit a query to our sustainability experts regarding calculations, methodology, or platform issues.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800">New Query Submission</h2>
            </div>
            {message && (
              <div className={`px-3 py-1 text-xs font-semibold rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {message.text}
              </div>
            )}
          </div>

          <div className="p-6 space-y-6 flex-1 overflow-auto">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Query Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="E.g., Missing emission factor for R22"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Priority</label>
                <FormControl fullWidth size="small">
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    displayEmpty
                    className="bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      borderRadius: '0.75rem',
                      '& .MuiSelect-select': { py: 1 }
                    }}
                  >
                    <MenuItem value="Low">Low (Response in 48h)</MenuItem>
                    <MenuItem value="Medium">Medium (Response in 24h)</MenuItem>
                    <MenuItem value="High">High (Response in 12h)</MenuItem>
                    <MenuItem value="Critical">Critical (Immediate Support)</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Category *</label>
                <FormControl fullWidth size="small">
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    displayEmpty
                    className="bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      borderRadius: '0.75rem',
                      '& .MuiSelect-select': { py: 1 }
                    }}
                  >
                    <MenuItem value="" disabled>Select a category...</MenuItem>
                    {CATEGORIES.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                  </Select>
                </FormControl>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Sub-Category (Optional)</label>
                <input
                  type="text"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  placeholder="E.g., Process Emissions"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Reporting Date</label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={formData.reportingYear}
                    onChange={handleDateChange}
                    format="YYYY-MM-DD"
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        className: "bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all",
                        sx: {
                          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                          borderRadius: '0.75rem',
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
              </div>
              {/*
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Affected Module</label>
                <FormControl fullWidth size="small">
                  <Select
                    name="calculationModule"
                    value={formData.calculationModule}
                    onChange={handleInputChange}
                    displayEmpty
                    className="bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      borderRadius: '0.75rem',
                      '& .MuiSelect-select': { py: 1 }
                    }}
                  >
                    <MenuItem value="">General Platform</MenuItem>
                    {MODULES.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </div>
              */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">{siteUnitLabel}</label>
                <input
                  type="text"
                  value={user?.facilityId?.name || "Global / Organization Level"}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Detailed Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                placeholder="Provide as much detail as possible to help our experts assist you quickly..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
              />
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Attachments (Optional)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Click to upload files</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, PDF, XLSX up to 10MB</p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>
              
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-sm">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate max-w-[200px] text-slate-700 font-medium">{file.name}</span>
                        <span className="text-xs text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeAttachment(i)}
                        className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
             <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </div>

        {/* Guidance Cards Sidebar */}
        <div className="space-y-4">
          {formData.category && GUIDANCE_CARDS[formData.category] && (
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm shrink-0">
                  <Info className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-900 mb-1">
                    {GUIDANCE_CARDS[formData.category].title}
                  </h3>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    {GUIDANCE_CARDS[formData.category].desc}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Before you submit
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                Verify if your query is addressed in the Platform Documentation or methodology guidelines.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                Attach relevant screenshots or export files indicating exactly where the issue occurs.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                If reporting a bug, state the steps to reproduce it.
              </li>
            </ul>
          </div>

          {/*
          <div className="bg-slate-900 rounded-2xl p-5 shadow-sm text-white">
            <h3 className="text-sm font-bold mb-2">Need Immediate Help?</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              For critical platform outages preventing data submission close to regulatory deadlines, escalate to the direct hotline.
            </p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
              View Escalation Contacts
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          */}
        </div>
      </div>
    </div>
  );
};

export default QuerySubmission;
