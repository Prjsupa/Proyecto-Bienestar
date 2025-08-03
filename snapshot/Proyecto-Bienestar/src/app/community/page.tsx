
"use client";

import { AppLayout } from "@/components/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
