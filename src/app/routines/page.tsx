
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { AppLayout } from "@/components/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoutinesView } from "@/components/routines-view";
import { Skeleton } from '@/components/ui/skeleton';
import { Dumbbell } from 'lucide-react';

export default function RoutinesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [userEnvironment, setUserEnvironment] = useState<'casa' | 'gimnasio' | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const { data: profile } = await supabase.from('usuarios').select('rol, entorno').eq('id', user.id).single();
      if (profile) {
        setUserRole(profile.rol);
        setUserEnvironment(profile.entorno);
      }
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-full mx-auto">
          <div className="space-y-2 mb-8">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64" />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  const renderForProfessional = () => (
    <Tabs defaultValue="home" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="home">En Casa</TabsTrigger>
        <TabsTrigger value="gym">Gimnasio</TabsTrigger>
      </TabsList>
      
      <TabsContent value="home" className="mt-6">
        <RoutinesView environment="casa" />
      </TabsContent>
      <TabsContent value="gym" className="mt-6">
        <RoutinesView environment="gimnasio" />
      </TabsContent>
    </Tabs>
  );

  const renderForUser = () => {
    if (!userEnvironment) {
      return (
        <div className="text-center py-10">
            <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Preferencias no establecidas</h3>
            <p className="mt-1 text-sm text-gray-500">Por favor, completa tu formulario de salud en tu perfil para ver tus rutinas.</p>
        </div>
      );
    }
    return <RoutinesView environment={userEnvironment} />;
  }

  return (
    <AppLayout>
      <div className="max-w-full mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold font-headline">Centro de Rutinas</h1>
          <p className="text-muted-foreground">
            {userRole === 1 
              ? "Gestiona las rutinas de entrenamiento para casa y gimnasio."
              : "Encuentra el entrenamiento perfecto para ti."
            }
          </p>
        </div>
        
        {userRole === 1 ? renderForProfessional() : renderForUser()}
      </div>
    </AppLayout>
  );
}

    