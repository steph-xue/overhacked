import "@/app/globals.css";

export default function RootLayout({children}: {children: React.ReactNode;}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F3E9D9]">
        {children}
      </body>
    </html>
  );
}