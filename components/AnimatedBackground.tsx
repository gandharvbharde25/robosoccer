"use client";
import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
      aria-hidden
    >
      {/* Orb 1 — lime yellow, top-left */}
      <motion.div
        animate={{ x: [0, 120, -60, 0], y: [0, -100, 80, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(232,255,60,0.12) 0%, rgba(232,255,60,0.04) 40%, transparent 70%)",
          top: "-300px",
          left: "-200px",
          filter: "blur(60px)",
        }}
      />

      {/* Orb 2 — lime yellow, bottom-right */}
      <motion.div
        animate={{ x: [0, -100, 60, 0], y: [0, 120, -80, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(232,255,60,0.09) 0%, rgba(232,255,60,0.03) 40%, transparent 70%)",
          bottom: "-200px",
          right: "-150px",
          filter: "blur(70px)",
        }}
      />

      {/* Orb 3 — electric cyan, center */}
      <motion.div
        animate={{ x: [0, 80, -60, 30, 0], y: [0, -60, 80, -40, 0] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,200,255,0.09) 0%, rgba(0,200,255,0.03) 40%, transparent 70%)",
          top: "30%",
          left: "55%",
          filter: "blur(80px)",
        }}
      />

      {/* Orb 4 — cyan accent, upper-right */}
      <motion.div
        animate={{ x: [0, -80, 40, 0], y: [0, 60, -80, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: 450,
          height: 450,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,200,255,0.07) 0%, transparent 65%)",
          top: "-80px",
          right: "15%",
          filter: "blur(55px)",
        }}
      />

      {/* Orb 5 — yellow, bottom-left */}
      <motion.div
        animate={{ x: [0, 60, -80, 0], y: [0, 80, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(232,255,60,0.07) 0%, transparent 65%)",
          bottom: "10%",
          left: "5%",
          filter: "blur(45px)",
        }}
      />

      {/* Subtle grid mesh */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(232,255,60,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,255,60,0.035) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(8,8,12,0.6) 100%)",
        }}
      />
    </div>
  );
}
