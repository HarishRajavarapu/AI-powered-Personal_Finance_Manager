import { Download, Edit, FileText, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import TransactionForm from "@/components/forms/TransactionForm";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectInput } from "@/components/ui/select";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "@/services/finance-service";
import { currencyFormatter, transactionCategories } from "@/utils/constants";
import { exportTransactionsCsv, exportTransactionsPdf } from "@/utils/export";

const defaultFilters = {
  search: "",
  date_from: "",
  date_to: "",
  month: "",
  category: "",
  type: "",
  amount_min: "",
  amount_max: "",
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadTransactions(nextFilters = filters) {
    setLoading(true);
    try {
      const data = await getTransactions(nextFilters);
      setTransactions(data.transactions);
    } catch (error) {
      toast.error(error.message || "Unable to load transactions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadInitialTransactions() {
      setLoading(true);
      try {
        const data = await getTransactions(defaultFilters);
        if (active) setTransactions(data.transactions);
      } catch (error) {
        toast.error(error.message || "Unable to load transactions.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadInitialTransactions();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(values) {
    try {
      if (editing) {
        await updateTransaction(editing.id, values);
        toast.success("Transaction updated.");
      } else {
        await createTransaction(values);
        toast.success("Transaction added.");
      }
      setEditing(null);
      await loadTransactions();
    } catch (error) {
      toast.error(error.message || "Unable to save transaction.");
    }
  }

  async function handleDelete(transaction) {
    try {
      await deleteTransaction(transaction.id);
      toast.success("Transaction deleted.");
      await loadTransactions();
    } catch (error) {
      toast.error(error.message || "Unable to delete transaction.");
    }
  }

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="page-shell">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="secondary">Database synced</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal sm:text-3xl">Transactions</h1>
          <p className="mt-2 text-sm text-muted-foreground">Income and expense history.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => exportTransactionsCsv(transactions)}
            disabled={!transactions.length}
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => exportTransactionsPdf(transactions)}
            disabled={!transactions.length}
          >
            <FileText className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{editing ? "Edit transaction" : "Add transaction"}</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm
            initialValues={editing}
            onCancel={() => setEditing(null)}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="space-y-2 xl:col-span-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                className="pl-9"
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Input
              id="month"
              type="month"
              value={filters.month}
              onChange={(event) => updateFilter("month", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-from">From</Label>
            <Input
              id="date-from"
              type="date"
              value={filters.date_from}
              onChange={(event) => updateFilter("date_from", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-to">To</Label>
            <Input
              id="date-to"
              type="date"
              value={filters.date_to}
              onChange={(event) => updateFilter("date_to", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <SelectInput
              id="category"
              value={filters.category}
              onChange={(event) => updateFilter("category", event.target.value)}
            >
              <option value="">All</option>
              {transactionCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </SelectInput>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <SelectInput
              id="type"
              value={filters.type}
              onChange={(event) => updateFilter("type", event.target.value)}
            >
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </SelectInput>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount-min">Min</Label>
            <Input
              id="amount-min"
              min="0"
              step="0.01"
              type="number"
              value={filters.amount_min}
              onChange={(event) => updateFilter("amount_min", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount-max">Max</Label>
            <Input
              id="amount-max"
              min="0"
              step="0.01"
              type="number"
              value={filters.amount_max}
              onChange={(event) => updateFilter("amount_max", event.target.value)}
            />
          </div>
          <div className="flex items-end gap-2 xl:col-span-2">
            <Button className="w-full" onClick={() => loadTransactions(filters)}>
              Apply
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFilters(defaultFilters);
                loadTransactions(defaultFilters);
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingState />
      ) : transactions.length ? (
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{transaction.title}</td>
                      <td className="px-4 py-3">{transaction.category}</td>
                      <td className="px-4 py-3 capitalize">{transaction.type}</td>
                      <td className="px-4 py-3">
                        {new Date(transaction.date).toLocaleDateString("en-IN")}
                      </td>
                      <td
                        className={
                          transaction.type === "income"
                            ? "px-4 py-3 text-right font-semibold text-success"
                            : "px-4 py-3 text-right font-semibold"
                        }
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {currencyFormatter.format(transaction.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Edit transaction"
                            onClick={() => setEditing(transaction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Delete transaction"
                            onClick={() => handleDelete(transaction)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No transactions found"
          description="Add your first income or expense record to start building a history."
        />
      )}
    </section>
  );
}
