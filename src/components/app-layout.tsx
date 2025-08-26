
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
  Shield,
  UserCog,
  UserPlus,
  MessageSquare,
  LayoutGrid,
  HeartPulse,
  UserCircle,
  Download,
  LayoutDashboard,
  BookMarked,
  Trophy
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
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
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
  { href: "/dashboard", icon: LayoutDashboard, label: "Panel" },
  { href: "/recipes", icon: UtensilsCrossed, label: "Recetas" },
  { href: "/routines", icon: Trophy, label: "Rutinas" },
  { href: "/profile", icon: UserCircle, label: "Perfil" },
  { href: "/live", icon: Video, label: "En Vivo" },
  { href: "/community", icon: Users, label: "Comunidad" },
  { href: "/technique-clinic", icon: HeartPulse, label: "Clínica de Técnica" },
  { href: "/consultas", icon: MessageSquare, label: "Consultas", roles: [0, 1] },
  { href: "/schedule", icon: CalendarPlus, label: "Agendar Cita", roles: [0, 1] },
];

const mobileBottomNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Panel" },
    { href: "/recipes", icon: BookMarked, label: "Recetas" },
    { href: "/routines", icon: Trophy, label: "Rutinas" },
    { href: "/profile", icon: UserCircle, label: "Perfil" },
];

const moderatorNavItems = [
    { href: "/moderation/users", icon: UserCog, label: "Gestionar Usuarios"},
    { href: "/moderation/registrations", icon: UserPlus, label: "Gestionar Registros"},
    { href: "/moderation/history", icon: Shield, label: "Historial de Moderación"}
];


function InstallAppButton() {
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [installInstructionsOpen, setInstallInstructionsOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            if(window.matchMedia('(display-mode: standalone)').matches === false) {
              setShowInstallPrompt(true);
            }
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
    };
    
    if(!showInstallPrompt && !/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      return null;
    }

    return (
        <>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleInstallClick}
            >
              <Download className="mr-2 h-4 w-4" />
              Instalar Aplicación
            </Button>
            
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
    )
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
        if (!item.roles) return true;
        return item.roles.includes(userRole);
    });
  }, [userRole]);

   const mobileSideNavItems = useMemo(() => {
    if (userRole === null) return [];
    const bottomNavHrefs = new Set(mobileBottomNavItems.map(i => i.href));
    return allNavItems.filter(item => {
        if (bottomNavHrefs.has(item.href)) return false;
        if (!item.roles) return true;
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

  const sidebarContent = (
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
                <SheetClose asChild>
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
                </SheetClose>
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
                        <SheetClose asChild>
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
                        </SheetClose>
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
            <div className="flex flex-col gap-2">
                <InstallAppButton />
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
            </div>
         ) : null}
      </SidebarFooter>
    </>
  );

  const mobileSideMenuContent = (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          <Logo />
          <span className="font-logo tracking-widest text-lg">MARIVI POWER</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {mobileSideNavItems.map((item) =>
            <SidebarMenuItem key={item.href}>
                <SheetClose asChild>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                    >
                        <Link href={item.href} className="flex items-center gap-2">
                        <item.icon />
                        <span>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SheetClose>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
         {userRole === 2 && (
            <SidebarMenu className="mt-auto pt-4 border-t">
                <p className="px-4 text-xs font-semibold text-muted-foreground/80 tracking-wider uppercase mb-2">
                    Moderación
                </p>
                {moderatorNavItems.map(item => (
                    <SidebarMenuItem key={item.href}>
                        <SheetClose asChild>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === item.href}
                            >
                            <Link href={item.href} className="flex items-center gap-2">
                                <item.icon />
                                <span>{item.label}</span>
                            </Link>
                            </SidebarMenuButton>
                        </SheetClose>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        )}
      </SidebarContent>
      <SidebarFooter>
          <div className="flex flex-col gap-2">
            <InstallAppButton />
            <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start">Cerrar Sesión</Button>
          </div>
      </SidebarFooter>
    </>
  )

  if (isMobile) {
    return (
        <div className="flex flex-col min-h-screen">
             <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Abrir menú</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col p-0 w-72">
                        <SidebarProvider>
                            <Sidebar side="left" variant="sidebar" collapsible="none">
                                {mobileSideMenuContent}
                            </Sidebar>
                        </SidebarProvider>
                    </SheetContent>
                </Sheet>
                 <Link href="/dashboard" className="flex items-center gap-2 font-bold absolute left-1/2 -translate-x-1/2">
                    <Logo />
                </Link>
                <div className="flex items-center gap-2">
                    <NotificationsDropdown />
                    <ThemeToggle />
                </div>
            </header>
            <main className="flex-1 p-4 pb-24">{children}</main>
            <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t bg-background/80 backdrop-blur-sm">
                <div className="grid h-full max-w-lg grid-cols-4 mx-auto">
                    {mobileBottomNavItems.map(item => {
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        return (
                            <Link key={item.href} href={item.href} className={cn("inline-flex flex-col items-center justify-center font-medium px-2 hover:bg-muted", isActive ? "text-primary" : "text-muted-foreground")}>
                                <item.icon className="w-5 h-5 mb-1" />
                                <span className="text-xs">{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        {sidebarContent}
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
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
