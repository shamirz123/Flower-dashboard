"use client";

import Link from "next/link";
import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthShell, Divider } from "@/components/auth-shell";
import { GoogleButton } from "@/components/google-button";
import { btnCls, inputCls, labelCls } from "@/components/ui";
import { login } from "./actions";

function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const authError = useSearchParams().get("error");

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your dashboard">
      <GoogleButton />
      <Divider />
      <form action={action} className="space-y-4">
        <label className={labelCls}>
          Email
          <input name="email" type="email" autoComplete="email" required placeholder="you@company.com" className={`${inputCls} mt-1.5`} />
        </label>
        <label className={labelCls}>
          Password
          <input name="password" type="password" autoComplete="current-password" required placeholder="••••••••" className={`${inputCls} mt-1.5`} />
        </label>
        {(state?.error || authError) && (
          <p role="alert" className="rounded-xl bg-bad/10 px-3.5 py-2.5 text-sm text-bad">
            {state?.error ?? "Sign-in failed. Please try again."}
          </p>
        )}
        <button disabled={pending} className={`${btnCls} w-full`}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
