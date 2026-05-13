import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodedLogs",
  description: "Digital Asset Repository",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-black text-[#00ff41] font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
