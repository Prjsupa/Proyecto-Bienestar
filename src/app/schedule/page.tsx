
"use client";

import { useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/client";
import { UserSchedulerView } from "@/components/schedule/user-scheduler-view";
import { ProfessionalSchedulerView } from "@/components/schedule/professional-view";

export default function SchedulePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  
  const fetchUserRole = useCallback(async (user: User) => {
    const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single();
    if (profile) {
      setUserRole(profile.rol);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const getInitialData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await fetchUserRole(user);
      } else {
        setLoading(false);
      }
    };
    getInitialData();
  }, [fetchUserRole, supabase]);

  if (loading) {
    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <Card>
                    <CardHeader className="p-6">
                        <Skeleton className="h-6 w-1/3" />
                    </CardHeader>
                    <CardContent className="p-6">
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
  }

  return (
    <AppLayout>
      {userRole === 1 ? (
        <ProfessionalSchedulerView />
      ) : (
        <UserSchedulerView currentUser={user} />
      )}
    </AppLayout>
  );
}
