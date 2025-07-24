
"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, UtensilsCrossed, Dumbbell, ArrowRight } from "lucide-react";

type Plan = "basic" | "premium" | "family";

export default function DashboardPage() {
  const [userPlan, setUserPlan] = useState<Plan | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // In a real app, this would be fetched from an API
    const storedPlan = "premium" as Plan; // or 'basic', 'family'
    setUserPlan(storedPlan);
    setUserName("Alex"); // fetch user name
    setProgress(Math.floor(Math.random() * (75 - 40 + 1)) + 40);
  }, []);

  const planDetails = {
    basic: { name: "Basic Plan", features: ["Access to 10 new recipes weekly", "Basic workout plans"] },
    premium: { name: "Premium Plan", features: ["Unlimited recipes", "Personalized workout plans", "1-on-1 coach chat"] },
    family: { name: "Family Plan", features: ["All Premium features", "Up to 4 family member profiles", "Family meal planner"] }
  };
  
  const greeting = () => {
    if (!userName) return "Welcome!";
    const hours = new Date().getHours();
    if (hours < 12) return `Good morning, ${userName}!`;
    if (hours < 18) return `Good afternoon, ${userName}!`;
    return `Good evening, ${userName}!`;
  };
  
  if (!userPlan || !userName) {
    return (
      <AppLayout>
        <div>Loading dashboard...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">{greeting()}</h1>
          <p className="text-muted-foreground">Here's your wellness snapshot for today.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center justify-between">
                <span>Your Plan</span>
                <Badge variant="secondary" className="bg-accent/50 text-accent-foreground">{planDetails[userPlan].name}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {planDetails[userPlan].features.map(feature => <li key={feature}>{feature}</li>)}
              </ul>
            </CardContent>
            <CardFooter>
                 <Button variant="outline" size="sm">Manage Plan</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Weekly Progress</CardTitle>
              <CardDescription>You're doing great this week!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                    <span>Workouts</span>
                    <span>3/5</span>
                </div>
                <Progress value={60} aria-label="60% of workouts complete" />
                <div className="flex justify-between text-sm font-medium pt-2">
                    <span>Healthy Meals</span>
                    <span>12/21</span>
                </div>
                <Progress value={57} aria-label="57% of meals healthy" />
            </CardContent>
          </Card>
          
           {userPlan !== 'basic' && (
             <Card className="bg-gradient-to-tr from-primary/80 to-accent/80 text-primary-foreground">
                <CardHeader>
                    <CardTitle className="font-headline">Personalized Coaching</CardTitle>
                    <CardDescription className="text-primary-foreground/80">Your coach is available to help you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">"Remember to stay hydrated during your workout today, Alex!" - Coach Sarah</p>
                </CardContent>
                <CardFooter>
                    <Button variant="secondary" className="bg-background/20 hover:bg-background/30 text-primary-foreground">Chat with Coach</Button>
                </CardFooter>
             </Card>
           )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><UtensilsCrossed className="w-5 h-5" /> Today's Recipe</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                    <Image 
                        src="https://placehold.co/400x300.png"
                        alt="Recipe"
                        width={150}
                        height={100}
                        className="rounded-lg object-cover"
                        data-ai-hint="quinoa salad"
                    />
                    <div className="space-y-2">
                        <h3 className="font-semibold font-headline">Quinoa & Avocado Salad</h3>
                        <p className="text-sm text-muted-foreground">A refreshing and protein-packed meal perfect for lunch.</p>
                        <Button asChild variant="link" className="p-0 h-auto">
                            <Link href="/recipes">View Recipe <ArrowRight className="w-4 h-4 ml-1" /></Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Users className="w-5 h-5" /> Community Buzz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Image src="https://placehold.co/40x40.png" alt="User avatar" width={40} height={40} className="rounded-full" data-ai-hint="person smiling" />
                        <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Mark R.</span> shared a new deadlift technique.</p>
                    </div>
                     <div className="flex items-center gap-3">
                        <Image src="https://placehold.co/40x40.png" alt="User avatar" width={40} height={40} className="rounded-full" data-ai-hint="woman jogging" />
                        <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Jane D.</span> is looking for a running partner.</p>
                    </div>
                     <Button asChild variant="link" className="p-0 h-auto">
                        <Link href="/community">Join Conversation <ArrowRight className="w-4 h-4 ml-1" /></Link>
                    </Button>
                </CardContent>
            </Card>
        </div>

      </div>
    </AppLayout>
  );
}
