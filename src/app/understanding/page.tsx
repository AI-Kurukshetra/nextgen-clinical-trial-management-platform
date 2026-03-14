import { createClient } from "@/lib/supabase/server";
import { HomeNav } from "@/components/home/home-nav";
import { ContentContainer } from "@/components/shared/content-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const phaseOneCompleted = [
  "Study lifecycle foundation: studies, protocol/design entities, and role-aware dashboards",
  "Operational execution modules: sites, subjects, monitoring visits, deviations, and milestones",
  "Compliance workflows: document metadata, S3/MinIO upload flow, audit logs, and electronic signatures",
  "Access controls: scoped ownership model, team/site permissions, and subject assignment controls",
  "Patient workflow base: no-code form templates, assignment, submission, and portal access",
];

const futureProspects = [
  "Advanced financial and startup operations (budget controls, startup timelines, portfolio-level readiness)",
  "Cross-system integrations (EDC, eTMF, and supply-chain coordination)",
  "Regulatory automation and stronger risk/compliance monitoring",
  "AI-assisted enrollment forecasting, site selection intelligence, and predictive operations",
  "Mobile-first field execution with offline-friendly workflows",
];

const operatingFlow = [
  {
    title: "Study Setup",
    description: "Create study records, define protocol/design structure, assign ownership, and establish access scope.",
  },
  {
    title: "Site & Subject Operations",
    description: "Activate sites, manage teams and permissions, enroll subjects, and maintain subject-level accountability.",
  },
  {
    title: "Oversight & Compliance",
    description: "Run monitoring/deviation workflows, manage controlled documents, and capture signed approvals.",
  },
  {
    title: "Delivery & Portfolio Control",
    description: "Track milestones, review activity logs, and monitor execution health across studies.",
  },
];

export default async function UnderstandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ContentContainer variant="wide" className="flex items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight">
            TrialFlow CTMS
          </Link>
          <HomeNav user={user} />
        </ContentContainer>
      </header>

      <main className="flex-1 py-10 md:py-14">
        <ContentContainer variant="wide" className="space-y-8">
          <section className="space-y-4">
            <Badge variant="secondary" className="w-fit">
              Understanding TrialFlow
            </Badge>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              What this app does, how it works, and where it is going next.
            </h1>
            <p className="max-w-4xl text-base text-muted-foreground md:text-lg">
              TrialFlow CTMS is a role-aware clinical operations workspace built on Next.js + Supabase.
              It centralizes study setup, site execution, subject lifecycle, compliance workflows, and
              delivery tracking into one connected operating system.
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/80 bg-card/70">
              <CardHeader>
                <CardTitle>How This App Works</CardTitle>
                <CardDescription>Operational flow from setup to close-out.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {operatingFlow.map((item, index) => (
                  <div key={item.title} className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    {index < operatingFlow.length - 1 ? <Separator /> : null}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card/70">
              <CardHeader>
                <CardTitle>Phase 1 Completed</CardTitle>
                <CardDescription>What is already delivered in the current platform baseline.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {phaseOneCompleted.map((item) => (
                  <p key={item} className="text-sm text-muted-foreground">
                    - {item}
                  </p>
                ))}
              </CardContent>
            </Card>
          </section>

          <section>
            <Card className="border-border/80 bg-card/70">
              <CardHeader>
                <CardTitle>Future Prospects</CardTitle>
                <CardDescription>Planned expansion areas after the Phase 1 foundation.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 md:grid-cols-2">
                {futureProspects.map((item) => (
                  <p key={item} className="text-sm text-muted-foreground">
                    - {item}
                  </p>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="rounded-2xl border border-border/80 bg-card/80 p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  Explore The Product
                </Badge>
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  Use this context page as your product briefing entry point.
                </h2>
                <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                  Share this page with stakeholders for a concise view of scope, architecture intent, and roadmap direction.
                </p>
              </div>
              {user ? (
                <Button
                  size="lg"
                  render={<Link href="/dashboard">Open Dashboard</Link>}
                  nativeButton={false}
                  icon={<ArrowRight />}
                  iconPosition="end"
                />
              ) : (
                <Button
                  size="lg"
                  render={<Link href="/auth/sign-up">Create Workspace</Link>}
                  nativeButton={false}
                  icon={<ArrowRight />}
                  iconPosition="end"
                />
              )}
            </div>
          </section>
        </ContentContainer>
      </main>
    </div>
  );
}
