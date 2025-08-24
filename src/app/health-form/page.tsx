
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { HealthForm } from '@/components/profile/health-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { HealthFormData } from '@/types/health-form';
import { FileText } from 'lucide-react';
import { Logo } from '@/components/icons';

export default function HealthFormPage() {
    const [user, setUser] = useState<User | null>(null);
    const [initialData, setInitialData] = useState<HealthFormData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const getInitialData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data: formData } = await supabase
                    .from('formulario')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();
                
                if (formData && formData.pregunta_1_edad) {
                    // If user already filled the form, they shouldn't be here.
                    // The middleware will handle this, but as a fallback:
                    router.push('/dashboard');
                    return;
                }
            } else {
                router.push('/login');
            }
            setLoading(false);
        };

        getInitialData();
    }, [router, supabase]);

    const handleSuccess = () => {
        // After submitting, go to dashboard
        router.push('/dashboard'); 
    }

    if (loading) {
        return (
             <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
                <div className="w-full max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-4 w-3/4 mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-8 pt-6">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }
    
    return (
         <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
            <div className="absolute top-4 left-4 flex items-center gap-2 font-bold text-lg">
                <Logo />
                <span className="font-logo tracking-widest text-xl">MARIVI POWER</span>
            </div>
            <div className="w-full max-w-4xl mx-auto">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline flex items-center gap-2">
                           <FileText className="w-6 h-6" /> Formulario Inicial
                        </CardTitle>
                        <CardDescription>
                           Completa este formulario para que podamos crear un plan personalizado para ti.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {user && (
                            <HealthForm 
                                userId={user.id} 
                                initialData={initialData} 
                                onFormSubmit={handleSuccess} 
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
