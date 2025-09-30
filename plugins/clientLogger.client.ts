import { defineNuxtPlugin } from "#app";
import { clientLogger } from "~/utils/clientLogger";

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();
  const debug = runtimeConfig.public.tir_debug === true;

  clientLogger.setDebug(debug);
});
