import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip static assets and the generated icon routes (icon2, apple-icon) so they load for signed-out visitors.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon\\d*|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
