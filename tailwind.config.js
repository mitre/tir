const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        status: {
          open: "#ef4444", // red-500
          notafinding: "#4ade80", // green-400
          not_reviewed: "#f59e0b", // amber-500
          not_applicable: "#38bdf8", // sky-500
          default: "#1f2937", // gray-800
        },
      },
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [
    // ...
    require("@tailwindcss/forms"),
  ],

  // ...
};
