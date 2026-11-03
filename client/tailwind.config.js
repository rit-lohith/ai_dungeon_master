/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        gameBg: "#1a1a24",
        panelBg: "#2d2d3d",
        accent: "#d4af37",
        health: "#e74c3c",
        xp: "#3498db"
      },
      fontFamily: {
        fantasy: ['"Cinzel"', "serif"],
        pixel: ['"Press Start 2P"', "cursive"]
      }
    },
  },
  plugins: [],
}
