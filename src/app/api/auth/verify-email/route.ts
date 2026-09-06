import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { emailToUuid } from "@/lib/auth-utils";

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
    const { email, code, password, fullName } = body;

    if (!email || !code || !password) {
      return NextResponse.json(
        { error: "Email, verification code, and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userId = emailToUuid(normalizedEmail);
    const cleanedCode = code.toString().trim();

    // 1. Look up verification_tokens where user_id = emailToUuid(email) and token = code
    const { data: tokenRecords, error: tokenError } = await supabaseAdmin
      .from("verification_tokens")
      .select("*")
      .eq("user_id", userId)
      .eq("token", cleanedCode);

    if (tokenError || !tokenRecords || tokenRecords.length === 0) {
      return NextResponse.json(
        { error: "Invalid verification code. Please check and try again." },
        { status: 400 }
      );
    }

    const tokenRecord = tokenRecords[0];

    // Check expiration
    if (new Date(tokenRecord.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // 2. Code is valid! Create the user in Supabase Auth using Service Role client
    const { data: authUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: password,
      email_confirm: true, // auto-confirm email since OTP was verified
      user_metadata: {
        full_name: fullName || normalizedEmail,
        username: fullName || normalizedEmail,
      },
    });

    if (createUserError || !authUser.user) {
      console.error("Failed to create user via admin:", createUserError);
      return NextResponse.json(
        { error: createUserError?.message || "Failed to create user account." },
        { status: 400 }
      );
    }

    const newUserId = authUser.user.id;

    // 3. Upsert into public.profiles ({ id: newUserId, full_name: fullName, verified: true })
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: newUserId,
        email: normalizedEmail,
        full_name: fullName || normalizedEmail,
        username: fullName || normalizedEmail,
        verified: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

    if (profileError) {
      console.error("Failed to upsert profile record:", profileError);
      // Non-fatal if handle_new_user trigger already ran, but log it
    }

    // 4. Delete the used token from verification_tokens
    await supabaseAdmin
      .from("verification_tokens")
      .delete()
      .eq("user_id", userId);

    return NextResponse.json({
      success: true,
      user: {
        id: newUserId,
        email: authUser.user.email,
      },
      message: "Email verified and account created successfully.",
    });
  } catch (err: any) {
    console.error("Verify Email API Error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during verification." },
      { status: 500 }
    );
  }
}
