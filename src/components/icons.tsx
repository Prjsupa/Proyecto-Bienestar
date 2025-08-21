
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
// I am assuming the filenames based on your upload.
// If your filenames are different, please update them here.
const LOGO_FOR_LIGHT_MODE = 'negro rojo imago@3x.png'; // Assuming this is for light backgrounds
const LOGO_FOR_DARK_MODE = 'blanco rojo imago@3x.png'; // This is the one you showed me

export function Logo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder or nothing on the server to avoid hydration mismatch
    return <div style={{ width: '120px', height: '32px' }} aria-label="Marivi Power Logo" role="img"></div>;
  }

  const logoSrc = resolvedTheme === 'dark' ? LOGO_FOR_DARK_MODE : LOGO_FOR_LIGHT_MODE;

  return (
    <Image
      src={`${SUPABASE_STORAGE_URL}/logos.marivi/${logoSrc}`}
      alt="Marivi Power Logo"
      width={120}
      height={32}
      className="h-8 w-auto"
      priority // The logo is important, so we prioritize its loading
    />
  );
}
