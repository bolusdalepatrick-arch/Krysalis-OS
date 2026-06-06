import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Krysalis OS — Gemini",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
