import type { Metadata } from "next";
import { QueryProvider } from "@/contexts/QueryProvider";

export const metadata: Metadata = {
  title: "Curia - Web3 Forum Embed",
  description: "Embed authentication interface for Web3 forums",
  // Minimal metadata for embed context
};

export default function EmbedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased overflow-x-hidden">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
} 