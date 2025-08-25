
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Leaf, Dumbbell, UtensilsCrossed, Users, Check, LogIn, UserPlus, HeartPulse } from 'lucide-react';
import { Logo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';

const premiumPlan = {
    name: "Premium",
    price: "$100/mes",
    features: [
        "Rutinas personalizadas",
        "Coaching avanzado y personalizado",
        "Recetas ilimitadas",
        "Chat 1 a 1 con el coach",
        "Entrenamiento a tu ritmo",
        "Todo esto y mucho más"
    ],
    cta: "Suscribirse Ahora"
};

const SUPABASE_STORAGE_URL = 'https://jqdbhsicpfdpzifphdft.supabase.co/storage/v1/object/public';

function LandingPageHeader() {
    return (
      <header className="h-16 flex items-center border-b sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between">
            <Link href="/" className="flex items-center justify-center gap-2 font-bold text-lg" aria-label="Inicio">
                <Logo />
                <span className="font-logo tracking-widest text-xl">MARIVI POWER</span>
            </Link>
            <nav className="hidden md:flex items-center gap-2 sm:gap-4">
                <ThemeToggle />
                <Button variant="ghost" asChild>
                    <Link href="/login">
                    Iniciar Sesión
                    </Link>
                </Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                    <Link href="/register">
                    Comenzar
                    </Link>
                </Button>
            </nav>
            <div className="md:hidden">
              <ThemeToggle />
            </div>
        </div>
      </header>
    );
}

function MobileCtaBar() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full p-4 bg-background/80 backdrop-blur-sm border-t">
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" asChild>
          <Link href="/login">
            <LogIn className="w-4 h-4 mr-2" />
            Iniciar Sesión
          </Link>
        </Button>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
          <Link href="/register">
             <UserPlus className="w-4 h-4 mr-2" />
            Comenzar
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingPageHeader />
      <main className="flex-1 mb-20 md:mb-0">
        <section className="w-full py-20 md:py-32 lg:py-40 relative overflow-hidden">
            <div 
                className="absolute inset-0 bg-repeat bg-center opacity-5 dark:opacity-[0.02]" 
                style={{backgroundImage: `url(${SUPABASE_STORAGE_URL}/logos.marivi/negro%20rojo%20imago%403x.png)`}}
            />
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-20">
              <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Transforma tu Cuerpo y Mente
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl font-body mx-auto lg:mx-0">
                    Planes de salud a medida, recetas deliciosas y una comunidad de apoyo para ayudarte a alcanzar tus metas de bienestar.
                  </p>
                </div>
                <div className="relative flex items-center justify-center lg:justify-start w-full max-w-xs mx-auto lg:mx-0 mt-6">
                    <Image
                        src={`${SUPABASE_STORAGE_URL}/logos.marivi/blanco@3x.png`}
                        width="400"
                        height="400"
                        alt="Logo Marivi Power"
                        data-ai-hint="logo"
                        className="w-1/2 drop-shadow-lg invert dark:invert-0"
                    />
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                    src={`${SUPABASE_STORAGE_URL}/logos.marivi/marivi_inicio.JPG`}
                    width="600"
                    height="800"
                    alt="Marivi Barrios sonriendo"
                    data-ai-hint="woman smiling fitness"
                    className="mx-auto rounded-xl object-cover aspect-[3/4] w-full max-w-sm shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm font-headline border">Características Clave</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Una Vida Más Sana, Simplificada</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-body">
                  Te proporcionamos las herramientas y el apoyo que necesitas para prosperar. Explora nuestras funciones diseñadas para tu éxito.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-2 lg:max-w-none xl:grid-cols-4 pt-12">
              <Card className="bg-card hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-col items-center text-center">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Leaf className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline mt-4">Planes Personalizados</CardTitle>
                </CardHeader>
                <CardContent className="text-center font-body text-muted-foreground">
                  Elige un plan que se ajuste a tu estilo de vida y objetivos, desde bienestar básico hasta salud familiar.
                </CardContent>
              </Card>
              <Card className="bg-card hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-col items-center text-center">
                   <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <UtensilsCrossed className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline mt-4">Recetas Saludables</CardTitle>
                </CardHeader>
                <CardContent className="text-center font-body text-muted-foreground">
                  Accede a una biblioteca de recetas deliciosas y nutritivas adaptadas a tus necesidades dietéticas.
                </CardContent>
              </Card>
              <Card className="bg-card hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-col items-center text-center">
                   <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Dumbbell className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline mt-4">Técnicas de Entrenamiento</CardTitle>
                </CardHeader>
                <CardContent className="text-center font-body text-muted-foreground">
                  Aprende técnicas de entrenamiento adecuadas para maximizar resultados y prevenir lesiones.
                </CardContent>
              </Card>
              <Card className="bg-card hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-col items-center text-center">
                   <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Users className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline mt-4">Apoyo Comunitario</CardTitle>
                </CardHeader>
                <CardContent className="text-center font-body text-muted-foreground">
                  Conéctate con otros, comparte tu progreso y manténganse motivados juntos.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        <section id="team" className="w-full py-12 md:py-24 lg:py-32 bg-background">
            <div className="container px-4 md:px-6">
                <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
                    <div className="space-y-4 flex flex-col justify-center">
                        <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm font-headline border w-fit">Nuestro Equipo</div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">Expertos Dedicados a Tu Bienestar</h2>
                        <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed font-body">
                          Contamos con los mejores profesionales, capacitados y comprometidos con tu transformación. Nuestro equipo combina la experiencia clínica con la pasión por el fitness para ofrecerte un acompañamiento integral y resultados reales.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-center">
                        <Image
                            src={`${SUPABASE_STORAGE_URL}/logos.marivi/personal_bata.jpg`}
                            width={500}
                            height={500}
                            alt="Equipo de profesionales con batas"
                            data-ai-hint="team professional"
                            className="rounded-xl object-contain w-full h-auto shadow-lg"
                        />
                        <Image
                             src={`${SUPABASE_STORAGE_URL}/logos.marivi/personal_uniforme.jpg`}
                             width={500}
                             height={500}
                             alt="Equipo de profesionales con uniformes"
                             data-ai-hint="team professional"
                             className="rounded-xl object-contain w-full h-auto shadow-lg"
                        />
                    </div>
                </div>
            </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-secondary/30 to-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm font-headline border">Suscripción Premium</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Acceso Total a Tu Bienestar</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-body">
                  Obtén acceso ilimitado a todas nuestras herramientas, coaching personalizado y contenido exclusivo con nuestro plan premium.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-2xl pt-12">
                <Card className="flex flex-col bg-card hover:shadow-2xl transition-shadow duration-300 border-primary border-2 shadow-primary/10">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="font-headline text-2xl text-primary">{premiumPlan.name}</CardTitle>
                        <p className="text-5xl font-bold font-headline">{premiumPlan.price}</p>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4 p-8">
                       <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
                        {premiumPlan.features.map((feature) => (
                            <li key={feature} className="flex items-start">
                                <Check className="w-4 h-4 mr-2 mt-1 text-primary shrink-0"/>
                                <span>{feature}</span>
                            </li>
                        ))}
                       </ul>
                    </CardContent>
                    <CardFooter>
                         <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                            <Link href="/register">{premiumPlan.cta}</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full bg-primary dark:bg-black text-primary-foreground py-12">
        <div className="container flex flex-col items-center text-center gap-6">
            <Image 
                src={`${SUPABASE_STORAGE_URL}/logos.marivi/blanco@3x.png`}
                alt="Marivi Power Logo"
                width={120}
                height={120}
                className="h-20 w-auto md:h-24 block dark:hidden"
                data-ai-hint="logo white"
            />
            <Image 
                src={`${SUPABASE_STORAGE_URL}/logos.marivi/rojo%20y%20blanco%20imago%403x.png`}
                alt="Marivi Power Logo Dark"
                width={120}
                height={120}
                className="h-20 w-auto md:h-24 hidden dark:block"
                data-ai-hint="logo white red"
            />
            
            <div className="flex gap-4">
                <Link href="#" className="text-sm hover:underline underline-offset-4" prefetch={false}>
                    Términos de Servicio
                </Link>
                <Link href="#" className="text-sm hover:underline underline-offset-4" prefetch={false}>
                    Privacidad
                </Link>
            </div>
            <p className="text-xs text-primary-foreground/70">Todos los derechos reservados a Marivi Barrios 2025&copy;</p>
        </div>
      </footer>
      <MobileCtaBar />
    </div>
  );
}
