import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>

        {/* Toast Container */}
        <Toaster 
          position="top-center" 
          richColors 
          closeButton 
          duration={4500}
        />
      </body>
    </html>
  );
}