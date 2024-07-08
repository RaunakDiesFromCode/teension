import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import Left from "./components/left";
import Right from "./components/right";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Providers } from "./components/providers";
import { Analytics } from "@vercel/analytics/react";
<link rel="icon" href="/favicon.ico" sizes="any" />;

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Teension | Very Beta",
  description: "The modern social media platformp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    // <html lang="en">
    //   <body className={inter.className}>{children}</body>
    // </html>

    <html lang="en" className="text-white" suppressHydrationWarning>
      <Providers>
        <body className="bg-white dark:bg-black transition-colors duration-100">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
          <div className="flex flex-col">
            <div className="fixed top-0 left-0 right-0 z-50">
              <Navbar />
              <div className="flex h-[90vh]">
                <Left />
                <div className="flex bg-gray-200 dark:bg-gray-900 py-2 my-3 mr-3 px-4 w-[200rem] flex-col rounded-xl overflow-scroll transition-colors duration-100">
                  {/* <body className={inter.className}>{children}</body> */}
                  {children}
                </div>
                <Right />
              </div>
            </div>
          </div>
        </body>
      </Providers>
      <Analytics />
    </html>
  );
}
