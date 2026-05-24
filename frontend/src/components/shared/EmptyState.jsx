import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-background/70 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Inbox className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {actionLabel ? (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

