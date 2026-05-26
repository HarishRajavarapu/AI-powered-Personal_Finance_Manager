import { ArrowRight, BarChart3, Bot, CheckCircle2, LockKeyhole, ReceiptText, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

const highlights = [
  { label: "Track every rupee", icon: ReceiptText },
  { label: "Read cash flow clearly", icon: BarChart3 },
  { label: "Budget with confidence", icon: CheckCircle2 },
  { label: "Ask AI for insights", icon: Bot },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <WalletCards className="h-5 w-5" />
            </span>
            <span className="truncate text-sm font-semibold">F!NO</span>
          </Link>
          <nav className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/signup">
                Start
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative isolate flex min-h-[78svh] items-center overflow-hidden">
        <img
          src="/landing-dashboard.png"
          alt="F!NO dashboard showing balances, budget progress, and recent transactions"
          className="absolute inset-0 h-full w-full object-cover object-left-top"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/88 to-slate-950/42 sm:to-slate-950/28" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
        <div className="relative mx-auto flex w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="w-full max-w-[calc(100vw-2rem)] text-white sm:max-w-2xl">
            <p className="text-sm font-medium text-cyan-200">Financial operations, finally clear</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl lg:text-6xl">
              F!NO
            </h1>
            <p className="mt-5 max-w-full text-base leading-7 text-slate-100 sm:max-w-xl sm:text-lg">
              A modern Financial Operator for expenses, budgets, savings, analytics, and AI-powered spending insights.
            </p>
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/signup">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-white/40 bg-white/10 text-white hover:bg-white/18 hover:text-white sm:w-auto"
              >
                <Link to="/dashboard">
                  Open dashboard
                  <LockKeyhole className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-3 px-4 pb-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {highlights.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary/12 text-secondary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          );
        })}
      </section>
    </main>
  );
}
