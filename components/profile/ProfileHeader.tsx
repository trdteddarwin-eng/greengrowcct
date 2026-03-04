"use client";

import { motion } from "framer-motion";

interface ProfileHeaderProps {
  displayName: string | null;
  email: string;
  role: string;
  createdAt: string;
}

export default function ProfileHeader({
  displayName,
  email,
  role,
  createdAt,
}: ProfileHeaderProps) {
  const name = displayName || email.split("@")[0];
  const initial = name.charAt(0).toUpperCase();
  const memberSince = new Date(createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-5 bg-gray-900 border border-gray-800 rounded-xl p-6"
    >
      <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-2xl font-bold text-green-400 shrink-0">
        {initial}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold text-white truncate">{name}</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30 capitalize">
            {role}
          </span>
        </div>
        <p className="text-sm text-gray-400 truncate mt-0.5">{email}</p>
        <p className="text-xs text-gray-500 mt-1">Member since {memberSince}</p>
      </div>
    </motion.div>
  );
}
