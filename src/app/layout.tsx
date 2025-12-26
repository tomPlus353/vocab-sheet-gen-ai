import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { SettingsProvider } from "./SettingsProvider";

export const metadata: Metadata = {
    title: "Japanese Ereader",
    description:
        "A tool to help students of Japanese read and understand difficult texts.",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={`${GeistSans.variable}`}>
            <body className="h-screen w-full overflow-x-hidden bg-gradient-to-b from-slate-900 to-slate-800 text-gray-300">
                <SettingsProvider>
                    <TRPCReactProvider>{children}</TRPCReactProvider>
                </SettingsProvider>
            </body>
        </html>
    );
}
