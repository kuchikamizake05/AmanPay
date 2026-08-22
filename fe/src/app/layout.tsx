import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "AmanPay — Non-Custodial Escrow & Deal OS",
  description: "Programmable smart contract escrow for informal digital commerce and chat deals on Stellar Soroban.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
