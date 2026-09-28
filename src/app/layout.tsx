import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ariz — Homes and apartments in Peru",
    template: "%s | Ariz",
  },
  description:
    "Real estate portal to find homes, apartments, land and projects in Peru.",
<<<<<<< HEAD
=======
  icons: {
    icon: [
      { rel: "icon", url: "/web_v/logo_web.png", type: "image/png" },
      { rel: "apple-touch-icon", url: "/web_v/logo_web.png", type: "image/png" },
    ],
  },
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
<<<<<<< HEAD
    <html lang="es">
=======
    <html lang="es" data-scroll-behavior="smooth">
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}