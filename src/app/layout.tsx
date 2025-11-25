import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { APP_NAME } from "@/config/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - AI Baby Meal Planner`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Smart, personalized meal plans for babies. AI-powered nutrition guidance for parents with babies 6-24 months.",
  keywords: [
    "baby meal plan",
    "baby food",
    "baby nutrition",
    "infant feeding",
    "baby led weaning",
    "first foods",
    "toddler meals",
  ],
  authors: [{ name: APP_NAME }],
  openGraph: {
    title: `${APP_NAME} - AI Baby Meal Planner`,
    description:
      "Smart, personalized meal plans for babies. AI-powered nutrition guidance for parents.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
