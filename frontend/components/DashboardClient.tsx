"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/api";

interface Team { id: number; name: string; college: string; attendance: boolean; }
interface Match { 
  id: number; 
  roundName: string; 
  teamA: { name: string }; 
  teamB: { name: string } | null; 
  scoreA: number; 
  scoreB: number; 
  status: string; 
  winnerId: number | null;
  isBye: boolean;
}

export default function DashboardClient() {
  const [stats, setStats] = useState({ teams: 0, pending: 0, completed: 0, live: null as Match | null });
  const [recent, setRecent] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchDashboard() {
    try {
      const [tr, mr] = await Promise.all([
        fetch(`${API_URL}/teams`),
        fetch(`${API_URL}/matches`)
      ]);
      const teams = await tr.json();
      const matches = await mr.json();
      
      const live = matches.find((m: any) => m.status === "live") || null;
      const completed = matches.filter((m: any) => m.status === "completed").length;
      const upcoming = matches.filter((m: any) => m.status === "upcoming").length;

      setStats({
        teams: teams.length,
        pending: upcoming,
        completed: completed,
        live: live
      });
      setRecent(matches.filter((m: any) => m.status === "completed").reverse().slice(0, 5));
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
    const inv = setInterval(fetchDashboard, 3000);
    return () => clearInterval(inv);
  }, []);

  // "Next Step" logic
  const getNextStep = () => {
    if (stats.teams === 0) return { step: "Add Teams", href: "/attendance", desc: "Start by registering teams for the tournament." };
    if (stats.pending === 0 && stats.live === null && stats.completed === 0) return { step: "Create Matches", href: "/matches", desc: "Teams are ready. Generate the first stage of matches." };
    if (stats.live) return { step: "Update Score", href: "/matches", desc: "A match is currently LIVE. Monitor and update the score." };
    return { step: "Manage Matches", href: "/matches", desc: "Move to the next stage or start pending matches." };
  };

  const nextStep = getNextStep();

  if (loading) return <div className="mono" style={{ padding: 40 }}>INITIALIZING OPERATIONAL SYSTEM...</div>;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: 60 }}>
      {/* Hero Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 20 }}>
        <div>
           <div className="mono" style={{ color: "var(--accent)", fontSize: "0.8rem", letterSpacing: "2px", marginBottom: 8 }}>COMMAND CENTER // TECHTONICS</div>
           <h1 className="neon-text" style={{ fontSize: "clamp(3rem, 10vw, 5rem)", lineHeight: 0.9 }}>DASHBOARD</h1>
        </div>
        <div style={{ textAlign: "right" }}>
           <div className="mono" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>SYSTEM STATUS</div>
           <div className="badge badge-success mono" style={{ marginTop: 4 }}>OPERATIONAL</div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        
        {/* Step Guide & Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Next Step Spotlight (Informational Only) */}
          <div style={{ textDecoration: "none" }}>
            <motion.div 
              className="glass" 
              style={{ padding: 24, borderRadius: 16, border: "1px solid var(--accent2)", position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: 0, right: 0, padding: "8px 16px", background: "var(--accent2)", color: "var(--bg)", fontFamily: "Bebas Neue", fontSize: "0.9rem" }}>RECOMMENDED ACTION</div>
              <h2 className="heading" style={{ fontSize: "2rem", marginBottom: 8 }}>{nextStep.step.toUpperCase()}</h2>
              <p className="mono" style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: 0 }}>{nextStep.desc}</p>
            </motion.div>
          </div>

          {/* Core Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="glass" style={{ padding: 20, borderRadius: 12, textAlign: "center" }}>
              <div className="mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 8 }}>TOTAL TEAMS</div>
              <div className="heading" style={{ fontSize: "2.5rem", color: "var(--accent)" }}>{stats.teams}</div>
            </div>
            <div className="glass" style={{ padding: 20, borderRadius: 12, textAlign: "center" }}>
              <div className="mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 8 }}>MATCHES DONE</div>
              <div className="heading" style={{ fontSize: "2.5rem", color: "var(--accent2)" }}>{stats.completed}</div>
            </div>
          </div>
        </div>

        {/* Live Spotlight */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {stats.live ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: 24, borderRadius: 16, border: "2px solid var(--live)", background: "rgba(255,77,77,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <span className="badge badge-live mono">● LIVE MATCH</span>
                <span className="mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{stats.live.roundName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div className="heading" style={{ fontSize: "1.2rem" }}>{stats.live.teamA.name}</div>
                  <div className="heading" style={{ fontSize: "3.5rem", color: "var(--accent)" }}>{stats.live.scoreA}</div>
                </div>
                <div className="mono" style={{ fontSize: "1.5rem", opacity: 0.2 }}>VS</div>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div className="heading" style={{ fontSize: "1.2rem" }}>{stats.live.teamB?.name || "TBD"}</div>
                  <div className="heading" style={{ fontSize: "3.5rem", color: "var(--accent)" }}>{stats.live.scoreB}</div>
                </div>
              </div>
              <Link href="/matches" className="btn btn-danger" style={{ display: "block", textAlign: "center", marginTop: 20, textDecoration: "none" }}>CONTROL MATCH</Link>
            </motion.div>
          ) : (
            <div className="glass" style={{ padding: 40, borderRadius: 16, textAlign: "center", borderStyle: "dashed", opacity: 0.5 }}>
              <div className="mono" style={{ color: "var(--text-muted)" }}>NO ACTIVE LIVE MATCH</div>
              <div className="mono" style={{ fontSize: "0.7rem", marginTop: 10 }}>Start a match from the control panel</div>
            </div>
          )}

          {/* Recent Results */}
          <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
            <h3 className="heading" style={{ fontSize: "1.2rem", marginBottom: 16, color: "var(--text-muted)" }}>RECENT RESULTS</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recent.length > 0 ? recent.map(m => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="mono" style={{ fontSize: "0.75rem", flex: 1 }}>{m.teamA.name}</span>
                  <span className="badge badge-completed mono" style={{ margin: "0 10px", minWidth: 60, textAlign: "center" }}>{m.scoreA}-{m.scoreB}</span>
                  <span className="mono" style={{ fontSize: "0.75rem", flex: 1, textAlign: "right" }}>{m.teamB?.name || "BYE"}</span>
                </div>
              )) : <div className="mono" style={{ fontSize: "0.7rem", opacity: 0.5 }}>Waiting for first results...</div>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
