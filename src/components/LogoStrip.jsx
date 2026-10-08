const logoFiles = [
  "Frame 36917.png",
  "Frame 36918.png",
  "Frame 36919.png",
  "Frame 36920.png",
  "Frame 36921.png",
  "Frame 36922.png",
  "Frame 36923.png",
  "Frame 36924.png",
  "Frame 36925.png",
  "Frame 36926.png",
  "Frame 36927.png",
  "Frame 36928.png",
  "Frame 36929.png",
  "Frame 36930.png",
  "Frame 36931.png",
  "Frame 36932.png",
  "Frame 36933.png",
  "Frame 36934.png",
  "Frame 36935.png",
  "Frame 36936.png",
  "Frame 36937.png",
  "Frame 36938.png",
  "Frame 36939.png",
  "Frame 36940.png",
  "Frame 36941.png",
  "Frame 36942.png",
];

const logos = logoFiles.map((file, index) => ({
  name: `Client ${index + 1}`,
  src: `/clients/${encodeURIComponent(file)}`,
}));

const marqueeLogos = [...logos, ...logos];

export default function LogoStrip() {
  return (
    <section aria-label="Trusted partners" className="flex min-h-[100px] sm:min-h-[160px] items-center bg-[#FEF0E3] py-3 sm:py-4">
      <div className="logo-marquee client-marquee mx-auto w-full max-w-[1920px] xl:max-w-[92%] px-2 sm:px-6 lg:px-8">
        <div className="client-track">
          {marqueeLogos.map((logo, index) => (
            <img key={`${logo.name}-${index}`} src={logo.src} alt={logo.name} className="client-logo-image" loading="lazy" decoding="async" />
          ))}
        </div>
      </div>
    </section>
  );
}
