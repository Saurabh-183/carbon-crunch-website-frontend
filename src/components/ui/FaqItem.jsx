import { useId } from "react";

export default function FaqItem({ question, answer, open, onToggle }) {
  const panelId = useId();

  return (
    <div className="border-b border-bark-900/20">
      <button type="button" className="flex w-full items-center justify-between gap-4 py-4 text-left" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
        <span className="text-sm font-medium text-bark-900 sm:text-base">{question}</span>
        <span aria-hidden="true" className="text-xl text-bark-900/70">
          {open ? "−" : "+"}
        </span>
      </button>
      <div id={panelId} className={`grid overflow-hidden transition-all duration-300 ${open ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]"}`}>
        <p className="min-h-0 text-sm leading-relaxed text-bark-900/70">{answer}</p>
      </div>
    </div>
  );
}
