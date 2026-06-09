import type { Metadata } from "next";
import "./globals.css";
import NotificationBell from "@/components/notifications/NotificationBell";

export const metadata: Metadata = {
  title: "Desk Invoice | Smart Billing & Inventory Software",
  description:
    "Desk Invoice is a modern billing and inventory management software for businesses, shops, and freelancers.",
  keywords: [
    "billing software",
    "invoice software",
    "inventory management",
    "gst billing",
    "business software",
    "desk invoice",
  ],
  authors: [{ name: "Jitendra Suthar" }],
  icons: {
    icon: "https://img.icons8.com/?size=100&id=105067&format=png&color=000000",
    shortcut: "/invoice.png",
    apple: "/invoice.png",
  },
  openGraph: {
    title: "Desk Invoice",
    description:
      "Modern billing and inventory management software for businesses.",
    url: "https://desk-invoice.vercel.app",
    siteName: "Desk Invoice",
    images: [
      {
        url: "https://img.icons8.com/?size=100&id=iPkvpBwIE0k7&format=png&color=000000",
        width: 512,
        height: 512,
        alt: "Desk Invoice Logo",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body> {children}</body>
    </html>
  );
}
