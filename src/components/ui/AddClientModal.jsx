import React, { useState } from "react";
import { Building2, X, Check, Save, FlaskConical, UserCircle, Loader2, ShieldCheck, PenLine, ClipboardCheck, Lock } from "lucide-react";
import ChipSelector from "./ChipSelector";
import Dropdown from "./DropDown";
import api from "../../utils/api";

/* ══════════════════════════════════════════════════════════
   STATIC OPTIONS
   ══════════════════════════════════════════════════════════ */
const SECTOR_OPTIONS = ["Pulp & Paper", "Sugar", "Ceramic", "Textiles"];
const SECTOR_COLORS = {
  "Pulp & Paper": "text-orange-600",
  Sugar: "text-blue-600",
  Ceramic: "text-purple-600",
  Textiles: "text-cyan-600",
};

const COMPLIANCE_OPTIONS = ["RCO", "GHG", "CBAM", "CCTS", "PAT"];
const COMPLIANCE_COLORS = {
  RCO: "bg-violet-50 text-violet-700 border-violet-200",
  GHG: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CBAM: "bg-sky-50 text-sky-700 border-sky-200",
  CCTS: "bg-amber-50 text-amber-700 border-amber-200",
  PAT: "bg-rose-50 text-rose-700 border-rose-200",
};

const GHG_PROTOCOL_OPTIONS = ["GHG Protocol", "GHG Protocol v2", "ISO 14064", "IPCC 2006"];
const ORGANIZATION_BOUNDARIES = ["Operation Control", "Financial Control", "Equity Share"];
const REPORTING_SCOPES = ["Scope 1", "Scope 2", "Scope 3"];
const SYSTEM_BOUNDARIES = ["Organization Level", "Project Level", "Product Level"];

const ORG_BOUNDARY_COLORS = {
  "Operation Control": "bg-purple-50 text-purple-700 border-purple-200",
  "Financial Control": "bg-green-50 text-green-700 border-green-200",
  "Equity Share": "bg-yellow-50 text-yellow-700 border-yellow-200",
};
const REPORTING_SCOPE_COLORS = {
  "Scope 1": "bg-rose-50 text-rose-700 border-rose-200",
  "Scope 2": "bg-sky-50 text-sky-700 border-sky-200",
  "Scope 3": "bg-emerald-50 text-emerald-700 border-emerald-200",
};
const SYSTEM_BOUNDARY_COLORS = {
  "Organization Level": "bg-violet-50 text-violet-700 border-violet-200",
  "Project Level": "bg-pink-50 text-pink-700 border-pink-200",
  "Product Level": "bg-indigo-50 text-indigo-700 border-indigo-200",
};

/* Data-entry role options — add more here when roles expand */
const DATA_ENTRY_ROLES = [
  { value: "auditor", label: "Auditor" },
  { value: "client", label: "Client" },
];

const INITIAL_FORM = {
  companyName: "",
  sector: "",
  complianceTypes: [],
  ghgProtocol: "",
  organizationBoundaries: [],
  reportingScopes: [],
  systemBoundaries: [],
  dataEntryAssignee: null, // "auditor" | "client" | null
  clientUsername: "",
  clientEmail: "",
};

/* ══════════════════════════════════════════════════════════
   ATOMS
   ══════════════════════════════════════════════════════════ */
const SectionCard = ({ icon: Icon, iconBg, iconColor, title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
      <div className={`p-2 rounded-lg ${iconBg}`}>
        <Icon size={16} className={iconColor} />
      </div>
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
    </div>
    {children}
  </div>
);

const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
);

const TextInput = ({ icon: Icon, placeholder, value, onChange, error, ...rest }) => (
  <div className="relative">
    {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full ${Icon ? "pl-9" : "pl-3"} pr-3 py-2.5 text-sm bg-gray-50 border rounded-xl
                text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2
                focus:ring-indigo-500/20 focus:border-indigo-400 transition-all
                ${error ? "border-red-300 bg-red-50" : "border-gray-200"}`}
      {...rest}
    />
  </div>
);

const PreviewChips = ({ items, colorMap }) =>
  items.length > 0 ? (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border
                        ${colorMap?.[item] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}
        >
          {item}
        </span>
      ))}
    </div>
  ) : (
    <p className="text-xs text-gray-400">None selected</p>
  );

/* ══════════════════════════════════════════════════════════
   RESPONSIBILITY SLOT — reusable container for each toggle row
   ══════════════════════════════════════════════════════════ */
const ResponsibilitySlot = ({ icon: Icon, heading, description, children, footer }) => (
  <div className="flex flex-col gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
    <div className="flex items-start gap-2.5">
      <div className="p-1.5 bg-white border border-gray-200 rounded-lg shadow-sm shrink-0 mt-0.5">
        <Icon size={13} className="text-gray-500" />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-900">{heading}</p>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{description}</p>
      </div>
    </div>
    {children}
    {footer && <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">{footer}</p>}
  </div>
);

/* ══════════════════════════════════════════════════════════
   ADD CLIENT MODAL
   ══════════════════════════════════════════════════════════ */
const AddClientModal = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ── Safe field setter — never calls .target on null/undefined ── */
  const setField = (field) => (val) => {
    let resolved;
    if (val === null || val === undefined) {
      resolved = val;
    } else if (typeof val === "string" || typeof val === "boolean" || Array.isArray(val)) {
      resolved = val;
    } else if (val && typeof val === "object" && "target" in val) {
      resolved = val.target.value;
    } else {
      resolved = val;
    }
    setForm((prev) => ({ ...prev, [field]: resolved }));
  };

  /* Whether client admin fields are relevant */
  const isClientDataEntry = form.dataEntryAssignee === "client";

  const validate = () => {
    const e = {};
    if (!form.companyName.trim()) e.companyName = "Company name is required.";
    if (!form.sector) e.sector = "Please select an industry.";
    if (!form.complianceTypes.length) e.complianceTypes = "Select at least one compliance type.";
    if (!form.ghgProtocol) e.ghgProtocol = "Please select a GHG protocol.";
    if (!form.organizationBoundaries.length) e.organizationBoundaries = "Select at least one boundary.";
    if (!form.reportingScopes.length) e.reportingScopes = "Select at least one scope.";
    if (!form.systemBoundaries.length) e.systemBoundaries = "Select at least one boundary.";
    if (!form.dataEntryAssignee) e.dataEntryAssignee = "Please assign data entry responsibility.";
    /* Client admin fields only required when data entry = client */
    if (isClientDataEntry) {
      if (!form.clientUsername.trim()) e.clientUsername = "Username is required.";
      if (!form.clientEmail.trim()) e.clientEmail = "Email is required.";
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    setErrors({});

    try {
      /*
       * Base payload — matches the confirmed API shape exactly.
       * Fields present for BOTH auditor and client cases.
       */
      const basePayload = {
        name: form.companyName.trim(),
        industry: form.sector,
        address: {},
        complianceSettings: {
          enabledModules: form.complianceTypes,
          GHGProtocolVersion: form.ghgProtocol,
          allowedBoundaryMethods: form.organizationBoundaries,
          allowedReportingScopes: form.reportingScopes,
          allowedSystemBoundaries: form.systemBoundaries,
        },
      };

      /*
       * Client case: append clientUsername + clientEmail.
       * Auditor case: send base payload only — no credential fields.
       * reportVerification is always Auditor so it is never sent.
       */
      const payload = isClientDataEntry
        ? {
            ...basePayload,
            clientUsername: form.clientUsername.trim(),
            clientEmail: form.clientEmail.trim(),
          }
        : basePayload;

      const endpoint = isClientDataEntry ? "/api/organizations/auditor-invite" : "/api/organizations/auditorGotInvite";

      await api.post(endpoint, payload);
      setSubmitted(true);
      onSubmit?.(form);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error?.message || "Failed to invite client. Please try again.";
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setSubmitted(false);
  };

  if (!isOpen) return null;

  const initials = form.companyName
    ? form.companyName
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  /* ── Success state ── */
  if (submitted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl flex flex-col items-center text-center gap-5">
          <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
            <Check size={28} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Client Added Successfully</h3>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-semibold text-gray-700">{form.companyName}</span> has been registered. Credentials have been sent via email.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleReset} className="px-4 py-2 bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl hover:text-gray-900 transition-colors cursor-pointer">
              Add Another
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors border-0 cursor-pointer">
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main modal ── */
  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black/40 z-50 p-4">
      <div className="bg-gray-50 rounded-2xl w-full max-w-5xl shadow-xl my-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Building2 size={16} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Add Client</h1>
              <p className="text-xs text-gray-500">Register a new client to your portfolio</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border-0 bg-transparent">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 p-6 overflow-hidden flex-1 min-h-0">
          {/* ── LEFT: scrollable form ── */}
          <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300">
            {/* ── Card 1: Company Details ── */}
            <SectionCard icon={Building2} iconBg="bg-blue-50" iconColor="text-blue-600" title="Company Details">
              <Field label="Company Name" required error={errors.companyName}>
                <TextInput placeholder="e.g. Meridian Energy Group" value={form.companyName} onChange={setField("companyName")} icon={Building2} error={errors.companyName} />
              </Field>
              <Field label="Industry" required error={errors.sector}>
                <Dropdown value={form.sector} onChange={setField("sector")} options={SECTOR_OPTIONS} placeholder="Select industry…" colorMap={SECTOR_COLORS} error={errors.sector} />
              </Field>
              <Field label="Compliance Types" required error={errors.complianceTypes}>
                <ChipSelector selected={form.complianceTypes} onChange={setField("complianceTypes")} options={COMPLIANCE_OPTIONS} colorMap={COMPLIANCE_COLORS} error={errors.complianceTypes} />
              </Field>
            </SectionCard>

            {/* ── Card 2: GHG & Boundaries ── */}
            <SectionCard icon={FlaskConical} iconBg="bg-emerald-50" iconColor="text-emerald-600" title="GHG & Boundaries">
              <Field label="GHG Protocol" required error={errors.ghgProtocol}>
                <Dropdown value={form.ghgProtocol} onChange={setField("ghgProtocol")} options={GHG_PROTOCOL_OPTIONS} placeholder="Select protocol…" error={errors.ghgProtocol} />
              </Field>
              <Field label="Organization Boundaries" required error={errors.organizationBoundaries}>
                <ChipSelector
                  selected={form.organizationBoundaries}
                  onChange={setField("organizationBoundaries")}
                  options={ORGANIZATION_BOUNDARIES}
                  colorMap={ORG_BOUNDARY_COLORS}
                  error={errors.organizationBoundaries}
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Reporting Scopes" required error={errors.reportingScopes}>
                  <ChipSelector selected={form.reportingScopes} onChange={setField("reportingScopes")} options={REPORTING_SCOPES} colorMap={REPORTING_SCOPE_COLORS} error={errors.reportingScopes} />
                </Field>
                <Field label="System Boundaries" required error={errors.systemBoundaries}>
                  <ChipSelector
                    selected={form.systemBoundaries}
                    onChange={setField("systemBoundaries")}
                    options={SYSTEM_BOUNDARIES}
                    colorMap={SYSTEM_BOUNDARY_COLORS}
                    error={errors.systemBoundaries}
                  />
                </Field>
              </div>
            </SectionCard>

            {/* ── Card 3: Assign Responsibilities ── */}
            <SectionCard icon={ShieldCheck} iconBg="bg-amber-50" iconColor="text-amber-600" title="Assign Responsibilities">
              <p className="text-xs text-gray-500 -mt-1">Choose who will handle data entry and report verification.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Toggle 1 — Data Entry (interactive) */}
                <ResponsibilitySlot
                  icon={PenLine}
                  heading="Data Entry"
                  description="Select who will enter the data."
                  footer={form.dataEntryAssignee ? `Assigned to ${DATA_ENTRY_ROLES.find((r) => r.value === form.dataEntryAssignee)?.label}` : undefined}
                >
                  <div className="flex flex-wrap gap-2">
                    {DATA_ENTRY_ROLES.map((role) => {
                      const isSelected = form.dataEntryAssignee === role.value;
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => {
                            /* Toggle off if clicking the already-selected role */
                            const next = isSelected ? null : role.value;
                            setForm((prev) => ({ ...prev, dataEntryAssignee: next }));
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer
                                                        ${
                                                          isSelected
                                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                                            : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                                                        }`}
                        >
                          {isSelected && <Check size={11} />}
                          {role.label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.dataEntryAssignee && <p className="text-xs text-red-500">{errors.dataEntryAssignee}</p>}
                </ResponsibilitySlot>

                {/* Toggle 2 — Report Verification (locked, read-only) */}
                <ResponsibilitySlot icon={ClipboardCheck} heading="Report Verification" description="Select who will verify the report." footer="Assigned to Auditor">
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-indigo-600 text-white border-indigo-600 shadow-sm select-none">
                      <Check size={11} />
                      Auditor
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-400 select-none">
                      <Lock size={11} />
                      Locked
                    </div>
                  </div>
                </ResponsibilitySlot>
              </div>
            </SectionCard>

            {/* ── Card 4: Client Admin — only shown when data entry = client ── */}
            {isClientDataEntry && (
              <SectionCard icon={UserCircle} iconBg="bg-purple-50" iconColor="text-purple-600" title="Client Admin (Organization Head)">
                <p className="text-xs text-gray-500 -mt-1">Provide credentials for the client who will be entering data.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Username" required error={errors.clientUsername}>
                    <TextInput placeholder="e.g. johndoe" value={form.clientUsername} onChange={setField("clientUsername")} error={errors.clientUsername} />
                  </Field>
                  <Field label="Email" required error={errors.clientEmail}>
                    <TextInput placeholder="e.g. john@example.com" value={form.clientEmail} onChange={setField("clientEmail")} error={errors.clientEmail} />
                  </Field>
                </div>
              </SectionCard>
            )}
          </div>

          {/* ── RIGHT: sticky preview ── */}
          <div className="lg:col-span-1 overflow-y-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4 sticky top-0">
              <h2 className="text-sm font-semibold text-gray-900 pb-3 border-b border-gray-100">Preview</h2>

              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white tracking-wide">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{form.companyName || <span className="font-normal text-gray-400">Company name</span>}</p>
                  <p className="text-xs text-gray-500 truncate">{form.sector || "No industry selected"}</p>
                </div>
              </div>

              {/* Compliance */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Compliance</p>
                <PreviewChips items={form.complianceTypes} colorMap={COMPLIANCE_COLORS} />
              </div>

              {/* GHG Protocol */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">GHG Protocol</p>
                {form.ghgProtocol ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">{form.ghgProtocol}</span>
                ) : (
                  <p className="text-xs text-gray-400">No protocol selected</p>
                )}
              </div>

              {/* Org Boundaries */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Org. Boundaries</p>
                <PreviewChips items={form.organizationBoundaries} colorMap={ORG_BOUNDARY_COLORS} />
              </div>

              {/* Reporting Scopes */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Reporting Scopes</p>
                <PreviewChips items={form.reportingScopes} colorMap={REPORTING_SCOPE_COLORS} />
              </div>

              {/* System Boundaries */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">System Boundaries</p>
                <PreviewChips items={form.systemBoundaries} colorMap={SYSTEM_BOUNDARY_COLORS} />
              </div>

              {/* Responsibilities */}
              <div className="pt-3 border-t border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Responsibilities</p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="flex items-center gap-1.5 text-xs text-gray-600">
                      <PenLine size={11} className="text-gray-400" /> Data Entry
                    </span>
                    {form.dataEntryAssignee ? (
                      <span className="text-[11px] font-semibold text-indigo-600 capitalize">{form.dataEntryAssignee}</span>
                    ) : (
                      <span className="text-[11px] text-gray-400">Unassigned</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="flex items-center gap-1.5 text-xs text-gray-600">
                      <ClipboardCheck size={11} className="text-gray-400" /> Verification
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-600">Auditor</span>
                  </div>
                </div>
              </div>

              {/* Client Admin preview — only when client data entry */}
              {isClientDataEntry && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Client Admin</p>
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-700">Username: </span>
                    {form.clientUsername || <span className="text-gray-400">Not set</span>}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-semibold text-gray-700">Email: </span>
                    {form.clientEmail || <span className="text-gray-400">Not set</span>}
                  </p>
                </div>
              )}

              {/* Submit error */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs text-red-600">{errors.submit}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors border-0 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {loading ? "Saving…" : "Save Client"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer bg-transparent border-0 disabled:opacity-50"
                >
                  Reset Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddClientModal;
