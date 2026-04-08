"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/api";

interface Team { id: number; name: string; college: string; }
interface Match { 
  id: number; 
  teamA: Team; 
  teamB: Team | null; 
  scoreA: number; 
  scoreB: number; 
  status: string; 
  roundName: string; 
  startedAt: string | null; 
  isPaused: boolean; 
  elapsedSeconds: number; 
}

function LiveTimer({ m }: { m: Match }) {
  const calculateInitialSeconds = () => {
    const totalCap = 240;
    const elapsedSoFar = m.elapsedSeconds || 0;
    if (m.isPaused || !m.startedAt) return Math.max(0, totalCap - elapsedSoFar);
    
    const startTime = new Date(m.startedAt).getTime();
    const sessionDiff = Math.floor((Date.now() - startTime) / 1000);
    return Math.max(0, totalCap - (elapsedSoFar + sessionDiff));
  };

  const [timeLeft, setTimeLeft] = useState(calculateInitialSeconds());

  useEffect(() => {
    setTimeLeft(calculateInitialSeconds());
  }, [m.isPaused, m.elapsedSeconds, m.startedAt, m.status]);

  useEffect(() => {
    if (m.status !== 'live' || m.isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [m.status, m.isPaused, timeLeft > 0]);

  const min = Math.floor(timeLeft / 60) || 0;
  const sec = timeLeft % 60 || 0;
  
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ 
        fontSize: "12vh", 
        fontFamily: "Bebas Neue", 
        color: m.isPaused ? "#ff8800" : (timeLeft === 0 ? "#ff4d4d" : timeLeft < 60 ? "#ff8800" : "var(--accent)"),
        textShadow: (timeLeft < 60 || m.isPaused) ? "0 0 30px rgba(255,136,0,0.2)" : "none",
        lineHeight: 1
      }}>
        {min.toString().padStart(2, "0")} : {sec.toString().padStart(2, "0")}
      </div>
      {m.isPaused && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: [0.4, 1, 0.4] }} 
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ fontFamily: "Bebas Neue", color: "#ff8800", fontSize: "4vh", letterSpacing: "1rem", marginTop: 10 }}
        >
          PAUSED
        </motion.div>
      )}
    </div>
  );
}

export default function LivePage() {
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await fetch(`${API_URL}/matches`);
        const matches = await res.json();
        setMatch(matches.find((m: any) => m.status === "live") || null);
      } catch (e) {}
    };
    fetchLive();
    const inv = setInterval(fetchLive, 1000);
    return () => clearInterval(inv);
  }, []);

  return (
    <div style={{ height: "100vh", w: "100vw", background: "#050508", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "fixed", top: 0, left: 0 }}>
      {/* Background Glow */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "80vw", height: "80vh", background: "radial-gradient(circle, rgba(232,255,60,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
      
      <AnimatePresence mode="wait">
        {!match ? (
          <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center" }}>
            <h1 style={{ fontFamily: "Bebas Neue", fontSize: "10vh", color: "rgba(255,255,255,0.05)", letterSpacing: "1rem" }}>AWAITING NEXT MATCH</h1>
            <p className="mono" style={{ color: "var(--accent)", opacity: 0.3 }}>ROBOSOCCER TOURNAMENT // TECHTONICS</p>
          </motion.div>
        ) : (
          <motion.div key={match.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ width: "90vw", textAlign: "center", position: "relative" }}>
            
            {/* Round Badge */}
            <div style={{ display: "flex", justifyContent: "center", gap: 20, alignItems: "center", marginBottom: "4vh" }}>
               <div className="badge-live mono" style={{ padding: "8px 20px", fontSize: "1.2rem", fontWeight: "bold" }}>● LIVE</div>
               <div style={{ fontFamily: "Bebas Neue", fontSize: "3rem", color: "var(--accent)", letterSpacing: "0.5rem" }}>{match.roundName.toUpperCase()}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "0vw" }}>
              {/* Team A */}
              <div style={{ textAlign: "right", paddingRight: "4vw" }}>
                <div style={{ fontFamily: "Bebas Neue", fontSize: "14vh", lineHeight: 0.9 }}>{match.teamA.name}</div>
                <div className="mono" style={{ color: "var(--accent)", fontSize: "2.5vh", opacity: 0.5 }}>{match.teamA.college}</div>
              </div>

              {/* Score Box */}
              <div style={{ padding: "4vh 6vw", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 40, display: "flex", alignItems: "center", gap: "2vw" }}>
                <motion.div key={match.scoreA} initial={{ scale: 1.2, color: "#fff" }} animate={{ scale: 1, color: "var(--accent)" }} style={{ fontFamily: "Bebas Neue", fontSize: "28vh", lineHeight: 1 }}>{match.scoreA}</motion.div>
                <div style={{ fontFamily: "Bebas Neue", fontSize: "10vh", opacity: 0.2 }}>-</div>
                <motion.div key={match.scoreB} initial={{ scale: 1.2, color: "#fff" }} animate={{ scale: 1, color: "var(--accent)" }} style={{ fontFamily: "Bebas Neue", fontSize: "28vh", lineHeight: 1 }}>{match.scoreB}</motion.div>
              </div>

              {/* Team B */}
              <div style={{ textAlign: "left", paddingLeft: "4vw" }}>
                <div style={{ fontFamily: "Bebas Neue", fontSize: "14vh", lineHeight: 0.9 }}>{match.teamB?.name || "TBD"}</div>
                <div className="mono" style={{ color: "var(--accent)", fontSize: "2.5vh", opacity: 0.5 }}>{match.teamB?.college || "—"}</div>
              </div>
            </div>

            {/* Timer */}
            <div style={{ marginTop: "4vh" }}>
              <LiveTimer m={match} />
              <div className="heading" style={{ color: "rgba(255,255,255,0.2)", fontSize: "2.5vh", letterSpacing: "1rem", marginTop: 20 }}>MATCH CLOCK</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        :root { --accent: #e8ff3c; }
        .badge-live { background: rgba(255,77,77,0.1); color: #ff4d4d; border: 1px solid #ff4d4d; border-radius: 4px; animation: blink 1s infinite; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        .mono { font-family: 'DM Mono', monospace; }
        .heading { font-family: 'Bebas Neue', sans-serif; }
      `}</style>
    </div>
  );
}
