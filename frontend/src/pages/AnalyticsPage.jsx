import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalyticsCharts } from "@/services/finance-service";

const chartColors = ["#4F46E5", "#06B6D4", "#10B981", "#64748B", "#F59E0B", "#EF4444"];
const emptyCharts = {
  category_spending: [],
  income_vs_expenses: [],
  spending_trend: [],
  savings_growth: [],
};

export default function AnalyticsPage() {
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCharts() {
      try {
        const data = await getAnalyticsCharts();
        if (active) setCharts(data);
      } catch (error) {
        toast.error(error.message || "Unable to load analytics.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCharts();
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

  const safeCharts = charts || emptyCharts;
  const hasData =
    safeCharts.category_spending.length ||
    safeCharts.income_vs_expenses.some((point) => point.income || point.expenses);

  return (
    <section className="page-shell">
      <div>
        <Badge variant="secondary">Live charts</Badge>
        <h1 className="mt-3 text-2xl font-semibold tracking-normal sm:text-3xl">Analytics</h1>
        <p className="mt-2 text-sm text-muted-foreground">Charts for spending, savings, and cash flow.</p>
      </div>

      {!hasData ? (
        <EmptyState
          title="Analytics need transactions"
          description="Charts are generated after transaction data is available."
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Category spending</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Tooltip />
                <Pie
                  data={safeCharts.category_spending}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={64}
                  outerRadius={110}
                  paddingAngle={3}
                >
                  {safeCharts.category_spending.map((entry, index) => (
                    <Cell key={entry.category} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Income vs expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={safeCharts.income_vs_expenses} margin={{ left: -18, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.12} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip />
                <Bar dataKey="income" fill="#06B6D4" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Monthly spending trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={safeCharts.spending_trend} margin={{ left: -18, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.12} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip />
                <Line type="monotone" dataKey="expenses" stroke="#4F46E5" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Savings growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={safeCharts.savings_growth} margin={{ left: -18, right: 8 }}>
                <defs>
                  <linearGradient id="analyticsSavings" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.12} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="savings"
                  stroke="#10B981"
                  strokeWidth={3}
                  fill="url(#analyticsSavings)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
