const publicPaths = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/invite",
];

const adminApiPrefix = "/api/v1/admin/";

export function isPublicPath(pathname: string): boolean {
  return publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function isAdminApiPath(pathname: string): boolean {
  return pathname.startsWith(adminApiPrefix);
}
