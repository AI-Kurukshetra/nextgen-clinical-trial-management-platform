import Link from "next/link";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function EmailVerifiedPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="absolute right-4 top-4 md:right-6 md:top-6">
        <ThemeSwitcher />
      </div>
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-primary" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Email verified
          </h1>
          <p className="text-muted-foreground text-sm">
            Your email has been successfully verified. You can now sign in to
            your account.
          </p>
        </div>
        <Button
          className="w-full"
          size="lg"
          render={<Link href="/auth/sign-in">Sign in to proceed</Link>}
          nativeButton={false}
        />
      </div>
    </div>
  );
}
