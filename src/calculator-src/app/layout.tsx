import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/theme/ThemeProvider";
import ThemeToggleButton from "@/components/ThemeToggleButton";

export const metadata: Metadata = {
  title: "SustainOS GHG Calculator | Carbon Crunch",
  description: "Calculate your Scope 1 and 2 emissions easily, and sign up to unlock Scope 3 with our 3-day SustainOS trial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider>
          <ThemeToggleButton />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
