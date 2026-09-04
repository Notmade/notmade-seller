const STATS = [
  { value: "17%", label: "Commission" },
  { value: "₹0",     label: "Hidden fees" },
  { value: "2 hrs",  label: "Delhi delivery" },
  { value: "24 hrs", label: "Support response" },
];

export default function CounterStats() {
  return (
    <div
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
            {stat.value}
          </div>
          <div
            className="font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: "#888888" }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
