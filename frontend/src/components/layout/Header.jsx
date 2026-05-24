import { LogOut, Menu, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { SidebarContent } from "@/components/layout/Sidebar";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/auth-context";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.success("Logged out.");
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent className="p-5">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="relative hidden w-full max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search transactions, budgets, insights" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link to="/transactions">
              <Plus className="h-4 w-4" />
              Add transaction
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Log out" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
          <Avatar className="h-10 w-10 border">
            <AvatarFallback className="text-sm font-semibold">
              {initials(user?.name) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
