const NOT_AUTHENTICATED = 401;

export const useAlertsStore = defineStore("alerts", {
  state: () => ({
    alerts: [],
    pollingInterval: null,
    userId: null,
  }),

  actions: {
    refresh() {
      if (this.userId) this.fetchAlerts(this.userId);
    },

    async fetchAlerts(userId) {
      if (!userId) {
        console.warn("fetchAlerts called with no userId. Skipping request.");
        return;
      }

      try {
        console.log(`Fetching alerts for user: ${userId}`);
        this.alerts = await $fetch(`/api/config/alert`, {
          method: "GET",
          query: { userId },
          credentials: "include",
        });
      } catch (error) {
        const err = error as { statusCode?: number; response?: { status?: number } };
        const status = err?.statusCode ?? err?.response?.status;
        if (status === NOT_AUTHENTICATED) {
          this.stopPolling();
          navigateTo("/");
          return;
        }
        console.error("Error fetching alerts:", error);
      }
    },

    startPolling(userId) {
      if (!userId) {
        console.warn("startPolling called with no userId. Skipping polling.");
        return;
      }

      // Prevent multiple intervals
      if (this.pollingInterval) {
        console.warn("Polling already active. Skipping new interval.");
        return;
      }

      console.log("Starting alert polling...");
      this.userId = userId;
      this.fetchAlerts(userId); // Initial fetch

      this.pollingInterval = setInterval(() => {
        this.fetchAlerts(userId);
      }, 60000); // Poll every 60 seconds
    },

    stopPolling() {
      if (this.pollingInterval) {
        console.log("Stopping alert polling...");
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    },
  },
});
