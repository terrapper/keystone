import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fetchTodayTasks, closeTask, validateToken } from "@/lib/todoist";

/**
 * GET /api/todoist — Fetch today's Todoist tasks for the authenticated user
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("todoist_token")
      .eq("id", user.id)
      .single();

    if (!profile?.todoist_token) {
      return NextResponse.json({ tasks: [], connected: false });
    }

    try {
      const tasks = await fetchTodayTasks(profile.todoist_token);
      return NextResponse.json({ tasks, connected: true });
    } catch (error) {
      if (error instanceof Error && error.message === "TODOIST_AUTH_ERROR") {
        return NextResponse.json({
          tasks: [],
          connected: false,
          error: "Invalid or expired Todoist token",
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Todoist fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/todoist — Actions: close task, save token, disconnect
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "close") {
      const { taskId } = body;
      if (!taskId) {
        return NextResponse.json({ error: "taskId required" }, { status: 400 });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("todoist_token")
        .eq("id", user.id)
        .single();

      if (!profile?.todoist_token) {
        return NextResponse.json({ error: "Todoist not connected" }, { status: 400 });
      }

      const success = await closeTask(profile.todoist_token, taskId);
      return NextResponse.json({ success });
    }

    if (action === "save_token") {
      const { token } = body;
      if (!token) {
        return NextResponse.json({ error: "token required" }, { status: 400 });
      }

      // Validate the token first
      const valid = await validateToken(token);
      if (!valid) {
        return NextResponse.json(
          { error: "Invalid Todoist API token" },
          { status: 400 }
        );
      }

      await supabase
        .from("profiles")
        .update({ todoist_token: token })
        .eq("id", user.id);

      return NextResponse.json({ success: true });
    }

    if (action === "disconnect") {
      await supabase
        .from("profiles")
        .update({ todoist_token: null })
        .eq("id", user.id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Todoist action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
