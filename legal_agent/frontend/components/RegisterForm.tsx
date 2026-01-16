"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FcGoogle } from "react-icons/fc"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { auth, googleProvider } from "../lib/Firebase"
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  //  Email + Password Register
  async function onSubmit(values: z.infer<typeof registerSchema>) {
    try {
      setLoading(true)

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      )

      await updateProfile(userCredential.user, {
        displayName: values.name,
      })

      router.push("/chat")
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  //  Google Register / Login
  async function signUpWithGoogle() {
    try {
      setGoogleLoading(true)
      await signInWithPopup(auth, googleProvider)
      router.push("/chat")
    } catch (error: any) {
      alert(error.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-center mb-6">
        Create your account
      </h1>

      {/* Google Sign Up */}
      <Button
        type="button"
        variant="outline"
        className="w-full mb-4 flex gap-2"
        onClick={signUpWithGoogle}
        disabled={loading || googleLoading}
      >
        {googleLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <FcGoogle className="h-5 w-5" />
            Continue with Google
          </>
        )}
      </Button>

      <div className="relative my-4 text-center text-sm text-slate-500">
        <span className="bg-white px-2">or</span>
        <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200 -z-10" />
      </div>

    
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} disabled={loading} />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-black text-white"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </form>
      </Form>
    </>
  )
}
