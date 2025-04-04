"use client"

import type React from "react"

import { useState } from "react"
import { apiRequest } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"

export default function EmailCheckPage() {
  const [email, setEmail] = useState("")
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setResult(null)
    setError("")

    try {
      const data = await apiRequest(`/email/check?email=${encodeURIComponent(email)}`)
      setResult(data)
    } catch (error: any) {
      setError(error.message || "Failed to check email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Check</h1>
        <p className="text-muted-foreground">Check email address reputation and validity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check an Email</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex space-x-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Checking..." : "Check"}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <div className="mt-4 space-y-4">
                {result.isValid ? (
                  <Alert
                    variant="default"
                    className="border-green-500 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Valid Email</AlertTitle>
                    <AlertDescription>This email address appears to be valid.</AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Invalid Email</AlertTitle>
                    <AlertDescription>This email address appears to be invalid.</AlertDescription>
                  </Alert>
                )}

                {result.reputation && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Reputation Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">Score:</span> {result.reputation.score}/100
                        </div>
                        {result.reputation.flags && (
                          <div>
                            <span className="font-medium">Flags:</span> {result.reputation.flags.join(", ")}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

