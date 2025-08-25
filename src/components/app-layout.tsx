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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "./icons";
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import { NotificationsDropdown } from "./notifications-dropdown";
import { ThemeToggle } from "./theme-toggle";


const allNavItems = [
  { href: "/dashboard", icon: Home, label: "Panel" },
  { href: "/recipes", icon: UtensilsCrossed, label: "Recetas" },
  { href: "/routines", icon: Dumbbell, label: "Rutinas" },
  { href: "/live", icon: Video, label: "En Vivo" },
  { href: "/community", icon: Users, label: "Comunidad" },
  { href: "/technique-clinic", icon: Dumbbell, label: "Clínica de la Técnica" },
  { href: "/consultas", icon: MessageSquare, label: "Consultas", roles: [0, 1] },
  { href: "/schedule", icon: CalendarPlus, label: "Agendar Cita", roles: [0, 1] },
];

const moderatorNavItems = [
    { href: "/moderation/users", icon: UserCog, label: "Gestionar Usuarios"},
    { href: "/moderation/registrations", icon: UserPlus, label: "Gestionar Registros"},
    { href: "/moderation/history", icon: Shield, label: "Historial de Moderación"}
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        {sidebarContent}
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
                    {sidebarContent}
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
