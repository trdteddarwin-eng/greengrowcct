"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminHeader() {
  const pathname = usePathname();

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">
        Monitor user activity and app performance
      </p>
      <nav className="flex gap-1 border-b border-gray-800 pb-px">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                isActive
                  ? "text-green-400 border-b-2 border-green-500 bg-green-950/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
