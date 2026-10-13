import {
  BarChart3,
  Boxes,
  CreditCard,
  FileText,
  FolderTree,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Newspaper,
  Package,
  ScrollText,
  Settings,
  ShoppingCart,
  TicketPercent,
  Truck,
  Users,
} from "lucide-react";
import { Link, Outlet } from "react-router";

import { AdminShell, type AdminNavGroup } from "@/components/layout/admin-shell";

// Admin modules (REQUIREMENTS.md §4.8). Access control arrives with Phase 5; every admin read and
// write is also enforced in the database, never only by this UI (ARCHITECTURE.md §6.2).
const groups: AdminNavGroup[] = [
  {
    label: "Operations",
    items: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard, end: true },
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
      { label: "Inventory", href: "/admin/inventory", icon: Boxes },
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Messages", href: "/admin/messages", icon: MessageSquare },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Categories", href: "/admin/categories", icon: FolderTree },
      { label: "Promotions", href: "/admin/promotions", icon: TicketPercent },
      { label: "Delivery", href: "/admin/delivery", icon: Truck },
    ],
  },
  {
    label: "Website",
    items: [
      { label: "Content", href: "/admin/content", icon: Megaphone },
      { label: "Blog", href: "/admin/blog", icon: Newspaper },
      { label: "Pages", href: "/admin/content/pages", icon: FileText },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "Reports", href: "/admin/reports", icon: BarChart3 },
      { label: "Settings", href: "/admin/settings", icon: Settings },
      { label: "Audit log", href: "/admin/audit-log", icon: ScrollText },
    ],
  },
];

export default function AdminLayout() {
  return (
    <AdminShell
      groups={groups}
      topbar={
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold text-ink-700">PoultryHub admin</p>
          <Link to="/" className="text-sm font-semibold text-forest-700 hover:underline">
            View site
          </Link>
        </div>
      }
    >
      <Outlet />
    </AdminShell>
  );
}
