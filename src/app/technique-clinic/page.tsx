
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, ArrowRight, Dumbbell, Search, Video } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const exercises = [
  { name: "Squat", image: "https://placehold.co/600x400.png", aiHint: "person squatting" },
  { name: "Deadlift", image: "https://placehold.co/600x400.png", aiHint: "person deadlifting" },
  { name: "Bench Press", image: "https://placehold.co/600x400.png", aiHint: "person bench pressing" },
  { name: "Overhead Press", image: "https://placehold.co/600x400.png", aiHint: "person overhead press" },
];

export default function TechniqueClinicPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("video/")) {
        setSelectedFile(file);
        setVideoPreview(URL.createObjectURL(file));
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please select a video file.",
        });
      }
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
        toast({
            variant: "destructive",
            title: "No file selected",
            description: "Please select a video to analyze.",
        });
        return;
    }
    toast({
        title: "Video Submitted!",
        description: "Your technique analysis will be available soon.",
    });
    console.log("Submitting file:", selectedFile.name);
    // Here you would typically upload the file and handle the form data
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Dumbbell className="w-8 h-8" />
            Clínica de la Técnica
          </h1>
          <p className="text-muted-foreground">
            Analiza y perfecciona tus movimientos con la ayuda de nuestros expertos y la tecnología de IA.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Analiza tu Técnica</CardTitle>
                <CardDescription>Sube un video de tu ejercicio para recibir un análisis detallado.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div 
                    className="border-2 border-dashed border-muted-foreground/30 rounded-lg aspect-video flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-primary transition-colors"
                    onClick={handleUploadClick}
                  >
                     <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="video/*"
                    />
                    {videoPreview ? (
                       <video src={videoPreview} className="w-full h-full object-cover rounded-md" controls />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="w-8 h-8" />
                        <span className="font-semibold">Click to upload a video</span>
                        <span className="text-xs">MP4, AVI, MOV up to 50MB</span>
                      </div>
                    )}
                  </div>
                 
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exercise" />
                    </SelectTrigger>
                    <SelectContent>
                      {exercises.map(ex => <SelectItem key={ex.name} value={ex.name}>{ex.name}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Textarea placeholder="Añade una nota o pregunta para el coach (opcional)..." rows={3}/>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <Video className="w-4 h-4 mr-2"/>
                    Analizar Video
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Guías de Técnica</CardTitle>
                    <CardDescription>Explora nuestras guías de ejercicios para mejorar tu forma.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {exercises.map((exercise) => (
                        <Card key={exercise.name} className="overflow-hidden group">
                            <CardHeader className="p-0">
                                <Image
                                src={exercise.image}
                                alt={exercise.name}
                                width={400}
                                height={300}
                                className="object-cover aspect-video group-hover:scale-105 transition-transform"
                                data-ai-hint={exercise.aiHint}
                                />
                            </CardHeader>
                            <CardContent className="p-4">
                                <h3 className="font-semibold font-headline">{exercise.name}</h3>
                                <p className="text-sm text-muted-foreground">Guía completa y puntos clave.</p>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                <Button variant="link" className="p-0 h-auto">
                                    Ver Guía <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
