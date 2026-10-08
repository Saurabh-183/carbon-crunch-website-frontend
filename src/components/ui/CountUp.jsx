import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

export default function CountUp({ end, suffix = "", duration = 1400, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    let startTime;
    let raf;

    const update = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const nextValue = Math.floor(progress * end);
      setValue(nextValue);

      if (progress < 1) {
        raf = window.requestAnimationFrame(update);
      }
    };

    raf = window.requestAnimationFrame(update);

    return () => {
      if (raf) {
        window.cancelAnimationFrame(raf);
      }
    };
  }, [duration, end, isInView]);

  return (
    <p ref={ref} className={className}>
      {value}
      {suffix}
    </p>
  );
}
