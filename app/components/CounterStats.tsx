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
  { value: 12, prefix: "",  suffix: "%",  label: "Commission" },
  { value: 0,  prefix: "₹", suffix: "",   label: "Hidden Fees" },
  { value: 2,  prefix: "",  suffix: "HR", label: "Delhi Delivery" },
  { value: 24, prefix: "",  suffix: "H",  label: "Support Response" },
];

function StatItem({ stat, started }: { stat: (typeof STATS)[0]; started: boolean }) {
  const count = useCounter(stat.value, 1400, started);
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-5 glass-card flex-1 min-w-[110px]">
      <div className="stat-number text-4xl md:text-5xl">
        {stat.prefix}{count}{stat.suffix}
      </div>
      <div
        className="font-mono text-[10px] uppercase tracking-[0.2em]"
        style={{ color: "var(--muted)" }}
      >
        {stat.label}
      </div>
    </div>
  );
}

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
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex flex-wrap items-stretch justify-center gap-3 pt-8"
    >
      {STATS.map((stat) => (
        <StatItem key={stat.label} stat={stat} started={started} />
      ))}
    </div>
  );
}
