"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { registerGuest } from "@/app/actions/guest"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function InvitePage() {
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
    } catch (error) {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Invite Code</h1>
          <p>Please use a valid invite link.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">
            Complete Your Registration
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Invite Code: <span className="font-mono font-bold">{code}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label>Email *</Label>
              <Input
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
              <Label>Mobile</Label>
              <Input
                type="tel"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label>Birth Year</Label>
              <Input
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
              <Label>School</Label>
              <Input
                value={formData.school}
                onChange={(e) =>
                  setFormData({ ...formData, school: e.target.value })
                }
                placeholder="e.g. ACS(I), ACS(O), Barker"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Graduation Year</Label>
              <Input
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
              <Label>Dietary Requirements</Label>
              <Input
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
              className="w-full bg-blue-900 text-yellow-400 hover:bg-blue-800"
            >
              {loading ? "Registering..." : "Complete Registration"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

