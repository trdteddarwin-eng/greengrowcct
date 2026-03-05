"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { scenarios } from "@/lib/scenarios";
import type { Scenario, CustomScenarioData } from "@/lib/types";
import { customScenarioToScenario } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

interface UserOption {
  id: string;
  displayName: string;
  email: string;
}

interface CreateTaskFormProps {
  onCreated: () => void;
  onCancel: () => void;
}

const STEP_COUNT = 3;

export default function CreateTaskForm({ onCreated, onCancel }: CreateTaskFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scenarioId, setScenarioId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

  // Load users list
  useEffect(() => {
    async function loadUsers() {
      const res = await fetch("/api/admin/users?sort=display_name&order=asc");
      if (res.ok) {
        const data = await res.json();
        setUsers(
          (data.users as { id: string; displayName: string; email: string }[]).map((u) => ({
            id: u.id,
            displayName: u.displayName,
            email: u.email,
          }))
        );
      }
    }
    loadUsers();
  }, []);

  // Load custom scenarios
  useEffect(() => {
    async function loadCustom() {
      try {
        const res = await fetch("/api/scenarios");
        if (res.ok) {
          const data = await res.json();
          setCustomScenarios(
            (data.scenarios as CustomScenarioData[]).map(customScenarioToScenario)
          );
        }
      } catch {
        // optional
      }
    }
    loadCustom();
  }, []);

  const allScenarios = useMemo(() => {
    return [...scenarios, ...customScenarios];
  }, [customScenarios]);

  const selectedScenario = useMemo(() => {
    return allScenarios.find((s) => s.id === scenarioId);
  }, [scenarioId, allScenarios]);

  function toggleUser(userId: string) {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }

  function selectAllUsers() {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  }

  const handleNext = () => {
    setError("");
    if (currentStep === 1) {
      if (!title.trim()) {
        setError("Task Title is required.");
        return;
      }
      if (!scenarioId) {
        setError("Please select a scenario.");
        return;
      }
    }
    if (currentStep === 2) {
      if (selectedUsers.length === 0) {
        setError("Please assign at least one team member.");
        return;
      }
    }

    if (currentStep < STEP_COUNT) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError("");
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (selectedUsers.length === 0) { // Final check for step 3
      setError("Please assign at least one team member.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          scenario_id: scenarioId,
          scenario_name: selectedScenario?.name ?? scenarioId,
          due_date: dueDate || null,
          user_ids: selectedUsers,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create task");
      }

      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-400 bg-green-900/40 border-green-800";
      case "medium":
        return "text-yellow-400 bg-yellow-900/40 border-yellow-800";
      case "hard":
        return "text-red-400 bg-red-900/40 border-red-800";
      default:
        return "text-gray-400 bg-gray-800/40 border-gray-700";
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="relative overflow-hidden">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4"
        >
          {error}
        </motion.div>
      )}

      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${
                currentStep === step
                  ? "bg-green-600 text-white"
                  : "bg-gray-800 text-gray-400 border border-gray-700"
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <span className="font-medium text-white">Step {currentStep} of {STEP_COUNT}</span>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Task Details & Scenario</h3>

            {/* Title */}
            <div>
              <label htmlFor="task-title" className="block text-sm font-medium text-gray-300 mb-2">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='e.g. "Practice cold open with Jessica"'
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors shadow-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="task-description" className="block text-sm font-medium text-gray-300 mb-2">
                Description <span className="text-gray-500">(optional)</span>
              </label>
              <textarea
                id="task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Additional details or instructions for your team members..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors resize-y shadow-sm"
              />
            </div>

            {/* Scenario Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Choose Scenario <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {allScenarios.map((s) => (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                      ${scenarioId === s.id
                        ? "border-green-500 ring-2 ring-green-500 bg-green-900/20"
                        : "border-gray-800 hover:border-gray-600 bg-gray-900/50 hover:bg-gray-800/50"
                      }`}
                    onClick={() => setScenarioId(s.id)}
                  >
                    <div className="flex items-center mb-3">
                      <span className="text-3xl mr-3">{s.icon}</span>
                      <h4 className="font-semibold text-white text-lg">{s.name}</h4>
                    </div>
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">{s.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded-full border ${getDifficultyColor(s.difficulty)}`}>
                        {s.difficulty}
                      </span>
                      <span className="text-gray-500">Prospect: {s.prospectName}</span>
                    </div>
                    {scenarioId === s.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 bg-green-500 rounded-full p-0.5"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
                {allScenarios.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No scenarios available.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Assign Team & Due Date</h3>

            {/* Due Date */}
            <div>
              <label htmlFor="due-date" className="block text-sm font-medium text-gray-300 mb-2">
                Due Date <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors shadow-sm appearance-none"
              />
            </div>

            {/* Assign Users */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Assign To <span className="text-red-500">*</span>
                </label>
                <motion.button
                  type="button"
                  onClick={selectAllUsers}
                  whileTap={{ scale: 0.95 }}
                  className="text-xs text-green-400 hover:text-green-300 transition-colors font-medium px-2 py-1 rounded-md"
                >
                  {selectedUsers.length === users.length && users.length > 0 ? "Deselect All" : "Select All"}
                </motion.button>
              </div>
              <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-700 bg-gray-800 divide-y divide-gray-700/50 shadow-inner custom-scrollbar">
                {users.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    Loading team members...
                  </div>
                )}
                {users.map((user) => (
                  <motion.label
                    key={user.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors duration-150
                      ${selectedUsers.includes(user.id) ? "bg-green-900/20 hover:bg-green-900/30" : "hover:bg-gray-700/50"}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="form-checkbox h-5 w-5 text-green-500 rounded border-gray-600 bg-gray-700 focus:ring-green-500 focus:ring-offset-gray-900"
                    />
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-green-700 flex items-center justify-center text-sm font-semibold text-white">
                      {getInitials(user.displayName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </motion.label>
                ))}
              </div>
              {selectedUsers.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {selectedUsers.length} member{selectedUsers.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Review & Confirm</h3>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4 shadow-lg">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Task Title</p>
                <p className="text-lg font-semibold text-white">{title || "N/A"}</p>
              </div>
              {description && (
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Description</p>
                  <p className="text-white text-base leading-relaxed">{description}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Scenario</p>
                {selectedScenario ? (
                  <div className="flex items-center gap-3 bg-gray-700/50 rounded-lg p-3">
                    <span className="text-2xl">{selectedScenario.icon}</span>
                    <div>
                      <p className="text-white font-medium">{selectedScenario.name}</p>
                      <p className="text-xs text-gray-400">
                        {selectedScenario.difficulty} &bull; Prospect: {selectedScenario.prospectName}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No scenario selected</p>
                )}
              </div>
              {dueDate && (
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Due Date</p>
                  <p className="text-white">{new Date(dueDate).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Assigned To</p>
                {selectedUsers.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedUsers.map((userId) => {
                      const user = users.find((u) => u.id === userId);
                      return user ? (
                        <span
                          key={userId}
                          className="flex items-center gap-2 px-3 py-1 bg-green-900/30 rounded-full text-sm text-green-200 border border-green-800"
                        >
                          <div className="w-5 h-5 rounded-full bg-green-700 flex items-center justify-center text-xs font-medium text-white">
                            {getInitials(user.displayName)}
                          </div>
                          {user.displayName}
                        </span>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">No team members assigned</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-800">
        {currentStep > 1 && (
          <motion.button
            type="button"
            onClick={handleBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg border border-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </motion.button>
        )}
        <div className="flex-grow flex justify-end gap-3">
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg border border-gray-700 transition-colors"
          >
            Cancel
          </motion.button>

          {currentStep < STEP_COUNT && (
            <motion.button
              type="button"
              onClick={handleNext}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Next
              <svg className="w-5 h-5 -mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </motion.button>
          )}

          {currentStep === STEP_COUNT && (
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {submitting ? "Creating Task..." : "Create Task"}
            </motion.button>
          )}
        </div>
      </div>
    </form>
  );
}
