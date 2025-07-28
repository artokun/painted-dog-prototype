import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";

const fieldsFont = localFont({
  src: [
    {
      path: "./fonts/FieldsDisplayRegular.woff2",
      weight: "normal",
      style: "normal",
    },
    {
      path: "./fonts/FieldsDisplaySemiBoldRegular.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/FieldsDisplayBold.woff2",
      weight: "bold",
      style: "normal",
    },
    {
      path: "./fonts/FieldsDisplayMediumRegular.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-fields",
});

import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Painted Dog",
  description: "A book stacking visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${fieldsFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
