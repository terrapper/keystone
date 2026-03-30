import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getOptimalNotificationTime, getMissedDayResponse, incrementMissedDays } from "@/lib/adaptive";
import type { TimeOfDay } from "@/lib/types/database";

/**
 * POST /api/notifications/schedule
 *
 * Called by a cron job (Vercel cron or external).
 * Checks all users with SMS notifications enabled and sends
 * reminders for routines that are due now.
 */
export async function POST(request: NextRequest) {
  try {
    // Simple auth check — require a secret header for cron security
    const cronSecret = request.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;
    if (expectedSecret && cronSecret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Determine current time of day
    let currentTimeOfDay: TimeOfDay;
    if (currentHour < 12) currentTimeOfDay = "morning";
    else if (currentHour < 17) currentTimeOfDay = "afternoon";
    else currentTimeOfDay = "evening";

    // Get all profiles with phone numbers and non-zen notification preferences
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, phone_number, notification_preferences, quiet_hours_start, quiet_hours_end, zen_mode")
      .not("phone_number", "is", null);

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ processed: 0, sent: 0 });
    }

    let sent = 0;
    let skipped = 0;

    for (const profile of profiles) {
      // Skip zen mode users
      if (profile.zen_mode) {
        skipped++;
        continue;
      }

      // Check notification preferences
      const prefs = (profile.notification_preferences || {}) as Record<string, string>;
      const notifPref = prefs[currentTimeOfDay];
      if (notifPref !== "sms" && notifPref !== "both") {
        continue;
      }

      // Check quiet hours
      if (profile.quiet_hours_start && profile.quiet_hours_end) {
        const quietStart = parseTime(profile.quiet_hours_start);
        const quietEnd = parseTime(profile.quiet_hours_end);
        const nowMinutes = currentHour * 60 + currentMinute;

        if (isInQuietHours(nowMinutes, quietStart, quietEnd)) {
          skipped++;
          continue;
        }
      }

      // Get user's active routines for current time of day
      const { data: routines } = await supabase
        .from("routines")
        .select("id, start_time, time_of_day")
        .eq("user_id", profile.id)
        .eq("time_of_day", currentTimeOfDay)
        .eq("is_active", true);

      if (!routines || routines.length === 0) continue;

      for (const routine of routines) {
        // Check if it's time to send (within 15-minute window of routine start)
        let targetHour: number;
        let targetMinute: number;

        // After week 2, try adaptive timing
        const optimalTime = await getOptimalNotificationTime(
          supabase,
          profile.id,
          routine.time_of_day as TimeOfDay
        );

        if (optimalTime) {
          targetHour = optimalTime.hour;
          targetMinute = optimalTime.minute;
        } else {
          // Use the user's set start_time
          const [h, m] = routine.start_time.split(":").map(Number);
          targetHour = h;
          targetMinute = m;
        }

        // Check if we're within the 15-minute send window
        const targetMinutes = targetHour * 60 + targetMinute;
        const nowMinutes = currentHour * 60 + currentMinute;
        const diff = Math.abs(nowMinutes - targetMinutes);

        if (diff > 15) continue;

        // Check missed day response to determine message
        const nudge = await getMissedDayResponse(supabase, profile.id);

        // If back_off strategy and it's an "off" day, skip
        if (nudge.type === "back_off") {
          const dayOfYear = Math.floor(
            (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
          );
          if (dayOfYear % 2 !== 0) {
            skipped++;
            continue;
          }
        }

        // Build the message
        const timeLabel =
          currentTimeOfDay.charAt(0).toUpperCase() + currentTimeOfDay.slice(1);
        const message =
          nudge.type === "normal"
            ? `Your ${timeLabel} Keystone is ready 🔑`
            : nudge.message;

        // Send SMS
        const smsRes = await fetch(
          new URL("/api/notifications/sms", request.url).toString(),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone_number: profile.phone_number,
              message,
            }),
          }
        );

        const smsData = await smsRes.json();
        if (smsData.sent) {
          sent++;

          // Update last nudge info
          await supabase
            .from("adaptive_settings")
            .update({
              last_nudge_type: nudge.type,
              last_nudge_at: now.toISOString(),
            })
            .eq("user_id", profile.id);
        }
      }

      // Check if user has any completions today — if not, this counts toward missed days
      const today = now.toISOString().split("T")[0];
      const { count } = await supabase
        .from("habit_completions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .eq("date", today)
        .eq("skipped", false);

      if (count === 0) {
        // Only increment if this is the evening pass (end of day)
        if (currentTimeOfDay === "evening") {
          await incrementMissedDays(supabase, profile.id);
        }
      }
    }

    return NextResponse.json({
      processed: profiles.length,
      sent,
      skipped,
    });
  } catch (error) {
    console.error("Notification scheduler error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m || 0);
}

function isInQuietHours(nowMinutes: number, startMinutes: number, endMinutes: number): boolean {
  if (startMinutes <= endMinutes) {
    // e.g., 22:00 to 23:59 (same day)
    return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
  }
  // Wraps midnight, e.g., 22:00 to 07:00
  return nowMinutes >= startMinutes || nowMinutes <= endMinutes;
}
