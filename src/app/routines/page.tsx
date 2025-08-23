
"use client";

import { AppLayout } from "@/components/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoutinesView } from "@/components/routines-view";

export default function RoutinesPage() {
  return (
    <AppLayout>
      <div className="max-w-full mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold font-headline">Centro de Rutinas</h1>
          <p className="text-muted-foreground">
            Encuentra el entrenamiento perfecto para ti, ya sea en casa o en el gimnasio.
          </p>
        </div>

        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="home">En Casa</TabsTrigger>
            <TabsTrigger value="gym">Gimnasio</TabsTrigger>
          </TabsList>
          
          <TabsContent value="home" className="mt-6">
            <RoutinesView environment="casa" />
          </TabsContent>
          <TabsContent value="gym" className="mt-6">
            <RoutinesView environment="gimnasio" />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
