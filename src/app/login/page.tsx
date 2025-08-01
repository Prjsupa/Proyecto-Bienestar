"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { VitaNovaIcon } from "@/components/icons"
import { useToast } from "@/hooks/use-toast"

import { createClient } from "../../../utils/supabase/client"
const supabase = createClient()

const formSchema = z.object({
  email: z.string().email({
    message: "Por favor, introduce una dirección de correo electrónico válida.",
  }),
  password: z.string().min(1, {
    message: "La contraseña es obligatoria.",
  }),
})

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // 1. Intentar iniciar sesión con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    console.log("SIGN IN RESPONSE:", { data, error });

    if (error) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (!data.session) {
      toast({
        title: "Error",
        description: "No se obtuvo sesión válida.",
        variant: "destructive",
      });

      console.log("No hay sesión válida después del login");
      return;
    }

    // 2. Verificar la sesión activa explícitamente
    const session = await supabase.auth.getSession();
    console.log("SESSION ACTIVA:", session);

    if (!session.data.session) {
      toast({
        title: "Error",
        description: "Sesión no activa después de login.",
        variant: "destructive",
      });
      return;
    }

    const user = data.user;
    console.log("USER ID:", user?.id);
    console.log("USER METADATA:", user?.user_metadata);

    // 3. Consultar si existe ya el usuario en la tabla "usuarios"
    const { data: existingUser, error: fetchError } = await supabase
      .from("usuarios")
      .select("id")
      .eq("id", user.id)
      .single();

    console.log("EXISTING USER FETCH:", { existingUser, fetchError });

    if (fetchError && fetchError.code !== "PGRST116") { // PGRST116 = no encontrado
      toast({
        title: "Error al buscar usuario",
        description: fetchError.message,
        variant: "destructive",
      });
      return;
    }

    // 4. Insertar registro si no existe
    if (!existingUser) {
      const { error: insertError } = await supabase.from("usuarios").insert({
        id: user.id,
        name: user.user_metadata?.name || "",
        last_name: user.user_metadata?.last_name || "",
        email: user.email || "",
      });

      if (insertError) {
        console.error("ERROR INSERTANDO EN usuarios:", insertError);
        toast({
          title: "Error al guardar datos",
          description: insertError.message,
          variant: "destructive",
        });
        return;
      }
      console.log("Usuario insertado correctamente en tabla 'usuarios'");
    }

    // 5. Prueba lectura simple para usuario autenticado (debug adicional)
    const { data: testSelect, error: testSelectError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", user.id);

    console.log("TEST SELECT tras login:", { testSelect, testSelectError });

    toast({
      title: "Inicio de Sesión Exitoso",
      description: "Redirigiendo a tu panel de control...",
    });
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Link href="/" className="absolute top-4 left-4 flex items-center gap-2 text-foreground font-semibold">
        <VitaNovaIcon className="h-6 w-6" />
      </Link>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Iniciar Sesión</CardTitle>
          <CardDescription>
            Introduce tu correo electrónico para acceder a tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="nombre@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Iniciar Sesión
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="underline text-accent-foreground/80 font-semibold">
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
