
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { AppLayout } from '@/components/app-layout';
import { HealthForm } from '@/components/profile/health-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { HealthFormData } from '@/types/health-form';
import { FileText } from 'lucide-react';

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
                setInitialData(formData);
            } else {
                router.push('/login');
            }
            setLoading(false);
        };

        getInitialData();
    }, [router, supabase]);

    const handleSuccess = () => {
        // Redirect to dashboard or profile after successful submission
        router.push('/dashboard');
    }

    if (loading) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-4 w-3/4 mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-8 pt-6">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <div className="flex justify-between">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }
    
    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline flex items-center gap-2">
                           <FileText className="w-6 h-6" /> Formulario de Bienestar
                        </CardTitle>
                        <CardDescription>
                            Tus respuestas nos ayudarán a crear un plan completamente personalizado para ti. Por favor, sé lo más precisa posible.
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
        </AppLayout>
    );
}

