import type { Metadata } from "next";
import { APP_NAME } from "@/config/constants";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - AI Baby Meal Planner`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Smart, personalized meal plans for babies. AI-powered nutrition guidance for parents with babies 6-24 months.",
};

// Root layout - just passes children through
// The actual HTML structure is in [locale]/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
