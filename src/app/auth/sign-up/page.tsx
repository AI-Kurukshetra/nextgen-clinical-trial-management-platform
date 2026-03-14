import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="absolute right-4 top-4 md:right-6 md:top-6">
        <ThemeSwitcher />
      </div>
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-1 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter your details to get started
          </p>
        </div>
        <AuthForm
          mode="sign-up"
          error={params.error}
          message={params.message}
        />
        <p className="text-center text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
