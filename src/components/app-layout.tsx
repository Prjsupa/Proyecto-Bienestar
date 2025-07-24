
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
} from "lucide-react";

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

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/recipes", icon: UtensilsCrossed, label: "Recipes" },
  { href: "/live", icon: Video, label: "En Vivo" },
  { href: "/community", icon: Users, label: "Community" },
  { href: "/technique-clinic", icon: Dumbbell, label: "Técnica" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const sidebarContent = (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
          <VitaNovaIcon className="w-8 h-8 text-primary" />
          <span className="font-headline text-2xl font-semibold text-primary-foreground/90">
            VitaNova
          </span>
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
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-sidebar-accent">
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="group-data-[collapsible=icon]:hidden">
                        <p className="font-semibold text-sm">Sofia Davis</p>
                        <p className="text-xs text-muted-foreground">sofia.davis@email.com</p>
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Sofia Davis</p>
                    <p className="text-xs leading-none text-muted-foreground">
                    sofia.davis@email.com
                    </p>
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">Log out</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </>
  );

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        {sidebarContent}
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
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
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
