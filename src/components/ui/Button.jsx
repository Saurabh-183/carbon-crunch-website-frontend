const variants = {
  primary: "bg-ember-300 text-white hover:bg-ember-400 focus-visible:outline-ember-300",
  secondary: "bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white",
  dark: "bg-bark-900 text-white hover:bg-bark-800 focus-visible:outline-bark-900",
};

export default function Button({ children, variant = "primary", showIcon = true, className = "", type = "button", ...props }) {
  return (
    <button
      type={type}
      className={`group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
      {showIcon ? (
        <span aria-hidden="true">
          <svg className="ml-2 w-5 h-5 transition-transform duration-200 group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </span>
      ) : null}
    </button>
  );
}
