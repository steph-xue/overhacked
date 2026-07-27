import "./globals.css";
import { Silkscreen } from "next/font/google";

const silkscreen = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Overhacked!</title>
        <link rel="icon" href="/favicons/overhacked-favicon.png" />
      </head>
      <body className={`${silkscreen.className} min-h-screen bg-[#F3E9D9]`}>
        {children}
      </body>
    </html>
  );
}