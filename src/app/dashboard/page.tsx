
"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Users, UtensilsCrossed, ArrowRight, Dumbbell, Calendar, Video, PlusCircle, Activity, Shield, UserCog, UserPlus, CalendarPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Recipe } from "@/types/recipe";
import type { Routine } from "@/types/routine";
import type { Cita } from "@/types/community";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function UserDashboard({ user, greeting, dailyRecipe, recipeLoading, dailyRoutine, routineLoading, appointment, appointmentLoading }: { user: User | null, greeting: string, dailyRecipe: Recipe | null, recipeLoading: boolean, dailyRoutine: Routine | null, routineLoading: boolean, appointment: Cita | null, appointmentLoading: boolean }) {
    const getStatusInfo = (status: Cita['estado']) => {
        switch (status) {
            case 'pendiente': return { variant: 'secondary', text: 'Pendiente' };
            case 'confirmada': return { variant: 'default', text: 'Confirmada' };
            case 'cancelada': return { variant: 'destructive', text: 'Cancelada' };
            default: return { variant: 'outline', text: 'Desconocido' };
        }
    }
    
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">{greeting}</h1>
                <p className="text-muted-foreground">Aquí tienes tu resumen de bienestar para hoy.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Dumbbell className="w-5 h-5" /> Rutina del Día</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                    {routineLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ) : dailyRoutine ? (
                        <div className="space-y-2">
                            <h3 className="font-semibold font-headline">{dailyRoutine.titulo}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{dailyRoutine.descripcion}</p>
                            <Button asChild variant="link" className="p-0 h-auto">
                                <Link href="/routines">Ver Todas las Rutinas <ArrowRight className="w-4 h-4 ml-1" /></Link>
                            </Button>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No hay rutinas nuevas hoy. ¡Vuelve mañana!</p>
                    )}
                    </CardContent>
                </Card>
            
                <Card className="lg:col-span-2 bg-primary/5 dark:bg-primary/10 border-primary/20">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><CalendarPlus className="w-5 h-5" /> Próxima Cita</CardTitle>
                        <CardDescription>Consulta o agenda tu próxima cita con un profesional.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {appointmentLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                        ) : appointment ? (
                             <div className="space-y-2">
                                <p className="font-semibold text-lg">{format(new Date(appointment.fecha_agendada), "eeee, dd 'de' MMMM", { locale: es })}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-muted-foreground">Estado:</p>
                                    <Badge variant={getStatusInfo(appointment.estado).variant}>{getStatusInfo(appointment.estado).text}</Badge>
                                </div>
                             </div>
                        ) : (
                            <div className="text-center py-4 flex flex-col items-center gap-2">
                                <p className="text-sm text-muted-foreground">No tienes ninguna cita programada.</p>
                                <Button asChild>
                                    <Link href="/schedule">Agendar Cita Ahora</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                     <CardFooter>
                        <Button asChild variant="link" className="p-0 h-auto text-sm">
                            <Link href="/schedule">Gestionar mis citas <ArrowRight className="w-4 h-4 ml-1" /></Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><UtensilsCrossed className="w-5 h-5" /> Receta del Día</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-4">
                    {recipeLoading ? (
                        <>
                        <Skeleton className="w-[150px] h-[100px] rounded-lg" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        </>
                    ) : dailyRecipe ? (
                        <>
                        <Image 
                            src={dailyRecipe.img_url || "https://placehold.co/400x300.png"}
                            alt={dailyRecipe.titulo}
                            width={150}
                            height={100}
                            className="rounded-lg object-cover"
                            data-ai-hint="recipe food"
                        />
                        <div className="space-y-2">
                            <h3 className="font-semibold font-headline">{dailyRecipe.titulo}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{dailyRecipe.descripcion}</p>
                            <Button asChild variant="link" className="p-0 h-auto">
                                <Link href="/recipes">Ver Todas las Recetas <ArrowRight className="w-4 h-4 ml-1" /></Link>
                            </Button>
                        </div>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">No hay recetas nuevas hoy. ¡Vuelve mañana!</p>
                    )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Users className="w-5 h-5" /> Novedades de la Comunidad</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center text-center justify-center h-full gap-2">
                       <p className="text-sm text-muted-foreground">Conecta con otros miembros y comparte tu progreso.</p>
                        <Button asChild variant="outline">
                            <Link href="/community">Únete a la Conversación <ArrowRight className="w-4 h-4 ml-1" /></Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function ProfessionalDashboard({ greeting, stats }: { greeting: string, stats: any }) {
    const quickActions = [
        { href: "/recipes", icon: UtensilsCrossed, label: "Gestionar Recetas" },
        { href: "/routines", icon: Dumbbell, label: "Gestionar Rutinas" },
        { href: "/live", icon: Video, label: "Gestionar Clases en Vivo" },
        { href: "/schedule", icon: Calendar, label: "Revisar Citas" },
        { href: "/technique-clinic", icon: Activity, label: "Clínica de Técnica" },
    ];

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">{greeting}</h1>
                <p className="text-muted-foreground">Bienvenido al centro de control de VitaNova.</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recetas Totales</CardTitle>
                        <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {stats.loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.recipes}</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rutinas Totales</CardTitle>
                        <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {stats.loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.routines}</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Citas Pendientes</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {stats.loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.appointments}</div>}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                    <CardDescription>Crea y gestiona el contenido de la plataforma desde aquí.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {quickActions.map(action => (
                        <Button key={action.href} asChild variant="outline" className="justify-start h-12 text-base">
                            <Link href={action.href}>
                                <action.icon className="w-5 h-5 mr-3" />
                                {action.label}
                            </Link>
                        </Button>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}

function ModeratorDashboard({ greeting, stats }: { greeting: string, stats: any }) {
    const mainActions = [
        { href: "/community", icon: Users, label: "Moderar Comunidad", description: "Revisa publicaciones, preguntas y respuestas." },
        { href: "/moderation/users", icon: UserCog, label: "Gestionar Usuarios", description: "Visualiza a todos los usuarios por rol." },
        { href: "/moderation/registrations", icon: UserPlus, label: "Gestionar Registros", description: "Activa o desactiva los enlaces de registro." },
        { href: "/moderation/history", icon: Shield, label: "Historial de Moderación", description: "Consulta todas las acciones realizadas." },
    ];

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">{greeting}</h1>
                <p className="text-muted-foreground">Bienvenido al panel de moderación.</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {stats.loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.users}</div>}
                        <p className="text-xs text-muted-foreground">Total de usuarios regulares en la plataforma.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Acciones de Moderación (Hoy)</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                         {stats.loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.moderation_actions}</div>}
                         <p className="text-xs text-muted-foreground">Acciones realizadas en las últimas 24 horas.</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                 <h2 className="text-xl font-bold font-headline">Herramientas de Moderación</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {mainActions.map(action => (
                        <Link href={action.href} key={action.href} className="block group">
                            <Card className="h-full transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1">
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                                       <action.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <CardTitle>{action.label}</CardTitle>
                                        <CardDescription>{action.description}</CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [greeting, setGreeting] = useState("¡Bienvenido!");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // State for User Dashboard
  const [dailyRecipe, setDailyRecipe] = useState<Recipe | null>(null);
  const [recipeLoading, setRecipeLoading] = useState(true);
  const [dailyRoutine, setDailyRoutine] = useState<Routine | null>(null);
  const [routineLoading, setRoutineLoading] = useState(true);
  const [appointment, setAppointment] = useState<Cita | null>(null);
  const [appointmentLoading, setAppointmentLoading] = useState(true);
  
  // State for Professional & Moderator Dashboards
  const [stats, setStats] = useState({ 
      recipes: 0, 
      routines: 0, 
      appointments: 0, 
      users: 0, 
      moderation_actions: 0, 
      loading: true 
  });

  const supabase = createClient();

  useEffect(() => {
    const getUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        router.push('/login');
        return;
      }
      
      setUser(user);

      const { data: profile } = await supabase.from('usuarios').select('rol, name, last_name').eq('id', user.id).single();
      const role = profile?.rol ?? 0;
      setUserRole(role);
      
      // For regular users, check if they have filled the form
      if (role === 0) {
        const { data: formData, error: formError } = await supabase.from('formulario').select('id').eq('user_id', user.id).maybeSingle();
        
        if (formError && formError.code !== 'PGRST116') { // PGRST116 is "No rows found"
            console.error("Error checking for health form:", formError);
        }
        
        if (!formData) {
            router.push('/health-form');
            // We don't need to continue loading dashboard data since we're redirecting
            return;
        }
      }

      setLoading(true);

      const name = profile?.name || user.user_metadata?.name || 'Usuario';
      const lastName = profile?.last_name || user.user_metadata?.last_name || '';
      const fullName = `${name} ${lastName}`.trim();
      
      const hours = new Date().getHours();
      if (hours < 12) setGreeting(`¡Buenos días, ${fullName}!`);
      else if (hours < 18) setGreeting(`¡Buenas tardes, ${fullName}!`);
      else setGreeting(`¡Buenas noches, ${fullName}!`);

      if (role === 1) { // Professional
          setStats(prev => ({ ...prev, loading: true }));
          const { count: recipesCount } = await supabase.from('recetas').select('*', { count: 'exact', head: true });
          const { count: routinesCount } = await supabase.from('rutinas').select('*', { count: 'exact', head: true });
          const { count: appointmentsCount } = await supabase.from('cita').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente');
          setStats(prev => ({
              ...prev,
              recipes: recipesCount ?? 0,
              routines: routinesCount ?? 0,
              appointments: appointmentsCount ?? 0,
              loading: false
          }));
      } else if (role === 2) { // Moderator
          setStats(prev => ({ ...prev, loading: true }));
          const today = new Date();
          today.setHours(0,0,0,0);
          const { count: usersCount } = await supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('rol', 0);
          const { count: modActionsCount } = await supabase.from('accion_moderador').select('*', { count: 'exact', head: true }).gte('fecha', today.toISOString());
           setStats(prev => ({
              ...prev,
              users: usersCount ?? 0,
              moderation_actions: modActionsCount ?? 0,
              loading: false
          }));
      } else { // Regular User
          setRecipeLoading(true);
          setRoutineLoading(true);
          setAppointmentLoading(true);

          const { data: recipeData } = await supabase.from('recetas').select('*').eq('visible', true).order('fecha', { ascending: false }).limit(1).single();
          setDailyRecipe(recipeData);
          setRecipeLoading(false);
          
          const { data: routineData } = await supabase.from('rutinas').select('*').eq('visible', true).order('fecha', { ascending: false }).limit(1).single();
          setDailyRoutine(routineData);
          setRoutineLoading(false);

          const { data: appointmentData } = await supabase.from('cita').select('*').eq('user_id', user.id).in('estado', ['pendiente', 'confirmada', 'cancelada']).order('fecha_agendada', { ascending: false }).limit(1).single();
          setAppointment(appointmentData);
          setAppointmentLoading(false);
      }

      setLoading(false);
    };

    getUserAndData();
  }, [supabase, router]);
  
  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card><CardHeader className="h-24"></CardHeader><CardContent className="h-20"></CardContent></Card>
              <Card><CardHeader className="h-24"></CardHeader><CardContent className="h-20"></CardContent></Card>
            </div>
             <div className="grid gap-6 lg:grid-cols-2">
                <Card><CardContent className="h-40"></CardContent></Card>
                <Card><CardContent className="h-40"></CardContent></Card>
             </div>
        </div>
      </AppLayout>
    );
  }
  
  const renderDashboard = () => {
    switch (userRole) {
        case 1:
            return <ProfessionalDashboard greeting={greeting} stats={stats} />;
        case 2:
            return <ModeratorDashboard greeting={greeting} stats={stats} />;
        default:
            return <UserDashboard 
                user={user}
                greeting={greeting} 
                dailyRecipe={dailyRecipe}
                recipeLoading={recipeLoading}
                dailyRoutine={dailyRoutine}
                routineLoading={routineLoading}
                appointment={appointment}
                appointmentLoading={appointmentLoading}
            />;
    }
  }

  return (
    <AppLayout>
        {renderDashboard()}
    </AppLayout>
  );
}

    
