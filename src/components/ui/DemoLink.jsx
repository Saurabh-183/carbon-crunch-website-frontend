import { Link } from "react-router-dom";

export default function DemoLink({ to = "/book-demo", children, className = "", ...props }) {
  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-4 pl-6 pr-2 py-2 rounded-full bg-ember-300 text-white font-semibold transition-all hover:bg-ember-400 border border-white/25 backdrop-blur-md ${className}`}
      {...props}
    >
      <span className="whitespace-nowrap">{children}</span>
      <div className="w-9 h-9 md:w-10 md:h-10 bg-white text-[#F27A18] rounded-full flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 shrink-0 shadow-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17L17 7M17 7H7M17 7V17" />
        </svg>
      </div>
    </Link>
  );
}
