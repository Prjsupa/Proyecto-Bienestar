
"use client"

import Link from "next/link";
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { VitaNovaIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { createClient } from "@/utils/supabase/client"

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre es requerido." }),
  last_name: z.string().min(2, { message: "El apellido es requerido." }),
  email: z.string().email({ message: "Introduce un correo válido." }),
  password: z.string().min(8, { message: "Mínimo 8 caracteres." }),
})

export default function RegisterPage() {
  const { toast } = useToast()
  const [isRegistered, setIsRegistered] = useState(false)
  const [emailToVerify, setEmailToVerify] = useState("")
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      last_name: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          name: values.name,
          last_name: values.last_name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast({
        title: "Error en registro",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    if (data.user) {
        setIsRegistered(true)
        setEmailToVerify(values.email)
        toast({
            title: "Registro exitoso",
            description: "Revisa tu correo electrónico para verificar tu cuenta.",
        })
    }
    
    form.reset()
  }

  if (isRegistered) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verifica tu correo electrónico</CardTitle>
            <CardDescription>
              Hemos enviado un enlace de verificación a <strong>{emailToVerify}</strong>. Por favor, verifica tu correo antes de{" "}
              <Link href="/login" className="text-accent-foreground underline">
                iniciar sesión
              </Link>.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center gap-2 text-foreground font-semibold"
      >
        <VitaNovaIcon className="h-6 w-6" />
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Crear tu cuenta Premium</CardTitle>
          <CardDescription>
            Comienza tu viaje de bienestar con acceso a todo nuestro contenido.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input placeholder="Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting ? "Registrando..." : "Registrarse"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="/login" className="underline text-accent-foreground/80 font-semibold">
                    Iniciar Sesión
                  </Link>
                </p>
              </CardFooter>
          </form>
        </Form>

      </Card>
    </div>
  )
}
