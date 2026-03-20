import Navbar from "./components/navbar";
import Header from "./components/header";
import "./globals.css";
import "../output.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Farm Brain",
  description: "smart farm",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Mitr:wght@200;300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="../output.css" rel="stylesheet"></link>
      </head>
      <body className="font-mitr">
        <Providers>
          <Header />
          {children}
          <Navbar />
        </Providers>
      </body>
    </html>
  );
}
