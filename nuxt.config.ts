// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "nuxt-headlessui",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@nuxtjs/color-mode",
  ],
  runtimeConfig: {
    database_host: process.env.DATABASE_HOST,
    database_port: process.env.DATABASE_PORT,
    database_user: process.env.DATABASE_USER,
    database_password: process.env.DATABASE_PASSWORD,
    database_name: process.env.DATABASE_NAME,
    temp_folder: process.env.TEMP_FOLDER || "./tmp",
    jwt_key: process.env.JWT_KEY,
    usesqlite: process.env.SQLITE,
  },
  telemetry: false,
  alias: {
    //pinia: "/node_modules/@pinia/nuxt/node_modules/pinia/dist/pinia.mjs"
  },
  nitro: {
    experimental: { openAPI: true },
  },
  colorMode: {
    classSuffix: "",
    preference: "system", // default value of $colorMode.preference
    fallback: "dark", // fallback value if not system preference found
  },
});
