import AnimatedSection from "./components/AnimatedSection";
import ApplyForm from "./components/ApplyForm";
import Header from "./components/Header";

/* ─── Icons ─── */
function Icon({ name }: { name: string }) {
  const p = {
    width: 22, height: 22, viewBox: "0 0 24 24",
    fill: "none" as const, stroke: "#FF3B30", strokeWidth: 2,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "map-pin":     return <svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
    case "zap":         return <svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
    case "truck":       return <svg {...p}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
    case "database":    return <svg {...p}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
    case "credit-card": return <svg {...p}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
    case "clock":       return <svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    default:            return null;
  }
}

/* ─── Dashboard mockup ─── */
function DashboardMockup() {
  return (
    <div style={{
      background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: 16,
      boxShadow: "0 32px 80px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06)",
      overflow: "hidden", width: "100%", maxWidth: 440,
    }}>
      {/* Browser chrome */}
      <div style={{ background: "#F9F9F9", borderBottom: "1px solid #EBEBEB", padding: "10px 16px", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF3B30" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
        <div style={{ flex: 1, marginLeft: 8, background: "white", border: "1px solid #E5E5E5", borderRadius: 5, height: 22, display: "flex", alignItems: "center", paddingLeft: 10 }}>
          <span style={{ fontSize: 10, color: "#aaa", fontFamily: "system-ui" }}>seller.notmade.in/dashboard</span>
        </div>
      </div>

      {/* Dashboard header */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #F0F0F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', cursive", fontSize: 18, letterSpacing: "0.05em", color: "#1A1A1A" }}>NOTMADE</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#C8F542", background: "#1A1A1A", padding: "3px 10px", borderRadius: 100 }}>SELLER</span>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid #F0F0F0" }}>
        {[
          { val: "₹24K", label: "Revenue", color: "#1A1A1A" },
          { val: "47", label: "Orders", color: "#1A1A1A" },
          { val: "7d", label: "Payout", color: "#FF3B30" },
        ].map((s, i) => (
          <div key={i} style={{ padding: "16px", borderRight: i < 2 ? "1px solid #F0F0F0" : "none", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1, fontFamily: "system-ui" }}>{s.val}</div>
            <div style={{ fontSize: 10, color: "#999", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Orders */}
      <div style={{ padding: "0 20px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#bbb", textTransform: "uppercase", padding: "14px 0 8px" }}>Recent Orders</div>
        {[
          { name: "Handwoven Tote Bag", id: "#NM-2891", status: "Delivered",  amt: "₹2,400", sc: "#22c55e" },
          { name: "Block Print Kurta",  id: "#NM-2890", status: "In Transit", amt: "₹3,800", sc: "#FF3B30" },
          { name: "Silver Jhumki Pair", id: "#NM-2889", status: "Processing", amt: "₹1,200", sc: "#999999" },
        ].map(o => (
          <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F5F5F5" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A" }}>{o.name}</div>
              <div style={{ fontSize: 10, color: "#ccc" }}>{o.id}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1A1A" }}>{o.amt}</div>
              <div style={{ fontSize: 10, color: o.sc, fontWeight: 600 }}>{o.status}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Payout banner */}
      <div style={{ margin: "12px 20px 20px", background: "#0B0B0C", borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Next Payout</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#C8F542", lineHeight: 1.2, fontFamily: "system-ui" }}>₹8,200</div>
        </div>
        <div style={{ background: "#FF3B30", color: "white", fontSize: 10, fontWeight: 700, padding: "8px 14px", borderRadius: 6, letterSpacing: "0.06em" }}>IN 4 DAYS</div>
      </div>
    </div>
  );
}

/* ─── Data ─── */
const WHY_CARDS = [
  { icon: "map-pin",     title: "SELL FROM YOUR LOCATION",    desc: "No warehouse needed. Sell from Delhi, Mumbai, Jaipur — anywhere in India." },
  { icon: "zap",         title: "DELHI NCR: 3 HOURS",         desc: "Flagship 3-hour delivery for Delhi NCR sellers. Your customer orders at 2PM, receives by 5PM." },
  { icon: "truck",       title: "PAN INDIA: 3-5 DAYS",        desc: "Standard delivery across all of India. Your products, everywhere." },
  { icon: "database",    title: "YOUR CUSTOMERS, YOUR DATA",   desc: "Access your complete buyer database at nominal cost. Know who bought and what they loved." },
  { icon: "credit-card", title: "ZERO UPFRONT COST",          desc: "No listing fees. No mandatory ad spend. Just list your product and go live." },
  { icon: "clock",       title: "7-DAY PAYOUTS",              desc: "We pay within 7 days of delivery. Not 30, not 45. Seven. Because your cash flow matters." },
];

const COMING_SOON = [
  { title: "Seller Dashboard",    desc: "Manage orders, track payouts, add/remove products from one place." },
  { title: "UAE Expansion",       desc: "Sell across Gulf markets. Commission revised. No additional cost." },
  { title: "COD & Returns",       desc: "Enable or disable COD and returns on your own terms." },
  { title: "Advanced Analytics",  desc: "In-house tech for better data visibility and customer insights." },
];

const STEPS = [
  { num: "01", title: "FILL THE FORM", desc: "Takes 2 minutes." },
  { num: "02", title: "WE CONNECT",    desc: "Our team reaches out within 48 hours." },
  { num: "03", title: "GO LIVE",       desc: "We handle listing. You handle the product." },
];

const STATS = [
  { num: "0%",    label: "Zero upfront cost" },
  { num: "17%",   label: "Flat commission" },
  { num: "7 Days", label: "Payout cycle" },
];

/* ─── Page ─── */
export default function Home() {
  return (
    <main style={{ background: "#FFFFFF" }}>
      <Header />

      {/* ════ HERO ════ */}
      <section style={{ paddingTop: 64, background: "#FFFFFF", minHeight: "90vh", display: "flex", alignItems: "center" }}>
        <div className="hero-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 28px", width: "100%" }}>

          {/* Left */}
          <AnimatedSection>
            <div>
              {/* Badge */}
              <span style={{
                display: "inline-flex", alignItems: "center",
                background: "#FF3B30", color: "#FFFFFF",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "6px 16px", borderRadius: 100,
                fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
                marginBottom: 28,
              }}>
                Fashion &amp; Lifestyle Marketplace
              </span>

              {/* H1 */}
              <h1 style={{
                fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                fontSize: "clamp(3rem, 5.5vw, 68px)",
                fontWeight: 400, lineHeight: 1.0, letterSpacing: "0.02em",
                color: "#1A1A1A", marginBottom: 24, maxWidth: 580,
              }}>
                Sell from where you are.<br />
                Reach customers everywhere.
              </h1>

              {/* Subtext */}
              <p style={{
                fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
                fontSize: 17, color: "#666666", lineHeight: 1.65,
                maxWidth: 460, marginBottom: 36,
              }}>
                NOTMADE is India&apos;s culture-first fashion and lifestyle marketplace — built for independent sellers who make things worth selling.
              </p>

              {/* CTAs */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 52 }}>
                <a href="#apply" className="btn-primary" style={{ fontSize: 16, padding: "14px 32px", textDecoration: "none", borderRadius: 0 }}>
                  START SELLING →
                </a>
                <a href="mailto:admin@notmade.in" className="btn-outlined" style={{ fontSize: 16, padding: "14px 32px", textDecoration: "none" }}>
                  TALK TO US
                </a>
              </div>

              {/* Stats */}
              <div className="stats-row" style={{ paddingTop: 32, borderTop: "1px solid #E5E5E5" }}>
                {STATS.map((s, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", paddingRight: i < 2 ? 40 : 0, borderRight: i < 2 ? "1px solid #E5E5E5" : "none" }}>
                    <span style={{
                      fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                      fontSize: 40, color: "#1A1A1A", lineHeight: 1,
                    }}>{s.num}</span>
                    <span style={{
                      fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
                      fontSize: 12, color: "#888", marginTop: 4,
                    }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Right — CSS dashboard mockup */}
          <div className="hero-visual" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ════ TRUST BAR ════ */}
      <section style={{ background: "#F5F5F5", borderTop: "1px solid #E5E5E5", borderBottom: "1px solid #E5E5E5", padding: "28px 28px" }}>
        <div className="trust-items" style={{ maxWidth: 1200, margin: "0 auto" }}>
          {[
            "Delhi NCR — 3 Hour Delivery",
            "Pan India — 3-5 Days",
            "Zero Ad Spend to Start",
          ].map((item, i) => (
            <>
              {i > 0 && <div key={`sep-${i}`} className="trust-sep" />}
              <span key={item} style={{
                fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
                fontSize: 14, fontWeight: 500, color: "#1A1A1A",
              }}>{item}</span>
            </>
          ))}
        </div>
      </section>

      {/* ════ WHY NOTMADE ════ */}
      <section id="why" style={{ background: "#FFFFFF", padding: "100px 0 120px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <AnimatedSection>
            <div style={{ marginBottom: 64 }}>
              <h2 style={{
                fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                fontSize: "clamp(2.5rem, 6vw, 72px)",
                fontWeight: 400, lineHeight: 1, letterSpacing: "0.02em",
                color: "#1A1A1A", marginBottom: 12,
              }}>Why sellers choose NOTMADE</h2>
              <p style={{
                fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
                fontSize: 16, color: "#666666",
              }}>Built for independent sellers. Not big brands.</p>
            </div>
          </AnimatedSection>

          <div className="why-grid">
            {WHY_CARDS.map((card, i) => (
              <AnimatedSection key={i} delay={i * 60}>
                <div className="why-card" style={{
                  background: "#0B0B0C", borderRadius: 12,
                  padding: "32px 28px", height: "100%",
                  display: "flex", flexDirection: "column", gap: 16,
                }}>
                  <div style={{
                    width: 44, height: 44,
                    background: "rgba(255,59,48,0.12)",
                    border: "1px solid rgba(255,59,48,0.22)",
                    borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Icon name={card.icon} />
                  </div>
                  <h3 style={{
                    fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                    fontSize: "clamp(1.3rem, 2.2vw, 24px)",
                    fontWeight: 400, letterSpacing: "0.03em",
                    color: "#FFFFFF", lineHeight: 1.1, margin: 0,
                  }}>{card.title}</h3>
                  <p style={{
                    fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
                    fontSize: 14, color: "rgba(255,255,255,0.52)",
                    lineHeight: 1.75, margin: 0, flex: 1,
                  }}>{card.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════ COMMISSION ════ */}
      <section style={{ background: "#0B0B0C", padding: "100px 28px", textAlign: "center" }}>
        <AnimatedSection>
          <div style={{
            fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
            fontSize: "clamp(8rem, 22vw, 240px)",
            color: "#FF3B30", lineHeight: 0.85, letterSpacing: "0.02em", marginBottom: 32,
          }}>17%</div>
          <p style={{
            fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
            fontSize: "clamp(1rem, 2.5vw, 20px)",
            color: "#FFFFFF", fontWeight: 600, marginBottom: 16, maxWidth: 560, margin: "0 auto 16px",
          }}>Flat commission. Nothing hidden. No surprise deductions.</p>
          <p style={{
            fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
            fontSize: 15, color: "rgba(255,255,255,0.4)",
          }}>COD available. Returns flexible as per your preference.</p>
        </AnimatedSection>
      </section>

      {/* ════ WHAT'S COMING ════ */}
      <section style={{ background: "#FFFFFF", padding: "100px 0 120px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <AnimatedSection>
            <div style={{ marginBottom: 64 }}>
              <h2 style={{
                fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                fontSize: "clamp(2.5rem, 6vw, 72px)",
                fontWeight: 400, lineHeight: 1, letterSpacing: "0.02em",
                color: "#1A1A1A", marginBottom: 12,
              }}>We&apos;re just getting started.</h2>
              <p style={{
                fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
                fontSize: 16, color: "#666666",
              }}>More tools. More markets. More control.</p>
            </div>
          </AnimatedSection>

          <div className="coming-grid">
            {COMING_SOON.map((item, i) => (
              <AnimatedSection key={i} delay={i * 60}>
                <div style={{
                  background: "#F5F5F5", border: "1px solid #E5E5E5",
                  borderRadius: 12, padding: "28px 24px", height: "100%",
                  display: "flex", flexDirection: "column", gap: 14,
                }}>
                  <span style={{
                    display: "inline-block", background: "#C8F542", color: "#0B0B0C",
                    fontSize: 10, fontWeight: 800, letterSpacing: "0.14em",
                    textTransform: "uppercase", padding: "4px 10px", borderRadius: 4,
                    fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
                    alignSelf: "flex-start",
                  }}>COMING SOON</span>
                  <h3 style={{
                    fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                    fontSize: "clamp(1.3rem, 2vw, 22px)",
                    fontWeight: 400, letterSpacing: "0.03em",
                    color: "#1A1A1A", margin: 0,
                  }}>{item.title}</h3>
                  <p style={{
                    fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
                    fontSize: 14, color: "#666", lineHeight: 1.65, margin: 0,
                  }}>{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════ HOW IT WORKS ════ */}
      <section id="how" style={{ background: "#F5F5F5", borderTop: "1px solid #E5E5E5", borderBottom: "1px solid #E5E5E5", padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <AnimatedSection>
            <h2 style={{
              fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
              fontSize: "clamp(2.5rem, 6vw, 72px)",
              fontWeight: 400, lineHeight: 1, letterSpacing: "0.02em",
              color: "#1A1A1A", marginBottom: 64,
            }}>HOW IT WORKS</h2>
          </AnimatedSection>

          <div className="steps-grid">
            {STEPS.map((step, i) => (
              <AnimatedSection key={step.num} delay={i * 80}>
                <div className="step-item" style={{ padding: "40px 36px", borderLeft: i > 0 ? "1px solid #E5E5E5" : "none" }}>
                  <div style={{
                    fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                    fontSize: "clamp(5rem, 10vw, 96px)",
                    color: "#FF3B30", lineHeight: 0.85, letterSpacing: "0.01em", marginBottom: 24,
                  }}>{step.num}</div>
                  <h3 style={{
                    fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                    fontSize: "clamp(1.4rem, 2.5vw, 26px)",
                    fontWeight: 400, letterSpacing: "0.04em",
                    color: "#1A1A1A", marginBottom: 12,
                  }}>{step.title}</h3>
                  <p style={{
                    fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
                    fontSize: 15, color: "#666666", lineHeight: 1.65,
                  }}>{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════ APPLY FORM ════ */}
      <section id="apply" style={{ background: "#0B0B0C", padding: "100px 0 120px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 28px" }}>
          <AnimatedSection>
            <h2 style={{
              fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
              fontSize: "clamp(2.5rem, 7vw, 72px)",
              fontWeight: 400, lineHeight: 1, letterSpacing: "0.02em",
              color: "#FFFFFF", marginBottom: 16, textAlign: "center",
            }}>Ready to sell on NOTMADE?</h2>
            <p style={{
              fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
              fontSize: 16, color: "#666666", textAlign: "center",
              marginBottom: 48, lineHeight: 1.6,
            }}>Fill this out. Our team connects within 48 hours.</p>
          </AnimatedSection>

          <AnimatedSection delay={60}>
            <ApplyForm />
          </AnimatedSection>
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <footer style={{ background: "#0B0B0C", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "56px 28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
          <span style={{
            fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
            fontSize: 24, letterSpacing: "0.04em", color: "#FFFFFF",
          }}>NOTMADE</span>
          <p style={{
            fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
            fontSize: 13, color: "rgba(255,255,255,0.35)",
          }}>seller.notmade.in — A NOTMADE PLATFORM</p>
          <p style={{
            fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
            fontSize: 13, color: "rgba(255,255,255,0.22)",
          }}>House of Notmade Studio Private Limited · Delhi NCR · India</p>
          <nav style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <a href="/privacy-policy" className="footer-pill">Privacy Policy</a>
            <a href="/terms" className="footer-pill">Terms</a>
            <a href="mailto:admin@notmade.in" className="footer-pill">Contact</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
