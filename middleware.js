import { NextResponse } from 'next/server';

export function middleware(req) {
    return new NextResponse("Middleware está funcionando", { status: 200 });
}

