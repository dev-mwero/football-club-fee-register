import { Eye, Pencil, Plus, Users } from "lucide-react";
import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Player } from "@/models/Player";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const session = await getSession();
  await connectDB();

  const filter = session?.role === "PARENT" ? { parent: session.userId } : {};
  const players = await Player.find(filter)
    .populate("parent", "name phone email")
    .sort({ createdAt: -1 });

  const isAdmin = session?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? "Players" : "My Children"}
        description={
          isAdmin
            ? "Manage academy players and their fee status"
            : "View your registered children"
        }
        action={
          isAdmin ? (
            <Link href="/dashboard/players/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Player
              </Button>
            </Link>
          ) : undefined
        }
      />

      {players.length === 0 ? (
        <EmptyState
          icon={<Users className="h-7 w-7" />}
          title="No players found"
          description="No players have been registered yet."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Parent</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => {
                const parent = player.parent as unknown as {
                  name: string;
                  phone: string;
                  email: string;
                } | null;

                return (
                  <TableRow
                    key={player._id.toString()}
                    className="group cursor-pointer transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {player.fullName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {player.teamCategory}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {parent?.name ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {parent?.phone ?? "\u2014"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          player.status === "ACTIVE"
                            ? "default"
                            : player.status === "INACTIVE"
                              ? "secondary"
                              : "outline"
                        }
                        className={
                          player.status === "ACTIVE"
                            ? "bg-primary/15 text-primary hover:bg-primary/15"
                            : ""
                        }
                      >
                        {player.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/dashboard/players/${player._id.toString()}`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {isAdmin && (
                          <Link
                            href={`/dashboard/players/${player._id.toString()}`}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
