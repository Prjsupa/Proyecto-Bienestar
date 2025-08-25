
"use client";

import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';
import { useEffect, useState } from 'react';

// export const metadata: Metadata = {
//   title: 'Marivi Power',
//   description: 'Tu viaje hacia una vida más saludable comienza aquí.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquear Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+P, PrintScreen
      if (e.ctrlKey && ['c', 'v', 'x', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        // Esto no puede evitar la captura, pero sí puede intentar interferir.
        alert('Las capturas de pantalla están deshabilitadas.');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>Marivi Power</title>
        <meta name="description" content="Tu viaje hacia una vida más saludable comienza aquí." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <div onContextMenu={(e) => e.preventDefault()} className="secure-content">
                {children}
            </div>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
