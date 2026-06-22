import { Eye, Pencil, Plus } from "lucide-react";
import Link from "next/link";
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
import { connectDB } from "@/lib/db";
import { Player } from "@/models/Player";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  await connectDB();
  const players = await Player.find()
    .populate("parent", "name phone email")
    .sort({ createdAt: -1 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Players</h1>
          <p className="text-sm text-muted-foreground">
            Manage academy players and their fee status
          </p>
        </div>
        <Link href="/dashboard/players/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Player
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No players registered yet
                </TableCell>
              </TableRow>
            )}
            {players.map((player) => {
              const status = "ACTIVE";
              const parent = player.parent as unknown as {
                name: string;
                phone: string;
                email: string;
              } | null;

              return (
                <TableRow key={player._id.toString()}>
                  <TableCell className="font-medium">
                    {player.fullName}
                  </TableCell>
                  <TableCell>{player.teamCategory}</TableCell>
                  <TableCell>{parent?.name ?? "—"}</TableCell>
                  <TableCell>{parent?.phone ?? "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        status === "ACTIVE"
                          ? "default"
                          : status === "INACTIVE"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/players/${player._id.toString()}`}
                      >
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link
                        href={`/dashboard/players/${player._id.toString()}`}
                      >
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
