import React from "react";
import { CheckCircle2, Factory, Network, Sparkles } from "lucide-react";
import { buildRcoCanvasLayout, buildRcoInfraProfile, createDefaultRcoInfraAnswers, loadApprovedRcoInfraProfile } from "./rcoPlantInfraModel";

const Toggle = ({ label, checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`rounded-lg border px-3 py-2 text-left text-xs font-bold transition ${checked ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-500"}`}
  >
    {label}
  </button>
);

const Field = ({ label, value, onChange, placeholder }) => (
  <label className="block">
    <div className="mb-1 text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</div>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
    />
  </label>
);

const RequestPreview = ({ profile }) => {
  const grouped = profile.requests.reduce((acc, request) => {
    acc[request.type] = acc[request.type] || [];
    acc[request.type].push(request);
    return acc;
  }, {});

  return (
    <div className="grid gap-2 lg:grid-cols-4">
      {[
        ["generation", "Generation"],
        ["fuel", "Fuel"],
        ["gcv", "GCV / lab"],
        ["consumption", "Consumption"],
      ].map(([key, label]) => (
        <div key={key} className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="text-xs font-black text-slate-900">{label}</div>
          <div className="mt-2 space-y-1">
            {(grouped[key] || []).slice(0, 5).map((request) => (
              <div key={request.id} className="rounded-md bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600">
                {request.title}
              </div>
            ))}
            {!grouped[key]?.length && <div className="text-[11px] font-semibold text-slate-400">No request</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

const DiagramNode = ({ title, subtitle, tone = "slate" }) => {
  const tones = {
    fuel: "border-amber-200 bg-amber-50 text-amber-900",
    boiler: "border-orange-200 bg-orange-50 text-orange-900",
    source: "border-blue-200 bg-blue-50 text-blue-900",
    bus: "border-emerald-200 bg-emerald-50 text-emerald-900",
    load: "border-slate-200 bg-white text-slate-900",
    aux: "border-purple-200 bg-purple-50 text-purple-900",
  };

  return (
    <div className={`rounded-lg border px-3 py-2 shadow-sm ${tones[tone] || tones.slate}`}>
      <div className="text-xs font-black">{title}</div>
      {subtitle && <div className="mt-0.5 text-[10px] font-semibold opacity-70">{subtitle}</div>}
    </div>
  );
};

const RcoInfraDiagram = ({ profile }) => {
  const fuels = profile.assets.fuels || [];
  const boilers = profile.assets.boilers || [];
  const sources = profile.assets.generation || [];
  const loads = profile.assets.consumption || [];
  const auxiliary = profile.assets.auxiliary || [];

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Generated plant infra diagram</div>
      <div className="overflow-x-auto">
        <div className="grid min-w-[980px] grid-cols-[1fr_32px_1fr_32px_1fr_32px_0.8fr_32px_1fr] items-center gap-2">
          <div className="space-y-2">
            <div className="text-center text-[10px] font-black uppercase tracking-wide text-slate-400">Fuels</div>
            {fuels.length ? fuels.map((fuel) => <DiagramNode key={fuel} title={fuel} tone="fuel" />) : <DiagramNode title="No fuels" />}
          </div>
          <div className="text-center text-xl font-black text-slate-300">→</div>
          <div className="space-y-2">
            <div className="text-center text-[10px] font-black uppercase tracking-wide text-slate-400">Boilers</div>
            {boilers.length ? boilers.map((boiler) => <DiagramNode key={boiler.id} title={boiler.name} subtitle={boiler.capacity} tone="boiler" />) : <DiagramNode title="No boiler" />}
          </div>
          <div className="text-center text-xl font-black text-slate-300">→</div>
          <div className="space-y-2">
            <div className="text-center text-[10px] font-black uppercase tracking-wide text-slate-400">Generation sources</div>
            {sources.length ? sources.map((source) => <DiagramNode key={source.id} title={source.name} subtitle={source.capacity || source.type} tone="source" />) : <DiagramNode title="No source" />}
          </div>
          <div className="text-center text-xl font-black text-slate-300">→</div>
          <DiagramNode title="CPP Bus" subtitle="Distribution" tone="bus" />
          <div className="text-center text-xl font-black text-slate-300">→</div>
          <div className="space-y-2">
            <div className="text-center text-[10px] font-black uppercase tracking-wide text-slate-400">Consumption</div>
            {loads.map((load) => <DiagramNode key={load.id} title={load.name} tone="load" />)}
            {auxiliary.map((load) => <DiagramNode key={load.id} title={load.name} subtitle="Auxiliary" tone="aux" />)}
            {!loads.length && !auxiliary.length && <DiagramNode title="No load" />}
          </div>
        </div>
      </div>
    </div>
  );
};

const RcoInfraSetupAssistant = ({ facilityId, orgIndustry, saving, onApprove }) => {
  const [answers, setAnswers] = React.useState(createDefaultRcoInfraAnswers);
  const [approvedProfile, setApprovedProfile] = React.useState(() => loadApprovedRcoInfraProfile(facilityId));

  React.useEffect(() => {
    setApprovedProfile(loadApprovedRcoInfraProfile(facilityId));
  }, [facilityId]);

  const draftProfile = React.useMemo(
    () => buildRcoInfraProfile({ answers, facilityId, orgIndustry }),
    [answers, facilityId, orgIndustry],
  );

  const update = (key, value) => setAnswers((current) => ({ ...current, [key]: value }));

  const handleApprove = () => {
    const profile = buildRcoInfraProfile({ answers, facilityId, orgIndustry });
    const layout = buildRcoCanvasLayout(profile);
    setApprovedProfile(profile);
    onApprove?.(profile, layout);
  };

  return (
    <div className="mx-4 mb-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm sm:mx-6 lg:mx-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-slate-900">
            <Sparkles size={16} className="text-emerald-600" />
            RCO plant infra setup
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-600">
            Answer simple plant questions. The system generates the RCO infra and Data Manager upload requests.
          </div>
        </div>
        {approvedProfile && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-black text-emerald-700">
            <CheckCircle2 size={14} />
            Approved source of truth
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
            <Factory size={14} />
            Basic questions
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <Toggle label="Turbine" checked={answers.hasTurbine} onChange={(value) => update("hasTurbine", value)} />
            <Toggle label="Boilers" checked={answers.hasBoiler} onChange={(value) => update("hasBoiler", value)} />
            <Toggle label="Grid" checked={answers.hasGrid} onChange={(value) => update("hasGrid", value)} />
            <Toggle label="Open access" checked={answers.hasOpenAccess} onChange={(value) => update("hasOpenAccess", value)} />
            <Toggle label="Solar / wind" checked={answers.hasSolar || answers.hasWind} onChange={(value) => { update("hasSolar", value); update("hasWind", value); }} />
            <Toggle label="DG" checked={answers.hasDg} onChange={(value) => update("hasDg", value)} />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {answers.hasTurbine && <Field label="Turbine name" value={answers.turbineName} onChange={(value) => update("turbineName", value)} />}
            {answers.hasTurbine && <Field label="Turbine capacity" value={answers.turbineCapacity} onChange={(value) => update("turbineCapacity", value)} />}
            {answers.hasBoiler && <Field label="Boiler name" value={answers.boilerName} onChange={(value) => update("boilerName", value)} />}
            {answers.hasBoiler && <Field label="Boiler size" value={answers.boilerCapacity} onChange={(value) => update("boilerCapacity", value)} />}
            {answers.hasBoiler && <Field label="Fuels" value={answers.fuels} onChange={(value) => update("fuels", value)} placeholder="Coal, Biomass, HSD" />}
            {answers.hasGrid && <Field label="Grid / open access" value={answers.gridName} onChange={(value) => update("gridName", value)} />}
            {answers.hasGrid && <Field label="Grid capacity" value={answers.gridCapacity} onChange={(value) => update("gridCapacity", value)} />}
            {answers.hasSolar && <Field label="Solar capacity" value={answers.solarCapacity} onChange={(value) => update("solarCapacity", value)} />}
            {answers.hasWind && <Field label="Wind capacity" value={answers.windCapacity} onChange={(value) => update("windCapacity", value)} />}
            {answers.hasDg && <Field label="DG capacity" value={answers.dgCapacity} onChange={(value) => update("dgCapacity", value)} />}
            <Field label="Consumption departments" value={answers.consumptionDepartments} onChange={(value) => update("consumptionDepartments", value)} placeholder="Paper Machine, Pulp Machine, ETP" />
            <Field label="Auxiliary loads" value={answers.auxiliaryLoads} onChange={(value) => update("auxiliaryLoads", value)} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
            <Network size={14} />
            Generated logic
          </div>
          <div className="mt-3 space-y-2 text-xs font-semibold text-slate-600">
            <div className="rounded-lg bg-slate-50 px-3 py-2">Fuel to Boiler to Turbine to CPP Bus to Consumption</div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">Grid / open access / DG / solar / wind to CPP Bus</div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">Auxiliary loads attach to the bus and become consumption requests</div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-emerald-50 p-2 text-center"><div className="text-lg font-black text-emerald-800">{draftProfile.assets.generation.length}</div><div className="text-[10px] font-bold text-emerald-700">Sources</div></div>
            <div className="rounded-lg bg-amber-50 p-2 text-center"><div className="text-lg font-black text-amber-800">{draftProfile.assets.boilers.length}</div><div className="text-[10px] font-bold text-amber-700">Boilers</div></div>
            <div className="rounded-lg bg-blue-50 p-2 text-center"><div className="text-lg font-black text-blue-800">{draftProfile.assets.consumption.length}</div><div className="text-[10px] font-bold text-blue-700">Departments</div></div>
          </div>
          <button
            type="button"
            onClick={handleApprove}
            disabled={saving}
            className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            Approve infra and generate requests
          </button>
        </div>
      </div>

      <div className="mt-3">
        <RequestPreview profile={draftProfile} />
      </div>

      <RcoInfraDiagram profile={draftProfile} />
    </div>
  );
};

export default RcoInfraSetupAssistant;
