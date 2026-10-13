import type { LucideIcon } from "lucide-react";
import { Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { NavLink } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { LogoMark } from "./logo";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

function AdminNav({ groups, onNavigate }: { groups: AdminNavGroup[]; onNavigate?: () => void }) {
  return (
    <nav aria-label="Admin" className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="px-3 text-eyebrow text-forest-200">{group.label}</p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map(({ label, href, icon: Icon, end }) => (
              <li key={href}>
                <NavLink
                  to={href}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-forest-200 transition-colors hover:bg-white/10 hover:text-white",
                      isActive && "bg-white/10 text-white",
                    )
                  }
                >
                  <Icon aria-hidden="true" className="size-[1.125rem]" strokeWidth={1.75} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarBrand() {
  return (
    <div className="flex items-center gap-2.5 px-3">
      <LogoMark className="size-9" />
      <span className="flex flex-col leading-tight">
        <span className="font-extrabold text-white">PoultryHub</span>
        <span className="text-xs font-semibold text-gold-400">Admin</span>
      </span>
    </div>
  );
}

/** Admin chrome: fixed sidebar on desktop, sheet on mobile (DESIGN_SYSTEM.md §9.5). */
export function AdminShell({
  groups,
  topbar,
  children,
}: {
  groups: AdminNavGroup[];
  topbar?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-cream-50 lg:grid lg:grid-cols-[16rem_1fr]">
      <aside
        data-surface="dark"
        className="hidden bg-forest-950 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:gap-8 lg:overflow-y-auto lg:px-3 lg:py-6"
      >
        <SidebarBrand />
        <AdminNav groups={groups} />
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white px-4 sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open admin menu"
              >
                <Menu aria-hidden="true" className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              data-surface="dark"
              side="left"
              className="w-72 gap-0 border-none bg-forest-950 p-0 text-forest-200"
            >
              <SheetHeader className="px-3 py-5">
                <SheetTitle asChild>
                  <div>
                    <SidebarBrand />
                  </div>
                </SheetTitle>
                <SheetDescription className="sr-only">Admin navigation</SheetDescription>
              </SheetHeader>
              <div className="overflow-y-auto px-3 pb-6">
                <AdminNav groups={groups} onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <div className="min-w-0 flex-1">{topbar}</div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
