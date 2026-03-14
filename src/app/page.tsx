import { createClient } from "@/lib/supabase/server";
import { HomeNav } from "@/components/home/home-nav";
import { ContentContainer } from "@/components/shared/content-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  ArrowRight,
  FileCheck2,
  Flag,
  Hospital,
  ShieldAlert,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const platformCapabilities = [
  {
    title: "Study Governance",
    description: "Manage protocol, endpoints, amendments, and cross-functional ownership with full traceability.",
    icon: Activity,
  },
  {
    title: "Site Operations",
    description: "Track site activation, status transitions, enrollment targets, and staffing permissions per site.",
    icon: Hospital,
  },
  {
    title: "Subject Lifecycle",
    description: "Enroll, assign, and monitor each subject with clear accountability and timeline visibility.",
    icon: UsersRound,
  },
  {
    title: "Monitoring & Deviations",
    description: "Schedule monitoring visits, capture outcomes, and close deviations with compliant workflows.",
    icon: ShieldAlert,
  },
  {
    title: "Document & Signatures",
    description: "Upload controlled documents, approve with signatures, and maintain versioned metadata.",
    icon: FileCheck2,
  },
  {
    title: "Milestone Delivery",
    description: "Track critical milestones, timeline variance, and portfolio readiness from one command center.",
    icon: Flag,
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Set Up Study Framework",
    description: "Define protocol and design entities, then establish timelines and operational baselines.",
  },
  {
    step: "02",
    title: "Activate Sites & Enroll Subjects",
    description: "Launch sites quickly with role-based permissions and enroll subjects into the right cohorts.",
  },
  {
    step: "03",
    title: "Run Monitoring & Compliance",
    description: "Coordinate CRA workflows, resolve deviations, and enforce signed approvals.",
  },
  {
    step: "04",
    title: "Track Milestones & Portfolio Health",
    description: "Review study-level performance with live operational metrics and audit-ready activity.",
  },
];

const mediaHighlights = [
  { title: "Study Command Center", image: "/home/analytics.jpg" },
  { title: "Site Oversight", image: "/home/site-operations.jpg" },
  { title: "Subject Screening", image: "/home/subject-care.jpg" },
  { title: "Monitoring Visits", image: "/home/monitoring.jpg" },
];

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
            TrialFlow CTMS
          </Link>
          <HomeNav user={user} />
        </ContentContainer>
      </header>
      <main className="relative flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-[radial-gradient(circle_at_top,_var(--color-primary)_0%,_transparent_65%)] opacity-15" />
        <div className="pointer-events-none absolute right-[-20%] top-[20%] h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

        <ContentContainer variant="wide" className="relative py-10 md:py-14">
          <section className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit">
                Unified Clinical Trial Execution Platform
              </Badge>
              <div className="space-y-4">
                <h1 className="font-display text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                  Run your studies with operational clarity from protocol to close-out.
                </h1>
                <p className="max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
                  TrialFlow CTMS brings study design, site operations, enrollment, monitoring,
                  deviations, documents, signatures, and milestones into one role-aware workspace.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {user ? (
                  <Button
                    size="lg"
                    render={<Link href="/dashboard">Open Dashboard</Link>}
                    nativeButton={false}
                    icon={<ArrowRight />}
                    iconPosition="end"
                  />
                ) : (
                  <>
                    <Button
                      size="lg"
                      render={<Link href="/auth/sign-up">Start Free Workspace</Link>}
                      nativeButton={false}
                      icon={<ArrowRight />}
                      iconPosition="end"
                    />
                    <Button
                      size="lg"
                      variant="outline"
                      render={<Link href="/auth/sign-in">Sign In</Link>}
                      nativeButton={false}
                    />
                  </>
                )}
              </div>

              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                <p className="rounded-lg border border-border/80 bg-card/60 px-3 py-2">Role-based access control</p>
                <p className="rounded-lg border border-border/80 bg-card/60 px-3 py-2">
                  Signed approvals + audit trails
                </p>
                <p className="rounded-lg border border-border/80 bg-card/60 px-3 py-2">
                  Study, site, and subject visibility
                </p>
              </div>
            </div>

            <Card className="border-border/80 bg-card/80 backdrop-blur">
              <Image
                src="/home/hero-clinical.jpg"
                alt="Trial operations architecture and workflow overview"
                className="h-60 w-full object-cover md:h-72"
                width={1800}
                height={900}
                priority
              />
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-semibold text-foreground">Portfolio Command View</p>
                    <p className="text-sm text-muted-foreground">
                      Monitor execution risks and delivery progress with one operational picture.
                    </p>
                  </div>
                  <Badge variant="outline">CTMS</Badge>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="mt-12 space-y-5 md:mt-16">
            <div className="space-y-2">
              <p className="text-sm font-medium tracking-wide text-primary uppercase">Platform Capabilities</p>
              <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
                Everything your study teams need, connected by design.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {platformCapabilities.map((capability) => {
                const Icon = capability.icon;
                return (
                  <Card key={capability.title} className="h-full border-border/80 bg-card/70">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="rounded-md border border-border/80 bg-background p-1.5">
                          <Icon className="size-4 text-primary" />
                        </span>
                        {capability.title}
                      </CardTitle>
                      <CardDescription>{capability.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </section>

          <section className="mt-12 md:mt-16">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
              <Card className="border-border/80 bg-card/70">
                <CardHeader>
                  <CardTitle className="font-display text-xl md:text-2xl">
                    Purpose-built workflow for modern clinical operations
                  </CardTitle>
                  <CardDescription>
                    Structured progression from study setup through milestone delivery.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {workflowSteps.map((item, index) => (
                    <div key={item.step} className="space-y-3">
                      <div className="flex gap-3">
                        <Badge variant="outline" className="min-w-10 justify-center font-mono">
                          {item.step}
                        </Badge>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      {index < workflowSteps.length - 1 ? <Separator /> : null}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                {mediaHighlights.map((media) => (
                  <Card key={media.title} className="border-border/80 bg-card/70">
                    <Image
                      src={media.image}
                      alt={media.title}
                      className="h-36 w-full object-cover sm:h-40"
                      width={1200}
                      height={800}
                    />
                    <CardContent className="pt-3">
                      <p className="text-sm font-medium text-foreground">{media.title}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border/80 bg-card/80 p-6 md:mt-16 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <Badge variant="secondary" className="w-fit">
                  Ready to Launch
                </Badge>
                <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
                  Build a consistent, audit-ready execution rhythm across every study.
                </h2>
                <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                  Centralize teams, reduce operational blind spots, and maintain control as trial
                  complexity grows.
                </p>
              </div>
              {user ? (
                <Button
                  size="lg"
                  render={<Link href="/dashboard">Go to Dashboard</Link>}
                  nativeButton={false}
                />
              ) : (
                <Button
                  size="lg"
                  render={<Link href="/auth/sign-up">Create Your Account</Link>}
                  nativeButton={false}
                />
              )}
            </div>
          </section>
        </ContentContainer>
      </main>
    </div>
  );
}
