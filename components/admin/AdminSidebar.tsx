"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/admin", icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0" /> },
  { label: "Users", href: "/admin/users", icon: <Users className="h-5 w-5 flex-shrink-0" /> },
  { label: "Tasks", href: "/admin/tasks", icon: <ClipboardList className="h-5 w-5 flex-shrink-0" /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody
        className={cn(
          "sticky top-0 z-30 h-screen border-r border-gray-800 bg-gray-950"
        )}
      >
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Admin branding */}
          <Link href="/admin" className="flex items-center gap-2.5 py-1 mb-6">
            <div className="w-7 h-7 rounded-lg bg-green-950 border border-green-800 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-green-400" />
            </div>
            <motion.span
              animate={{
                display: open ? "inline-block" : "none",
                opacity: open ? 1 : 0,
              }}
              className="whitespace-pre"
            >
              <span className="text-sm font-semibold text-white">Admin</span>
              <span className="block text-xs text-gray-500">Dashboard</span>
            </motion.span>
          </Link>

          {/* Nav links */}
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <SidebarLink
                  key={item.href}
                  link={item}
                  className={cn(
                    "rounded-lg px-2 py-2 transition-colors",
                    isActive
                      ? "bg-green-950/50 text-green-400"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 pt-4 mt-4">
          <motion.p
            animate={{
              display: open ? "block" : "none",
              opacity: open ? 1 : 0,
            }}
            className="text-xs text-gray-600 whitespace-pre"
          >
            GreenGrow CCT Admin
          </motion.p>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
