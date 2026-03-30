/**
 * Todoist REST API v2 integration
 * Handles fetching tasks and completing them via the Todoist API.
 * Token is stored in the user's Supabase profile.
 */

const TODOIST_API_BASE = "https://api.todoist.com/rest/v2";

export interface TodoistTask {
  id: string;
  content: string;
  description: string;
  is_completed: boolean;
  priority: number;
  due: {
    date: string;
    string: string;
    datetime?: string;
    timezone?: string;
  } | null;
  project_id: string;
  labels: string[];
  order: number;
  url: string;
}

/**
 * Fetch today's tasks from Todoist
 */
export async function fetchTodayTasks(token: string): Promise<TodoistTask[]> {
  const res = await fetch(`${TODOIST_API_BASE}/tasks?filter=today`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("TODOIST_AUTH_ERROR");
    }
    throw new Error(`Todoist API error: ${res.status}`);
  }

  return res.json();
}

/**
 * Close (complete) a task in Todoist
 */
export async function closeTask(token: string, taskId: string): Promise<boolean> {
  const res = await fetch(`${TODOIST_API_BASE}/tasks/${taskId}/close`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.ok;
}

/**
 * Validate a Todoist API token by fetching user info
 */
export async function validateToken(token: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.todoist.com/sync/v9/sync", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "sync_token=*&resource_types=[\"user\"]",
    });
    return res.ok;
  } catch {
    return false;
  }
}
