
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  UtensilsCrossed,
  Users,
  Dumbbell,
  Menu,
  Video,
  CalendarPlus,
  ChevronDown,
  Shield,
  UserCog,
  UserPlus,
  FileText,
  MessageSquare,
  LayoutGrid,
  HeartPulse,
  UserCircle,
  Plus,
  X,
  Download,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import type { User } from "@supabase/supabase-js";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "./icons";
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import { NotificationsDropdown } from "./notifications-dropdown";
import { ThemeToggle } from "./theme-toggle";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent } from "./ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

const allNavItems = [
  { href: "/dashboard", icon: Home, label: "Panel", mobile: true },
  { href: "/recipes", icon: UtensilsCrossed, label: "Recetas", mobile: true },
  { href: "/routines", icon: Dumbbell, label: "Rutinas", mobile: true },
  { href: "/profile", icon: UserCircle, label: "Perfil", mobile: true },
  { href: "/live", icon: Video, label: "En Vivo", mobile: false },
  { href: "/community", icon: Users, label: "Comunidad", mobile: false },
  { href: "/technique-clinic", icon: HeartPulse, label: "Clínica de Técnica", mobile: false },
  { href: "/consultas", icon: MessageSquare, label: "Consultas", roles: [0, 1], mobile: false },
  { href: "/schedule", icon: CalendarPlus, label: "Agendar Cita", roles: [0, 1], mobile: false },
];

const moderatorNavItems = [
    { href: "/moderation/users", icon: UserCog, label: "Gestionar Usuarios"},
    { href: "/moderation/registrations", icon: UserPlus, label: "Gestionar Registros"},
    { href: "/moderation/history", icon: Shield, label: "Historial de Moderación"}
];

function MobileBottomNav({ userRole }: { userRole: number | null }) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [installInstructionsOpen, setInstallInstructionsOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallPrompt(true);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);
    
    const handleInstallClick = async () => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        if (isIOS) {
            setInstallInstructionsOpen(true);
        } else if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            setDeferredPrompt(null);
        } else {
           setInstallInstructionsOpen(true);
        }
        setIsMenuOpen(false);
    };


    const navItems = useMemo(() => {
        if (userRole === null) return { mobile: [], desktop: [] };
        const filtered = allNavItems.filter(item => {
            if (!item.roles) return true;
            return item.roles.includes(userRole);
        });
        return {
            mobile: filtered.filter(item => item.mobile),
            desktop: filtered.filter(item => !item.mobile)
        };
    }, [userRole]);

    const fabMenuitems = [
        ...navItems.desktop,
        ...moderatorNavItems.filter(() => userRole === 2)
    ];

    if (userRole === null) return null;

    return (
        <>
            <footer className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-sm border-t z-50 flex justify-around items-center">
                {navItems.mobile.map(item => (
                    <Link href={item.href} key={item.href} className={cn(
                        "flex flex-col items-center justify-center gap-1 w-full h-full text-muted-foreground transition-colors",
                        (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) && "text-primary"
                    )}>
                        <item.icon className="w-6 h-6" />
                        <span className="text-xs">{item.label}</span>
                    </Link>
                ))}
            </footer>

            {/* FAB and Menu */}
            <div className="md:hidden fixed bottom-6 right-1/2 translate-x-1/2 z-50 flex flex-col items-center">
                 {isMenuOpen && (
                    <div className="absolute bottom-full mb-4 w-56 bg-background rounded-xl shadow-lg border p-2">
                        <div className="grid grid-cols-2 gap-2">
                            {fabMenuitems.map(item => (
                                <Link key={item.href} href={item.href} className="flex flex-col items-center p-2 rounded-lg hover:bg-muted">
                                    <item.icon className="w-5 h-5 mb-1" />
                                    <span className="text-xs text-center">{item.label}</span>
                                </Link>
                            ))}
                             {(showInstallPrompt || /iPad|iPhone|iPod/.test(navigator.userAgent)) && (
                                <button onClick={handleInstallClick} className="flex flex-col items-center p-2 rounded-lg hover:bg-muted text-primary">
                                    <Download className="w-5 h-5 mb-1" />
                                    <span className="text-xs text-center">Instalar App</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
                <Button 
                    size="icon" 
                    className={cn(
                        "rounded-full w-16 h-16 shadow-lg transition-transform duration-300",
                        isMenuOpen ? "bg-destructive hover:bg-destructive/90 rotate-45" : "bg-primary hover:bg-primary/90"
                    )}
                    onClick={() => setIsMenuOpen(prev => !prev)}
                >
                    <Plus className="w-8 h-8" />
                </Button>
            </div>
            
             <Dialog open={installInstructionsOpen} onOpenChange={setInstallInstructionsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Instalar Aplicación</DialogTitle>
                        <DialogDescription>
                            Para instalar la aplicación en tu iPhone o iPad, sigue estos pasos:
                        </DialogDescription>
                    </DialogHeader>
                    <ol className="list-decimal list-inside space-y-2 mt-4">
                        <li>Toca el ícono de **Compartir** en la barra de herramientas de Safari.</li>
                        <li>Desplázate hacia abajo y selecciona **"Añadir a la pantalla de inicio"**.</li>
                        <li>Toca **"Añadir"** en la esquina superior derecha.</li>
                    </ol>
                </DialogContent>
            </Dialog>
        </>
    );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
       if (user) {
        const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single();
        if (profile) setUserRole(profile.rol);
      }
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setLoading(false);
      } else {
         const fetchRole = async () => {
            const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', session!.user.id).single();
            if (profile) setUserRole(profile.rol);
        }
        fetchRole();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, supabase.auth]);
  
  const navItems = useMemo(() => {
    if (userRole === null) return [];
    return allNavItems.filter(item => {
        if (!item.roles) return true; // Visible para todos si no se especifican roles
        return item.roles.includes(userRole);
    });
  }, [userRole]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  }

  const getInitials = (name: string, lastName: string) => {
    if (name && lastName) return `${name[0]}${lastName[0]}`.toUpperCase();
    if (name) return name.substring(0, 2).toUpperCase();
    return "US";
  }
  
  const displayName = user?.user_metadata?.name && user?.user_metadata?.last_name 
    ? `${user.user_metadata.name} ${user.user_metadata.last_name}` 
    : user?.user_metadata?.name ?? user?.email ?? "Usuario";
    
  const userInitials = getInitials(user?.user_metadata?.name || '', user?.user_metadata?.last_name || '');

  const desktopSidebarContent = (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 font-bold group-data-[collapsible=icon]:justify-center">
          <Logo />
          <span className="font-logo tracking-widest text-lg group-data-[collapsible=icon]:hidden">MARIVI POWER</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) =>
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                tooltip={item.label}
              >
                <Link href={item.href} className="flex items-center gap-2">
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
         {userRole === 2 && (
            <SidebarMenu className="mt-auto pt-4 border-t">
                <p className="px-4 text-xs font-semibold text-muted-foreground/80 tracking-wider uppercase mb-2 group-data-[collapsible=icon]:hidden">
                    Moderación
                </p>
                {moderatorNavItems.map(item => (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname === item.href}
                            tooltip={item.label}
                        >
                        <Link href={item.href} className="flex items-center gap-2">
                            <item.icon />
                            <span>{item.label}</span>
                        </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        )}
      </SidebarContent>
      <SidebarFooter>
         {loading ? (
             <div className="flex items-center gap-3 p-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="w-full space-y-2 group-data-[collapsible=icon]:hidden">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                </div>
            </div>
         ) : user ? (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-accent hover:text-accent-foreground">
                        <Avatar>
                            <AvatarImage src={user.user_metadata?.avatar_url} alt={displayName} />
                            <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <div className="group-data-[collapsible=icon]:hidden">
                            <p className="font-semibold text-sm truncate">{displayName}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                        </p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                        Cerrar Sesión
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
         ) : null}
      </SidebarFooter>
    </>
  );

  if (isMobile) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4">
                 <Link href="/dashboard" className="flex items-center gap-2 font-bold">
                    <Logo />
                </Link>
                <div className="flex items-center gap-2">
                    <NotificationsDropdown />
                    <ThemeToggle />
                </div>
            </header>
            <main className="flex-1 p-4 pb-28">{children}</main>
            <MobileBottomNav userRole={userRole} />
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        {desktopSidebarContent}
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Alternar menú de navegación</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0 w-72">
                 <SidebarProvider>
                  <Sidebar side="left" variant="sidebar" collapsible="none">
                    {desktopSidebarContent}
                  </Sidebar>
                </SidebarProvider>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex w-full items-center justify-end gap-2">
             <NotificationsDropdown />
             <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
