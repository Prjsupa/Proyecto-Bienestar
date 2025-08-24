
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
  "/health-form", // Also protect the form itself
];

const MODERATOR_RESTRICTED_ROUTES = [
    "/schedule",
];

const MODERATOR_ONLY_ROUTES = [
    "/moderation"
];

export async function middleware(request: NextRequest) {
  const { supabase, response } = await updateSession(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedRoute = PROTECTED_ROUTES.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  const isSpecialRegistration = request.nextUrl.pathname.startsWith('/register/');
  const isHealthFormPage = request.nextUrl.pathname.startsWith('/health-form');

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Handle special registration links regardless of login status
  if (isSpecialRegistration) {
    const linkType = request.nextUrl.pathname.split('/')[2];
    if (linkType === 'professional' || linkType === 'moderator') {
      const { data } = await supabase
        .from('registration_links')
        .select('is_active')
        .eq('id', linkType)
        .single();
      
      if (!data?.is_active) {
        return NextResponse.redirect(new URL("/register", request.url));
      }
    }
  }

  if (user) {
    if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    
    const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single();
    const userRole = profile?.rol;

    // Gate for regular users who haven't filled the form
    if (userRole === 0) {
        const { data: formData, error: formError } = await supabase.from('formulario').select('id').eq('user_id', user.id).maybeSingle();
        const formFilled = formData && !formError;

        if (!formFilled && !isHealthFormPage) {
            return NextResponse.redirect(new URL('/health-form', request.url));
        }
        if (formFilled && isHealthFormPage) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }
    
    // Role-based restrictions for other routes
    if (userRole === 2) { // Moderator
        const isRestrictedForModerator = MODERATOR_RESTRICTED_ROUTES.some((path) => 
            request.nextUrl.pathname.startsWith(path)
        );
        if (isRestrictedForModerator) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    } else { // Not a moderator
        const isModeratorOnlyRoute = MODERATOR_ONLY_ROUTES.some((path) =>
            request.nextUrl.pathname.startsWith(path)
        );
        if (isModeratorOnlyRoute) {
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
