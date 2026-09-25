import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Container } from "@/shared/ui";
import { LoginForm } from "@/features/auth";
import { ROUTES } from "@/shared/config/routes";
import { buildMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sign in",
  description: "Access your Ariz account.",
  path: ROUTES.login,
});

export default function LoginPage() {
  return (
    <Container className="flex flex-1 items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="mt-4 text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link href={ROUTES.register} className="font-medium text-brand">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}