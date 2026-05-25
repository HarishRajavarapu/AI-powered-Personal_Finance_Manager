import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/cn";

export default function SummaryCard({ title, value, helper, icon: Icon, tone = "primary" }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/12 text-secondary",
    success: "bg-success/12 text-success",
    muted: "bg-muted text-foreground",
  };

  return (
    <div>
      <Card className="glass-card">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="mt-3 truncate text-2xl font-semibold tracking-normal">{value}</p>
            </div>
            <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", tones[tone])}>
              <Icon className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{helper}</p>
        </CardContent>
      </Card>
    </div>
  );
}
