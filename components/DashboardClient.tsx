"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

// --- Ripple helper ---
function addRipple(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const span = document.createElement("span");
  span.style.cssText = `
    position:absolute;width:${size}px;height:${size}px;
    border-radius:50%;background:rgba(232,255,60,0.25);
    transform:scale(0);animation:ripple-out 0.55s ease-out forwards;
    left:${e.clientX - rect.left - size / 2}px;
    top:${e.clientY - rect.top - size / 2}px;
    pointer-events:none;
  `;
  el.style.position = "relative";
  el.style.overflow = "hidden";
  el.appendChild(span);
  span.addEventListener("animationend", () => span.remove());
}

// --- Animated counter ---
function Counter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || typeof target !== "number") return;
    if (target === 0) return;
    let frame = 0;
    const totalFrames = 60;
    const timer = setInterval(() => {
      frame++;
      setCount(Math.round((frame / totalFrames) * target));
      if (frame >= totalFrames) clearInterval(timer);
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{typeof target === "number" ? count : target}</span>;
}

// --- 3D Soccer ball ---
function SoccerBall() {
  return (
    <motion.div
      animate={{ y: [0, -18, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      style={{ position: "relative", width: 160, height: 160 }}
    >
      {/* Outer glow ring */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: -16,
          borderRadius: "50%",
          background: "radial-gradient(circle, #e8ff3c22 0%, transparent 70%)",
          filter: "blur(12px)",
        }}
      />
      {/* Ball */}
      <motion.div
        animate={{ rotateZ: [0, 360] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        style={{ width: 160, height: 160 }}
      >
        <svg width="160" height="160" viewBox="0 0 160 160">
          <defs>
            <radialGradient id="ballGrad" cx="38%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#2a2a40" />
              <stop offset="50%" stopColor="#141420" />
              <stop offset="100%" stopColor="#08080f" />
            </radialGradient>
            <filter id="ballGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Ball body */}
          <circle cx="80" cy="80" r="76" fill="url(#ballGrad)" stroke="#e8ff3c" strokeWidth="0.8" strokeOpacity="0.35" />
          {/* Central hexagon */}
          <polygon
            points="80,52 100,64 100,88 80,100 60,88 60,64"
            fill="#e8ff3c12"
            stroke="#e8ff3c"
            strokeWidth="1.5"
            strokeOpacity="0.65"
            filter="url(#ballGlow)"
          />
          {/* Connector lines to edge hexagons */}
          <line x1="80" y1="52" x2="80" y2="26" stroke="#e8ff3c" strokeWidth="1" strokeOpacity="0.35" />
          <line x1="100" y1="64" x2="122" y2="52" stroke="#e8ff3c" strokeWidth="1" strokeOpacity="0.35" />
          <line x1="100" y1="88" x2="122" y2="100" stroke="#e8ff3c" strokeWidth="1" strokeOpacity="0.35" />
          <line x1="80" y1="100" x2="80" y2="126" stroke="#e8ff3c" strokeWidth="1" strokeOpacity="0.35" />
          <line x1="60" y1="88" x2="38" y2="100" stroke="#e8ff3c" strokeWidth="1" strokeOpacity="0.35" />
          <line x1="60" y1="64" x2="38" y2="52" stroke="#e8ff3c" strokeWidth="1" strokeOpacity="0.35" />
          {/* Partial surrounding hexagons */}
          <polygon points="80,26 96,17 110,26 110,44 96,53 80,44" fill="none" stroke="#e8ff3c" strokeWidth="1" strokeOpacity="0.3" />
          <polygon points="122,52 138,43 152,52 152,70 138,79 122,70" fill="none" stroke="#e8ff3c" strokeWidth="1" strokeOpacity="0.2" />
          <polygon points="80,126 96,117 110,126 110,144 96,153 80,144" fill="none" stroke="#e8ff3c" strokeWidth="1" strokeOpacity="0.2" />
          <polygon points="38,52 54,43 68,52 68,70 54,79 38,70" fill="none" stroke="#e8ff3c" strokeWidth="1" strokeOpacity="0.25" />
          {/* Shine highlight */}
          <ellipse cx="58" cy="54" rx="14" ry="9" fill="white" fillOpacity="0.07" transform="rotate(-20 58 54)" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// --- 3D tilt card ---
function TiltCard({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-4px)`;
    el.style.boxShadow = `0 12px 40px rgba(232,255,60,0.18), 0 0 0 1px rgba(232,255,60,0.2)`;
  }

  function handleMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)";
    el.style.boxShadow = "none";
  }

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// --- Glass stat card ---
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

interface StatItem {
  label: string;
  value: number | string;
  sub: string;
}

interface NavItem {
  href: string;
  label: string;
  desc: string;
  icon: string;
}

interface Match {
  id: number;
  round: number;
  score1: number | null;
  score2: number | null;
  winnerId: number | null;
  isBye: boolean;
  team1Id: number;
  team2Id: number | null;
  team1: { name: string };
  team2: { name: string } | null;
}

interface Props {
  stats: StatItem[];
  navItems: NavItem[];
  recentMatches: Match[];
}

export default function DashboardClient({ stats, navItems, recentMatches }: Props) {
  return (
    <div>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          marginBottom: 40,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            className="neon-text"
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "clamp(3rem, 8vw, 5.5rem)",
              letterSpacing: "0.06em",
              lineHeight: 1,
            }}
          >
            ROBOSOCCER
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              color: "var(--text-muted)",
              fontFamily: "DM Mono, monospace",
              fontSize: "0.8rem",
              marginTop: 8,
              letterSpacing: "0.12em",
            }}
          >
            TECHTONICS — TOURNAMENT MANAGER
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SoccerBall />
        </motion.div>
      </motion.div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <TiltCard
              style={{
                background: "var(--glass-bg)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid var(--glass-border)",
                borderRadius: 12,
                padding: "20px 24px",
                height: "100%",
                cursor: "default",
              }}
            >
              {/* Gradient border top accent */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  borderRadius: "12px 12px 0 0",
                  background: "linear-gradient(90deg, transparent, #e8ff3c, transparent)",
                  opacity: 0.6,
                }}
              />
              <div
                style={{
                  fontFamily: "DM Mono, monospace",
                  fontSize: "2.5rem",
                  color: "var(--accent)",
                  fontWeight: 500,
                  lineHeight: 1,
                  textShadow: "0 0 20px #e8ff3c60",
                }}
              >
                {typeof s.value === "number" ? <Counter target={s.value} /> : s.value}
              </div>
              <div
                style={{
                  fontFamily: "Bebas Neue, sans-serif",
                  fontSize: "0.95rem",
                  color: "var(--text)",
                  letterSpacing: "0.05em",
                  marginTop: 6,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: "DM Mono, monospace",
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  marginTop: 3,
                }}
              >
                {s.sub}
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {/* Nav cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {navItems.map((item, i) => (
          <motion.div
            key={item.href}
            custom={i + stats.length}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Link href={item.href} style={{ textDecoration: "none", display: "block", height: "100%" }}>
              <motion.div
                whileHover={{ y: -6, boxShadow: "0 16px 48px rgba(232,255,60,0.15), 0 0 0 1px rgba(232,255,60,0.25)" }}
                whileTap={{ scale: 0.97 }}
                onClick={addRipple}
                style={{
                  background: "var(--glass-bg)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(232,255,60,0.1)",
                  borderRadius: 12,
                  padding: "20px 24px",
                  cursor: "pointer",
                  height: "100%",
                  transition: "border-color 0.2s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onHoverStart={(e) => {
                  const el = (e.target as HTMLElement).closest("[data-navcard]") as HTMLElement;
                  if (el) el.style.borderColor = "rgba(232,255,60,0.3)";
                }}
              >
                {/* Corner accent */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 40,
                    height: 40,
                    background: "linear-gradient(225deg, #e8ff3c18, transparent)",
                    borderRadius: "0 12px 0 40px",
                  }}
                />
                <div style={{ fontSize: "1.4rem", marginBottom: 8 }}>{item.icon}</div>
                <div
                  style={{
                    fontFamily: "Bebas Neue, sans-serif",
                    fontSize: "1.1rem",
                    color: "var(--accent)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginTop: 4,
                  }}
                >
                  {item.desc}
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent results */}
      {recentMatches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.45 }}
          style={{ marginTop: 40 }}
        >
          <h2
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "1.4rem",
              color: "var(--text)",
              letterSpacing: "0.04em",
              marginBottom: 14,
            }}
          >
            RECENT RESULTS
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {recentMatches.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.06, duration: 0.35 }}
                style={{
                  background: "rgba(19,19,26,0.6)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(232,255,60,0.08)",
                  borderRadius: 8,
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: "DM Mono, monospace",
                    fontSize: "0.65rem",
                    color: "var(--text-muted)",
                    minWidth: 52,
                  }}
                >
                  RND {m.round}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: "0.9rem",
                    color:
                      m.winnerId === m.team1Id ? "var(--accent)" : "var(--text)",
                    fontWeight: m.winnerId === m.team1Id ? 600 : 400,
                  }}
                >
                  {m.team1.name}
                </span>
                <span
                  style={{
                    fontFamily: "DM Mono, monospace",
                    fontSize: "0.9rem",
                    color: "var(--text)",
                    minWidth: 60,
                    textAlign: "center",
                  }}
                >
                  {m.isBye ? "BYE" : `${m.score1} — ${m.score2}`}
                </span>
                <span
                  style={{
                    flex: 1,
                    textAlign: "right",
                    fontSize: "0.9rem",
                    color:
                      m.winnerId === m.team2Id ? "var(--accent)" : "var(--text)",
                    fontWeight: m.winnerId === m.team2Id ? 600 : 400,
                  }}
                >
                  {m.team2?.name ?? "BYE"}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
