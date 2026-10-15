"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AuthShell, Divider } from "@/components/auth-shell";
import { GoogleButton } from "@/components/google-button";
import { btnCls, inputCls, labelCls } from "@/components/ui";
import { signup } from "../login/actions";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <AuthShell title="Create your account" subtitle="Start tracking flower usage in minutes">
      <GoogleButton label="Sign up with Google" />
      <Divider />
      <form action={action} className="space-y-4">
        <label className={labelCls}>
          Full name
          <input name="name" autoComplete="name" required placeholder="Your name" className={`${inputCls} mt-1.5`} />
        </label>
        <label className={labelCls}>
          Email
          <input name="email" type="email" autoComplete="email" required placeholder="you@company.com" className={`${inputCls} mt-1.5`} />
        </label>
        <label className={labelCls}>
          Password
          <input name="password" type="password" autoComplete="new-password" minLength={8} required placeholder="At least 8 characters" className={`${inputCls} mt-1.5`} />
        </label>
        {state?.error && (
          <p role="alert" className="rounded-xl bg-bad/10 px-3.5 py-2.5 text-sm text-bad">{state.error}</p>
        )}
        {state?.message && (
          <p className="rounded-xl bg-good/10 px-3.5 py-2.5 text-sm text-good">{state.message}</p>
        )}
        <button disabled={pending} className={`${btnCls} w-full`}>
          {pending ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
