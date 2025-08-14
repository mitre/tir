// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },

  modules: [
    "@nuxt/ui",
    "@nuxtjs/tailwindcss",
    "nuxt-headlessui",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate",
    "@nuxtjs/color-mode",
  ],

  runtimeConfig: {
    base_url: process.env.BASE_URL,
    database_host: process.env.DATABASE_HOST,
    database_port: process.env.DATABASE_PORT,
    database_user: process.env.DATABASE_USER,
    database_password: process.env.DATABASE_PASSWORD,
    database_name: process.env.DATABASE_NAME,
    temp_folder: process.env.TEMP_FOLDER || "./tmp",
    jwt_key: process.env.JWT_KEY,
    secret_key: process.env.SECRET_KEY,
    oidc_secret: process.env.OIDC_SECRET,
    oidc_callback: process.env.OIDC_CALLBACK,
    oidc_url: process.env.OIDC_URL,
    usesqlite: process.env.SQLITE,
    ldap_host: process.env.LDAP_HOST,
    ldap_port: process.env.LDAP_PORT || "389",
    ldap_binddn: process.env.LDAP_BINDDN,
    ldap_password: process.env.LDAP_PASSWORD,
    ldap_searchbase: process.env.LDAP_SEARCHBASE,
    ldap_searchfilter: process.env.LDAP_SEARCHFILTER || "sAMAccountName={{username}}",
    ldap_namefield: process.env.LDAP_NAMEFIELD || "name",
    ldap_mailfield: process.env.LDAP_MAILFIELD || "mail",
    ldap_ssl: process.env.LDAP_SSL || "false",
    ldap_ssl_insecure: process.env.LDAP_SSL_INSECURE || "false",
    ldap_ssl_ca: process.env.LDAP_SSL_CA,
    public: {
      ldap_enabled: process.env.LDAP_ENABLED || "false",
    },
  },

  telemetry: false,

  alias: {
    // pinia: "/node_modules/@pinia/nuxt/node_modules/pinia/dist/pinia.mjs"
  },

  nitro: {
    experimental: { openAPI: true },
    esbuild: {
      options: {
        target: "esnext",
      },
    },
  },

  colorMode: {
    classSuffix: "",
    preference: "system", // default value of $colorMode.preference
    fallback: "dark", // fallback value if not system preference found
  },
  vite: {
    build: {
      target: "ESNext",
    },
  },
  compatibilityDate: "2024-08-18",
});
