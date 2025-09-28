export default function middleware(request: Request) {
  const url = new URL(request.url);
  const isDevRoute = url.pathname.startsWith('/dev') || url.pathname === '/dev-logs';
  const allowDevRoutes = process.env.EXPO_PUBLIC_ENABLE_DEV_ROUTES === 'true';

  if (isDevRoute && !allowDevRoutes) {
    url.pathname = '/';
    return Response.redirect(url);
  }

  return undefined;
}
