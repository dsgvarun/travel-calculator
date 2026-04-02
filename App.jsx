import { useState, useEffect, useRef } from "react";

const DEFAULTS = {
  employees: 900,
  adoptionRate: 40,
  tripsPerUser: 2,
  avgFlightValue: 8000,
  avgHotelValue: 17000,
  flightMix: 40,
  hotelCommission: 12,
  flightFee: 300,
  convenienceFee: 200,
  ancillaryRate: 5,
  corporateRouting: false,
  corporateGMV: 1000000,
  corporateCommission: 8,
  mice: false,
  miceGMV: 500000,
  miceCommission: 10,
};

function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = display;
    const end = value;
    const duration = 600;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);

  const fmt = (n) =>
    decimals > 0
      ? n.toFixed(decimals)
      : Math.round(n).toLocaleString("en-IN");

  return (
    <span>
      {prefix}
      {fmt(display)}
      {suffix}
    </span>
  );
}

function Slider({ label, min, max, step = 1, value, onChange, format = (v) => v, hint }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", fontFamily: "'DM Mono', monospace" }}>{format(value)}</span>
      </div>
      <div style={{ position: "relative", height: 6, background: "#1e293b", borderRadius: 3 }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #f97316, #fb923c)", borderRadius: 3, transition: "width 0.1s" }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ position: "absolute", inset: 0, width: "100%", opacity: 0, cursor: "pointer", height: "100%", margin: 0 }}
        />
        <div style={{ position: "absolute", top: "50%", left: `${pct}%`, transform: "translate(-50%, -50%)", width: 14, height: 14, borderRadius: "50%", background: "#fb923c", border: "2px solid #0f172a", pointerEvents: "none", transition: "left 0.1s" }} />
      </div>
      {hint && <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function Toggle({ label, value, onChange, hint }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1e293b" }}>
      <div>
        <div style={{ fontSize: 13, color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: "#475569" }}>{hint}</div>}
      </div>
      <button onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, background: value ? "#f97316" : "#1e293b", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
        <div style={{ position: "absolute", top: 3, left: value ? 22 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
      </button>
    </div>
  );
}

function Section({ title, children, accent = "#f97316" }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 3, height: 16, borderRadius: 2, background: accent }} />
        <span style={{ fontSize: 11, color: accent, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function MetricCard({ label, value, sub, accent = "#f97316", large }) {
  return (
    <div style={{
      background: "#0f172a",
      border: `1px solid ${accent}22`,
      borderRadius: 12,
      padding: large ? "20px 24px" : "16px 18px",
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: large ? 28 : 20, fontWeight: 800, color: accent, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export default function TravelRevenueCalculator() {
  const [s, setS] = useState(DEFAULTS);
  const set = (k) => (v) => setS((prev) => ({ ...prev, [k]: v }));

  // Calculations
  const activeUsers = Math.round(s.employees * s.adoptionRate / 100);
  const totalBookings = activeUsers * s.tripsPerUser;
  const avgBookingValue = (s.flightMix / 100) * s.avgFlightValue + (1 - s.flightMix / 100) * s.avgHotelValue;
  const leisureGMV = totalBookings * avgBookingValue;

  // Revenue from leisure
  const hotelGMV = leisureGMV * (1 - s.flightMix / 100);
  const flightGMV = leisureGMV * (s.flightMix / 100);
  const flightBookings = totalBookings * (s.flightMix / 100);

  const hotelRevenue = hotelGMV * s.hotelCommission / 100;
  const flightRevenue = flightBookings * s.flightFee;
  const convenienceRevenue = totalBookings * s.convenienceFee;
  const ancillaryRevenue = leisureGMV * s.ancillaryRate / 100;

  // Corporate
  const corpRevenue = s.corporateRouting ? s.corporateGMV * s.corporateCommission / 100 : 0;

  // MICE
  const miceRevenue = s.mice ? s.miceGMV * s.miceCommission / 100 : 0;

  const totalRevenue = hotelRevenue + flightRevenue + convenienceRevenue + ancillaryRevenue + corpRevenue + miceRevenue;
  const totalGMV = leisureGMV + (s.corporateRouting ? s.corporateGMV : 0) + (s.mice ? s.miceGMV : 0);
  const blendedTake = totalGMV > 0 ? (totalRevenue / totalGMV) * 100 : 0;

  const inr = (n) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${Math.round(n).toLocaleString("en-IN")}`;
  };

  const streams = [
    { label: "Hotel Commissions", value: hotelRevenue, color: "#f97316" },
    { label: "Flight Fees", value: flightRevenue, color: "#fb923c" },
    { label: "Convenience Fees", value: convenienceRevenue, color: "#fdba74" },
    { label: "Ancillaries", value: ancillaryRevenue, color: "#fed7aa" },
    ...(s.corporateRouting ? [{ label: "Corporate Travel", value: corpRevenue, color: "#22d3ee" }] : []),
    ...(s.mice ? [{ label: "MICE / Events", value: miceRevenue, color: "#a78bfa" }] : []),
  ];
  const maxStream = Math.max(...streams.map((s) => s.value), 1);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#020617",
      fontFamily: "'DM Sans', sans-serif",
      color: "#e2e8f0",
      padding: "0 0 60px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #f97316; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "40px 32px 24px", borderBottom: "1px solid #1e293b", background: "linear-gradient(180deg, #0f172a 0%, #020617 100%)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>Dream Sports · Travel Portal</div>
          <h1 style={{ fontSize: 36, fontFamily: "'Syne', sans-serif", fontWeight: 800, margin: 0, lineHeight: 1.1, background: "linear-gradient(135deg, #fff 0%, #94a3b8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Year 1 Revenue Calculator
          </h1>
          <p style={{ color: "#475569", fontSize: 14, marginTop: 10, marginBottom: 0 }}>
            Model your travel portal's potential across leisure, corporate & MICE segments.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px 0" }}>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>

          {/* Controls */}
          <div style={{ flex: "1 1 340px", minWidth: 300 }}>

            <Section title="Workforce">
              <Slider label="Total Employees" min={100} max={2000} step={50} value={s.employees} onChange={set("employees")} format={(v) => v.toLocaleString()} />
              <Slider label="Portal Adoption Rate" min={5} max={90} value={s.adoptionRate} onChange={set("adoptionRate")} format={(v) => `${v}%`} hint="% of employees who book at least once" />
              <Slider label="Trips per Active User / Year" min={1} max={8} value={s.tripsPerUser} onChange={set("tripsPerUser")} format={(v) => `${v} trips`} />
            </Section>

            <Section title="Booking Profile">
              <Slider label="Avg Flight Booking Value" min={3000} max={25000} step={500} value={s.avgFlightValue} onChange={set("avgFlightValue")} format={(v) => `₹${v.toLocaleString()}`} />
              <Slider label="Avg Hotel Booking Value" min={5000} max={50000} step={500} value={s.avgHotelValue} onChange={set("avgHotelValue")} format={(v) => `₹${v.toLocaleString()}`} />
              <Slider label="Flight vs Hotel Mix" min={10} max={90} value={s.flightMix} onChange={set("flightMix")} format={(v) => `${v}% Flights`} hint={`Remaining ${100 - s.flightMix}% are hotel bookings`} />
            </Section>

            <Section title="Revenue Rates" accent="#22d3ee">
              <Slider label="Hotel Commission Rate" min={5} max={20} value={s.hotelCommission} onChange={set("hotelCommission")} format={(v) => `${v}%`} hint="Typically 10–15% from hotel suppliers" />
              <Slider label="Flight Fee per Booking" min={100} max={800} step={50} value={s.flightFee} onChange={set("flightFee")} format={(v) => `₹${v}`} hint="Flat fee per flight booking" />
              <Slider label="Convenience Fee per Booking" min={0} max={500} step={50} value={s.convenienceFee} onChange={set("convenienceFee")} format={(v) => `₹${v}`} />
              <Slider label="Ancillary Revenue Rate" min={0} max={15} value={s.ancillaryRate} onChange={set("ancillaryRate")} format={(v) => `${v}%`} hint="Insurance, transfers, add-ons" />
            </Section>

            <Section title="Unlock More Revenue" accent="#a78bfa">
              <Toggle label="Route Corporate Travel" value={s.corporateRouting} onChange={set("corporateRouting")} hint="Business trips through the same portal" />
              {s.corporateRouting && (
                <div style={{ paddingTop: 12 }}>
                  <Slider label="Corporate Travel GMV" min={500000} max={10000000} step={100000} value={s.corporateGMV} onChange={set("corporateGMV")} format={(v) => inr(v)} />
                  <Slider label="Corporate Commission %" min={3} max={12} value={s.corporateCommission} onChange={set("corporateCommission")} format={(v) => `${v}%`} />
                </div>
              )}
              <Toggle label="Include MICE / Events" value={s.mice} onChange={set("mice")} hint="Masterclasses, offsites, team events" />
              {s.mice && (
                <div style={{ paddingTop: 12 }}>
                  <Slider label="MICE GMV" min={200000} max={5000000} step={100000} value={s.miceGMV} onChange={set("miceGMV")} format={(v) => inr(v)} />
                  <Slider label="MICE Commission %" min={5} max={20} value={s.miceCommission} onChange={set("miceCommission")} format={(v) => `${v}%`} />
                </div>
              )}
            </Section>
          </div>

          {/* Results */}
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <div style={{ position: "sticky", top: 24 }}>

              {/* Hero metric */}
              <div style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e1035 100%)",
                border: "1px solid #f9731633",
                borderRadius: 16,
                padding: "28px 24px",
                marginBottom: 20,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, #f9731611 0%, transparent 70%)", pointerEvents: "none" }} />
                <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>Year 1 Revenue Potential</div>
                <div style={{ fontSize: 52, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fb923c", lineHeight: 1 }}>
                  {inr(totalRevenue)}
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>on {inr(totalGMV)} GMV · {blendedTake.toFixed(1)}% take rate</div>
              </div>

              {/* Key metrics */}
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <MetricCard label="Active Users" value={activeUsers.toLocaleString()} sub={`${s.adoptionRate}% of ${s.employees}`} />
                <MetricCard label="Total Bookings" value={totalBookings.toLocaleString()} sub={`${s.tripsPerUser} trips/user`} />
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <MetricCard label="Avg Booking Value" value={`₹${Math.round(avgBookingValue).toLocaleString()}`} sub="blended flight+hotel" accent="#22d3ee" />
                <MetricCard label="Revenue / Employee" value={`₹${Math.round(totalRevenue / s.employees).toLocaleString()}`} sub="across all 900" accent="#22d3ee" />
              </div>

              {/* Revenue breakdown */}
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 18px", marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Revenue Breakdown</div>
                {streams.map((stream) => (
                  <div key={stream.label} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>{stream.label}</span>
                      <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: stream.color, fontWeight: 600 }}>{inr(stream.value)}</span>
                    </div>
                    <div style={{ height: 4, background: "#1e293b", borderRadius: 2 }}>
                      <div style={{
                        height: "100%",
                        width: `${(stream.value / maxStream) * 100}%`,
                        background: stream.color,
                        borderRadius: 2,
                        transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
                        minWidth: stream.value > 0 ? 4 : 0,
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Scenario summary */}
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "18px" }}>
                <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 14 }}>Scenario Benchmarks</div>
                {[
                  { label: "Bear Case", desc: "20% adoption, no extras", gmv: 900*0.2*2*12500, take: 0.06, color: "#ef4444" },
                  { label: "Base Case", desc: "40% adoption, hotel+flight mix", gmv: 900*0.4*2*15000, take: 0.083, color: "#f97316" },
                  { label: "Bull Case", desc: "60% adoption + corporate + MICE", gmv: 900*0.6*2*18000 + 1000000 + 500000, take: 0.10, color: "#22c55e" },
                ].map((sc) => (
                  <div key={sc.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1e293b" }}>
                    <div>
                      <div style={{ fontSize: 12, color: sc.color, fontWeight: 700 }}>{sc.label}</div>
                      <div style={{ fontSize: 10, color: "#475569" }}>{sc.desc}</div>
                    </div>
                    <div style={{ fontSize: 14, fontFamily: "'DM Mono', monospace", color: "#e2e8f0", fontWeight: 700 }}>{inr(sc.gmv * sc.take)}</div>
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: "10px 12px", background: "#0f172a", borderRadius: 8, border: "1px solid #f9731622" }}>
                  <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>Your current model</div>
                  <div style={{ fontSize: 18, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fb923c" }}>{inr(totalRevenue)}</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
