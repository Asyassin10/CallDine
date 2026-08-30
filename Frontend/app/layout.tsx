import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets:["latin"], variable:"--font-manrope" });
const mono = IBM_Plex_Mono({ subsets:["latin"], weight:["400","500"], variable:"--font-mono" });

export const metadata: Metadata = { title:"CallDine", description:"Restaurant voice ordering and operations" };

export default function RootLayout({ children }: Readonly<{children:React.ReactNode}>) {
  return <html lang="en"><body className={`${manrope.variable} ${mono.variable}`}>{children}</body></html>;
}
