"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/api";

interface Team {
  id: number;
  name: string;
  college: string;
}

interface Match {
  id: number;
  roundName: string;
  teamAId: number;
  teamBId: number | null;
  scoreA: number;
  scoreB: number;
  status: string;
}

interface LeaderboardEntry {
  id: number;
  name: string;
  college: string;
  gs: number;
  gc: number;
  gd: number;
  rank: number;
}

const glassCard: React.CSSProperties = {
  background: "rgba(19,19,26,0.6)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(232,255,60,0.1)",
  borderRadius: 12,
};

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tr, mr] = await Promise.all([
          fetch(`${API_URL}/teams`),
          fetch(`${API_URL}/matches`),
        ]);
        const teams: Team[] = await tr.json();
        const matches: Match[] = await mr.json();

        const qualifierMatches = matches.filter(
          (m) => m.roundName === "Stage 1 (Qualifier)" && m.status === "completed"
        );

        const statsMap: Record<number, { gs: number; gc: number }> = {};
        teams.forEach((t) => (statsMap[t.id] = { gs: 0, gc: 0 }));

        qualifierMatches.forEach((m) => {
          if (statsMap[m.teamAId]) {
            statsMap[m.teamAId].gs += m.scoreA;
            statsMap[m.teamAId].gc += m.scoreB;
          }
          if (m.teamBId && statsMap[m.teamBId]) {
            statsMap[m.teamBId].gs += m.scoreB;
            statsMap[m.teamBId].gc += m.scoreA;
          }
        });

        const leaderboard: LeaderboardEntry[] = teams.map((t) => ({
          id: t.id,
          name: t.name,
          college: t.college,
          gs: statsMap[t.id].gs,
          gc: statsMap[t.id].gc,
          gd: statsMap[t.id].gs - statsMap[t.id].gc,
          rank: 0,
        }));

        // Sort: GD descending, then GS descending
        leaderboard.sort((a, b) => {
          if (b.gd !== a.gd) return b.gd - a.gd;
          return b.gs - a.gs;
        });

        leaderboard.forEach((entry, i) => (entry.rank = i + 1));

        setEntries(leaderboard);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }
    fetchData();
    const inv = setInterval(fetchData, 5000);
    return () => clearInterval(inv);
  }, []);

  if (loading) return <div className="mono" style={{ padding: 40 }}>CALCULATING STANDINGS...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8">
        <h1 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "3.5rem", color: "var(--accent)", letterSpacing: "0.06em", textShadow: "0 0 30px #e8ff3c44" }}>
          QUALIFIER LEADERBOARD
        </h1>
        <p className="mono" style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          STAGE 1: TOP 16 TEAMS ADVANCE TO KNOCKOUTS
        </p>
      </div>

      <div className="glass" style={{ borderRadius: 16, overflow: "hidden" }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "60px 1fr 80px 80px 100px", 
          padding: "20px 24px", 
          background: "rgba(232,255,60,0.05)", 
          borderBottom: "1px solid rgba(232,255,60,0.1)",
          fontFamily: "Bebas Neue, sans-serif",
          color: "var(--accent)",
          fontSize: "1.2rem",
          letterSpacing: "0.05em"
        }}>
          <div>#</div>
          <div>TEAM NAME</div>
          <div style={{ textAlign: "center" }}>GS</div>
          <div style={{ textAlign: "center" }}>GC</div>
          <div style={{ textAlign: "right" }}>GD</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {entries.map((t, i) => {
            const isQualified = t.rank <= 16;
            return (
              <motion.div 
                key={t.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                style={{ 
                  display: "grid", 
                  gridTemplateColumns: "60px 1fr 80px 80px 100px", 
                  padding: "16px 24px", 
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  alignItems: "center",
                  background: isQualified ? "rgba(232,255,60,0.02)" : "transparent",
                  borderLeft: isQualified ? "4px solid var(--accent)" : "4px solid transparent",
                  position: "relative"
                }}
              >
                <div className="mono" style={{ fontSize: "1rem", color: isQualified ? "var(--accent)" : "var(--text-muted)", fontWeight: isQualified ? "bold" : "normal" }}>
                  {t.rank}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "1.1rem", color: isQualified ? "#fff" : "rgba(255,255,255,0.7)" }}>{t.name}</div>
                  <div className="mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{t.college}</div>
                </div>
                <div className="mono" style={{ textAlign: "center", fontSize: "1rem" }}>{t.gs}</div>
                <div className="mono" style={{ textAlign: "center", fontSize: "1rem" }}>{t.gc}</div>
                <div className="mono" style={{ textAlign: "right", fontSize: "1.1rem", fontWeight: "bold", color: t.gd > 0 ? "#4eff8c" : t.gd < 0 ? "#ff4d4d" : "inherit" }}>
                   {t.gd > 0 ? `+${t.gd}` : t.gd}
                </div>
                {isQualified && i === 0 && (
                  <div style={{ position: "absolute", right: 24, top: 4, fontSize: "0.6rem", color: "var(--accent)", fontFamily: "Bebas Neue" }}>LEADER</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 24, padding: 16, border: "1px solid rgba(232,255,60,0.1)", borderRadius: 12, display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ width: 12, height: 12, background: "var(--accent)", borderRadius: 2 }} />
          <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>QUALIFICATION ZONE (TOP 16)</span>
          <div style={{ flex: 1 }} />
          <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>SORTED BY: GD &gt; GS</span>
      </div>
    </motion.div>
  );
}
