"use client"

import Head from "next/head";
import { Poppins } from "next/font/google";
import "./globals.css";

import Childrens from "./Childrens";

const pop = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <meta charSet="UTF-8" />

        <link rel="icon" href="../public/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100&display=swap"
          rel="stylesheet"
        />
      </Head>

      <body className={pop.className}>
        <div suppressHydrationWarning className="Nav-children-container">
          <Childrens 
           >
             {children}
            
          </Childrens>
        </div>
      </body>
    </html>
  );
}

/*https://codepen.io/dinwun450/pen/BvoxJV */
