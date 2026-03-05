"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/sidebar";
import {
  Home,
  Phone,
  LifeBuoy,
  Mic,
  List,
  BookOpen,
  Shield,
  BarChart3,
  ShieldCheck,
  LogOut,
} from "lucide-react";

const baseNavLinks = [
  { label: "Home", href: "/", icon: <Home className="h-5 w-5 flex-shrink-0" /> },
  { label: "Practice", href: "/practice", icon: <Phone className="h-5 w-5 flex-shrink-0" /> },
  { label: "Helper", href: "/helper", icon: <LifeBuoy className="h-5 w-5 flex-shrink-0" /> },
  { label: "Live Call", href: "/live-call", icon: <Mic className="h-5 w-5 flex-shrink-0" /> },
  { label: "Scenarios", href: "/scenarios", icon: <List className="h-5 w-5 flex-shrink-0" /> },
  { label: "Playbook", href: "/playbook", icon: <BookOpen className="h-5 w-5 flex-shrink-0" /> },
  { label: "Objections", href: "/objections", icon: <Shield className="h-5 w-5 flex-shrink-0" /> },
  { label: "History", href: "/history", icon: <BarChart3 className="h-5 w-5 flex-shrink-0" /> },
];

const adminLink = {
  label: "Admin",
  href: "/admin",
  icon: <ShieldCheck className="h-5 w-5 flex-shrink-0" />,
};

export default function Header() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);

  // Don't render the nav on the auth page
  if (pathname.startsWith("/auth")) return null;

  const navLinks =
    profile?.role === "admin"
      ? [...baseNavLinks, adminLink]
      : baseNavLinks;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth";
  }

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody
        className={cn(
          "sticky top-0 z-40 h-screen border-r border-gray-800 bg-gray-950"
        )}
      >
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 py-1 mb-6">
            <span className="text-xl flex-shrink-0">📞</span>
            <motion.span
              animate={{
                display: open ? "inline-block" : "none",
                opacity: open ? 1 : 0,
              }}
              className="text-lg font-bold text-white whitespace-pre"
            >
              GreenGrow <span className="text-green-500">CCT</span>
            </motion.span>
          </Link>

          {/* Nav links */}
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <SidebarLink
                  key={link.href}
                  link={link}
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

        {/* User footer with logout */}
        {user && (
          <div className="border-t border-gray-800 pt-4 mt-4 space-y-2">
            <SidebarLink
              link={{
                label: user.email ?? "",
                href: "/profile",
                icon: (
                  <div className="w-7 h-7 rounded-full bg-green-700 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                    {(profile?.display_name ?? user.email ?? "U").charAt(0).toUpperCase()}
                  </div>
                ),
              }}
              className="text-gray-400 hover:text-white"
            />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 py-2 px-0 w-full text-left group/sidebar"
            >
              <LogOut className="h-5 w-5 flex-shrink-0 text-red-400" />
              <motion.span
                animate={{
                  display: open ? "inline-block" : "none",
                  opacity: open ? 1 : 0,
                }}
                className="text-red-400 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
              >
                Log out
              </motion.span>
            </button>
          </div>
        )}
      </SidebarBody>
    </Sidebar>
  );
}
