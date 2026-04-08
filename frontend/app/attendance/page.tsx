"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/api";
import { useToast } from "@/components/Toasts";

interface Team {
  id: number;
  name: string;
  email: string;
  players: string;
  college: string;
  attendance: boolean;
}

const inputStyle: React.CSSProperties = {
  background: "rgba(26,26,36,0.6)",
  border: "1px solid rgba(232,255,60,0.1)",
  borderRadius: 8,
  padding: "10px 16px",
  color: "#fff",
  fontSize: "0.9rem",
  outline: "none",
  width: "100%",
};

export default function AttendancePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { showToast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGmail, setNewGmail] = useState("");
  const [newCollege, setNewCollege] = useState("");
  const [newPlayers, setNewPlayers] = useState("");

  const role = "admin"; // Simplified for demo

  async function fetchTeams() {
    try {
      const res = await fetch(`${API_URL}/teams`);
      const data = await res.json();
      setTeams(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  useEffect(() => { fetchTeams(); }, []);

  async function togglePresent(team: Team) {
    // Optimistic UI update
    const previousTeams = [...teams];
    setTeams(prev => prev.map(t => t.id === team.id ? { ...t, attendance: !t.attendance } : t));
    setUpdatingId(team.id);

    try {
      const res = await fetch(`${API_URL}/teams/${team.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendance: !team.attendance }),
      });
      if (res.ok) {
        showToast(`${team.name} marked as ${!team.attendance ? 'Present' : 'Absent'}`);
        // No need to fetchTeams here as we've already updated optimistically, 
        // but it's good for sync if state is complex. Let's fetch for safety.
        await fetchTeams();
      } else {
        throw new Error("API responded with error");
      }
    } catch (e) {
      showToast("Update failed", "error");
      setTeams(previousTeams); // Revert on failure
    }
    setUpdatingId(null);
  }

  async function handleAddTeam() {
    if (!newName || !newGmail) {
      showToast("Name and Email required", "error");
      return;
    }
    const res = await fetch(`${API_URL}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, email: newGmail, college: newCollege, players: newPlayers }),
    });
    if (res.ok) {
      showToast("Team added successfully");
      setNewName(""); setNewGmail(""); setNewCollege(""); setNewPlayers("");
      setIsAdding(false);
      fetchTeams();
    } else {
      showToast("Failed to add team", "error");
    }
  }

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.college.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header Area */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, gap: 20, flexWrap: "wrap" }}>
        <div>
          <h1 className="neon-text" style={{ fontSize: "3rem", margin: 0 }}>ATTENDANCE</h1>
          <p className="mono" style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            {teams.filter(t => t.attendance).length} / {teams.length} TEAMS PRESENT
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setIsAdding(!isAdding)} className="btn btn-primary" style={{ padding: "10px 24px" }}>
            {isAdding ? "CANCEL" : "+ ADD TEAM"}
          </button>
        </div>
      </div>

      {/* Add Team Panel */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass"
            style={{ overflow: "hidden", marginBottom: 32, borderRadius: 12 }}
          >
            <div style={{ padding: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Team Name" style={inputStyle} />
              <input value={newGmail} onChange={e => setNewGmail(e.target.value)} placeholder="Email" style={inputStyle} />
              <input value={newCollege} onChange={e => setNewCollege(e.target.value)} placeholder="College" style={inputStyle} />
              <input value={newPlayers} onChange={e => setNewPlayers(e.target.value)} placeholder="Players (comma separated)" style={inputStyle} />
              <button onClick={handleAddTeam} className="btn btn-primary" style={{ width: "100%" }}>SAVE TEAM</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Toolbar */}
      <div style={{ marginBottom: 20 }}>
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Search by team name or college..." 
          style={{ ...inputStyle, background: "rgba(18,18,30,0.4)" }} 
        />
      </div>

      {/* Modern Table UI */}
      <div className="glass" style={{ borderRadius: 12, overflow: "hidden" }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr 120px", 
          padding: "16px 24px", 
          background: "rgba(232,255,60,0.05)", 
          borderBottom: "1px solid rgba(232,255,60,0.1)",
          fontFamily: "Bebas Neue",
          letterSpacing: "0.05em",
          color: "var(--accent)",
          fontSize: "1.1rem"
        }}>
          <div>TEAM / COLLEGE</div>
          <div>PLAYERS</div>
          <div style={{ textAlign: "right" }}>STATUS</div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }} className="mono">LOADING TEAMS...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }} className="mono">NO TEAMS FOUND</div>
        ) : (
          filtered.map((t) => (
            <div key={t.id} style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr 120px", 
              padding: "16px 24px", 
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              alignItems: "center",
              transition: "background 0.2s"
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "1rem" }}>{t.name}</div>
                <div className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{t.college}</div>
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {t.players || "—"}
              </div>
              <div style={{ textAlign: "right" }}>
                <button
                  onClick={() => togglePresent(t)}
                  disabled={updatingId === t.id}
                  className={t.attendance ? "btn btn-success" : "btn btn-danger"}
                  style={{ fontSize: "0.8rem", padding: "6px 12px", width: "90px" }}
                >
                  {updatingId === t.id ? "..." : t.attendance ? "PRESENT" : "ABSENT"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
