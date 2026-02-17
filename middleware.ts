import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Allow access to the home page ("/")
    if (path === '/') {
        return NextResponse.next()
    }

    // Allow next.js internal requests (static files, images, etc.)
    // and public files (favicon.ico, etc.)
    if (
        path.startsWith('/_next') ||
        path.startsWith('/static') ||
        path.includes('.') // typically files like images, css
    ) {
        return NextResponse.next()
    }

    // Allow all other requests
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
