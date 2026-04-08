"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  status: string;
  isBye: boolean;
  team1: Team;
  team2: Team | null;
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
  isBye,
  index = 0,
}: {
  label: string;
  team1: Team | null;
  team2: Team | null;
  score1?: number | null;
  score2?: number | null;
  winnerId?: number | null;
  status?: string;
  isBye?: boolean;
  index?: number;
}) {
  const pending = status === "pending" || !team1;
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
        {/* Accent top border */}
        {!pending && (
          <div
            style={{
              height: 2,
              background: "linear-gradient(90deg, transparent, #e8ff3c, transparent)",
              opacity: 0.6,
            }}
          />
        )}
        {/* Team 1 row */}
        <div
          style={{
            padding: "10px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(42,42,58,0.6)",
            background:
              winnerId && team1 && winnerId === team1.id
                ? "rgba(232,255,60,0.07)"
                : "transparent",
          }}
        >
          <span
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "0.95rem",
              letterSpacing: "0.04em",
              color:
                winnerId && team1 && winnerId === team1.id
                  ? "var(--accent)"
                  : team1
                  ? "var(--text)"
                  : "var(--text-muted)",
              textShadow:
                winnerId && team1 && winnerId === team1.id
                  ? "0 0 12px #e8ff3c66"
                  : "none",
            }}
          >
            {team1?.name ?? "TBD"}
            {winnerId && team1 && winnerId === team1.id && (
              <span style={{ marginLeft: 6, fontSize: "0.65rem" }}>★</span>
            )}
          </span>
          {!pending && !isBye && (
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: "0.9rem", color: "var(--text)" }}>
              {score1 ?? "—"}
            </span>
          )}
        </div>
        {/* Team 2 row */}
        <div
          style={{
            padding: "10px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background:
              winnerId && team2 && winnerId === team2.id
                ? "rgba(232,255,60,0.07)"
                : "transparent",
          }}
        >
          <span
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "0.95rem",
              letterSpacing: "0.04em",
              color:
                winnerId && team2 && winnerId === team2.id
                  ? "var(--accent)"
                  : team2
                  ? "var(--text)"
                  : "var(--text-muted)",
              textShadow:
                winnerId && team2 && winnerId === team2.id
                  ? "0 0 12px #e8ff3c66"
                  : "none",
            }}
          >
            {winnerId && team2 && winnerId === team2.id && (
              <span style={{ marginRight: 6, fontSize: "0.65rem" }}>★</span>
            )}
            {isBye ? "BYE" : team2?.name ?? "TBD"}
          </span>
          {!pending && !isBye && (
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: "0.9rem", color: "var(--text)" }}>
              {score2 ?? "—"}
            </span>
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
    fetch("/api/matches").then((r) => r.json()).then((d) => { setMatches(d); setLoading(false); });
  }, []);

  if (loading) return <p style={{ color: "var(--text-muted)", fontFamily: "DM Mono, monospace" }}>Loading...</p>;

  const completedMatches = matches.filter((m) => m.status === "completed");
  const allWinners = completedMatches.map((m) => m.winner).filter(Boolean) as Team[];
  const uniqueWinnerIds = [...new Set(allWinners.map((w) => w.id))];
  const uniqueWinners = uniqueWinnerIds.map((id) => allWinners.find((w) => w.id === id)!).filter(Boolean);

  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b);

  const sfRound = rounds.find((r) => {
    const nonBye = matches.filter((m) => m.round === r && !m.isBye);
    return nonBye.length === 2;
  });
  const finalRound = rounds.find((r) => {
    const nonBye = matches.filter((m) => m.round === r && !m.isBye);
    return nonBye.length === 1;
  });

  const sfMatches = sfRound ? matches.filter((m) => m.round === sfRound && !m.isBye) : [];
  const finalMatch = finalRound ? matches.find((m) => m.round === finalRound && !m.isBye) : null;
  const champion = finalMatch?.winner ?? null;
  const hasBracket = sfMatches.length > 0 || finalMatch;

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
          BRACKET
        </h1>
        <p style={{ color: "var(--text-muted)", fontFamily: "DM Mono, monospace", fontSize: "0.8rem", marginTop: 4 }}>
          Semifinals & Final
        </p>
      </div>

      {/* Champion Banner */}
      <AnimatePresence>
        {champion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: "linear-gradient(135deg, rgba(232,255,60,0.12), rgba(232,255,60,0.2))",
              border: "2px solid rgba(232,255,60,0.5)",
              borderRadius: 16,
              padding: "28px 36px",
              textAlign: "center",
              marginBottom: 40,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 0 60px rgba(232,255,60,0.12), inset 0 0 40px rgba(232,255,60,0.04)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "30%",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(232,255,60,0.08), transparent)",
                pointerEvents: "none",
              }}
            />
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: "0.75rem", color: "var(--accent)", letterSpacing: "0.12em", marginBottom: 8 }}>
              🏆 ROBOSOCCER CHAMPION
            </div>
            <div
              className="neon-text"
              style={{
                fontFamily: "Bebas Neue, sans-serif",
                fontSize: "3rem",
                letterSpacing: "0.05em",
                lineHeight: 1,
              }}
            >
              {champion.name}
            </div>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 8 }}>
              TECHTONICS — ROBOSOCCER
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasBracket ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ ...glassCard, padding: "40px", textAlign: "center" }}
        >
          <p style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "1.4rem", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
            BRACKET NOT YET AVAILABLE
          </p>
          <p style={{ fontFamily: "DM Mono, monospace", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 12 }}>
            The bracket will appear automatically once 4 teams remain as winners.
            {uniqueWinners.length > 0 && ` Currently ${uniqueWinners.length} winner(s) advancing.`}
          </p>
          {uniqueWinners.length > 0 && (
            <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {uniqueWinners.map((w, i) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  whileHover={{ scale: 1.05, borderColor: "rgba(232,255,60,0.4)" }}
                  style={{
                    background: "rgba(26,26,36,0.8)",
                    border: "1px solid rgba(42,42,58,0.8)",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontFamily: "Bebas Neue, sans-serif",
                    fontSize: "0.95rem",
                    color: "var(--text)",
                    letterSpacing: "0.03em",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {w.name}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <div
            style={{
              display: "flex",
              gap: 60,
              alignItems: "center",
              minWidth: 700,
              padding: "20px 0",
            }}
          >
            {/* Semifinals */}
            {sfMatches.length > 0 && (
              <div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    fontFamily: "Bebas Neue, sans-serif",
                    fontSize: "1.1rem",
                    color: "var(--text-muted)",
                    letterSpacing: "0.06em",
                    marginBottom: 20,
                  }}
                >
                  SEMIFINALS
                </motion.h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                  {sfMatches.map((m, i) => (
                    <BracketMatch
                      key={m.id}
                      label={`SF ${i + 1}`}
                      team1={m.team1}
                      team2={m.team2}
                      score1={m.score1}
                      score2={m.score2}
                      winnerId={m.winnerId}
                      status={m.status}
                      isBye={m.isBye}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Connector arrow */}
            {sfMatches.length > 0 && finalMatch && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                  color: "var(--accent)",
                  fontSize: "1.8rem",
                  flexShrink: 0,
                  textShadow: "0 0 16px #e8ff3c88",
                }}
              >
                →
              </motion.div>
            )}

            {/* Final */}
            {finalMatch && (
              <div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    fontFamily: "Bebas Neue, sans-serif",
                    fontSize: "1.1rem",
                    color: "var(--accent)",
                    letterSpacing: "0.06em",
                    marginBottom: 20,
                    textShadow: "0 0 16px #e8ff3c66",
                  }}
                >
                  GRAND FINAL
                </motion.h2>
                <BracketMatch
                  label="FINAL"
                  team1={finalMatch.team1}
                  team2={finalMatch.team2}
                  score1={finalMatch.score1}
                  score2={finalMatch.score2}
                  winnerId={finalMatch.winnerId}
                  status={finalMatch.status}
                  isBye={finalMatch.isBye}
                  index={2}
                />
                {finalMatch.winner && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{
                      marginTop: 16,
                      fontFamily: "DM Mono, monospace",
                      fontSize: "0.72rem",
                      color: "var(--accent)",
                      textAlign: "center",
                      textShadow: "0 0 10px #e8ff3c88",
                    }}
                  >
                    🏆 {finalMatch.winner.name}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
