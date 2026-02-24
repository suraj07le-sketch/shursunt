import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    const response = handleI18nRouting(request);

    const path = request.nextUrl.pathname;

    // Protected routes - these require authentication
    const protectedPaths = ['/dashboard', '/crypto', '/market', '/settings', '/predictions', '/stocks', '/watchlist', '/billing', '/admin'];
    const isProtected = protectedPaths.some(p => path.includes(p));
    const isAuthPage = path.includes('/login') || path.includes('/signup');

    // ONLY perform Supabase auth checks if we are on a protected route or an auth page.
    // This prevents the app from hanging on the landing page if Supabase is down.
    if (isProtected || isAuthPage) {
        try {
            // Create a Supabase client configured to use cookies
            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        getAll() {
                            return request.cookies.getAll()
                        },
                        setAll(cookiesToSet) {
                            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                            // Update the response from next-intl
                            cookiesToSet.forEach(({ name, value, options }) =>
                                response.cookies.set(name, value, options)
                            )
                        },
                    },
                }
            )

            // IMPORTANT: Only wait for user data if we absolutely need it
            const {
                data: { user },
                error: authError
            } = await supabase.auth.getUser()

            if (authError) throw authError;

            if (isProtected && !user) {
                // Redirect to login if not authenticated
                const url = request.nextUrl.clone()
                url.pathname = '/login';
                return NextResponse.redirect(url)
            }

            if (isAuthPage && user) {
                // Redirect to dashboard if already logged in
                const url = request.nextUrl.clone()
                url.pathname = path.replace(/\/login|\/signup/, '/dashboard');
                return NextResponse.redirect(url)
            }
        } catch (err) {
            console.error('Middleware Auth Error (Supabase likely unreachable):', err);
            // If it's a protected route, we still need to redirect if it fails
            if (isProtected) {
                const url = request.nextUrl.clone()
                url.pathname = '/login';
                return NextResponse.redirect(url)
            }
        }
    }

    return response
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
        '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
