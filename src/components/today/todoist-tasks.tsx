"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TodoistTask } from "@/lib/todoist";
import Link from "next/link";

export function TodoistTasks() {
  const [tasks, setTasks] = useState<TodoistTask[]>([]);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/todoist");
      const data = await res.json();
      setConnected(data.connected);
      setTasks(data.tasks || []);
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function completeTask(taskId: string) {
    setCompletingId(taskId);
    try {
      const res = await fetch("/api/todoist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close", taskId }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    } catch {
      // silently fail
    } finally {
      setCompletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-5 bg-sand-stone/20 rounded w-1/3" />
        <div className="h-12 bg-sand-stone/20 rounded-keystone" />
        <div className="h-12 bg-sand-stone/20 rounded-keystone" />
      </div>
    );
  }

  // Not connected — show subtle CTA
  if (connected === false) {
    return (
      <div className="mt-2">
        <Link
          href="/you"
          className="block text-center py-3 text-sand-stone/70 text-sm hover:text-amber-warm transition-colors"
        >
          Connect Todoist to see your tasks here →
        </Link>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="mt-2">
        <p className="text-sm text-sand-stone text-center py-2">
          All clear — no Todoist tasks for today.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-display text-base text-slate-deep font-semibold">
        Today&apos;s Tasks
      </h2>
      <AnimatePresence>
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, height: 0 }}
            className="card-keystone flex items-center gap-3"
          >
            <button
              onClick={() => completeTask(task.id)}
              disabled={completingId === task.id}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                completingId === task.id
                  ? "border-green-sage bg-green-sage/20"
                  : "border-sand-stone/50 hover:border-green-sage"
              }`}
            >
              {completingId === task.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-3 h-3 bg-green-sage rounded-full"
                />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-deep truncate">
                {task.content}
              </div>
              {task.description && (
                <div className="text-xs text-sand-stone truncate mt-0.5">
                  {task.description}
                </div>
              )}
            </div>
            {task.priority > 1 && (
              <span
                className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                  task.priority === 4
                    ? "bg-red-50 text-red-500"
                    : task.priority === 3
                    ? "bg-amber-warm/10 text-amber-warm"
                    : "bg-indigo-soft/10 text-indigo-soft"
                }`}
              >
                P{5 - task.priority}
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
