const defaultSupportCards = [
  {
    title: "Email us",
    value: "support@carboncrunch.in",
    icon: "email",
  },
  {
    title: "Address",
    value: "B.K Tower, H, 65, Sector 63 Rd, H Block, Sector 63, Noida, Uttar Pradesh 201309",
    icon: "address",
  },
  {
    title: "Phone Number",
    value: "+91-9220885384",
    icon: "phone",
  },
];

function ContactMethodIcon({ type }) {
  if (type === "email") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 8l9 6 9-6" />
      </svg>
    );
  }

  if (type === "address") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.9v2.6a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.2 3.9 2 2 0 0 1 4.2 1.7H6.8a2 2 0 0 1 2 1.7l.6 3a2 2 0 0 1-.6 1.9l-1.4 1.4a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 1.9-.6l3 .6a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}

function ContactCard({ title, value, icon, maxWidthClass = "max-w-[280px]" }) {
  return (
    <article className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center md:border-r md:border-[#57c0ff]/45 last:md:border-r-0">
      <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#37aae6] text-white" aria-hidden="true">
        <ContactMethodIcon type={icon} />
      </div>
      <h3 className="text-[28px] font-medium leading-tight text-bark-900 md:text-[34px]">{title}</h3>
      <p className={`${maxWidthClass} text-[15px] leading-relaxed text-bark-900/70 sm:text-[16px]`}>{value}</p>
    </article>
  );
}

export default function SupportCardsSection({ heading, subheading, cards = defaultSupportCards, maxWidthClass = "max-w-[280px]" }) {
  return (
    <section className="mx-auto mt-20 max-w-[1360px] text-center">
      <h3 className="font-display text-[40px] leading-tight text-bark-900 sm:text-[48px] md:text-[56px] lg:text-[68px]">{heading}</h3>
      <p className="mx-auto mt-4 max-w-4xl text-[16px] text-bark-900/75 sm:text-[18px] md:text-[22px] lg:text-[26px]">{subheading}</p>

      <div className="mt-12 grid overflow-hidden rounded-[20px] border border-[#57c0ff] bg-transparent md:grid-cols-3">
        {cards.map((card) => (
          <ContactCard key={card.title} title={card.title} value={card.value} icon={card.icon} maxWidthClass={maxWidthClass} />
        ))}
      </div>
    </section>
  );
}
