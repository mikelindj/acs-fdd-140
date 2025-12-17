"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { registerGuest } from "@/app/actions/guest"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

function InvitePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get("code")
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    birthYear: "",
    school: "",
    gradYear: "",
    dietary: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) {
      toast({
        title: "Error",
        description: "Invalid invite code",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await registerGuest({
        ...formData,
        inviteCode: code,
        birthYear: formData.birthYear ? parseInt(formData.birthYear) : undefined,
        gradYear: formData.gradYear ? parseInt(formData.gradYear) : undefined,
      })

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Registration completed!",
        })
        router.push("/")
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to register",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-4">Invalid Invite Code</h1>
          <p className="text-slate-600">Please use a valid invite link.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-6 text-center">
            Complete Your Registration
          </h1>
          <p className="text-center text-slate-600 mb-8">
            Invite Code: <span className="font-mono font-semibold text-slate-900">{code}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
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
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="birthYear">Birth Year</Label>
              <Input
                id="birthYear"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.birthYear}
                onChange={(e) =>
                  setFormData({ ...formData, birthYear: e.target.value })
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="school">School</Label>
              <Input
                id="school"
                value={formData.school}
                onChange={(e) =>
                  setFormData({ ...formData, school: e.target.value })
                }
                placeholder="e.g. ACS(I), ACS(O), Barker"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="gradYear">Graduation Year</Label>
              <Input
                id="gradYear"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.gradYear}
                onChange={(e) =>
                  setFormData({ ...formData, gradYear: e.target.value })
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="dietary">Dietary Requirements</Label>
              <Input
                id="dietary"
                value={formData.dietary}
                onChange={(e) =>
                  setFormData({ ...formData, dietary: e.target.value })
                }
                placeholder="e.g. Vegetarian, Halal, No beef"
                className="mt-2"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Registering..." : "Complete Registration"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-slate-600">Loading...</div>
      </div>
    }>
      <InvitePageContent />
    </Suspense>
  )
}

