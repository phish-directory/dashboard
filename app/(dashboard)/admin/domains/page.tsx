"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AlertCircle, Edit, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";

type Domain = {
  id: string;
  domain: string;
  isPhishing: boolean;
  reportedBy: string;
  createdAt: string;
};

export default function AdminDomainsPage() {
  const { user } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

  // Form states
  const [newDomain, setNewDomain] = useState("");
  const [newIsPhishing, setNewIsPhishing] = useState(true);

  const [editDomain, setEditDomain] = useState("");
  const [editIsPhishing, setEditIsPhishing] = useState(false);

  useEffect(() => {
    if (user?.role !== "admin") {
      setError("You do not have permission to access this page");
      setIsLoading(false);
      return;
    }

    fetchDomains();
  }, [user]);

  const fetchDomains = async () => {
    try {
      const data = await apiRequest<Domain[]>("/admin/domain", {
        requiresAuth: true,
      });
      setDomains(data);
    } catch (error: any) {
      setError(error.message || "Failed to fetch domains");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDomain = async () => {
    try {
      await apiRequest("/admin/domain", {
        method: "POST",
        body: {
          domain: newDomain,
          isPhishing: newIsPhishing,
        },
      });

      // Reset form
      setNewDomain("");
      setNewIsPhishing(true);

      // Close dialog and refresh domains
      setIsAddDialogOpen(false);
      fetchDomains();
    } catch (error: any) {
      setError(error.message || "Failed to add domain");
    }
  };

  const handleEditDomain = async () => {
    if (!selectedDomain) return;

    try {
      await apiRequest(`/admin/domain/${selectedDomain.id}`, {
        method: "PATCH",
        body: {
          domain: editDomain,
          isPhishing: editIsPhishing,
        },
      });

      // Close dialog and refresh domains
      setIsEditDialogOpen(false);
      fetchDomains();
    } catch (error: any) {
      setError(error.message || "Failed to update domain");
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm("Are you sure you want to delete this domain?")) return;

    try {
      await apiRequest(`/admin/domain/${domainId}`, {
        method: "DELETE",
      });

      // Refresh domains
      fetchDomains();
    } catch (error: any) {
      setError(error.message || "Failed to delete domain");
    }
  };

  const openEditDialog = (domain: Domain) => {
    setSelectedDomain(domain);
    setEditDomain(domain.domain);
    setEditIsPhishing(domain.isPhishing);
    setIsEditDialogOpen(true);
  };

  if (user?.role !== "admin") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin: Domains</h1>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin: Domains</h1>
          <p className="text-muted-foreground">Manage phishing domains</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Domain</DialogTitle>
              <DialogDescription>
                Add a new domain to the database.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-domain">Domain</Label>
                <Input
                  id="new-domain"
                  placeholder="example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-is-phishing">Is Phishing</Label>
                <div className="flex items-center space-x-2">
                  <input
                    id="new-is-phishing"
                    type="checkbox"
                    checked={newIsPhishing}
                    onChange={(e) => setNewIsPhishing(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="new-is-phishing">
                    Mark as phishing domain
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddDomain}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Domains</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <span className="ml-2">Loading domains...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((domain) => (
                  <TableRow key={domain.id}>
                    <TableCell>{domain.domain}</TableCell>
                    <TableCell>
                      <span
                        className={
                          domain.isPhishing
                            ? "text-destructive font-medium"
                            : "text-green-600 font-medium"
                        }
                      >
                        {domain.isPhishing ? "Phishing" : "Safe"}
                      </span>
                    </TableCell>
                    <TableCell>{domain.reportedBy}</TableCell>
                    <TableCell>
                      {new Date(domain.createdAt).toDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(domain)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDomain(domain.id)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Domain</DialogTitle>
            <DialogDescription>Update domain information.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-domain">Domain</Label>
              <Input
                id="edit-domain"
                value={editDomain}
                onChange={(e) => setEditDomain(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-is-phishing">Is Phishing</Label>
              <div className="flex items-center space-x-2">
                <input
                  id="edit-is-phishing"
                  type="checkbox"
                  checked={editIsPhishing}
                  onChange={(e) => setEditIsPhishing(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="edit-is-phishing">
                  Mark as phishing domain
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditDomain}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
