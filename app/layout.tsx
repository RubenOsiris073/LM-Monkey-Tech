import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grocery ML Classifier",
  description: "Plataforma de machine learning para clasificación de productos de abarrotes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
