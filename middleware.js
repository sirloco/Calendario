import { NextResponse } from 'next/server';

export function middleware(req) {
    return new NextResponse("Middleware activo 🚀", { status: 200 });
}
