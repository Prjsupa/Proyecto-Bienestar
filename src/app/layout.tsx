
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
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquear Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+P, PrintScreen
      if (e.ctrlKey && ['c', 'v', 'x', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      // La tecla 'PrintScreen' no siempre es detectable, pero lo intentamos.
      if (e.key === 'PrintScreen') {
        e.preventDefault();
      }
    };

    const handleBeforePrint = () => {
      setIsPrinting(true);
    };

    const handleAfterPrint = () => {
      setIsPrinting(false);
    };
    
    // Escuchar eventos de teclado
    window.addEventListener('keydown', handleKeyDown);
    // Escuchar eventos de impresión
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
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
        <style>
          {`
            @media print {
              body * {
                display: none !important;
              }
              body::before {
                content: "La impresión de este contenido está deshabilitada.";
                display: block;
                text-align: center;
                font-size: 24px;
                padding: 50px;
                color: black;
              }
            }
          `}
        </style>
      </head>
      <body className="font-body antialiased min-h-screen">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <div 
              onContextMenu={(e) => e.preventDefault()} 
              className={isPrinting ? 'print-block' : ''}
            >
              {children}
            </div>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
