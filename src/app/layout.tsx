import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudiOS",
  description: "An AI-powered web application that transforms messy notes into smart, interactive study experiences with summaries, flashcards, quizzes, and AI chatbot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
