import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "C-C-C-Calendar",
  description: "Some calendar shenanigans",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
