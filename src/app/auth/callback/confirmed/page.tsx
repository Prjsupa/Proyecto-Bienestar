
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AuthCallbackConfirmedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <div className="absolute top-4 left-4 flex items-center gap-2 font-bold text-lg">
          <Logo />
          <span className="font-logo tracking-widest text-xl">MARIVI POWER</span>
      </div>
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-fit rounded-full bg-green-100 p-3 dark:bg-green-900/50">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="pt-4 text-2xl font-headline">
            ¡Correo Confirmado!
          </CardTitle>
          <CardDescription>
            Gracias por verificar tu dirección de correo electrónico.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Ya puedes cerrar esta pestaña y volver a la página de inicio de sesión.</p>
          <Button asChild>
            <Link href="/login">Ir a Iniciar Sesión</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
