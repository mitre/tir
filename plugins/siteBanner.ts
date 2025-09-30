export default defineNuxtPlugin(async () => {
  const banner = useBannerStore();
  await banner.load();
});
