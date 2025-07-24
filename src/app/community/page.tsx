
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatDistanceToNow } from "date-fns";
import { Check, MessageCircle, Paperclip, X, CornerDownRight } from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const postSchema = z.object({
  content: z.string().min(10, "Post must be at least 10 characters.").max(500, "Post cannot exceed 500 characters."),
  file: z.any().optional(),
});

const questionSchema = z.object({
  question: z.string().min(15, "Question must be at least 15 characters.").max(500, "Question cannot exceed 500 characters."),
  file: z.any().optional(),
});

const replySchema = z.object({
  replyContent: z.string().min(1, "Reply cannot be empty.").max(500, "Reply cannot exceed 500 characters."),
});

type Reply = {
    id: number;
    author: string;
    avatar: string;
    aiHint: string;
    timestamp: Date;
    content: string;
    isProfessional?: boolean;
}

type CommunityPost = {
  id: number;
  author: string;
  avatar: string;
  aiHint: string;
  timestamp: Date;
  content: string;
  replies: Reply[];
};

type QAPost = {
    id: number;
    author: string;
    avatar: string;
    aiHint: string;
    timestamp: Date;
    question: string;
    answer: {
        professional: string;
        specialty: string;
        avatar: string;
        aiHint: string;
        content: string;
    } | null;
}

const initialPostsData: Omit<CommunityPost, 'timestamp' | 'replies'>[] = [
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

const initialRepliesData: Omit<Reply, 'timestamp'>[][] = [
    [
        { id: 1, author: 'Coach Sarah', avatar: 'https://placehold.co/40x40.png', aiHint: 'woman coach', content: 'Awesome work Mark! Form is everything. Keep it up!', isProfessional: true },
        { id: 2, author: 'Alex', avatar: 'https://placehold.co/40x40.png', aiHint: 'person gym', content: 'Congrats! That\'s a huge achievement.' },
    ],
    [
        { id: 3, author: 'Michael Star', avatar: 'https://placehold.co/40x40.png', aiHint: 'man physiotherapist', content: 'Consistency is key, Jane. Try incorporating dynamic stretches before your sessions and holding static stretches after. PNF stretching could also be very beneficial for you.', isProfessional: true },
    ],
    [],
]


const initialQAData: Omit<QAPost, 'timestamp'>[] = [
    {
        id: 1,
        author: 'Laura Evans',
        avatar: 'https://placehold.co/40x40.png',
        aiHint: 'woman thinking',
        question: 'What are the best post-workout meals for muscle recovery? I always feel so sore the next day.',
        answer: {
            professional: 'Dr. Emily Carter',
            specialty: 'Nutritionist',
            avatar: 'https://placehold.co/40x40.png',
            aiHint: 'woman doctor smiling',
            content: "Great question, Laura! For muscle recovery, aim for a meal with a 3:1 or 4:1 ratio of carbohydrates to protein within 45 minutes of your workout. A smoothie with fruit and protein powder, or grilled chicken with sweet potato are excellent choices. This helps replenish glycogen stores and repair muscle fibers.",
        }
    },
    {
        id: 2,
        author: 'David Chen',
        avatar: 'https://placehold.co/40x40.png',
        aiHint: 'man stretching',
        question: 'I have a slight pain in my right knee when I do squats. Should I be concerned?',
        answer: {
            professional: 'Michael Star',
            specialty: 'Physiotherapist',
            avatar: 'https://placehold.co/40x40.png',
            aiHint: 'man physiotherapist',
            content: "Hi David, it's wise to listen to your body. Pain during squats could be due to form. Ensure your knees are tracking over your feet and not caving inwards. Try filming yourself or have a professional check your form. If the pain persists, it's best to get it checked out to rule out any underlying issues. For now, try reducing the weight and focusing on form.",
        }
    },
    {
        id: 3,
        author: 'Maria Garcia',
        avatar: 'https://placehold.co/40x40.png',
        aiHint: 'woman confused',
        question: 'How much cardio is too much? I want to lose weight but I don\'t want to lose muscle mass.',
        answer: null,
    }
]

export default function CommunityPage() {
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [qaPosts, setQAPosts] = useState<QAPost[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedPostFile, setSelectedPostFile] = useState<File | null>(null);
  const [selectedQuestionFile, setSelectedQuestionFile] = useState<File | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const postFileInputRef = useRef<HTMLInputElement>(null);
  const questionFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
    const postsWithTimestamps = initialPostsData.map((post, index) => ({
      ...post,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * (5 * (index + 1))),
      replies: initialRepliesData[index]?.map((reply, replyIndex) => ({
          ...reply,
          timestamp: new Date(Date.now() - 1000 * 60 * (3 * (replyIndex + 1))),
      })) || [],
    }));
     const qaWithTimestamps = initialQAData.map((qa, index) => ({
      ...qa,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * (3 * (index + 1))),
    }));
    setCommunityPosts(postsWithTimestamps);
    setQAPosts(qaWithTimestamps);
  }, []);
  
  const postForm = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: { content: "" },
  });
  
  const questionForm = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: { question: "" },
  });

  const replyForm = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: { replyContent: "" },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert("File size cannot exceed 5MB.");
        return;
      }
      setFile(file);
    }
  };


  function onPostSubmit(values: z.infer<typeof postSchema>) {
    console.log("New post:", {...values, file: selectedPostFile?.name});
    const newPost: CommunityPost = {
        id: Date.now(),
        author: 'Sofia Davis',
        avatar: 'https://github.com/shadcn.png',
        aiHint: 'person smiling',
        timestamp: new Date(),
        content: values.content,
        replies: []
    }
    setCommunityPosts(posts => [newPost, ...posts]);
    postForm.reset();
    setSelectedPostFile(null);
    if(postFileInputRef.current) postFileInputRef.current.value = "";
  }
  
  function onQuestionSubmit(values: z.infer<typeof questionSchema>) {
    console.log("New question:", {...values, file: selectedQuestionFile?.name});
    const newQA: QAPost = {
        id: Date.now(),
        author: 'Sofia Davis',
        avatar: 'https://github.com/shadcn.png',
        aiHint: 'person thinking',
        timestamp: new Date(),
        question: values.question,
        answer: null
    }
    setQAPosts(qas => [newQA, ...qas]);
    questionForm.reset();
    setSelectedQuestionFile(null);
    if(questionFileInputRef.current) questionFileInputRef.current.value = "";
  }

  function onReplySubmit(postId: number, values: z.infer<typeof replySchema>) {
    console.log(`Replying to post ${postId}:`, values.replyContent);
    // In a real app, you'd send this to a server
    const newReply: Reply = {
        id: Date.now(),
        author: 'Sofia Davis', // Assuming the current user is Sofia
        avatar: 'https://github.com/shadcn.png',
        aiHint: 'person smiling',
        timestamp: new Date(),
        content: values.replyContent,
        isProfessional: false // Change to true if a professional is replying
    };
    setCommunityPosts(posts => posts.map(post => 
        post.id === postId ? {...post, replies: [...post.replies, newReply]} : post
    ));
    replyForm.reset();
    setReplyingTo(null);
  }

  const renderCommunitySkeletons = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="w-full space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderQaSkeletons = () => (
    <div className="space-y-6">
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="w-full space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/3" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
          <CardFooter>
             <Skeleton className="h-20 w-full rounded-md" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )


  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold font-headline">Community Hub</h1>
          <p className="text-muted-foreground">
            Connect with peers and get expert advice to supercharge your wellness journey.
          </p>
        </div>

        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feed">Community Feed</TabsTrigger>
            <TabsTrigger value="q-and-a">Ask a Professional</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed" className="mt-6">
            <Card className="mb-8">
              <CardHeader>
                <h2 className="text-lg font-semibold font-headline">Share your thoughts</h2>
              </CardHeader>
              <CardContent>
                <Form {...postForm}>
                  <form onSubmit={postForm.handleSubmit(onPostSubmit)} className="space-y-4">
                    <FormField
                      control={postForm.control}
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
                     {selectedPostFile && (
                      <div className="flex items-center justify-between p-2 text-sm text-muted-foreground bg-muted rounded-md">
                          <div className="flex items-center gap-2 truncate">
                            <Paperclip className="w-4 h-4" />
                            <span className="truncate">{selectedPostFile.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => {
                                setSelectedPostFile(null)
                                if(postFileInputRef.current) postFileInputRef.current.value = "";
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                       <FormField
                        control={postForm.control}
                        name="file"
                        render={() => (
                            <FormItem>
                                <FormControl>
                                  <>
                                    <input 
                                      type="file" 
                                      className="hidden" 
                                      ref={postFileInputRef}
                                      onChange={(e) => handleFileChange(e, setSelectedPostFile)}
                                      accept="image/*,video/*,application/pdf,.doc,.docx"
                                    />
                                    <Button type="button" variant="outline" onClick={() => postFileInputRef.current?.click()}>
                                        <Paperclip className="w-4 h-4 mr-2"/>
                                        Attach File
                                    </Button>
                                  </>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                       />

                      <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Publish</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold font-headline">Recent Posts</h2>
              {!isClient ? renderCommunitySkeletons() : communityPosts.map((post) => (
                <Card key={post.id}>
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
                  <CardFooter className="flex-col items-start gap-4">
                     <Button variant="ghost" size="sm" onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}>
                        <CornerDownRight className="w-4 h-4 mr-2"/>
                        Reply
                     </Button>

                     {post.replies.length > 0 && (
                        <div className="w-full space-y-4 pl-8 border-l border-border ml-4">
                            {post.replies.map(reply => (
                                <div key={reply.id} className="flex gap-3">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={reply.avatar} alt={reply.author} data-ai-hint={reply.aiHint} />
                                        <AvatarFallback>{reply.author.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-sm">{reply.author}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(reply.timestamp, { addSuffix: true })}
                                            </p>
                                            {reply.isProfessional && (
                                                 <Badge variant="outline" className="border-primary/50 text-primary text-xs">
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Professional
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reply.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                     )}

                     {replyingTo === post.id && (
                        <div className="w-full pl-8 ml-4">
                            <Form {...replyForm}>
                                <form onSubmit={replyForm.handleSubmit(data => onReplySubmit(post.id, data))} className="flex items-start gap-3">
                                    <Avatar className="w-8 h-8 mt-1">
                                        <AvatarImage src="https://github.com/shadcn.png" alt="Your avatar" data-ai-hint="person smiling"/>
                                        <AvatarFallback>You</AvatarFallback>
                                    </Avatar>
                                    <FormField
                                        control={replyForm.control}
                                        name="replyContent"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl>
                                                    <Input placeholder="Write a reply..." {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Send</Button>
                                </form>
                            </Form>
                        </div>
                     )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="q-and-a" className="mt-6">
            <Card className="mb-8">
              <CardHeader>
                <h2 className="text-lg font-semibold font-headline">Ask our Experts</h2>
                <p className="text-sm text-muted-foreground">Have a question about nutrition, workouts, or recovery? Our professionals are here to help.</p>
              </CardHeader>
              <CardContent>
                <Form {...questionForm}>
                  <form onSubmit={questionForm.handleSubmit(onQuestionSubmit)} className="space-y-4">
                    <FormField
                      control={questionForm.control}
                      name="question"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Question</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="For example: 'What's the best way to warm up for a run?'"
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {selectedQuestionFile && (
                        <div className="flex items-center justify-between p-2 text-sm text-muted-foreground bg-muted rounded-md">
                           <div className="flex items-center gap-2 truncate">
                                <Paperclip className="w-4 h-4" />
                                <span className="truncate">{selectedQuestionFile.name}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                    setSelectedQuestionFile(null);
                                    if(questionFileInputRef.current) questionFileInputRef.current.value = "";
                                }}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                       <FormField
                        control={questionForm.control}
                        name="file"
                        render={() => (
                            <FormItem>
                                <FormControl>
                                  <>
                                    <input 
                                      type="file" 
                                      className="hidden" 
                                      ref={questionFileInputRef}
                                      onChange={(e) => handleFileChange(e, setSelectedQuestionFile)}
                                      accept="image/*,video/*,application/pdf,.doc,.docx"
                                    />
                                    <Button type="button" variant="outline" onClick={() => questionFileInputRef.current?.click()}>
                                        <Paperclip className="w-4 h-4 mr-2"/>
                                        Attach File
                                    </Button>
                                  </>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                       />
                      <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Submit Question</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold font-headline">Answered Questions</h2>
                {!isClient ? renderQaSkeletons() : qaPosts.map((qa) => (
                    <Card key={qa.id}>
                        <CardHeader>
                             <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={qa.avatar} alt={qa.author} data-ai-hint={qa.aiHint} />
                                    <AvatarFallback>{qa.author.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{qa.author}</p>
                                    <p className="text-xs text-muted-foreground">
                                        asked {formatDistanceToNow(qa.timestamp, { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold text-base mb-4">{qa.question}</p>
                            {qa.answer ? (
                                <div className="bg-secondary/50 p-4 rounded-lg">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={qa.answer.avatar} alt={qa.answer.professional} data-ai-hint={qa.answer.aiHint} />
                                            <AvatarFallback>{qa.answer.professional.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-sm">{qa.answer.professional}</p>
                                            <p className="text-xs text-muted-foreground">{qa.answer.specialty}</p>
                                        </div>
                                        <Badge variant="outline" className="ml-auto border-primary/50 text-primary">
                                            <Check className="w-3 h-3 mr-1" />
                                            Professional
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{qa.answer.content}</p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center text-sm text-muted-foreground p-4 bg-secondary/50 rounded-lg">
                                    <MessageCircle className="w-4 h-4 mr-2"/>
                                    Awaiting response from a professional.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

