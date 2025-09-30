import { useNotificationStore } from "~/stores/NotificationStore";

export default defineNuxtPlugin(async () => {
  const notificationStore = useNotificationStore();
  await notificationStore.loadTimeout();
});
