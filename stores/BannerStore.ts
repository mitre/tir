import { defineStore } from "pinia";
import { loadSiteBannerConfig, saveSiteBannerConfig } from "~/utils/siteBanner";

export const useBannerStore = defineStore("banner", {
  state: () => ({
    visible: false,
    html: "",
    color: "#1F5BA6",
    initialized: false,
  }),
  actions: {
    async load() {
      if (this.initialized) return;

      const visible = ref(this.visible);
      const html = ref(this.html);
      const color = ref(this.color);

      await loadSiteBannerConfig(visible, html, color);

      this.visible = visible.value;
      this.html = html.value;
      this.color = color.value;

      this.initialized = true;
    },

    async save({ visible, html, color }: { visible: boolean; html: string; color: string }) {
      await saveSiteBannerConfig(visible, html, color);

      this.visible = visible;
      this.html = html;
      this.color = color;
    },
  },
});
