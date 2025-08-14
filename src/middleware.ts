
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/recipes",
  "/live",
  "/community",
  "/technique-clinic",
  "/schedule",
  "/routines",
  "/moderation",
];

const MODERATOR_RESTRICTED_ROUTES = [
    "/schedule",
];

export async function middleware(request: NextRequest) {
  const { supabase, response } = await updateSession(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedRoute = PROTECTED_ROUTES.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user) {
    if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    
    // Check moderator restrictions
    const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single();
    const userRole = profile?.rol;

    if (userRole === 2) {
        const isRestrictedForModerator = MODERATOR_RESTRICTED_ROUTES.some((path) => 
            request.nextUrl.pathname.startsWith(path)
        );
        if (isRestrictedForModerator) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }
  }


  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
