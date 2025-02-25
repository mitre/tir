export default defineNuxtRouteMiddleware(async (to, from) => {
  try {
    if (to.path !== "/") {
      const { data: user } = await useFetch("/api/auth/currentUser", { method: "GET" });
      if (user) {
        if (to.fullPath.startsWith("/administration")) {
          if (!user.value.UserRole.name.toUpperCase().includes("ADMIN")) {
            return abortNavigation("Insufficient permisions.");
          }
        }
      } else {
        return navigateTo("/");
      }
    }
  } catch (error) {
    console.log("ERROR AUTH:", error.message);
    return navigateTo("/");
  }
});
