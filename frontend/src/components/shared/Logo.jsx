import { WalletCards } from "lucide-react";
import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <WalletCards className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold leading-5">AI Finance</span>
        <span className="block truncate text-xs text-muted-foreground">Personal manager</span>
      </span>
    </Link>
  );
}

