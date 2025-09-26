import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Glowskill Dashboard Workspace</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Explore the 24-month plan, revenue projections, and qualitative prospectus for Glowskill.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/prospectus">
          Open Prospectus Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </main>
  );
}
