import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Krysalis OS — Seo-guide",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
