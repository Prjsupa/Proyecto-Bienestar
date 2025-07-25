
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CheckCircle2 } from "lucide-react"

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
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { VitaNovaIcon } from "@/components/icons"

const plans = [
  { id: "basic", name: "Básico", price: "$5", description: "Acceso a dieta estándar" },
  { id: "premium", name: "Premium", price: "$32", description: "Acceso a rutinas y dieta semi-estándar" },
  { id: "family", name: "Familiar", price: "$100/mes", description: "Todas las características, coaching avanzado y más." },
]

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
  plan: z.string().min(1, { message: "Por favor, selecciona un plan." }),
})

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedPlan, setSelectedPlan] = useState("premium")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      plan: "premium",
    },
  })

  function handlePlanSelect(planId: string) {
    setSelectedPlan(planId)
    form.setValue("plan", planId)
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    toast({
      title: "¡Cuenta Creada!",
      description: "Bienvenido a VitaNova. Redirigiendo a tu panel de control...",
    })
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Link href="/" className="absolute top-4 left-4 flex items-center gap-2 text-foreground font-semibold">
        <VitaNovaIcon className="h-6 w-6" />
        <span className="font-headline">VitaNova</span>
      </Link>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Crear una cuenta</CardTitle>
          <CardDescription>
            Únete a VitaNova hoy. Elige tu plan y comienza tu viaje de bienestar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    onClick={() => handlePlanSelect(plan.id)}
                    className={cn(
                      "cursor-pointer transition-all duration-300",
                      selectedPlan === plan.id ? "ring-2 ring-accent shadow-lg" : "hover:shadow-md"
                    )}
                  >
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-headline">{plan.name}</CardTitle>
                        {selectedPlan === plan.id && <CheckCircle2 className="h-5 w-5 text-accent" />}
                      </div>
                      <p className="text-xl font-bold font-headline">{plan.price}</p>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0">
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Registrarse
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="underline text-accent-foreground/80 font-semibold">
                    Iniciar Sesión
                </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  )
}

