export default defineNuxtRouteMiddleware(async (to, from) => {
  try {
    const publicPaths = ["/", "/login"];

    if (!publicPaths.includes(to.path)) {
      const { data: user } = await useFetch("/api/auth/currentUser");

      if (user.value?.statusCode !== 401) {
        if (to.fullPath.startsWith("/administration")) {
          if (!user.value?.UserRole?.name?.toUpperCase().includes("ADMIN")) {
            return abortNavigation("Insufficient permissions.");
          }
        }
      } else {
        return navigateTo("/");
      }
    }
  } catch (error) {
    logger.error({ service: "auth", message: `[auth.global]: ${error}` });
    return navigateTo("/");
  }
});
