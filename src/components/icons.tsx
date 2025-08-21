"use client";

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

// === IMPORTANT ===
// Make sure your bucket 'logos.marivi' is public.
// The public URL for your Supabase storage is needed here.
// You can get it from your Supabase dashboard under Storage > Settings.
// It usually looks like: https://<your-project-ref>.supabase.co/storage/v1/object/public/
const SUPABASE_STORAGE_URL = 'https://jqdbhsicpfdpzifphdft.supabase.co/storage/v1/object/public';

// === PLEASE VERIFY ===
// I am assuming the filenames for your logos.
// If your filenames are different, please update them here.
// This version is for the imagotype only (the logo without the text below it).
const LOGO_FOR_LIGHT_MODE = 'iso rojo@3x.png';
const LOGO_FOR_DARK_MODE = 'iso blanco y rojo@3x.png';

export function Logo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder on the server to avoid hydration mismatch and layout shift.
    return <div style={{ width: '32px', height: '32px' }} aria-label="Marivi Power Logo" role="img"></div>;
  }

  const logoSrc = resolvedTheme === 'dark' ? LOGO_FOR_DARK_MODE : LOGO_FOR_LIGHT_MODE;

  return (
    <Image
      src={`${SUPABASE_STORAGE_URL}/logos.marivi/${logoSrc}`}
      alt="Marivi Power Logo"
      width={32}
      height={32}
      className="h-8 w-auto"
      priority
    />
  );
}
