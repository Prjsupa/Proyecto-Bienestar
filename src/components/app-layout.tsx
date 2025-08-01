"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Home,
  UtensilsCrossed,
  Users,
  Dumbbell,
  Menu,
  Video,
  CalendarPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import { VitaNovaIcon } from "./icons";
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from "./ui/skeleton";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Panel" },
  { href: "/recipes", icon: UtensilsCrossed, label: "Recetas" },
  { href: "/live", icon: Video, label: "En Vivo" },
  { href: "/community", icon: Users, label: "Comunidad" },
  { href: "/technique-clinic", icon: Dumbbell, label: "Técnica" },
  { href: "/schedule", icon: CalendarPlus, label: "Agendar Cita" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ name: string | null; last_name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  // Crear cliente Supabase sólo una vez
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      setLoading(true);
      try {
        // Obtener usuario autenticado
        const { data: authData, error: authError } = await supabase.auth.getUser();
        console.log("Auth user data:", authData, authError);
        if (authError) throw authError;

        if (authData.user) {
          setUser(authData.user);

          // Obtener perfil del usuario desde tabla "usuarios"
          const { data: profileData, error: profileError } = await supabase
            .from("usuarios")
            .select("name, last_name")
            .eq("id", authData.user.id)
            .single();

          console.log("Perfil usuario:", profileData, profileError);
          if (profileError) {
            // En caso de error, loguear pero no bloquear UI
            console.error("Error fetching profile:", profileError.message);
            setProfile(null);
          } else {
            setProfile(profileData);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("Error en fetchUserAndProfile:", error);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();
  }, [supabase]);

  const getInitials = (name: string) => {
    if (!name) return "US";
    const names = name.trim().split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = profile?.name && profile?.last_name
    ? `${profile.name} ${profile.last_name}`
    : user?.email || "Usuario";

  const sidebarContent = (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
          <VitaNovaIcon className="w-8 h-8 text-primary" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                icon={<item.icon />}
                tooltip={item.label}
              >
                <Link href={item.href}>{item.label}</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
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
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-sidebar-accent">
                <Avatar>
                  <AvatarImage src={user?.user_metadata?.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                </Avatar>
                <div className="group-data-[collapsible=icon]:hidden">
                  <p className="font-semibold text-sm truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Configuración</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/">Cerrar Sesión</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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

          <div className="flex w-full items-center justify-end gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Alternar notificaciones</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
