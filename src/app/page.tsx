import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Leaf, Dumbbell, UtensilsCrossed, Users, Check } from 'lucide-react';
import { VitaNovaIcon } from '@/components/icons';

const plans = [
    {
        name: "Basic",
        price: "$5",
        features: [
            "Core features for individual wellness",
            "Access to 10 new recipes weekly",
            "Basic workout plans"
        ],
        cta: "Choose Basic"
    },
    {
        name: "Premium",
        price: "$32",
        features: [
            "Advanced features and personalized coaching",
            "Unlimited recipes",
            "1-on-1 coach chat"
        ],
        cta: "Choose Premium"
    },
    {
        name: "Family",
        price: "$100/mo",
        features: [
            "All features for up to 4 family members",
            "Family meal planner",
            "All Premium features included"
        ],
        cta: "Choose Family"
    }
];


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center justify-center" aria-label="VitaNova Home">
          <VitaNovaIcon className="h-6 w-6 text-primary" />
          <span className="sr-only">VitaNova</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" asChild>
            <Link href="/login">
              Login
            </Link>
          </Button>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
            <Link href="/register">
              Get Started
            </Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-background to-secondary">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary-foreground/90">
                    Your Personalized Path to Wellness
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl font-body">
                    VitaNova offers tailored health plans, delicious recipes, and a supportive community to help you achieve your wellness goals.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                    <Link href="/register">
                      Join Now
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#features">
                      Learn More
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="healthy food"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm font-headline">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline text-primary-foreground/90">A Healthier Life, Simplified</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-body">
                  We provide the tools and support you need to thrive. Explore our features designed for your success.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-2 lg:max-w-none xl:grid-cols-4 pt-12">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-col items-center text-center">
                  <div className="p-3 rounded-full bg-accent/20 text-accent-foreground">
                    <Leaf className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline mt-4">Personalized Plans</CardTitle>
                </CardHeader>
                <CardContent className="text-center font-body text-muted-foreground">
                  Choose a plan that fits your lifestyle and goals, from basic wellness to family health.
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-col items-center text-center">
                   <div className="p-3 rounded-full bg-accent/20 text-accent-foreground">
                    <UtensilsCrossed className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline mt-4">Healthy Recipes</CardTitle>
                </CardHeader>
                <CardContent className="text-center font-body text-muted-foreground">
                  Access a library of delicious and nutritious recipes tailored to your dietary needs.
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-col items-center text-center">
                   <div className="p-3 rounded-full bg-accent/20 text-accent-foreground">
                    <Dumbbell className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline mt-4">Workout Techniques</CardTitle>
                </CardHeader>
                <CardContent className="text-center font-body text-muted-foreground">
                  Learn proper workout techniques to maximize results and prevent injuries.
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-col items-center text-center">
                   <div className="p-3 rounded-full bg-accent/20 text-accent-foreground">
                    <Users className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline mt-4">Community Support</CardTitle>
                </CardHeader>
                <CardContent className="text-center font-body text-muted-foreground">
                  Connect with others, share your progress, and stay motivated together.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm font-headline">Pricing Plans</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline text-primary-foreground/90">Find the Perfect Plan</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-body">
                  Whether you're starting out or need advanced features, we have a plan for you.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-8 pt-12 sm:grid-cols-1 md:grid-cols-3 md:gap-12">
              {plans.map((plan) => (
                <Card key={plan.name} className="flex flex-col hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="text-center">
                        <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                        <p className="text-4xl font-bold font-headline">{plan.price}</p>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                       <ul className="space-y-2 text-muted-foreground">
                        {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start">
                                <Check className="w-4 h-4 mr-2 mt-1 text-primary"/>
                                <span>{feature}</span>
                            </li>
                        ))}
                       </ul>
                    </CardContent>
                    <CardFooter>
                         <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                            <Link href="/register">{plan.cta}</Link>
                        </Button>
                    </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 VitaNova. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
