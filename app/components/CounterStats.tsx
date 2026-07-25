"use client";

import { useEffect, useRef, useState } from "react";

function useCounter(target: number, duration: number, started: boolean) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!started) return;
    if (target === 0) { setCount(0); return; }
    let startTime = 0;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [started, target, duration]);

  return count;
}

const STATS = [
  { value: 12,  prefix: "",  suffix: "%",  label: "Commission" },
  { value: 0,   prefix: "₹", suffix: "",   label: "Hidden fees" },
  { value: 2,   prefix: "",  suffix: " hrs", label: "Delhi delivery" },
  { value: 24,  prefix: "",  suffix: " hrs", label: "Support response" },
];

export default function CounterStats() {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setStarted(true); observer.disconnect(); }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex flex-wrap items-stretch justify-center mt-10"
      style={{ border: "1px solid #1E1E1E" }}
    >
      {STATS.map((stat, i) => (
        <div
          key={stat.label}
          className="flex flex-col items-center gap-1.5 px-6 py-5 flex-1 min-w-[120px]"
          style={i < STATS.length - 1 ? { borderRight: "1px solid #1E1E1E" } : {}}
        >
          <div
            className="font-bebas leading-none"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", color: "#CC0000" }}
          >
            <StatInner stat={stat} started={started} />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em]"
               style={{ color: "#888888" }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatInner({ stat, started }: { stat: (typeof STATS)[0]; started: boolean }) {
  const count = useCounter(stat.value, 1400, started);
  return <>{stat.prefix}{count}{stat.suffix}</>;
}
