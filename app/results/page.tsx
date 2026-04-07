"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Team {
  id: number;
  name: string;
}

interface Match {
  id: number;
  round: number;
  score1: number | null;
  score2: number | null;
  winnerId: number | null;
  isBye: boolean;
  team1: Team;
  team2: Team | null;
  winner: Team | null;
}

interface ResultsData {
  matches: Match[];
  byRound: Record<string, Match[]>;
  stats: { total: number; completed: number; goals: number };
}

const glassCard: React.CSSProperties = {
  background: "rgba(19,19,26,0.6)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(232,255,60,0.1)",
  borderRadius: 12,
};

export default function ResultsPage() {
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/results").then((r) => r.json()).then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <p style={{ color: "var(--text-muted)", fontFamily: "DM Mono, monospace" }}>Loading...</p>;
  if (!data) return null;

  const rounds = Object.keys(data.byRound).map(Number).sort((a, b) => a - b);
  const roundLabels: Record<number, string> = {};
  const maxRound = Math.max(...rounds, 0);
  for (const r of rounds) {
    if (r === maxRound && data.byRound[r].some((m) => !m.isBye)) {
      const nonBye = data.byRound[r].filter((m) => !m.isBye);
      if (nonBye.length === 1) roundLabels[r] = "FINAL";
      else if (nonBye.length <= 2) roundLabels[r] = "SEMIFINALS";
      else roundLabels[r] = `ROUND ${r}`;
    } else {
      roundLabels[r] = `ROUND ${r}`;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-8">
        <h1
          style={{
            fontFamily: "Bebas Neue, sans-serif",
            fontSize: "2.5rem",
            color: "var(--accent)",
            letterSpacing: "0.06em",
            lineHeight: 1,
            textShadow: "0 0 30px #e8ff3c55",
          }}
        >
          RESULTS
        </h1>
        <p style={{ color: "var(--text-muted)", fontFamily: "DM Mono, monospace", fontSize: "0.8rem", marginTop: 4 }}>
          All completed matches
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        {[
          { label: "MATCHES PLAYED", value: data.stats.total },
          { label: "ROUNDS", value: rounds.length },
          { label: "TOTAL GOALS", value: data.stats.goals },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(232,255,60,0.12)" }}
            style={{ ...glassCard, padding: "16px 24px", flex: "1 1 120px", position: "relative" }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                borderRadius: "12px 12px 0 0",
                background: "linear-gradient(90deg, transparent, #e8ff3c, transparent)",
                opacity: 0.5,
              }}
            />
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: "2rem", color: "var(--accent)", fontWeight: 500, textShadow: "0 0 16px #e8ff3c55" }}>
              {s.value}
            </div>
            <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", letterSpacing: "0.05em", marginTop: 4 }}>
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>

      {rounds.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontFamily: "DM Mono, monospace", textAlign: "center", padding: "40px 0" }}>
          No completed matches yet.
        </p>
      ) : (
        rounds.map((round, ri) => {
          const rMatches = data.byRound[round] || [];
          const label = roundLabels[round];
          const isHighlight = label === "FINAL" || label === "SEMIFINALS";
          return (
            <motion.div
              key={round}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + ri * 0.07, duration: 0.4 }}
              style={{ marginBottom: 32 }}
            >
              <h2
                style={{
                  fontFamily: "Bebas Neue, sans-serif",
                  fontSize: "1.4rem",
                  color: isHighlight ? "var(--accent)" : "var(--text)",
                  letterSpacing: "0.05em",
                  marginBottom: 14,
                  borderBottom: `1px solid ${isHighlight ? "rgba(232,255,60,0.3)" : "rgba(42,42,58,0.6)"}`,
                  paddingBottom: 8,
                  textShadow: isHighlight ? "0 0 20px #e8ff3c55" : "none",
                }}
              >
                {label}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {rMatches.map((m, mi) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + ri * 0.07 + mi * 0.04, duration: 0.35 }}
                    whileHover={{
                      borderColor: "rgba(232,255,60,0.25)",
                      boxShadow: "0 4px 20px rgba(232,255,60,0.08)",
                    }}
                    style={{
                      ...glassCard,
                      padding: "14px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        fontFamily: "Bebas Neue, sans-serif",
                        fontSize: "1.05rem",
                        letterSpacing: "0.04em",
                        color: m.winnerId === m.team1.id ? "#4eff8c" : "var(--text)",
                        textShadow: m.winnerId === m.team1.id ? "0 0 14px #4eff8c66" : "none",
                      }}
                    >
                      {m.team1.name}
                      {m.winnerId === m.team1.id && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: "0.65rem",
                            background: "rgba(78,255,140,0.12)",
                            color: "#4eff8c",
                            padding: "1px 6px",
                            borderRadius: 3,
                            border: "1px solid rgba(78,255,140,0.3)",
                          }}
                        >
                          WINNER
                        </span>
                      )}
                    </span>

                    <span
                      style={{
                        fontFamily: "DM Mono, monospace",
                        fontSize: "1.1rem",
                        color: "var(--text)",
                        minWidth: 70,
                        textAlign: "center",
                      }}
                    >
                      {m.isBye ? "BYE" : `${m.score1} — ${m.score2}`}
                    </span>

                    <span
                      style={{
                        flex: 1,
                        textAlign: "right",
                        fontFamily: "Bebas Neue, sans-serif",
                        fontSize: "1.05rem",
                        letterSpacing: "0.04em",
                        color: m.team2 && m.winnerId === m.team2.id ? "#4eff8c" : "var(--text)",
                        textShadow: m.team2 && m.winnerId === m.team2.id ? "0 0 14px #4eff8c66" : "none",
                      }}
                    >
                      {m.team2 && m.winnerId === m.team2.id && (
                        <span
                          style={{
                            marginRight: 8,
                            fontSize: "0.65rem",
                            background: "rgba(78,255,140,0.12)",
                            color: "#4eff8c",
                            padding: "1px 6px",
                            borderRadius: 3,
                            border: "1px solid rgba(78,255,140,0.3)",
                          }}
                        >
                          WINNER
                        </span>
                      )}
                      {m.team2?.name ?? "—"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })
      )}
    </motion.div>
  );
}
