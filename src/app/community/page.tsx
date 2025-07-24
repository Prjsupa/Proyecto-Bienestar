
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatDistanceToNow } from "date-fns";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

const postSchema = z.object({
  content: z.string().min(10, "Post must be at least 10 characters.").max(500, "Post cannot exceed 500 characters."),
});

type CommunityPost = {
  id: number;
  author: string;
  avatar: string;
  aiHint: string;
  timestamp: Date;
  content: string;
};

const initialPosts = [
    {
      id: 1,
      author: "Mark Johnson",
      avatar: "https://placehold.co/40x40.png",
      aiHint: "man lifting weights",
      content: "Just hit a new PR on my deadlift! The key was focusing on my form, especially keeping my back straight. Remember to engage your lats before pulling. Stay strong everyone! #deadlift #PR",
    },
    {
      id: 2,
      author: "Jane Doe",
      avatar: "https://placehold.co/40x40.png",
      aiHint: "woman yoga",
      content: "Anyone have tips for improving flexibility for yoga? I'm struggling with forward folds. I've been trying to hold stretches for 30 seconds but not seeing much progress.",
    },
    {
      id: 3,
      author: "Carlos Rodriguez",
      avatar: "https://placehold.co/40x40.png",
      aiHint: "man running",
      content: "Completed my first 5k run today! The couch to 5k program on the app is fantastic. Highly recommend it for any beginners out there. The feeling of accomplishment is unreal.",
    },
];

export default function CommunityPage() {
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  
  useEffect(() => {
    const postsWithTimestamps = [
      { ...initialPosts[0], timestamp: new Date(Date.now() - 1000 * 60 * 5) }, // 5 minutes ago
      { ...initialPosts[1], timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) }, // 2 hours ago
      { ...initialPosts[2], timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) }, // 1 day ago
    ];
    setCommunityPosts(postsWithTimestamps);
  }, []);

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: { content: "" },
  });

  function onSubmit(values: z.infer<typeof postSchema>) {
    console.log("New post:", values);
    form.reset();
    // Here you would typically optimistic-update the UI and send to a server
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="space-y-4 mb-8">
            <h1 className="text-3xl font-bold font-headline">Community Forum</h1>
            <p className="text-muted-foreground">
                Share your workout tips, ask questions, and connect with fellow VitaNova members.
            </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-lg font-semibold font-headline">Share your thoughts</h2>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="What's on your mind? Share a workout tip or a recent success!"
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                    <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Publish</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
            <h2 className="text-2xl font-semibold font-headline">Recent Posts</h2>
            {communityPosts.map((post, index) => (
                <div key={post.id}>
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                            <Avatar>
                                <AvatarImage src={post.avatar} alt={post.author} data-ai-hint={post.aiHint} />
                                <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="w-full">
                                <p className="font-semibold">{post.author}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap">{post.content}</p>
                        </CardContent>
                    </Card>
                    {index < communityPosts.length - 1 && <Separator className="my-6 md:hidden"/>}
                </div>
            ))}
        </div>
      </div>
    </AppLayout>
  );
}
