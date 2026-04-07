import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import Nav from "@/components/Nav";
import AnimatedBackground from "@/components/AnimatedBackground";

export const metadata: Metadata = {
  title: "Techtonics — RoboSoccer",
  description: "RoboSoccer Tournament Manager for Techtonics",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const role = cookieStore.get("rs_session")?.value ?? null;

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
        <AnimatedBackground />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          {role && <Nav role={role} />}
          <main className="flex-1 px-4 py-6 w-full" style={{ maxWidth: "80rem", margin: "0 auto", minWidth: 0 }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
