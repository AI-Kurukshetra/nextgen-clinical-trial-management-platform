import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string; message?: string }>;
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
            Sign in
          </h1>
          <p className="text-muted-foreground text-sm">
            Use your email or a provider to continue
          </p>
        </div>
        <AuthForm
          mode="sign-in"
          redirectTo={params.redirectTo}
          error={params.error}
          message={params.message}
        />
        <p className="text-center text-muted-foreground text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
