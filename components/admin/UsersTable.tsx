"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface UserRow {
  id: string;
  displayName: string;
  email: string;
  role: string;
  totalCalls: number;
  avgScore: number;
  lastActive: string | null;
  joined: string;
}

interface UsersTableProps {
  users: UserRow[];
  onSort: (field: string) => void;
  sortField: string;
  sortOrder: "asc" | "desc";
}

function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

const columns = [
  { key: "display_name", label: "Name" },
  { key: "email", label: "Email", hideOnMobile: true },
  { key: "role", label: "Role", hideOnMobile: true },
  { key: "total_calls", label: "Calls" },
  { key: "avg_score", label: "Avg Score" },
  { key: "last_active_at", label: "Last Active", hideOnMobile: true },
  { key: "created_at", label: "Joined", hideOnMobile: true },
];

export default function UsersTable({
  users,
  onSort,
  sortField,
  sortOrder,
}: UsersTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900 shadow-soft">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => onSort(col.key)}
                className={`px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-white transition-colors select-none ${
                  col.hideOnMobile ? "hidden lg:table-cell" : ""
                }`}
              >
                {col.label}
                {sortField === col.key && (
                  <span className="ml-1 text-green-400">
                    {sortOrder === "asc" ? "\u2191" : "\u2193"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <motion.tr
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => router.push(`/admin/users/${user.id}`)}
              className="border-b border-gray-800/50 cursor-pointer hover:bg-gray-800/40 transition-colors"
            >
              <td className="px-4 py-3 font-medium text-white">
                {user.displayName}
              </td>
              <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">
                {user.email}
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    user.role === "admin"
                      ? "bg-green-950 text-green-400 border border-green-800"
                      : "bg-gray-800 text-gray-400 border border-gray-700"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-300 tabular-nums">
                {user.totalCalls}
              </td>
              <td className="px-4 py-3 tabular-nums">
                <span
                  className={
                    user.avgScore >= 7
                      ? "text-green-400"
                      : user.avgScore >= 5
                      ? "text-amber-400"
                      : "text-gray-400"
                  }
                >
                  {user.avgScore > 0 ? user.avgScore.toFixed(1) : "—"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                {relativeTime(user.lastActive)}
              </td>
              <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                {new Date(user.joined).toLocaleDateString()}
              </td>
            </motion.tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-gray-500"
              >
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
