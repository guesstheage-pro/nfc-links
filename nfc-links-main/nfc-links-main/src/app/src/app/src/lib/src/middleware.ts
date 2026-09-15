import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Proteggiamo solo la pagina principale (dashboard)
  if (req.nextUrl.pathname === '/') {
    const basicAuth = req.headers.get('authorization');
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');
      if (user === 'admin' && pwd === process.env.ADMIN_PASSWORD) {
        return NextResponse.next();
      }
    }
    return new NextResponse('Accesso Negato', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Dashboard Sicura"' }
    });
  }
}
