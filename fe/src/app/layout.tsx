import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "AmanPay — Deal jelas, dana aman",
  description: "Rekber programmable untuk transaksi digital dari chat.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
