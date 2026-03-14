import { createClient } from "@/lib/supabase/server";
import { HomeNav } from "@/components/home/home-nav";
import { ContentContainer } from "@/components/shared/content-container";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ContentContainer variant="wide" className="flex items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight">
            App
          </Link>
          <HomeNav user={user} />
        </ContentContainer>
      </header>
      <main className="flex-1 py-10">
        <ContentContainer variant="narrow">
          {user ? (
            <div className="space-y-6">
              <p className="font-display text-2xl font-semibold text-foreground">
                Welcome back
              </p>
              <p className="text-muted-foreground">
                Use the sidebar or the button above to open your dashboard and manage your items.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
              >
                Open Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="font-display text-2xl font-semibold text-foreground">
                Welcome
              </p>
              <p className="text-muted-foreground">
                Sign in or create an account to access the dashboard.
              </p>
            </div>
          )}
        </ContentContainer>
      </main>
    </div>
  );
}
