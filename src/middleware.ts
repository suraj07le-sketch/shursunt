import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    const response = handleI18nRouting(request);

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

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser().
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname;

    // Protected routes - these require authentication
    const protectedPaths = ['/dashboard', '/crypto', '/market', '/settings', '/predictions', '/stocks', '/watchlist', '/billing', '/admin'];
    const isProtected = protectedPaths.some(p => path.includes(p));

    if (isProtected) {
        if (!user) {
            // Redirect to login if not authenticated
            const url = request.nextUrl.clone()
            url.pathname = '/login';
            return NextResponse.redirect(url)
        }
    }

    // Check for Auth routes (Login/Signup) when already logged in
    if (path.includes('/login') || path.includes('/signup')) {
        if (user) {
            // Redirect to dashboard
            const url = request.nextUrl.clone()
            url.pathname = path.replace(/\/login|\/signup/, '/dashboard');
            return NextResponse.redirect(url)
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
