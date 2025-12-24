"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Error",
          description: "Invalid credentials",
          variant: "destructive",
        })
      } else {
        router.push("/admin/dashboard")
      }
    } catch {
      toast({
        title: "Error",
        description: "Login failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* --- HEADER --- */}
      <header className="relative z-50 w-full bg-white bg-wavy-pattern border-b border-slate-100 shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 h-32 md:h-40 flex items-center justify-between">
          <div className="flex items-center">
             {/* ACS 140 Logo (Big) */}
             <Link href="/">
               <div className="relative h-24 md:h-32 w-auto transition-transform hover:scale-105 duration-300">
                 <Image 
                   src="/images/acs-140-logo.jpg" 
                   alt="ACS 140 Years" 
                   width={200}
                   height={128}
                   className="object-contain w-full h-full"
                   priority
                 />
               </div>
             </Link>
          </div>
          
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
             {/* Navigation Items (Empty) */}
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-md w-full">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-6 text-center">
            Admin Login
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="mt-2"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 border-t border-slate-700 py-12">
        <div className="container max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-3">
               <div className="relative h-10 w-10 opacity-90 hover:opacity-100 transition-opacity duration-500">
                  <Image 
                    src="/images/acs-logo.png" 
                    alt="ACS Logo" 
                    width={40}
                    height={40}
                    className="object-contain w-full h-full"
                  />
               </div>
               <span className="font-bold text-white tracking-tight">ACS OBA</span>
           </div>
           
           <div className="text-center text-white md:text-right">
              © 140th ACS OBA FOUNDERS DAY DINNER, 2026
              <p className="text-[0.5rem] text-slate-400 mt-2">This page designed and built by ACSOBA Volunteers: <a href="https://nofa.io" className="hover:text-white transition-colors">Michael Lin</a> and <a href="https://github.com/kennethch22" className="hover:text-white transition-colors">Kenneth Hendra</a></p>
           </div>
        </div>
      </footer>
    </div>
  )
}

