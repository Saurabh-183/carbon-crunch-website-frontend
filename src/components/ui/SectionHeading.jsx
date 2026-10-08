export default function SectionHeading({ title, description, className = "" }) {
  return (
    <header
      className={`mx-auto max-w-3xl text-center px-4 sm:px-6 ${className}`}
    >
      <h2
        className="
          font-display
          text-[30px] min-[375px]:text-[34px] min-[480px]:text-[40px] sm:text-[48px]
          font-semibold
          leading-[1.15] sm:leading-[1.2]
          tracking-[-0.02em]
          text-bark-900
        "
      >
        {title}
      </h2>

      {description && (
        <p
          className="
            mt-5 sm:mt-6
            text-[15px] sm:text-[17px]
            leading-[1.7]
            text-bark-900/70
            max-w-2xl mx-auto
          "
        >
          {description}
        </p>
      )}
    </header>
  );
}