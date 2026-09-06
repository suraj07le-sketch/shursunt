import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { emailToUuid, generateOtp } from "@/lib/auth-utils";
import { sendOtpEmail } from "@/lib/mailjet";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, fullName } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Valid email address is required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if email belongs to an already registered & verified user in Supabase
    // Check in auth.users
    const { data: usersData, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listUsersError) {
      console.error("Error checking existing auth users:", listUsersError);
    } else if (usersData?.users) {
      const existingUser = usersData.users.find(
        (u) => u.email?.toLowerCase() === normalizedEmail
      );
      if (existingUser) {
        return NextResponse.json(
          { error: "This email is already registered." },
          { status: 400 }
        );
      }
    }

    // Also check profiles table
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, verified")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingProfile && existingProfile.verified !== false) {
      return NextResponse.json(
        { error: "This email is already registered." },
        { status: 400 }
      );
    }

    // 2. Generate 6-digit OTP
    const otpCode = generateOtp();

    // 3. Compute deterministic UUID from email
    const userId = emailToUuid(normalizedEmail);

    // 4. Set expiration (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // 5. Delete existing verification tokens for this user_id
    await supabaseAdmin
      .from("verification_tokens")
      .delete()
      .eq("user_id", userId);

    // 6. Insert new token into verification_tokens
    const { error: insertError } = await supabaseAdmin
      .from("verification_tokens")
      .insert({
        user_id: userId,
        token: otpCode,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("Failed to insert verification token:", insertError);
      return NextResponse.json(
        { error: "Failed to store verification token. Please ensure database tables are set up." },
        { status: 500 }
      );
    }

    // 7. Dispatch 6-digit code via Mailjet API
    const mailjetResult = await sendOtpEmail({
      toEmail: normalizedEmail,
      toName: fullName || normalizedEmail,
      otpCode,
    });

    if (!mailjetResult.success) {
      return NextResponse.json(
        { error: mailjetResult.error || "Failed to send verification email." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email.",
    });
  } catch (err: any) {
    console.error("Send OTP API Error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
