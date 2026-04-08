"use client";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import DashboardClient from "@/components/DashboardClient";

export default function Dashboard() {
  const [data, setData] = useState<{ teams: any[]; matches: any[] }>({ teams: [], matches: [] });
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const [tr, mr] = await Promise.all([
        fetch(`${API_URL}/teams`),
        fetch(`${API_URL}/matches`),
      ]);
      const teams = await tr.json();
      const matches = await mr.json();
      setData({ 
        teams: Array.isArray(teams) ? teams : [], 
        matches: Array.isArray(matches) ? matches : [] 
      });
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div style={{ color: "var(--accent)", padding: 40, fontFamily: "DM Mono" }}>SYNCING ARENA...</div>;

  const { teams, matches } = data;
  const presentTeams = teams.filter((t: any) => t.attendance);
  const completedMatches = matches.filter((m: any) => m.status === "completed");
  const upcomingMatches = matches.filter((m: any) => m.status === "upcoming" || m.status === "live");
  const totalGoals = completedMatches.reduce((s, m) => s + (m.scoreA || 0) + (m.scoreB || 0), 0);
  
  const winners = completedMatches.map((m) => m.winner).filter(Boolean);
  const uniqueWinners = Array.from(new Map(winners.map((w: any) => [w.id, w])).values());
  
  let stage = "Round 1";
  if (uniqueWinners.length === 1 && completedMatches.length > 0) stage = "Champion Crowned 🏆";
  else if (uniqueWinners.length === 2) stage = "Finals";
  else if (uniqueWinners.length <= 4 && uniqueWinners.length > 2) stage = "Semifinals";

  const stats = [
    { label: "Registered Teams", value: teams.length, sub: `${presentTeams.length} present`, icon: "🏟️" },
    { label: "Matches Played", value: completedMatches.length, sub: `${upcomingMatches.length} remaining`, icon: "⚽" },
    { label: "Total Goals", value: totalGoals, sub: "across all rounds", icon: "🎯" },
    {
      label: "Tournament Stage",
      value: stage,
      sub: "Live Event",
      icon: "🏆",
    },
  ];

  const navItems = [
    { href: "/attendance", label: "Teams & Attendance", desc: "Add teams and toggle presence", icon: "📋" },
    { href: "/leaderboard", label: "Qualifier Leaderboard", desc: "View standings and top 16 ranking", icon: "📊" },
    { href: "/matches", label: "Manage Matches", desc: "Create matches and enter scores", icon: "⚽" },
    { href: "/results", label: "View Results", desc: "All match results by stage", icon: "📊" },
    { href: "/bracket", label: "Tournament Bracket", desc: "Knockout visualization", icon: "🏆" }
  ];

  const recentMatches = [...completedMatches].reverse().slice(0, 5);

  return (
    <DashboardClient
      stats={stats}
      navItems={navItems}
      recentMatches={recentMatches}
    />
  );
}
