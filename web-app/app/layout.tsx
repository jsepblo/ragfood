import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Food RAG Assistant",
  description:
    "AI-powered Retrieval-Augmented Generation system for food discovery",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
