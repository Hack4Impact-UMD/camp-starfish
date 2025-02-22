import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";

const lato = localFont({
  src: [
    { path: "../../Lato-Black.ttf", weight: "900", style: "normal" },
    { path: "../../Lato-BlackItalic.ttf", weight: "900", style: "italic" },
    { path: "../../Lato-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../Lato-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "../../Lato-Light.ttf", weight: "300", style: "normal" },
    { path: "../../Lato-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../../Lato-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../Lato-RegularItalic.ttf", weight: "400", style: "italic" },
    { path: "../../Lato-Thin.ttf", weight: "100", style: "normal" },
    { path: "../../Lato-ThinItalic.ttf", weight: "100", style: "italic" },
  ],
  variable: "--font-lato",
});

const newSpirit = localFont({
  src: [
    { path: "../../NewSpirit-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../NewSpirit-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "../../NewSpirit-Light.ttf", weight: "300", style: "normal" },
    { path: "../../NewSpirit-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../../NewSpirit-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../NewSpirit-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../../NewSpirit-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../NewSpirit-RegularItalic.ttf", weight: "400", style: "italic" },
    { path: "../../NewSpirit-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../NewSpirit-SemiBoldItalic.ttf", weight: "600", style: "italic" },
  ],
  variable: "--font-new-spirit"
})

const besteam = localFont({
  src: "../../public/fonts/Besteam.ttf",
  weight: "400",
  style: "regular",
  variable: "--font-besteam"
})

export const metadata: Metadata = {
  title: "Camp Starfish",
  description: "Camp Starfish's photo portal and scheduling application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lato.variable} ${newSpirit.variable} ${besteam.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
