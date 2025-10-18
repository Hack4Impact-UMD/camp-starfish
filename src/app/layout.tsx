import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import Navbar from "../components/Navbar"; // Adjust the path as needed
import AuthProvider from "@/auth/AuthProvider";
import Footer from "../components/Footer";

import "@mantine/core/styles.css";
import {
  MantineColorsTuple,
  MantineProvider,
  MantineThemeOverride,
} from "@mantine/core";

const lato = localFont({
  src: [
    {
      path: "../../public/fonts/Lato/Lato-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lato/Lato-BlackItalic.ttf",
      weight: "900",
      style: "italic",
    },
    {
      path: "../../public/fonts/Lato/Lato-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lato/Lato-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/Lato/Lato-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lato/Lato-LightItalic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/Lato/Lato-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lato/Lato-RegularItalic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/Lato/Lato-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lato/Lato-ThinItalic.ttf",
      weight: "100",
      style: "italic",
    },
  ],
  variable: "--font-lato",
});

const newSpirit = localFont({
  src: [
    {
      path: "../../public/fonts/NewSpirit/NewSpirit-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/NewSpirit/NewSpirit-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/NewSpirit/NewSpirit-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/NewSpirit/NewSpirit-LightItalic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/NewSpirit/NewSpirit-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/NewSpirit/NewSpirit-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/NewSpirit/NewSpirit-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/NewSpirit/NewSpirit-RegularItalic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/NewSpirit/NewSpirit-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/NewSpirit/NewSpirit-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
  ],
  variable: "--font-newSpirit",
});

const besteam = localFont({
  src: "../../public/fonts/Besteam.ttf",
  weight: "400",
  style: "regular",
  variable: "--font-besteam",
});

const mantineTheme: MantineThemeOverride = {
  colors: {
    neutral: [
      ...Array<string>(2).fill('#FFFFFF'),
      '#FAFAFB',
      '#DEE1E3',
      '#C0C6C9',
      '#3B4E57',
      '#2F424C',
      ...Array<string>(3).fill('#1D323D')
    ] as unknown as MantineColorsTuple,
    primary: [
      ...Array<string>(4).fill("#E6EAEC"),
      "#2B5165",
      "#002D45",
      ...Array<string>(4).fill("#001B2A"),
    ] as unknown as MantineColorsTuple,
    "secondary-orange": [
      ...Array<string>(4).fill("#FACCA3"),
      "#F4831F",
      "#AB5C16",
      ...Array<string>(4).fill("#955013"),
    ] as unknown as MantineColorsTuple,
    "secondary-green": [
      ...Array<string>(4).fill("#99E2BF"),
      "#07B862",
      "#058145",
      ...Array<string>(4).fill("#04703C"),
    ] as unknown as MantineColorsTuple,
    "accent-yellow": [
      ...Array<string>(3).fill("#FFEC9F"),
      "#FFE475",
      "#FFDE59",
      "#B39B3E",
      ...Array<string>(4).fill("#9C8736"),
    ] as unknown as MantineColorsTuple,
    "accent-blue": [
      ...Array<string>(3).fill("#6BD5E3"),
      "#2BC2D6",
      "#00B6CE",
      "#007F90",
      ...Array<string>(4).fill("#006F7E"),
    ] as unknown as MantineColorsTuple,
    success: [
      ...Array<string>(5).fill("#1E8E3E"),
      "#15632B",
      ...Array<string>(4).fill("#125726"),
    ] as unknown as MantineColorsTuple,
    error: [
      ...Array<string>(5).fill("#D32F2F"),
      "#942121",
      ...Array<string>(4).fill("#811D1D"),
    ] as unknown as MantineColorsTuple,
    warning: [
      ...Array<string>(5).fill("#EFAF00"),
      "#A77A00",
      ...Array<string>(4).fill("#926B00"),
    ] as unknown as MantineColorsTuple,
    link: Array<string>(10).fill('#1A80D8') as unknown as MantineColorsTuple,
  },
  primaryShade: 4,
  primaryColor: 'primary',
};

export const metadata: Metadata = {
  title: "Camp Starfish",
  description: "Camp Starfish's photo portal and scheduling application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${lato.variable} ${newSpirit.variable} ${besteam.variable} antialiased w-full min-h-screen flex flex-col`}
      >
        <MantineProvider theme={mantineTheme}>
          <AuthProvider>
            <>
              <div className="w-full">
                <Navbar />
              </div>
              <div className="flex-grow w-full">{children}</div>
              <div className="w-full">
                <Footer />
              </div>
            </>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
