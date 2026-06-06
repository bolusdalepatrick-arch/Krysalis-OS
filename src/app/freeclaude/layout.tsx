import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Krysalis OS — Freeclaude",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
