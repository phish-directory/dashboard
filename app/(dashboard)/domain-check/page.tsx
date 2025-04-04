"use client";

import type React from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

export default function DomainCheckPage() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;

    setIsLoading(true);
    setResult(null);
    setError("");

    try {
      const data = await apiRequest(
        `/domain/check?domain=${encodeURIComponent(domain)}`,
        {
          requiresAuth: true,
        }
      );
      setResult(data);
    } catch (error: any) {
      setError(error.message || "Failed to check domain");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Domain Check</h1>
        <p className="text-muted-foreground">
          Check if a domain is known for phishing or malicious activity
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check a Domain</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <div className="flex space-x-2">
                <Input
                  id="domain"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
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
                {result.isPhishing ? (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Phishing Detected</AlertTitle>
                    <AlertDescription>
                      This domain has been identified as a phishing site.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert
                    variant="default"
                    className="border-green-500 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Safe Domain</AlertTitle>
                    <AlertDescription>
                      This domain has not been identified as a phishing site.
                    </AlertDescription>
                  </Alert>
                )}

                {result.details && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
