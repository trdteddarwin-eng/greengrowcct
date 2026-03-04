"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import UserDetailView from "@/components/admin/UserDetail";

interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  role: string;
  totalCalls: number;
  avgScore: number;
  bestScore: number;
  lastActive: string | null;
  joined: string;
}

interface CallRow {
  id: string;
  scenarioName: string;
  date: string;
  durationSeconds: number;
  score: number;
}

interface EventRow {
  id: string;
  event_type: string;
  metadata: Record<string, unknown>;
  page_path: string | null;
  created_at: string;
}

interface UserData {
  profile: UserProfile;
  calls: CallRow[];
  events: EventRow[];
}

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load user");
        return r.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <Link
          href="/admin/users"
          className="text-green-400 hover:text-green-300 text-sm"
        >
          Back to users
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to users
      </Link>

      <UserDetailView
        profile={data.profile}
        calls={data.calls}
        events={data.events}
      />
    </div>
  );
}
