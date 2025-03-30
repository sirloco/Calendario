import { NextResponse } from 'next/server';

export function middleware(req) {
    const auth = req.headers.get('authorization');

    // Credenciales en formato "usuario:contraseña" (Base64)
    const validUser = "santi";
    const validPass = "lidt";
    const validCreds = "Basic " + btoa(`${validUser}:${validPass}`);

    if (auth === validCreds) {
        return NextResponse.next(); // Permite el acceso
    }

    return new NextResponse("Acceso Denegado", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Acceso Restringido"' },
    });
}
