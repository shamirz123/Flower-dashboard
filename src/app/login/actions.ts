"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type State = { error?: string; message?: string } | undefined;

export async function login(_prev: State, formData: FormData): Promise<State> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      error: error.message.toLowerCase().includes("confirm")
        ? "Please confirm your email first. Check your inbox."
        : "Invalid email or password.",
    };
  }
  redirect("/dashboard");
}

export async function signup(_prev: State, formData: FormData): Promise<State> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!name || !email) return { error: "Enter your name and email." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      // Confirmation links return to this app even if the project's Site URL points elsewhere.
      emailRedirectTo: `${(await headers()).get("origin") ?? ""}/auth/callback`,
    },
  });
  if (error) return { error: error.message };

  // With email confirmation on there is no session yet; ask the user to confirm.
  if (!data.session) {
    return { message: "Account created. Check your email and click the confirmation link, then sign in." };
  }
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
