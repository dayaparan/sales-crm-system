import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./dashboard/scss/app.scss";
import "simplebar-react/dist/simplebar.min.css";
import "react-phone-input-2/lib/style.css";
import { Providers } from "@/components/partials/Provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ Define metadata here (this replaces <Head>)
export const metadata = {
  title: "Sales Management | Admin Dashboard",
  description: "Sales Management | Admin Dashboard",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#14234a]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
