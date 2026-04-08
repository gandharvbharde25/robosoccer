"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/api";
import { useToast } from "@/components/Toasts";

interface Team {
  id: number;
  name: string;
  college: string;
  attendance: boolean;
}

interface Match {
  id: number;
  roundName: string;
  teamAId: number;
  teamBId: number | null;
  scoreA: number;
  scoreB: number;
  winnerId: number | null;
  status: string;
  startedAt: string | null;
  isPaused: boolean;
  elapsedSeconds: number;
  teamA: Team;
  teamB: Team | null;
  winner: Team | null;
  isBye: boolean;
}

// ─── Timer Component ─────────────────────────────────────────────────────────

function LiveTimer({ m }: { m: Match }) {
  // Calculate initial seconds based on backend sync data
  const calculateInitialSeconds = () => {
    const totalCap = 240;
    const elapsedSoFar = m.elapsedSeconds || 0;
    if (m.isPaused || !m.startedAt) return Math.max(0, totalCap - elapsedSoFar);
    
    const startTime = new Date(m.startedAt).getTime();
    const sessionDiff = Math.floor((Date.now() - startTime) / 1000);
    return Math.max(0, totalCap - (elapsedSoFar + sessionDiff));
  };

  const [seconds, setSeconds] = useState(calculateInitialSeconds());

  useEffect(() => {
    // Whenever the match object from server changes (sync), re-calculate to stay in line
    setSeconds(calculateInitialSeconds());
  }, [m.isPaused, m.elapsedSeconds, m.startedAt, m.status]);

  useEffect(() => {
    if (m.status !== 'live' || m.isPaused || seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [m.status, m.isPaused, seconds > 0]);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60) || 0;
    const sec = s % 60 || 0;
    return `${min.toString().padStart(2, "0")} : ${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mono" style={{ 
      color: m.isPaused ? "#ff8800" : (seconds === 0 ? "#ff4d4d" : seconds < 60 ? "#ff8800" : "var(--accent)"), 
      fontSize: "2rem", 
      fontWeight: "bold",
      letterSpacing: "0.1em",
      textAlign: "center",
      minWidth: "160px"
    }}>
      {formatTime(seconds)}
      {m.isPaused && <div style={{ fontSize: "0.6rem", letterSpacing: "2px", color: "#ff8800", marginTop: -5 }}>PAUSED</div>}
    </div>
  );
}

// ─── Match Card ──────────────────────────────────────────────────────────────

function MatchCard({ m, onAction, onUpdateScore, onSelectWinner }: any) {
  const isLive = m.status === "live";
  const isCompleted = m.status === "completed";
  const { showToast } = useToast();

  // Local state for instant UI feedback (requested for stability)
  const [localPaused, setLocalPaused] = useState(m.isPaused);

  // Keep local state in sync when props change from server
  useEffect(() => {
    setLocalPaused(m.isPaused);
  }, [m.isPaused]);

  return (
    <motion.div
      layout
      className="glass"
      style={{
        padding: "24px",
        borderRadius: "16px",
        border: isLive ? "2px solid var(--live)" : "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        background: isLive ? "rgba(255,77,77,0.02)" : "rgba(13,13,18,0.4)",
        position: "relative",
        zIndex: 1
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className={`badge ${isLive ? 'badge-live' : isCompleted ? 'badge-completed' : 'badge-upcoming'}`}>
          {m.status.toUpperCase()}
        </span>
        {isLive && <LiveTimer m={{ ...m, isPaused: localPaused }} />}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 32 }}>
        {/* Team A */}
        <div style={{ textAlign: "center" }}>
          <div className="heading" style={{ fontSize: "1.6rem", color: m.winnerId === m.teamAId ? "var(--accent)" : "#fff", marginBottom: 4 }}>
            {m.teamA.name}
          </div>
          <div className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{m.teamA.college}</div>
          
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={() => onUpdateScore(m.id, "A", 1)} className="btn btn-success" style={{ height: 48, fontSize: "1.2rem", fontWeight: "bold", pointerEvents: "auto", position: "relative", zIndex: 10 }}>+1</button>
            <button onClick={() => onUpdateScore(m.id, "A", -1)} className="btn btn-danger" style={{ height: 32, fontSize: "0.8rem", opacity: 0.8, pointerEvents: "auto", position: "relative", zIndex: 10 }}>-1</button>
          </div>
        </div>

        {/* Score Display */}
        <div style={{ textAlign: "center" }}>
           <div className="mono" style={{ fontSize: "3.5rem", fontWeight: "bold", color: "var(--accent)", textShadow: "0 0 20px rgba(232,255,60,0.2)" }}>
             {m.isBye ? "BYE" : `${m.scoreA} : ${m.scoreB}`}
           </div>
        </div>

        {/* Team B */}
        <div style={{ textAlign: "center" }}>
          <div className="heading" style={{ fontSize: "1.6rem", color: m.winnerId === m.teamBId ? "var(--accent)" : "#fff", marginBottom: 4 }}>
            {m.teamB?.name || "TBD"}
          </div>
          <div className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{m.teamB?.college || "-"}</div>
          
          {m.teamB && (
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => onUpdateScore(m.id, "B", 1)} className="btn btn-success" style={{ height: 48, fontSize: "1.2rem", fontWeight: "bold", pointerEvents: "auto", position: "relative", zIndex: 10 }}>+1</button>
              <button onClick={() => onUpdateScore(m.id, "B", -1)} className="btn btn-danger" style={{ height: 32, fontSize: "0.8rem", opacity: 0.8, pointerEvents: "auto", position: "relative", zIndex: 10 }}>-1</button>
            </div>
          )}
        </div>
      </div>

      {/* Action Area */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        {!isCompleted && !isLive && (
          <button onClick={() => { console.log("Start Clicked"); onAction(m.id, "/start"); }} className="btn btn-success" style={{ width: "100%", height: 50, fontSize: "1.1rem", pointerEvents: "auto", position: "relative", zIndex: 10 }}>START MATCH</button>
        )}
        
        {isLive && (
          <div style={{ display: "flex", gap: 12 }}>
            <button 
              onClick={() => {
                console.log("Toggle Pause/Resume Clicked", localPaused ? "Resuming" : "Pausing");
                setLocalPaused(!localPaused);
                onAction(m.id, localPaused ? "/resume" : "/pause");
              }} 
              className={`btn ${localPaused ? "btn-success" : "btn-warning"}`} 
              style={{ flex: 1, height: 50, fontSize: "1.1rem", fontWeight: "bold", color: localPaused ? "#fff" : "#000", pointerEvents: "auto", position: "relative", zIndex: 10 }}
            >
              {localPaused ? "RESUME TIMER" : "PAUSE TIMER"}
            </button>
            <button onClick={() => { console.log("End Clicked"); onAction(m.id, "/end"); }} className="btn btn-danger" style={{ flex: 1, height: 50, fontSize: "1.1rem", pointerEvents: "auto", position: "relative", zIndex: 10 }}>END MATCH</button>
          </div>
        )}

        {isCompleted && !m.winnerId && !m.isBye && (
          <div style={{ background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 12 }}>
            <div className="mono" style={{ fontSize: "0.8rem", color: "var(--accent)", marginBottom: 12, textAlign: "center", letterSpacing: "1px" }}>SELECT OFFICIAL WINNER</div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => onSelectWinner(m.id, m.teamAId)} className="btn btn-primary" style={{ flex: 1, pointerEvents: "auto", position: "relative", zIndex: 10 }}>{m.teamA.name}</button>
              {m.teamB && <button onClick={() => onSelectWinner(m.id, m.teamBId)} className="btn btn-primary" style={{ flex: 1, pointerEvents: "auto", position: "relative", zIndex: 10 }}>{m.teamB.name}</button>}
            </div>
          </div>
        )}
        {m.winnerId && <div className="mono" style={{ color: "var(--accent)", fontSize: "0.9rem", width: "100%", textAlign: "center", background: "rgba(232,255,60,0.05)", padding: "10px", borderRadius: 8 }}>🏆 WINNER: {m.winner?.name}</div>}
      </div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function MatchesPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [t1, setT1] = useState("");
  const [t2, setT2] = useState("");
  const [round, setRound] = useState("Stage 1 (Qualifier)");

  async function fetchAll() {
    try {
      const [tr, mr] = await Promise.all([
        fetch(`${API_URL}/teams`),
        fetch(`${API_URL}/matches`),
      ]);
      const teamData = await tr.json();
      const matchData = await mr.json();
      setTeams(Array.isArray(teamData) ? teamData : []);
      setMatches(Array.isArray(matchData) ? matchData : []);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    const inv = setInterval(fetchAll, 2000);
    return () => clearInterval(inv);
  }, []);

  async function createMatch() {
    if (!t1 || !t2) { showToast("Select both teams", "error"); return; }
    const res = await fetch(`${API_URL}/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        roundName: round, 
        teamAId: Number(t1), 
        teamBId: t2 === "bye" ? null : Number(t2) 
      }),
    });
    if (res.ok) {
      showToast("Match created!"); setT1(""); setT2(""); fetchAll();
    } else {
      showToast("Creation failed", "error");
    }
  }

  async function handleAction(id: number, endpoint: string) {
    const res = await fetch(`${API_URL}/matches/${id}${endpoint}`, { method: "PUT" });
    if (res.ok) {
      showToast(`Match ${endpoint === '/start' ? 'started' : 'ended'}`);
      fetchAll();
    }
  }

  async function handleUpdateScore(id: number, team: "A" | "B", delta: number) {
    const m = matches.find(m => m.id === id);
    if (!m) return;
    const body = {
      scoreA: team === "A" ? Math.max(0, m.scoreA + delta) : m.scoreA,
      scoreB: team === "B" ? Math.max(0, m.scoreB + delta) : m.scoreB,
    };
    await fetch(`${API_URL}/matches/${id}/score`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    fetchAll();
  }

  async function handleSelectWinner(id: number, winnerId: number) {
    const res = await fetch(`${API_URL}/matches/${id}/winner`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnerId }),
    });
    if (res.ok) {
      showToast("Winner selected!");
      fetchAll();
    }
  }

  if (loading) return <div className="mono" style={{ padding: 40 }}>FETCHING MATCHES...</div>;

  const grouped = matches.reduce((acc: any, m) => {
    if (!acc[m.roundName]) acc[m.roundName] = [];
    acc[m.roundName].push(m);
    return acc;
  }, {});

  const stages = [
    "Stage 1 (Qualifier)",
    "Round of 16",
    "Quarterfinal",
    "Semifinal",
    "Final"
  ];
  const available = teams.filter(t => t.attendance);

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <h1 className="neon-text" style={{ fontSize: "3rem", marginBottom: 32 }}>MATCH CONTROL</h1>

      {/* Creation Panel */}
      <div className="glass" style={{ padding: 24, borderRadius: 12, marginBottom: 40 }}>
        <h2 className="heading" style={{ fontSize: "1.4rem", marginBottom: 20 }}>NEW MATCH SETUP</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, alignItems: "flex-end" }}>
          <div>
            <label className="mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginBottom: 8 }}>ROUND</label>
            <select value={round} onChange={e => setRound(e.target.value)} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", color: "#fff", padding: 10, borderRadius: 8 }}>
              {stages.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <label className="mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginBottom: 8 }}>TEAM A</label>
            <select value={t1} onChange={e => setT1(e.target.value)} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", color: "#fff", padding: 10, borderRadius: 8 }}>
              <option value="">Choose Team...</option>
              {available.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginBottom: 8 }}>TEAM B</label>
            <select value={t2} onChange={e => setT2(e.target.value)} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", color: "#fff", padding: 10, borderRadius: 8 }}>
              <option value="">Choose Team...</option>
              <option value="bye">BYE (Auto-Pass)</option>
              {available.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <button onClick={createMatch} className="btn btn-primary" style={{ padding: "11px 24px" }}>INITIALIZE MATCH</button>
        </div>
      </div>

      {/* Match List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
        {stages.map(rName => {
          const rMatches = grouped[rName] || [];
          if (rMatches.length === 0) return null;
          return (
            <div key={rName}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <h2 className="heading" style={{ fontSize: "1.8rem", color: "var(--accent2)", margin: 0 }}>{rName}</h2>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
                {rMatches.map((m: any) => (
                  <MatchCard key={m.id} m={m} onAction={handleAction} onUpdateScore={handleUpdateScore} onSelectWinner={handleSelectWinner} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
