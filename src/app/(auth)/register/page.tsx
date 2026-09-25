import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Container } from "@/shared/ui";
import { RegisterForm } from "@/features/auth";
import { ROUTES } from "@/shared/config/routes";
import { buildMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sign up",
  description: "Create your Ariz account.",
  path: ROUTES.register,
});

export default function RegisterPage() {
  return (
    <Container className="flex flex-1 items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <p className="mt-4 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href={ROUTES.login} className="font-medium text-brand">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}