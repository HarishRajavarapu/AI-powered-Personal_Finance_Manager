import { Bot, RefreshCcw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import LoadingState from "@/components/shared/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInsights } from "@/services/finance-service";

export default function InsightsPage() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadInsights() {
    setLoading(true);
    try {
      const data = await getInsights();
      setInsights(data);
    } catch (error) {
      toast.error(error.message || "Unable to generate insights.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInsights();
  }, []);

  if (loading) {
    return (
      <section className="page-shell">
        <LoadingState />
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant={insights?.generated_with_ai ? "success" : "secondary"}>
            {insights?.generated_with_ai ? "Gemini" : "Smart fallback"}
          </Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal sm:text-3xl">AI Insights</h1>
          <p className="mt-2 text-sm text-muted-foreground">Smart summaries and savings suggestions.</p>
        </div>
        <Button onClick={loadInsights}>
          <RefreshCcw className="h-4 w-4" />
          Regenerate
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader className="flex-row items-start gap-4 space-y-0">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <CardTitle>Monthly summary</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">{insights?.summary}</p>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Savings suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(insights?.suggestions || []).map((suggestion) => (
              <div key={suggestion} className="flex gap-3 rounded-lg border bg-background/70 p-4">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <p className="text-sm">{suggestion}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Spending behavior</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(insights?.behavior || []).map((item) => (
              <div key={item} className="rounded-lg border bg-background/70 p-4 text-sm">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

