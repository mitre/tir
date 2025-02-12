export default defineNuxtRouteMiddleware(async (to, from) => {
  const authCheck = await useFetch("/api/boundaries/summary", {
    method: "GET",
    query: { BoundaryId: to.params.boundaryId, authOnly: true },
  });
  if (authCheck.data.value.status !== "success") {
    return navigateTo("/home");
  }
});
