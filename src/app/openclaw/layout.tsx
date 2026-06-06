import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Krysalis OS — Openclaw",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
