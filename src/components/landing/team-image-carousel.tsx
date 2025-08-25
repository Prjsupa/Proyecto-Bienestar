
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const SUPABASE_STORAGE_URL = 'https://jqdbhsicpfdpzifphdft.supabase.co/storage/v1/object/public';

export function TeamImageCarousel() {
  const [isUniformsInFront, setIsUniformsInFront] = useState(false);

  return (
    <div 
        className="relative h-[300px] sm:h-[450px] lg:h-[500px] cursor-pointer group"
        onClick={() => setIsUniformsInFront(prev => !prev)}
        title="Haz clic para cambiar la imagen"
    >
        <Image
            src={`${SUPABASE_STORAGE_URL}/logos.marivi/personal_bata.jpg`}
            alt="Equipo de profesionales con batas"
            width={500}
            height={400}
            className={cn(
                "rounded-xl shadow-lg w-full sm:w-2/3 h-auto object-cover aspect-auto absolute transition-all duration-500 ease-in-out group-hover:scale-105",
                isUniformsInFront 
                    ? "bottom-0 left-0 z-0 scale-90 -rotate-6"
                    : "bottom-4 left-4 z-10 scale-100 rotate-0"
            )}
            data-ai-hint="team professional"
        />
        <Image
            src={`${SUPABASE_STORAGE_URL}/logos.marivi/personal_uniforme.jpg`}
            alt="Equipo de profesionales con uniformes"
            width={400}
            height={500}
            className={cn(
                "rounded-xl shadow-lg w-full sm:w-2/3 h-auto object-cover aspect-[4/5] absolute transition-all duration-500 ease-in-out group-hover:scale-105",
                isUniformsInFront
                    ? "right-4 top-4 z-10 scale-100 rotate-0"
                    : "right-0 top-0 z-0 scale-90 rotate-6"
            )}
            data-ai-hint="team fitness professional"
        />
    </div>
  );
}
