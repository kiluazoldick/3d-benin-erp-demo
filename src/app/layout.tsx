// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { DataProvider } from "@/context/DataContext";

export const metadata: Metadata = {
  title: "BTP-ERP | 3N BENIN",
  description: "Système de gestion intégré pour 3N BENIN",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-smoke text-ink antialiased">
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
