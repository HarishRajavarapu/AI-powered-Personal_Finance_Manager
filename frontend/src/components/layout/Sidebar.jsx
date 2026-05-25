import {
  BarChart3,
  Bot,
  Gauge,
  PiggyBank,
  ReceiptText,
  UserRound,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import Logo from "@/components/shared/Logo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Gauge },
  { name: "Transactions", href: "/transactions", icon: ReceiptText },
  { name: "Budgets", href: "/budgets", icon: PiggyBank },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "AI Insights", href: "/insights", icon: Bot },
  { name: "Profile", href: "/profile", icon: UserRound },
];

export function SidebarContent({ onNavigate }) {
  return (
    <div className="flex h-full flex-col gap-6">
      <Logo />
      <nav className="grid gap-1">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.name}</span>
              {item.name === "AI Insights" ? (
                <Badge variant="success" className="ml-auto">
                  Free
                </Badge>
              ) : null}
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-auto rounded-lg border bg-background/80 p-4">
        <p className="text-sm font-medium">Monthly goal</p>
        <p className="mt-1 text-xs text-muted-foreground">Savings tracker ready for budget data.</p>
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r bg-background/80 p-5 backdrop-blur-xl lg:block">
      <SidebarContent />
    </aside>
  );
}
