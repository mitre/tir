import { defineStore } from "pinia";

export type NotificationType = "success" | "error";

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  title?: string;
}

export const useNotificationStore = defineStore("NotificationStore", {
  state: () => ({
    timeout: 3000,
    queue: [] as Notification[],
    timeoutHandle: null as ReturnType<typeof setTimeout> | null,
  }),
  actions: {
    async loadTimeout() {
      const { data } = await useFetch<{ timeout: number }>("/api/config/notificationTimeout");

      if (data.value && typeof data.value.timeout === "number") {
        this.timeout = data.value.timeout;
      }
    },
    async setTimeout(newTimeout: number) {
      await $fetch("/api/config/notificationTimeout", {
        method: "PUT",
        body: { timeout: newTimeout },
      });
      this.timeout = newTimeout;
    },
    addNotification(notification: { type: NotificationType; message: string; title?: string }) {
      const note: Notification = {
        id: Date.now(),
        ...notification,
      };
      console.log("Adding notification to queue:", note);
      this.queue.push(note);

      if (this.queue.length === 1) {
        this._scheduleNextRemoval();
      }
    },
    removeNotification() {
      this.queue.shift();
      this._clearScheduledTimeout();
      if (this.queue.length > 0) {
        this._scheduleNextRemoval();
      }
    },
    removeNotificationById(id: number) {
      const idx = this.queue.findIndex((n) => n.id === id);
      if (idx !== -1) {
        this.queue.splice(idx, 1);
        this._clearScheduledTimeout();
        if (this.queue.length > 0) {
          this._scheduleNextRemoval();
        }
      }
    },
    _scheduleNextRemoval() {
      this._clearScheduledTimeout();
      this.timeoutHandle = setTimeout(() => {
        this.removeNotification();
      }, this.timeout);
    },
    _clearScheduledTimeout() {
      if (this.timeoutHandle) {
        clearTimeout(this.timeoutHandle);
        this.timeoutHandle = null;
      }
    },
  },
});
