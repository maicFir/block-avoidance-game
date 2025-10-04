import type { Metadata } from "next";
import "@src/styles/globals.css";
import AuthSessionProvider from "@src/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Game",
  description: "a simple game for block transition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
