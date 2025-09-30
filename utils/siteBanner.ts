import { useNotificationStore } from "~/stores/NotificationStore";
import { useBannerStore } from "~/stores/BannerStore";

export async function loadSiteBannerConfig(
  visible: Ref<boolean>,
  html: Ref<string>,
  color: Ref<string>,
) {
  const notificationStore = useNotificationStore();

  try {
    const { data } = await useFetch<{
      visible: boolean;
      html: string;
      color: string;
    }>("/api/config/siteBanner");

    if (data.value) {
      visible.value = data.value.visible;
      html.value = data.value.html;
      color.value = data.value.color;
    }
  } catch (error) {
    console.error("Failed to load site banner config", error);
    notificationStore.addNotification({
      type: "error",
      message: "Failed to load site banner settings",
    });
  }
}

export async function saveSiteBannerConfig(visible: boolean, html: string, color: string) {
  const notificationStore = useNotificationStore();
  const bannerStore = useBannerStore();

  try {
    await $fetch("/api/config/siteBanner", {
      method: "PUT",
      body: {
        visible,
        html,
        color,
      },
    });

    bannerStore.visible = visible;
    bannerStore.html = html;
    bannerStore.color = color;

    notificationStore.addNotification({
      type: "success",
      message: "Site banner settings saved",
    });
  } catch (error) {
    console.error("Failed to save site banner config", error);
    notificationStore.addNotification({
      type: "error",
      message: "Failed to save site banner settings",
    });
  }
}
