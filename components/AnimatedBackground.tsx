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
      {/* Moving gradient orbs */}
      <motion.div
        animate={{ x: [0, 120, -60, 0], y: [0, -100, 80, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(232,255,60,0.07) 0%, transparent 70%)",
          top: "-250px",
          left: "-150px",
          filter: "blur(50px)",
        }}
      />
      <motion.div
        animate={{ x: [0, -100, 60, 0], y: [0, 120, -80, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(232,255,60,0.05) 0%, transparent 70%)",
          bottom: "-150px",
          right: "-100px",
          filter: "blur(60px)",
        }}
      />
      <motion.div
        animate={{ x: [0, 60, -80, 0], y: [0, 80, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(232,255,60,0.04) 0%, transparent 70%)",
          top: "40%",
          left: "50%",
          filter: "blur(40px)",
        }}
      />

      {/* Subtle grid mesh */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(232,255,60,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,255,60,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}
