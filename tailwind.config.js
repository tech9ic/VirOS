/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./client/src/**/*.{js,jsx,ts,tsx}",
    "./client/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0078d7",
        secondary: "#f0f0f0",
        success: "#00a400",
        error: "#e81123",
        warning: "#ff8c00",
      },
      boxShadow: {
        window: "0 0 0 1px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.15)",
      },
      fontFamily: {
        system: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      backgroundImage: {
        'desktop-wallpaper': "url('/wallpapers/default.jpg')",
      },
    },
  },
  plugins: [],
};