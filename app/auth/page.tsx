"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";
type RoleChoice = null | "owner" | "member";

/* ── Floating orb component for left panel ── */
function FloatingOrb({
  size,
  x,
  y,
  delay,
  color,
}: {
  size: number;
  x: string;
  y: string;
  delay: number;
  color: string;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      }}
      animate={{
        y: [0, -20, 0, 15, 0],
        x: [0, 10, -8, 5, 0],
        scale: [1, 1.08, 0.95, 1.05, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

/* ── Animated particles ── */
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-green-400/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100 - Math.random() * 200],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── Animated grid ── */
function AnimatedGrid() {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.03 }}
      transition={{ duration: 2 }}
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    />
  );
}

/* ── Glowing ring decoration ── */
function GlowRing({
  size,
  delay,
  borderColor,
}: {
  size: number;
  delay: number;
  borderColor: string;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        border: `1px solid ${borderColor}`,
      }}
      animate={{
        scale: [1, 1.15, 1],
        opacity: [0.2, 0.5, 0.2],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

/* ── Fade-slide variants ── */
const fadeSlideUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const cardHover = {
  rest: { scale: 1, borderColor: "rgba(55, 65, 81, 1)" },
  hover: {
    scale: 1.01,
    borderColor: "rgba(34, 197, 94, 0.4)",
    transition: { duration: 0.2 },
  },
};

export default function AuthPage() {
  const [roleChoice, setRoleChoice] = useState<RoleChoice>(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function handleBack() {
    setRoleChoice(null);
    setMode("login");
    setEmail("");
    setPassword("");
    setError(null);
    setMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();

      if (mode === "login") {
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({ email, password });

        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }

        const userId = data.user?.id;
        if (userId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .single();

          if (profile?.role === "admin") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/";
          }
        } else {
          window.location.href = "/";
        }
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        window.location.href = "/";
      }
    } catch {
      setError(
        "Unable to connect to authentication service. Please try again."
      );
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 flex z-50">
      {/* ── Left Panel: Brand Visual ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-950">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(ellipse at 30% 50%, rgba(22,101,52,0.3) 0%, transparent 70%)",
              "radial-gradient(ellipse at 60% 40%, rgba(5,150,105,0.25) 0%, transparent 70%)",
              "radial-gradient(ellipse at 40% 60%, rgba(22,101,52,0.3) 0%, transparent 70%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating orbs */}
        <FloatingOrb size={300} x="20%" y="25%" delay={0} color="rgba(34,197,94,0.12)" />
        <FloatingOrb size={200} x="60%" y="15%" delay={1.5} color="rgba(16,185,129,0.1)" />
        <FloatingOrb size={150} x="70%" y="65%" delay={3} color="rgba(34,197,94,0.08)" />
        <FloatingOrb size={100} x="10%" y="70%" delay={2} color="rgba(52,211,153,0.1)" />

        {/* Glow rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <GlowRing size={280} delay={0} borderColor="rgba(34,197,94,0.15)" />
          <GlowRing size={200} delay={1} borderColor="rgba(16,185,129,0.12)" />
          <GlowRing size={350} delay={2} borderColor="rgba(34,197,94,0.08)" />
        </div>

        {/* Decorative shapes with pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <motion.div
              className="w-56 h-56 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-600/10 border border-green-500/10 backdrop-blur-sm"
              animate={{ scale: [1, 1.06, 1], rotate: [0, 3, -2, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -top-8 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-green-500/25 to-emerald-400/10 border border-green-400/10"
              animate={{ scale: [1, 1.1, 1], y: [0, -8, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: 1,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-6 -left-10 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400/15 to-green-600/5 border border-emerald-500/10"
              animate={{ scale: [1, 1.12, 1], x: [0, 6, 0] }}
              transition={{
                duration: 7,
                repeat: Infinity,
                delay: 2,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>

        {/* Particles */}
        <Particles />

        {/* Grid */}
        <AnimatedGrid />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="flex items-center gap-2.5">
              <motion.span
                className="text-2xl"
                animate={{ rotate: [0, -10, 10, -5, 0] }}
                transition={{ duration: 2, delay: 1, repeat: Infinity, repeatDelay: 8 }}
              >
                📞
              </motion.span>
              <span className="text-xl font-bold text-white">
                GreenGrow <span className="text-green-400">CCT</span>
              </span>
            </div>
          </motion.div>

          {/* Hero text */}
          <motion.div
            className="max-w-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
              Sharpen your pitch.{" "}
              <motion.span
                className="text-green-400 inline-block"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                Close more deals.
              </motion.span>
            </h2>
            <motion.p
              className="mt-5 text-gray-400 text-lg leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              AI-powered cold call practice that feels like the real thing.
              Train against realistic prospects and get scored on every call.
            </motion.p>
          </motion.div>

          {/* Social proof */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <div className="flex -space-x-2.5">
              {["bg-green-500", "bg-emerald-400", "bg-teal-500"].map(
                (bg, i) => (
                  <motion.div
                    key={i}
                    className={`w-9 h-9 rounded-full ${bg} border-2 border-gray-950 flex items-center justify-center text-xs font-bold text-white`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: 1.4 + i * 0.1,
                      type: "spring",
                      stiffness: 300,
                    }}
                  >
                    {["TD", "JR", "KM"][i]}
                  </motion.div>
                )
              )}
            </div>
            <div>
              <p className="text-white text-sm font-medium">Team of 10+</p>
              <p className="text-gray-500 text-xs">
                Already training with CCT
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right Panel: Auth Forms ── */}
      <div className="w-full lg:w-1/2 bg-gray-950 lg:bg-gray-900/30 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <motion.div
            className="lg:hidden text-center mb-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-3xl">📞</span>
            <h1 className="text-xl font-bold text-white mt-2">
              GreenGrow <span className="text-green-400">CCT</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Cold Call Trainer</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* ── Step 1: Role Picker ── */}
            {roleChoice === null && (
              <motion.div
                key="role-picker"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <motion.h2
                  className="text-2xl font-bold text-white"
                  variants={fadeSlideUp}
                  transition={{ duration: 0.4 }}
                >
                  Welcome back
                </motion.h2>
                <motion.p
                  className="text-gray-400 mt-1.5 mb-8"
                  variants={fadeSlideUp}
                  transition={{ duration: 0.4 }}
                >
                  Choose how you&apos;d like to sign in
                </motion.p>

                <div className="space-y-3">
                  <motion.button
                    type="button"
                    onClick={() => setRoleChoice("owner")}
                    className="w-full flex items-center gap-4 p-5 bg-gray-900 lg:bg-gray-800/50 border border-gray-800 rounded-xl transition-all group cursor-pointer"
                    variants={fadeSlideUp}
                    initial="rest"
                    whileHover="hover"
                    whileTap={{ scale: 0.985 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div
                      className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0"
                      whileHover={{ backgroundColor: "rgba(34,197,94,0.2)" }}
                    >
                      <svg
                        className="w-6 h-6 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                        />
                      </svg>
                    </motion.div>
                    <div className="text-left flex-1">
                      <div className="text-white font-semibold">
                        I&apos;m the Owner
                      </div>
                      <div className="text-gray-500 text-sm">
                        Admin access &amp; dashboard
                      </div>
                    </div>
                    <motion.svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      whileHover={{ x: 4, color: "rgb(74,222,128)" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                      />
                    </motion.svg>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => setRoleChoice("member")}
                    className="w-full flex items-center gap-4 p-5 bg-gray-900 lg:bg-gray-800/50 border border-gray-800 rounded-xl transition-all group cursor-pointer"
                    variants={fadeSlideUp}
                    initial="rest"
                    whileHover="hover"
                    whileTap={{ scale: 0.985 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div
                      className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0"
                      whileHover={{ backgroundColor: "rgba(59,130,246,0.2)" }}
                    >
                      <svg
                        className="w-6 h-6 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                        />
                      </svg>
                    </motion.div>
                    <div className="text-left flex-1">
                      <div className="text-white font-semibold">
                        I&apos;m a Team Member
                      </div>
                      <div className="text-gray-500 text-sm">
                        Practice cold calls
                      </div>
                    </div>
                    <motion.svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      whileHover={{ x: 4, color: "rgb(74,222,128)" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                      />
                    </motion.svg>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Auth Form ── */}
            {roleChoice !== null && (
              <motion.div
                key={`form-${roleChoice}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                {/* Back button */}
                <motion.button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
                  whileHover={{ x: -3 }}
                  whileTap={{ scale: 0.95 }}
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
                      d="M15.75 19.5 8.25 12l7.5-7.5"
                    />
                  </svg>
                  Back
                </motion.button>

                {/* Title */}
                <motion.h2
                  className="text-2xl font-bold text-white"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.35 }}
                >
                  {roleChoice === "owner"
                    ? "Owner Login"
                    : mode === "login"
                    ? "Team Login"
                    : "Create Account"}
                </motion.h2>
                <motion.p
                  className="text-gray-400 mt-1.5 mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.35 }}
                >
                  {roleChoice === "owner"
                    ? "Sign in to access the admin dashboard"
                    : mode === "login"
                    ? "Sign in to start practicing"
                    : "Join the team and start training"}
                </motion.p>

                {/* Tabs — only for team members */}
                {roleChoice === "member" && (
                  <motion.div
                    className="flex rounded-lg bg-gray-900 lg:bg-gray-800/50 border border-gray-800 p-1 mb-6"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setError(null);
                      }}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                        mode === "login"
                          ? "bg-gray-800 lg:bg-gray-700 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Log In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signup");
                        setError(null);
                      }}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                        mode === "signup"
                          ? "bg-gray-800 lg:bg-gray-700 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Sign Up
                    </button>
                  </motion.div>
                )}

                {/* Message */}
                <AnimatePresence>
                  {message && (
                    <motion.div
                      className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {message}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Email
                    </label>
                    <motion.input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-900 lg:bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm"
                      placeholder="you@example.com"
                      whileFocus={{
                        borderColor: "rgba(34,197,94,0.6)",
                        boxShadow: "0 0 0 3px rgba(34,197,94,0.1)",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Password
                    </label>
                    <motion.input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 bg-gray-900 lg:bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm"
                      placeholder={
                        mode === "signup"
                          ? "At least 6 characters"
                          : "Your password"
                      }
                      whileFocus={{
                        borderColor: "rgba(34,197,94,0.6)",
                        boxShadow: "0 0 0 3px rgba(34,197,94,0.1)",
                      }}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm cursor-pointer relative overflow-hidden"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: "easeInOut",
                      }}
                    />
                    <span className="relative">
                      {loading ? (
                        <motion.span
                          className="flex items-center justify-center gap-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <motion.span
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                          Please wait...
                        </motion.span>
                      ) : mode === "login" ? (
                        "Log In"
                      ) : (
                        "Create Account"
                      )}
                    </span>
                  </motion.button>
                </motion.form>

                {/* Toggle hint for team members */}
                {roleChoice === "member" && (
                  <motion.p
                    className="text-center text-gray-500 text-sm mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {mode === "login" ? (
                      <>
                        New here?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setMode("signup");
                            setError(null);
                          }}
                          className="text-green-400 hover:text-green-300 font-medium"
                        >
                          Create an account
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setMode("login");
                            setError(null);
                          }}
                          className="text-green-400 hover:text-green-300 font-medium"
                        >
                          Sign In
                        </button>
                      </>
                    )}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
