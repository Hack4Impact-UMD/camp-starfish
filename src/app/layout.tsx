import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar"; // Adjust the path as needed
import AuthProvider from "@/auth/AuthProvider";
import Footer from "../components/Footer";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { lato, newSpirit, besteam } from "../styles/fonts";
import { theme } from "../styles/theme";

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
        <MantineProvider theme={theme}>
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
