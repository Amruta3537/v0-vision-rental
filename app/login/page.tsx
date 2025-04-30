"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building, ArrowRight, Eye, EyeOff, Moon, Sun } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "next-themes"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  // Add signInAsGuest to the destructured values
  const { user, loading, signIn, signUp, signInAsGuest } = useAuth()
  const [isRegistering, setIsRegistering] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Check if user is already logged in
  useEffect(() => {
    // Safely check if user exists and router is available
    if (!loading && user && router) {
      // If user is already logged in, redirect to dashboard
      router.push("/dashboard")
    }

    // Check if register param is present
    const register = searchParams?.get("register")
    if (register === "true") {
      setIsRegistering(true)
    }

    setMounted(true)
  }, [router, searchParams, user, loading])

  // Avoid hydration mismatch
  if (!mounted) {
    return null
  }

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value })
  }

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await signIn(loginForm.email, loginForm.password)
      toast({
        title: "Login Successful",
        description: "Welcome back!",
        variant: "default",
      })

      // Use a more reliable way to navigate
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard"
      } else {
        router.push("/dashboard")
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials",
        variant: "destructive",
      })
    }
  }

  // Handle guest login
  const handleGuestLogin = async () => {
    try {
      await signInAsGuest()
      toast({
        title: "Guest Login Successful",
        description: "You are now logged in as a guest user",
        variant: "default",
      })

      // Use a more reliable way to navigate
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard"
      } else {
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Guest login error:", error)
      toast({
        title: "Guest Login Failed",
        description: error.message || "Failed to login as guest",
        variant: "destructive",
      })
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Simple validation
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      toast({
        title: "Registration Failed",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Registration Failed",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    try {
      await signUp(registerForm.email, registerForm.password, registerForm.name)
      toast({
        title: "Registration Successful",
        description: `Welcome, ${registerForm.name}!`,
        variant: "default",
      })

      // Use a more reliable way to navigate
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard"
      } else {
        router.push("/dashboard")
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-amber-800 to-rose-900 dark:from-gray-900 dark:to-gray-800 min-h-screen flex flex-col">
        {/* Header */}
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/"
              } else {
                router.push("/")
              }
            }}
          >
            <Building className="h-8 w-8 text-amber-400 mr-2" />
            <h1 className="text-2xl font-bold text-white">Premium Room Finder</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-white hover:bg-white/10"
          >
            {theme === "dark" ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Form Header */}
              <div className="bg-amber-50 dark:bg-gray-700 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isRegistering ? "Create an Account" : "Welcome Back"}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {isRegistering ? "Sign up to access all premium features" : "Sign in to continue to your account"}
                </p>
              </div>

              {/* Form Content */}
              <div className="p-6">
                {isRegistering ? (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="register-name" className="text-gray-700 dark:text-gray-300">
                        Full Name
                      </Label>
                      <Input
                        id="register-name"
                        name="name"
                        value={registerForm.name}
                        onChange={handleRegisterInputChange}
                        required
                        className="mt-1"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <Label htmlFor="register-email" className="text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        value={registerForm.email}
                        onChange={handleRegisterInputChange}
                        required
                        className="mt-1"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="register-password" className="text-gray-700 dark:text-gray-300">
                        Password
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="register-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={registerForm.password}
                          onChange={handleRegisterInputChange}
                          required
                          className="pr-10"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="register-confirm-password" className="text-gray-700 dark:text-gray-300">
                        Confirm Password
                      </Label>
                      <Input
                        id="register-confirm-password"
                        name="confirmPassword"
                        type="password"
                        value={registerForm.confirmPassword}
                        onChange={handleRegisterInputChange}
                        required
                        className="mt-1"
                        placeholder="••••••••"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white mt-6">
                      Create Account <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    <div className="text-center mt-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        Already have an account?{" "}
                        <button
                          type="button"
                          className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium"
                          onClick={() => setIsRegistering(false)}
                        >
                          Sign In
                        </button>
                      </p>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email" className="text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        value={loginForm.email}
                        onChange={handleLoginInputChange}
                        required
                        className="mt-1"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password" className="text-gray-700 dark:text-gray-300">
                          Password
                        </Label>
                        <button
                          type="button"
                          className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative mt-1">
                        <Input
                          id="login-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={loginForm.password}
                          onChange={handleLoginInputChange}
                          required
                          className="pr-10"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white mt-6">
                      Sign In <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    {/* Guest Login Button */}
                    <Button type="button" variant="outline" className="w-full mt-2" onClick={handleGuestLogin}>
                      Continue as Guest
                    </Button>

                    <div className="text-center mt-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        Don't have an account?{" "}
                        <button
                          type="button"
                          className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium"
                          onClick={() => setIsRegistering(true)}
                        >
                          Sign Up
                        </button>
                      </p>
                    </div>
                  </form>
                )}

                {/* Social Login Options */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <span className="ml-2">Facebook</span>
                    </button>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <span className="ml-2">Google</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
