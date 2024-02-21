export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.name === "boundaries-companyidid") {
    const { data: user } = await useFetch("/api/auth/currentUser", { method: "GET" });
    if (user.value.statusCode !== 401) {
      const { data: get, error } = await useFetch("/api/tiers/get", {
        method: "POST",
        body: { id: to.params.id },
      });
      if (error.value !== null) {
        return navigateTo("/home");
      }
    } else {
      return navigateTo("/");
    }
  }

  console.log("Middlewear: Checking Permissions");
});
