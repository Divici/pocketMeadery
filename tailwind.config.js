/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lightCream: "#FAF5E4",
        honeyRed: "#8B0000",
        honeyGold: "#FFD700",
        darkCream: "#4B3A39",
        darkGold: "#FFC300",
        secondaryGray: "#9CA3AF",
        alertRed: "#FF6347",
      },
    },
  },
  plugins: [],
  presets: [require("nativewind/preset")],
};
