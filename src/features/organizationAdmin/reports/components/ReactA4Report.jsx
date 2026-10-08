import React, { useRef, useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChevronLeft } from "lucide-react";
import { getSiteUnitLabel } from "../../../../utils/uiTerminology";

/* ─────────── colour palettes ─────────── */
const SCOPE_COLORS = { "Scope 1": "#f97316", "Scope 2": "#3b82f6", "Scope 3": "#8b5cf6" };
const PIE_PALETTE = ["#0d9488", "#3b82f6", "#8b5cf6", "#f97316", "#ec4899", "#eab308"];

/* ─────────── tiny helpers ─────────── */
const fmt = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  return n < 1 ? n.toFixed(4) : n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
};

const fyLabel = (startDate, endDate) => {
  try {
    const sy = new Date(startDate).getFullYear();
    const ey = new Date(endDate).getFullYear();
    return `FY ${sy}-${String(ey).slice(-2)}`;
  } catch {
    return "FY 2024-25";
  }
};

/* ═══════════════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════════════ */
const ReactA4Report = ({ reportData, payload, onBack }) => {
  const containerRef = useRef(null);

  // ── Derive display data from either pre-built payload or raw reportData ──
  const org = payload?.organization ?? {};
  const siteUnitLabel = getSiteUnitLabel(org?.industry || "", "singular");
  const siteUnitPluralLabel = getSiteUnitLabel(org?.industry || "", "plural");
  const period = payload?.period ?? reportData?.period ?? {};
  const fy = fyLabel(period.startDate, period.endDate);
  const rows = payload?.detailedRows ?? reportData?.detailedRows ?? [];
  const facilities = payload?.facilities ?? [];
  const totals = useMemo(() => {
    if (payload?.totals) return payload.totals;
    return rows.reduce(
      (acc, r) => {
        const v = Number(r.adjustedEmissions ?? r.emissions);
        if (!Number.isFinite(v)) return acc;
        if (r.scope === "Scope 1") acc.scope1 += v;
        if (r.scope === "Scope 2") acc.scope2 += v;
        if (r.scope === "Scope 3") acc.scope3 += v;
        acc.total += v;
        return acc;
      },
      { scope1: 0, scope2: 0, scope3: 0, total: 0 },
    );
  }, [rows, payload]);

  const pieData = useMemo(
    () =>
      [
        { name: "Scope 1", value: totals.scope1 },
        { name: "Scope 2", value: totals.scope2 },
        { name: "Scope 3", value: totals.scope3 },
      ].filter((d) => d.value > 0),
    [totals],
  );

  const barDataBySource = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      const key = r.source || "Other";
      map[key] = (map[key] || 0) + Number(r.emissions ?? 0);
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [rows]);

  const barDataByScope = useMemo(
    () => [
      { name: "Scope 1", value: totals.scope1, fill: SCOPE_COLORS["Scope 1"] },
      { name: "Scope 2", value: totals.scope2, fill: SCOPE_COLORS["Scope 2"] },
      { name: "Scope 3", value: totals.scope3, fill: SCOPE_COLORS["Scope 3"] },
    ],
    [totals],
  );

  /* ═════════════════ RENDER ═════════════════ */
  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      {/* ── Toolbar (hidden on print) ── */}
      <div className="no-print sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200 px-6 py-3 flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        <div className="flex-1" />
      </div>

      <div ref={containerRef} className="mx-auto" style={{ maxWidth: "210mm" }}>
        {/* ═══════════ COVER PAGE ═══════════ */}
        <section
          className="relative overflow-hidden text-white print:break-after-page"
          style={{
            minHeight: "297mm",
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #0d9488 100%)",
            padding: "60px 56px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div className="absolute top-0 left-0 right-0" style={{ height: 6, background: "linear-gradient(90deg, #14b8a6, #3b82f6, #8b5cf6)" }} />
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-8" style={{ background: "rgba(20,184,166,0.2)", color: "#5eead4", width: "fit-content" }}>
            CarbonOS v1
          </span>

          <h1 className="text-5xl font-black leading-tight mb-2">
            GREENHOUSE GAS
            <br />
            INVENTORY REPORT
          </h1>
          <div className="w-20 h-1 rounded bg-teal-400 my-5" />
          <p className="text-2xl font-semibold text-teal-300 mb-10">{fy}</p>

          <div className="grid grid-cols-2 gap-8 mt-auto">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Prepared For</p>
              <p className="text-lg font-bold">{org.name || "Organization"}</p>
              {org.address && <p className="text-sm text-slate-300">{org.address}</p>}
              {org.city && <p className="text-sm text-slate-300">{[org.city, org.state, org.zip].filter(Boolean).join(", ")}</p>}
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Prepared By</p>
              <p className="text-base font-semibold">CarbonOS Platform</p>
              <p className="text-sm text-slate-300 mt-2">
                Reporting Period: {period.startDate?.slice(0, 10)} to {period.endDate?.slice(0, 10)}
              </p>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10">
            <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Standards Applied</p>
            <p className="text-xs text-slate-400">GHG Protocol Corporate Accounting & Reporting Standard</p>
            <p className="text-xs text-slate-400">ISO 14064-1:2018</p>
          </div>

          <div className="absolute bottom-0 left-0 right-0" style={{ height: 4, background: "linear-gradient(90deg, #14b8a6, #3b82f6, #8b5cf6)" }} />
        </section>

        {/* ═══════════ EXECUTIVE SUMMARY ═══════════ */}
        <section className="bg-white print:break-after-page" style={{ minHeight: "297mm", padding: "48px 56px" }}>
          <SectionHeader num="1" title="Executive Summary" color="teal" />

          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            <strong>{org.name}</strong> has completed its annual GHG inventory for <strong>{fy}</strong>. The inventory covers <strong>{facilities.length}</strong> {siteUnitPluralLabel.toLowerCase()}.
            The total carbon footprint for the reporting period is <strong className="text-teal-600">{fmt(totals.total)} tCO₂e</strong>.
          </p>

          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <KpiCard title="Scope 1" value={totals.scope1} subtitle="Direct Emissions" gradient="from-slate-800 to-slate-900" accent="text-teal-400" />
            <KpiCard title="Scope 2" value={totals.scope2} subtitle="Indirect Energy" gradient="from-blue-700 to-blue-500" accent="text-blue-200" />
            <KpiCard title="Scope 3" value={totals.scope3} subtitle="Value Chain" gradient="from-purple-700 to-purple-500" accent="text-purple-200" />
          </div>

          {/* Donut chart */}
          <div className="flex justify-center mb-6">
            <div style={{ width: 300, height: 260 }}>
              <p className="text-xs font-bold text-slate-800 text-center mb-2 uppercase tracking-wide">Emission Profile</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={Object.values(SCOPE_COLORS)[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${fmt(v)} tCO₂e`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar by scope */}
          <div style={{ width: "100%", height: 220 }}>
            <p className="text-xs font-bold text-slate-800 text-center mb-2 uppercase tracking-wide">Emissions by Scope</p>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={barDataByScope} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip formatter={(v) => `${fmt(v)} tCO₂e`} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barDataByScope.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ═══════════ ORG PROFILE ═══════════ */}
        <section className="bg-white print:break-after-page" style={{ minHeight: "297mm", padding: "48px 56px" }}>
          <SectionHeader num="2" title="Organization Profile" color="blue" />

          <div className="grid grid-cols-2 gap-4 mb-6">
            <InfoCard label="Organization Details">
              <InfoRow k="Name" v={org.name} />
              <InfoRow k="Industry" v={org.industry} />
              <InfoRow k="Sector" v={org.sector} />
              <InfoRow k="Headquarters" v={org.headquarters} />
              <InfoRow k="Activities" v={org.activities} />
            </InfoCard>
            <InfoCard label="Reporting Scale">
              <InfoRow k={siteUnitPluralLabel} v={facilities.length} />
              <InfoRow k="Countries" v={org.countries} />
              <InfoRow k="Base Year" v={org.baseYear} />
            </InfoCard>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-5 mb-6">
            <p className="text-[10px] font-bold text-green-800 uppercase tracking-wide mb-2">Purpose of Reporting</p>
            <ul className="text-sm text-slate-600 list-disc pl-4 space-y-1 leading-relaxed">
              <li>Monitor progress towards Net Zero targets</li>
              <li>Meet regulatory compliance (SEBI BRSR, CBAM)</li>
              <li>Provide transparent disclosures to stakeholders</li>
            </ul>
          </div>

          {/* Facilities table */}
          {facilities.length > 0 && (
            <>
              <SectionHeader num="3" title="Inventory Design & Boundaries" color="teal" />
              <p className="text-xs font-bold text-slate-800 mb-2 mt-4">Reporting Units</p>
              <DataTable
                cols={[siteUnitLabel, "Location", "Activity Type", "Control Status"]}
                rows={facilities.map((f) => [
                  f.name,
                  f.location,
                  f.activityType,
                  <Badge key="cs" color="green">
                    {f.controlStatus || "Operational Control"}
                  </Badge>,
                ])}
              />
            </>
          )}
        </section>

        {/* ═══════════ SCOPE 1 DETAIL ═══════════ */}
        <section className="bg-white print:break-after-page" style={{ minHeight: "297mm", padding: "48px 56px" }}>
          <SectionHeader num="5" title="Scope 1 — Direct Emissions" color="orange" />

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-6">
            <p className="text-[9px] uppercase tracking-widest text-orange-800 font-semibold mb-1">Total Scope 1</p>
            <p className="text-3xl font-black text-orange-600">
              {fmt(totals.scope1)} <span className="text-sm font-medium">tCO₂e</span>
            </p>
          </div>

          {/* Top sources bar */}
          {barDataBySource.length > 0 && (
            <div style={{ width: "100%", height: 240 }} className="mb-6">
              <p className="text-xs font-bold text-slate-800 text-center mb-2 uppercase tracking-wide">Top Emission Sources</p>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={barDataBySource} layout="vertical" barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 9 }} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 8 }} />
                  <Tooltip formatter={(v) => `${fmt(v)} tCO₂e`} />
                  <Bar dataKey="value" fill="#f97316" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Detailed breakdown table */}
          <p className="text-xs font-bold text-slate-800 mb-2">Detailed Breakdown (Scope 1)</p>
          <DataTable
            cols={["Source", "Category", "Unit", "Consumption", "Emissions (tCO₂e)"]}
            rows={rows
              .filter((r) => r.scope === "Scope 1")
              .slice(0, 25)
              .map((r) => [
                r.source,
                r.activityCategory || r.category || "-",
                r.unit,
                fmt(r.consumptionValue),
                <strong key="e" className="text-orange-600">
                  {fmt(r.emissions)}
                </strong>,
              ])}
          />
        </section>

        {/* ═══════════ SCOPE 2 DETAIL ═══════════ */}
        <section className="bg-white print:break-after-page" style={{ minHeight: "297mm", padding: "48px 56px" }}>
          <SectionHeader num="6" title="Scope 2 — Indirect Energy Emissions" color="blue" />

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
            <p className="text-[9px] uppercase tracking-widest text-blue-800 font-semibold mb-1">Total Scope 2</p>
            <p className="text-3xl font-black text-blue-600">
              {fmt(totals.scope2)} <span className="text-sm font-medium">tCO₂e</span>
            </p>
          </div>

          <DataTable
            cols={["Source", "Category", "Unit", "Consumption", "Emissions (tCO₂e)"]}
            rows={rows
              .filter((r) => r.scope === "Scope 2")
              .slice(0, 25)
              .map((r) => [
                r.source,
                r.activityCategory || r.category || "-",
                r.unit,
                fmt(r.consumptionValue),
                <strong key="e" className="text-blue-600">
                  {fmt(r.emissions)}
                </strong>,
              ])}
          />
        </section>

        {/* ═══════════ SCOPE 3 DETAIL ═══════════ */}
        <section className="bg-white print:break-after-page" style={{ minHeight: "297mm", padding: "48px 56px" }}>
          <SectionHeader num="7" title="Scope 3 — Value Chain Emissions" color="purple" />

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 mb-6">
            <p className="text-[9px] uppercase tracking-widest text-purple-800 font-semibold mb-1">Total Scope 3</p>
            <p className="text-3xl font-black text-purple-600">
              {fmt(totals.scope3)} <span className="text-sm font-medium">tCO₂e</span>
            </p>
          </div>

          <DataTable
            cols={["Source", "Category", "Unit", "Consumption", "Emissions (tCO₂e)"]}
            rows={rows
              .filter((r) => r.scope === "Scope 3")
              .slice(0, 30)
              .map((r) => [
                r.source,
                r.activityCategory || r.category || "-",
                r.unit,
                fmt(r.consumptionValue),
                <strong key="e" className="text-purple-600">
                  {fmt(r.emissions)}
                </strong>,
              ])}
          />
        </section>

        {/* ═══════════ FOOTER ═══════════ */}
        <section className="bg-white" style={{ padding: "48px 56px" }}>
          <div className="text-center border-t border-slate-200 pt-8">
            <p className="text-xs text-slate-400">
              Generated by <strong>CarbonOS v1</strong>
            </p>
            <p className="text-[10px] text-slate-300 mt-1">This is a system-generated report. All data has been verified through the CarbonOS platform.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════ */

const COLOR_MAP = {
  teal: "from-teal-500 to-teal-600",
  blue: "from-blue-600 to-blue-500",
  orange: "from-orange-500 to-orange-600",
  purple: "from-purple-600 to-purple-500",
  red: "from-red-500 to-red-600",
};

function SectionHeader({ num, title, color = "teal" }) {
  return (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b-[3px] border-teal-500">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${COLOR_MAP[color]} text-white flex items-center justify-center text-sm font-extrabold flex-shrink-0`}>{num}</div>
      <span className="text-lg font-bold text-slate-900 uppercase tracking-wide">{title}</span>
    </div>
  );
}

function KpiCard({ title, value, subtitle, gradient, accent }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} text-white p-5`}>
      <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/5" />
      <p className={`text-[8px] uppercase tracking-widest font-semibold ${accent} mb-1`}>{title}</p>
      <p className="text-2xl font-extrabold leading-tight">{fmt(value)}</p>
      <p className={`text-[9px] ${accent} mt-1`}>{subtitle}</p>
    </div>
  );
}

function InfoCard({ label, children }) {
  return (
    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
      <p className="text-[9px] uppercase tracking-widest text-slate-500 font-semibold mb-3">{label}</p>
      {children}
    </div>
  );
}

function InfoRow({ k, v }) {
  return (
    <p className="text-[11px] text-slate-700 my-1">
      <strong className="text-slate-900">{k}:</strong> {v || "-"}
    </p>
  );
}

function Badge({ children, color = "green" }) {
  const colours = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-700",
    red: "bg-red-50 text-red-700",
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-semibold uppercase tracking-wide ${colours[color]}`}>{children}</span>;
}

function DataTable({ cols, rows }) {
  if (!rows || rows.length === 0) {
    return <p className="text-xs text-slate-400 italic">No data available.</p>;
  }
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-[9px] border-collapse">
        <thead>
          <tr className="bg-slate-900 text-white">
            {cols.map((c, i) => (
              <th key={i} className="px-3 py-2.5 text-left font-semibold uppercase tracking-wide text-[8px]">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReactA4Report;
