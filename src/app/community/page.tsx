
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Check, MessageCircle, Paperclip, X, Annoyed, Image as ImageIcon, MessageSquare } from "lucide-react";
import Image from "next/image";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { CommunityPost, QAPost, ProfessionalPost, Reply } from "@/types/community";
import { FeedTab } from "@/components/community/feed-tab";
import { QATab } from "@/components/community/qa-tab";
import { AnnouncementsTab } from "@/components/community/announcements-tab";

export default function CommunityPage() {

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold font-headline">Centro de Comunidad</h1>
          <p className="text-muted-foreground">
            Conecta con compañeros y obtén consejos de expertos para potenciar tu viaje de bienestar.
          </p>
        </div>

        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feed">Comunidad</TabsTrigger>
            <TabsTrigger value="q-and-a">Pregúntale a un Profesional</TabsTrigger>
            <TabsTrigger value="announcements">Anuncios de Profesionales</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed" className="mt-6">
            <FeedTab />
          </TabsContent>
          <TabsContent value="q-and-a" className="mt-6">
            <QATab />
          </TabsContent>
          <TabsContent value="announcements" className="mt-6">
            <AnnouncementsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
