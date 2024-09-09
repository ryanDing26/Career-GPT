import type { Metadata } from "next";
import { Inter, Nabla } from "next/font/google";
import "./globals.css";
import Nav from './components/Nav';
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });
const nabla = Nabla({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Career-GPT",
  description: "Elevate your career preparation and build your network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-amber-200 ${inter.className}`}>
        <Nav></Nav>
        {children}
        <Footer></Footer>
      </body>
    </html>
  );
}
