/** @type {import('tailwindcss').Config} */
export default {
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
        ink: "#111111",
        paper: "#FAFAFA",
        banana: "#FFE56D",
        sky: "#5BC0EB",
        lime: "#9BC53D",
      },
      maxWidth: {
        '4xl': '60rem'
      },
      boxShadow: {
        nb: '3px 3px 0 #111',
        nb2: '2px 2px 0 #111',
      },
      borderRadius: {
        nb: '0.75rem'
      }
    },
  },
  plugins: [],
}
