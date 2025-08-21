
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Leaf, Dumbbell, UtensilsCrossed, Users, Check } from 'lucide-react';
import { Logo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';


const premiumPlan = {
    name: "Premium",
    price: "$100/mes",
    features: [
        "Todas las características",
        "Coaching avanzado y personalizado",
        "Recetas ilimitadas",
        "Chat 1 a 1 con el coach",
    ],
    cta: "Suscribirse Ahora"
};


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center gap-2 font-bold text-lg" aria-label="Inicio">
          <Logo />
          <span className="font-headline tracking-tight">MARIVI POWER</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
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
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Transforma tu Cuerpo y Mente
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl font-body">
                    Planes de salud a medida, recetas deliciosas y una comunidad de apoyo para ayudarte a alcanzar tus metas de bienestar.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                    <Link href="/register">
                      Únete Ahora
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#features">
                      Saber Más
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Héroe"
                data-ai-hint="fitness woman workout"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm font-headline">Características Clave</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Una Vida Más Sana, Simplificada</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-body">
                  Te proporcionamos las herramientas y el apoyo que necesitas para prosperar. Explora nuestras funciones diseñadas para tu éxito.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-2 lg:max-w-none xl:grid-cols-4 pt-12">
              <Card className="bg-card hover:shadow-lg transition-shadow duration-300">
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
              <Card className="bg-card hover:shadow-lg transition-shadow duration-300">
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
              <Card className="bg-card hover:shadow-lg transition-shadow duration-300">
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
              <Card className="bg-card hover:shadow-lg transition-shadow duration-300">
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
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm font-headline">Suscripción Premium</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Acceso Total a Tu Bienestar</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-body">
                  Obtén acceso ilimitado a todas nuestras herramientas, coaching personalizado y contenido exclusivo con nuestro plan premium.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-2xl pt-12">
                <Card className="flex flex-col bg-card hover:shadow-xl transition-shadow duration-300 border-primary border-2">
                    <CardHeader className="text-center">
                        <CardTitle className="font-headline text-2xl text-primary">{premiumPlan.name}</CardTitle>
                        <p className="text-4xl font-bold font-headline">{premiumPlan.price}</p>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                       <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
                        {premiumPlan.features.map((feature) => (
                            <li key={feature} className="flex items-start">
                                <Check className="w-4 h-4 mr-2 mt-1 text-primary"/>
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
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Marivi Power. Todos los derechos reservados.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Términos de Servicio
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  );
}
