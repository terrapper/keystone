import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/notifications/sms
 * Send an SMS via Twilio.
 * Gracefully degrades if Twilio env vars are not set.
 */
export async function POST(request: NextRequest) {
  try {
    const { phone_number, message } = await request.json();

    if (!phone_number || !message) {
      return NextResponse.json(
        { error: "phone_number and message are required" },
        { status: 400 }
      );
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    // Graceful degradation: if Twilio is not configured, return success with note
    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json({
        sent: false,
        reason: "twilio_not_configured",
        message: "SMS not sent — Twilio credentials not configured.",
      });
    }

    // Send via Twilio REST API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const body = new URLSearchParams({
      To: phone_number,
      From: fromNumber,
      Body: message,
    });

    const res = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Twilio error:", errorData);
      return NextResponse.json(
        {
          sent: false,
          reason: "twilio_error",
          error: errorData.message || "Failed to send SMS",
        },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      sent: true,
      sid: data.sid,
    });
  } catch (error) {
    console.error("SMS send error:", error);
    return NextResponse.json(
      { sent: false, reason: "server_error", error: "Internal server error" },
      { status: 500 }
    );
  }
}
