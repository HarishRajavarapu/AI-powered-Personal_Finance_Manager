import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, PiggyBank, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { MonthlyOverviewChart, SavingsTrendChart } from "@/components/charts/PreviewChart";
import SummaryCard from "@/components/dashboard/SummaryCard";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getDashboard } from "@/services/finance-service";
import { currencyFormatter } from "@/utils/constants";

const emptyDashboard = {
  summary: {
    total_balance: 0,
    total_income: 0,
    total_expenses: 0,
    savings: 0,
  },
  monthly_overview: [],
  recent_transactions: [],
  budget_progress: [],
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const data = await getDashboard();
        if (active) setDashboard(data);
      } catch (error) {
        toast.error(error.message || "Unable to load dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="page-shell">
        <LoadingState />
      </section>
    );
  }

  const { summary } = dashboard;
  const hasActivity =
    dashboard.recent_transactions.length > 0 ||
    summary.total_income > 0 ||
    summary.total_expenses > 0;

  return (
    <section className="page-shell">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="secondary">Live overview</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal sm:text-3xl">
            F!NO dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Track cash flow, budgets, and savings with calm daily clarity.
          </p>
        </div>
      </div>

      {!hasActivity ? (
        <EmptyState
          title="Your dashboard is ready"
          description="Add a transaction to see balances, charts, and budget progress update from the database."
          actionLabel="Go to transactions"
          onAction={() => navigate("/transactions")}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total balance"
          value={currencyFormatter.format(summary.total_balance)}
          helper="Income minus expenses"
          icon={Wallet}
          tone="primary"
        />
        <SummaryCard
          title="This month income"
          value={currencyFormatter.format(summary.total_income)}
          helper="Current month total"
          icon={ArrowUpRight}
          tone="secondary"
        />
        <SummaryCard
          title="This month expenses"
          value={currencyFormatter.format(summary.total_expenses)}
          helper="Current month total"
          icon={ArrowDownLeft}
          tone="muted"
        />
        <SummaryCard
          title="Savings"
          value={currencyFormatter.format(summary.savings)}
          helper="Current month difference"
          icon={PiggyBank}
          tone={summary.savings >= 0 ? "success" : "muted"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Monthly overview</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyOverviewChart data={dashboard.monthly_overview} />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Budget progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {dashboard.budget_progress.length ? (
              dashboard.budget_progress.map((budget) => (
                <div key={budget.id}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium">{budget.category}</span>
                    <span className="text-muted-foreground">{Math.round(budget.progress)}%</span>
                  </div>
                  <Progress value={Math.min(budget.progress, 100)} />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No budgets for this month yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard.recent_transactions.length ? (
              <div className="space-y-4">
                {dashboard.recent_transactions.map((transaction, index) => (
                  <div key={transaction.id}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{transaction.title}</p>
                        <p className="text-xs text-muted-foreground">{transaction.category}</p>
                      </div>
                      <span
                        className={
                          transaction.type === "income"
                            ? "text-sm font-semibold text-success"
                            : "text-sm font-semibold text-foreground"
                        }
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {currencyFormatter.format(transaction.amount)}
                      </span>
                    </div>
                    {index < dashboard.recent_transactions.length - 1 ? (
                      <Separator className="mt-4" />
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No transactions yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Savings growth</CardTitle>
          </CardHeader>
          <CardContent>
            <SavingsTrendChart data={dashboard.monthly_overview} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
