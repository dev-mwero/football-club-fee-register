"use client";

import {
  Mail,
  Plus,
  Shield,
  ShieldAlert,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState, PageHeader } from "@/components/page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

interface InviteData {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  invitedBy: { _id: string; name: string; email: string } | null;
}

const roleBadgeVariant = (role: string) => {
  switch (role) {
    case "ADMIN":
      return {
        variant: "default" as const,
        class: "bg-primary/15 text-primary hover:bg-primary/15",
      };
    case "COACH":
      return { variant: "secondary" as const, class: "" };
    default:
      return { variant: "outline" as const, class: "" };
  }
};

const inviteStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING":
      return {
        label: "Pending",
        variant: "secondary" as const,
        class: "bg-amber-500/15 text-amber-600 hover:bg-amber-500/15",
      };
    case "ACCEPTED":
      return {
        label: "Accepted",
        variant: "default" as const,
        class: "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15",
      };
    case "EXPIRED":
      return {
        label: "Expired",
        variant: "outline" as const,
        class: "text-muted-foreground",
      };
    case "REVOKED":
      return { label: "Revoked", variant: "destructive" as const, class: "" };
    default:
      return { label: status, variant: "outline" as const, class: "" };
  }
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [invites, setInvites] = useState<InviteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("PARENT");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [promoteId, setPromoteId] = useState<string | null>(null);
  const [promoteName, setPromoteName] = useState("");
  const [promoting, setPromoting] = useState(false);

  async function loadData() {
    try {
      const [usersRes, invitesRes] = await Promise.all([
        fetch("/api/v1/admin/users"),
        fetch("/api/v1/admin/invites"),
      ]);
      const usersData = await usersRes.json();
      const invitesData = await invitesRes.json();
      if (usersData.success) setUsers(usersData.data);
      if (invitesData.success) setInvites(invitesData.data);
    } catch {
      console.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only fetch
  useEffect(() => {
    loadData();
  }, []);

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteError("");

    try {
      const res = await fetch("/api/v1/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();

      if (data.success) {
        setInviteOpen(false);
        setInviteEmail("");
        setInviteRole("PARENT");
        loadData();
      } else {
        setInviteError(data.error ?? "Failed to send invite");
      }
    } catch {
      setInviteError("Something went wrong");
    } finally {
      setInviting(false);
    }
  }

  async function handleRevokeInvite(inviteId: string) {
    try {
      await fetch(`/api/v1/admin/invites/${inviteId}`, { method: "DELETE" });
      loadData();
    } catch {
      console.error("Failed to revoke invite");
    }
  }

  async function handlePromote(userId: string) {
    setPromoting(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/promote`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setPromoteId(null);
        loadData();
      }
    } catch {
      console.error("Failed to promote user");
    } finally {
      setPromoting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Users" description="Manage users and invitations" />
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title="Users"
        description="Manage users and send invitations"
        action={
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Send Invite
                </Button>
              }
            />
            <DialogContent>
              <form onSubmit={handleSendInvite}>
                <DialogHeader>
                  <DialogTitle>Send Invitation</DialogTitle>
                  <DialogDescription>
                    Invite someone to join the academy fee register.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="email@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-role">Role</Label>
                    <Select
                      value={inviteRole}
                      onValueChange={(v) => v && setInviteRole(v)}
                    >
                      <SelectTrigger id="invite-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PARENT">Parent</SelectItem>
                        <SelectItem value="COACH">Coach</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {inviteError && (
                    <p className="text-sm text-destructive">{inviteError}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setInviteOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={inviting}>
                    {inviting ? "Sending..." : "Send Invitation"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Users section */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl tracking-wide text-foreground">
          Registered Users
        </h2>
        {users.length === 0 ? (
          <EmptyState
            icon={<Users className="h-7 w-7" />}
            title="No users found"
          />
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Phone</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="text-right font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const rbv = roleBadgeVariant(user.role);
                  return (
                    <TableRow
                      key={user.id}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.phone}
                      </TableCell>
                      <TableCell>
                        <Badge variant={rbv.variant} className={rbv.class}>
                          {user.role === "ADMIN" ? (
                            <ShieldAlert className="mr-1 h-3 w-3" />
                          ) : user.role === "COACH" ? (
                            <UserCog className="mr-1 h-3 w-3" />
                          ) : (
                            <Users className="mr-1 h-3 w-3" />
                          )}
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {user.role !== "ADMIN" && (
                          <Dialog
                            open={promoteId === user.id}
                            onOpenChange={(open) => {
                              if (!open) setPromoteId(null);
                            }}
                          >
                            <DialogTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 text-xs"
                                  onClick={() => {
                                    setPromoteId(user.id);
                                    setPromoteName(user.name);
                                  }}
                                >
                                  <Shield className="h-3.5 w-3.5" />
                                  Promote
                                </Button>
                              }
                            />
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Promote to Admin</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to promote{" "}
                                  <strong>{promoteName}</strong> to
                                  Administrator? They will gain full access to
                                  manage the system.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setPromoteId(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handlePromote(user.id)}
                                  disabled={promoting}
                                >
                                  {promoting
                                    ? "Promoting..."
                                    : "Promote to Admin"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Invites section */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl tracking-wide text-foreground">
          Pending Invitations
        </h2>
        {invites.filter((inv) => inv.status === "PENDING").length === 0 ? (
          <EmptyState
            icon={<Mail className="h-7 w-7" />}
            title="No pending invitations"
            description="Send an invite to get started."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Expires</TableHead>
                  <TableHead className="text-right font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites
                  .filter((inv) => inv.status === "PENDING")
                  .map((invite) => {
                    const sb = inviteStatusBadge(invite.status);
                    return (
                      <TableRow
                        key={invite.id}
                        className="transition-colors hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          {invite.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{invite.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={sb.variant} className={sb.class}>
                            {sb.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(invite.expiresAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 text-xs text-destructive hover:text-destructive"
                            onClick={() => handleRevokeInvite(invite.id)}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Revoke
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* All invites history */}
        {invites.filter((inv) => inv.status !== "PENDING").length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              Show invitation history
            </summary>
            <div className="mt-4 overflow-hidden rounded-xl border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites
                    .filter((inv) => inv.status !== "PENDING")
                    .map((invite) => {
                      const sb = inviteStatusBadge(invite.status);
                      return (
                        <TableRow
                          key={invite.id}
                          className="transition-colors hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            {invite.email}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{invite.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={sb.variant} className={sb.class}>
                              {sb.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(invite.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </details>
        )}
      </section>
    </div>
  );
}
