"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import type { TodoistTask } from "@/lib/todoist";

interface FocusTodoistPickerProps {
  onSelectTask: (task: TodoistTask | null) => void;
  selectedTaskId?: string | null;
}

/**
 * Shows top 3 Todoist tasks before starting a focus session.
 * User can pick one to work on, or skip.
 */
export function FocusTodoistPicker({ onSelectTask, selectedTaskId }: FocusTodoistPickerProps) {
  const [tasks, setTasks] = useState<TodoistTask[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/todoist");
      const data = await res.json();
      setConnected(data.connected);
      // Take top 3
      setTasks((data.tasks || []).slice(0, 3));
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  if (loading || !connected || tasks.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm text-sand-stone">Working on something specific?</p>
      <div className="space-y-2">
        {tasks.map((task) => (
          <motion.button
            key={task.id}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              onSelectTask(selectedTaskId === task.id ? null : task)
            }
            className={`w-full text-left card-keystone flex items-center gap-3 transition-all ${
              selectedTaskId === task.id
                ? "border-indigo-soft/50 bg-indigo-soft/5"
                : ""
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                selectedTaskId === task.id
                  ? "border-indigo-soft bg-indigo-soft"
                  : "border-sand-stone/40"
              }`}
            >
              {selectedTaskId === task.id && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <span className="text-sm text-slate-deep truncate">
              {task.content}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/**
 * After focus session completion, offer to complete the linked Todoist task.
 */
interface FocusTodoistCompleteProps {
  taskId: string;
  taskContent: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function FocusTodoistComplete({
  taskId,
  taskContent,
  onComplete,
  onSkip,
}: FocusTodoistCompleteProps) {
  const [completing, setCompleting] = useState(false);

  async function handleComplete() {
    setCompleting(true);
    try {
      await fetch("/api/todoist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close", taskId }),
      });
      onComplete();
    } catch {
      onSkip();
    } finally {
      setCompleting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-keystone bg-green-sage/10 border-green-sage/30"
    >
      <p className="text-sm text-slate-deep mb-3">
        Done with &ldquo;{taskContent}&rdquo;?
      </p>
      <div className="flex gap-3">
        <button onClick={onSkip} className="btn-secondary flex-1 text-sm py-2">
          Not yet
        </button>
        <button
          onClick={handleComplete}
          disabled={completing}
          className="btn-primary flex-1 text-sm py-2 disabled:opacity-60"
        >
          {completing ? "Completing..." : "Mark done"}
        </button>
      </div>
    </motion.div>
  );
}
