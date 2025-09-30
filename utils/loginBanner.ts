import { useNotificationStore } from "~/stores/NotificationStore";

export async function loadLoginBannerConfig(
  enable: Ref<boolean>,
  mode: Ref<"modal" | "checkbox">,
  html: Ref<string>,
  title: Ref<string>,
) {
  const notificationStore = useNotificationStore();

  try {
    const { data } = await useFetch<{
      mode: string;
      title: string;
      html: string;
    }>("/api/config/loginBanner", { method: "GET" });

    if (data.value) {
      enable.value = data.value.mode !== "none";
      mode.value = data.value.mode === "checkbox" ? "checkbox" : "modal";
      html.value = data.value.html || "";
      title.value = data.value.title || "";
    }
  } catch (error) {
    console.error("Failed to load login banner config", error);
    notificationStore.addNotification({
      type: "error",
      message: "Failed to load login banner settings",
    });
  }
}

export async function saveLoginBannerConfig(
  enabled: boolean,
  mode: "modal" | "checkbox",
  html: string,
  title: string,
) {
  const notificationStore = useNotificationStore();

  const storedMode = enabled ? mode : "none";

  try {
    await $fetch("/api/config/loginBanner", {
      method: "PUT",
      body: {
        mode: storedMode,
        html,
        title,
      },
    });

    notificationStore.addNotification({
      type: "success",
      message: "Login banner settings saved",
    });
  } catch (error) {
    console.error("Failed to save login banner config", error);
    notificationStore.addNotification({
      type: "error",
      message: "Failed to save login banner settings",
    });
  }
}
