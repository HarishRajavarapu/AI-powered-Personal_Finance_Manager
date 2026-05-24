import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card w-full max-w-md rounded-lg p-8 text-center">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-normal">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you requested does not exist.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Return to dashboard</Link>
        </Button>
      </div>
    </main>
  );
}

