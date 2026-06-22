import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Invite Only</CardTitle>
        <CardDescription>
          Registration is currently invite-only. Please contact the academy
          administrator to create your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/login">
          <Button className="w-full">Back to Sign In</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
