export default defineNuxtRouteMiddleware(async (to) => {
  const publicPaths = ["/", "/login"];
  if (publicPaths.includes(to.path)) return;

  let user: any;
  try {
    const fetchWithCookies = useRequestFetch();
    user = await fetchWithCookies("/api/auth/currentUser");
  } catch {
    return navigateTo("/");
  }

  if (to.fullPath.startsWith("/administration")) {
    if (!user?.UserRole?.name?.toUpperCase().includes("ADMIN")) {
      return abortNavigation("Insufficient permissions.");
    }
  }
});
