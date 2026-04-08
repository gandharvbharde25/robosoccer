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

const glassCard: React.CSSProperties = {
  background: "rgba(19,19,26,0.6)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(232,255,60,0.1)",
  borderRadius: 12,
};

function BracketMatch({
  label,
  team1,
  team2,
  score1,
  score2,
  winnerId,
  status,
  index = 0,
}: {
  label: string;
  team1: Team | null;
  team2: Team | null;
  score1?: number;
  score2?: number;
  winnerId?: number | null;
  status?: string;
  index?: number;
}) {
  const pending = status === "upcoming" || !team1;
  const isBye = team1 && !team2 && status !== "upcoming";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: 280 }}
    >
      <div style={{ fontFamily: "DM Mono, monospace", fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.08em" }}>
        {label}
      </div>
      <motion.div
        whileHover={{
          borderColor: "rgba(232,255,60,0.45)",
          boxShadow: "0 8px 32px rgba(232,255,60,0.14)",
        }}
        style={{
          ...glassCard,
          border: `1px solid ${pending ? "rgba(42,42,58,0.7)" : "rgba(232,255,60,0.3)"}`,
          overflow: "hidden",
        }}
      >
        {!pending && (
          <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #e8ff3c, transparent)", opacity: 0.6 }} />
        )}
        {/* Team A row */}
        <div style={{
            padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center",
            borderBottom: "1px solid rgba(42,42,58,0.6)",
            background: winnerId && team1 && winnerId === team1.id ? "rgba(232,255,60,0.07)" : "transparent",
          }}>
          <span style={{
              fontFamily: "Bebas Neue, sans-serif", fontSize: "0.95rem", letterSpacing: "0.04em",
              color: winnerId && team1 && winnerId === team1.id ? "var(--accent)" : team1 ? "var(--text)" : "var(--text-muted)",
              textShadow: winnerId && team1 && winnerId === team1.id ? "0 0 12px #e8ff3c66" : "none",
            }}>
            {team1?.name ?? "TBD"}
            {winnerId && team1 && winnerId === team1.id && <span style={{ marginLeft: 6, fontSize: "0.65rem" }}>★</span>}
          </span>
          {!pending && !isBye && (
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: "0.9rem", color: "var(--text)" }}>{score1 ?? 0}</span>
          )}
        </div>
        {/* Team B row */}
        <div style={{
            padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center",
            background: winnerId && team2 && winnerId === team2.id ? "rgba(232,255,60,0.07)" : "transparent",
          }}>
          <span style={{
              fontFamily: "Bebas Neue, sans-serif", fontSize: "0.95rem", letterSpacing: "0.04em",
              color: winnerId && team2 && winnerId === team2.id ? "var(--accent)" : team2 ? "var(--text)" : "var(--text-muted)",
              textShadow: winnerId && team2 && winnerId === team2.id ? "0 0 12px #e8ff3c66" : "none",
            }}>
            {winnerId && team2 && winnerId === team2.id && <span style={{ marginRight: 6, fontSize: "0.65rem" }}>★</span>}
            {isBye ? "BYE" : team2?.name ?? "TBD"}
          </span>
          {!pending && !isBye && (
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: "0.9rem", color: "var(--text)" }}>{score2 ?? 0}</span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function BracketPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/matches`)
      .then((r) => r.json())
      .then((data) => {
        setMatches(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ color: "var(--text-muted)", fontFamily: "DM Mono, monospace", padding: 40 }}>SYNCING BRACKET...</p>;

  const r16Matches = matches.filter(m => m.roundName === "Round of 16");
  const qfMatches = matches.filter(m => m.roundName === "Quarterfinal");
  const sfMatches = matches.filter(m => m.roundName === "Semifinal");
  const finalMatch = matches.find(m => m.roundName === "Final");
  const champion = finalMatch?.winner ?? null;

  const advancingWinners = matches.filter(m => m.winnerId).map(m => m.winner!);
  const uniqueWinners = Array.from(new Map(advancingWinners.map(w => [w.id, w])).values());

  const hasBracket = r16Matches.length > 0 || qfMatches.length > 0 || sfMatches.length > 0 || !!finalMatch;

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8">
        <h1 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "2.5rem", color: "var(--accent)", letterSpacing: "0.06em", textShadow: "0 0 30px #e8ff3c55" }}>
          TOURNAMENT BRACKET
        </h1>
        <p style={{ color: "var(--text-muted)", fontFamily: "DM Mono, monospace", fontSize: "0.8rem", marginTop: 4 }}>
          Road to the Championship (Stage 2: Knockouts)
        </p>
      </div>

      <AnimatePresence>
        {champion && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={{ background: "linear-gradient(135deg, rgba(232,255,60,0.12), rgba(232,255,60,0.2))", border: "2px solid rgba(232,255,60,0.5)", borderRadius: 16, padding: "28px 36px", textAlign: "center", marginBottom: 40, backdropFilter: "blur(20px)", boxShadow: "0 0 60px rgba(232,255,60,0.12)", position: "relative", overflow: "hidden" }}>
             <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              style={{ position: "absolute", top: 0, left: 0, width: "30%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(232,255,60,0.08), transparent)", pointerEvents: "none" }}
            />
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: "0.75rem", color: "var(--accent)", letterSpacing: "0.12em", marginBottom: 8 }}>🏆 ROBOSOCCER CHAMPION</div>
            <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "3rem", letterSpacing: "0.05em", lineHeight: 1 }}>{champion.name}</div>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 8 }}>TECHTONICS — ROBOSOCCER</div>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasBracket ? (
        <div style={{ ...glassCard, padding: "40px", textAlign: "center" }}>
          <p style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "1.4rem", color: "var(--text-muted)" }}>BRACKET NOT YET GENERATED</p>
          <p style={{ fontFamily: "DM Mono, monospace", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 12 }}>
            Matches for Round of 16, Quarterfinals, and Finals will appear here once created.
            {uniqueWinners.length > 0 && ` Currently ${uniqueWinners.length} winner(s) advancing.`}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", paddingBottom: 20 }}>
          <div style={{ display: "flex", gap: 50, alignItems: "center", minWidth: 1200, padding: "20px 0" }}>
            
            {/* Round of 16 */}
            <div>
              <h2 style={{ fontFamily: "Bebas Neue", fontSize: "1rem", color: "var(--text-muted)", marginBottom: 16 }}>ROUND OF 16</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {r16Matches.length > 0 ? r16Matches.map((m, i) => (
                  <BracketMatch key={m.id} label={`R16 #${i + 1}`} team1={m.teamA} team2={m.teamB} score1={m.scoreA} score2={m.scoreB} winnerId={m.winnerId} status={m.status} index={i} />
                )) : <div style={{ width: 280, height: 80, border: "1px dashed rgba(255,255,255,0.05)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "rgba(255,255,255,0.1)" }}>TBD</div>}
              </div>
            </div>

            <div style={{ width: 20, height: 2, background: "rgba(255,255,255,0.05)" }} />

            {/* Quarterfinal */}
            <div>
              <h2 style={{ fontFamily: "Bebas Neue", fontSize: "1rem", color: "var(--text-muted)", marginBottom: 16 }}>QUARTERFINAL</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 60 }}>
                {qfMatches.length > 0 ? qfMatches.map((m, i) => (
                  <BracketMatch key={m.id} label={`QF #${i + 1}`} team1={m.teamA} team2={m.teamB} score1={m.scoreA} score2={m.scoreB} winnerId={m.winnerId} status={m.status} index={i + 8} />
                )) : <div style={{ width: 280, height: 80, border: "1px dashed rgba(255,255,255,0.05)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "rgba(255,255,255,0.1)" }}>TBD</div>}
              </div>
            </div>

            <div style={{ width: 20, height: 2, background: "rgba(255,255,255,0.05)" }} />

            {/* Semifinals */}
            <div>
              <h2 style={{ fontFamily: "Bebas Neue", fontSize: "1rem", color: "var(--text-muted)", marginBottom: 16 }}>SEMIFINALS</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 140 }}>
                {sfMatches.length > 0 ? sfMatches.map((m, i) => (
                  <BracketMatch key={m.id} label={`SF #${i + 1}`} team1={m.teamA} team2={m.teamB} score1={m.scoreA} score2={m.scoreB} winnerId={m.winnerId} status={m.status} index={i + 12} />
                )) : [1,2].map(i => <div key={i} style={{ width: 280, height: 80, border: "1px dashed rgba(255,255,255,0.05)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "rgba(255,255,255,0.1)" }}>TBD</div>)}
              </div>
            </div>

            <div style={{ color: "var(--accent)", fontSize: "1.8rem", textShadow: "0 0 16px #e8ff3c88" }}>→</div>

            {/* Final */}
            <div>
              <h2 style={{ fontFamily: "Bebas Neue", fontSize: "1.1rem", color: "var(--accent)", marginBottom: 16 }}>GRAND FINAL</h2>
              <BracketMatch label="FINAL" team1={finalMatch?.teamA || null} team2={finalMatch?.teamB || null} score1={finalMatch?.scoreA} score2={finalMatch?.scoreB} winnerId={finalMatch?.winnerId} status={finalMatch?.status} index={15} />
              {champion && (
                <div style={{ marginTop: 24, textAlign: "center", color: "var(--accent)", fontFamily: "Bebas Neue", fontSize: "1.5rem" }}>
                  🏆 CHAMPION: {champion.name}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
