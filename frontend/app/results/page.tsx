"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/api";

interface Team {
  id: number;
  name: string;
}

interface Match {
  id: number;
  roundName: string;
  scoreA: number;
  scoreB: number;
  winnerId: number | null;
  status: string;
  teamA: Team;
  teamB: Team | null;
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
    fetch(`${API_URL}/matches`)
      .then((r) => r.json())
      .then((data) => {
        const matches = Array.isArray(data) ? data : [];
        const completed = matches.filter(m => m.status === 'completed');
        const byRound: Record<string, Match[]> = {};
        let totalGoals = 0;

        completed.forEach(m => {
          if (!byRound[m.roundName]) byRound[m.roundName] = [];
          byRound[m.roundName].push(m);
          totalGoals += (m.scoreA || 0) + (m.scoreB || 0);
        });

        setData({
          matches: completed,
          byRound,
          stats: {
            total: completed.length,
            completed: completed.length,
            goals: totalGoals
          }
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ color: "var(--text-muted)", fontFamily: "DM Mono, monospace", padding: 40 }}>SYNCING RESULTS...</p>;
  if (!data) return null;

  const rounds = Object.keys(data.byRound);

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8">
        <h1 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "2.5rem", color: "var(--accent)", letterSpacing: "0.06em", textShadow: "0 0 30px #e8ff3c55" }}>
          TOURNAMENT RESULTS
        </h1>
        <p style={{ color: "var(--text-muted)", fontFamily: "DM Mono, monospace", fontSize: "0.8rem", marginTop: 4 }}>
          History of the Arena
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        {[
          { label: "MATCHES PLAYED", value: data.stats.total },
          { label: "ROUNDS", value: rounds.length },
          { label: "TOTAL GOALS", value: data.stats.goals },
        ].map((s, i) => (
          <div key={s.label} style={{ ...glassCard, padding: "16px 24px", flex: "1 1 120px", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #e8ff3c, transparent)", opacity: 0.5 }} />
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: "2rem", color: "var(--accent)", fontWeight: 500, textShadow: "0 0 16px #e8ff3c55" }}>{s.value}</div>
            <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", letterSpacing: "0.05em", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {rounds.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontFamily: "DM Mono, monospace", textAlign: "center", padding: "40px 0" }}>No completed matches yet.</p>
      ) : (
        rounds.map((roundName, ri) => {
          const rMatches = data.byRound[roundName] || [];
          return (
            <div key={roundName} style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "1.4rem", color: "var(--accent)", letterSpacing: "0.05em", marginBottom: 14, borderBottom: "1px solid rgba(232,255,60,0.3)", paddingBottom: 8 }}>
                {roundName.toUpperCase()}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {rMatches.map((m, mi) => (
                  <div key={m.id} style={{ ...glassCard, padding: "14px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ flex: 1, fontFamily: "Bebas Neue, sans-serif", fontSize: "1.05rem", color: m.winnerId === m.teamA.id ? "#4eff8c" : "var(--text)" }}>
                      {m.teamA.name}
                      {m.winnerId === m.teamA.id && <span style={{ marginLeft: 8, fontSize: "0.65rem", background: "rgba(78,255,140,0.12)", color: "#4eff8c", padding: "1px 6px", borderRadius: 3, border: "1px solid rgba(78,255,140,0.3)" }}>WINNER</span>}
                    </span>

                    <span style={{ fontFamily: "DM Mono, monospace", fontSize: "1.1rem", color: "var(--text)", minWidth: 70, textAlign: "center" }}>
                      {!m.teamB ? "BYE" : `${m.scoreA} — ${m.scoreB}`}
                    </span>

                    <span style={{ flex: 1, textAlign: "right", fontFamily: "Bebas Neue, sans-serif", fontSize: "1.05rem", color: m.teamB && m.winnerId === m.teamB.id ? "#4eff8c" : "var(--text)" }}>
                      {m.teamB && m.winnerId === m.teamB.id && <span style={{ marginRight: 8, fontSize: "0.65rem", background: "rgba(78,255,140,0.12)", color: "#4eff8c", padding: "1px 6px", borderRadius: 3, border: "1px solid rgba(78,255,140,0.3)" }}>WINNER</span>}
                      {m.teamB?.name ?? "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </motion.div>
  );
}
