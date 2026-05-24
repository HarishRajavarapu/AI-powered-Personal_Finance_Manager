import { Edit, Trash2, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import BudgetForm from "@/components/forms/BudgetForm";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  createBudget,
  deleteBudget,
  getBudgets,
  updateBudget,
} from "@/services/finance-service";
import { currencyFormatter } from "@/utils/constants";
import { currentMonthInputValue } from "@/utils/date";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [month, setMonth] = useState(currentMonthInputValue());
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadBudgets(nextMonth = month) {
    setLoading(true);
    try {
      const data = await getBudgets({ month: nextMonth });
      setBudgets(data.budgets);
    } catch (error) {
      toast.error(error.message || "Unable to load budgets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadInitialBudgets() {
      setLoading(true);
      try {
        const data = await getBudgets({ month: currentMonthInputValue() });
        if (active) setBudgets(data.budgets);
      } catch (error) {
        toast.error(error.message || "Unable to load budgets.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadInitialBudgets();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(values) {
    try {
      if (editing) {
        await updateBudget(editing.id, values);
        toast.success("Budget updated.");
      } else {
        await createBudget(values);
        toast.success("Budget created.");
      }
      setEditing(null);
      setMonth(values.month);
      await loadBudgets(values.month);
    } catch (error) {
      toast.error(error.message || "Unable to save budget.");
    }
  }

  async function handleDelete(budget) {
    try {
      await deleteBudget(budget.id);
      toast.success("Budget deleted.");
      await loadBudgets();
    } catch (error) {
      toast.error(error.message || "Unable to delete budget.");
    }
  }

  return (
    <section className="page-shell">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="secondary">Budget alerts</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal sm:text-3xl">Budgets</h1>
          <p className="mt-2 text-sm text-muted-foreground">Monthly and category spending plans.</p>
        </div>
        <div className="flex items-end gap-2">
          <div className="space-y-2">
            <Label htmlFor="budget-month">Month</Label>
            <Input
              id="budget-month"
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </div>
          <Button onClick={() => loadBudgets(month)}>Load</Button>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{editing ? "Edit budget" : "Create budget"}</CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetForm
            initialValues={editing}
            onCancel={() => setEditing(null)}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      {loading ? (
        <LoadingState />
      ) : budgets.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {budgets.map((budget) => (
            <Card key={budget.id} className="glass-card">
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>{budget.category}</CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">{budget.month}</p>
                </div>
                {budget.is_over_budget ? (
                  <Badge variant="destructive">
                    <TriangleAlert className="mr-1 h-3 w-3" />
                    Over
                  </Badge>
                ) : (
                  <Badge variant="success">On track</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Spent</p>
                    <p className="font-semibold">{currencyFormatter.format(budget.spent)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Limit</p>
                    <p className="font-semibold">{currencyFormatter.format(budget.limit_amount)}</p>
                  </div>
                </div>
                <Progress value={Math.min(budget.progress, 100)} />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{Math.round(budget.progress)}% used</span>
                  <span>{currencyFormatter.format(budget.remaining)} left</span>
                </div>
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="ghost" aria-label="Edit budget" onClick={() => setEditing(budget)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Delete budget" onClick={() => handleDelete(budget)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No budgets configured"
          description="Create a monthly plan to track remaining balances by category."
        />
      )}
    </section>
  );
}
