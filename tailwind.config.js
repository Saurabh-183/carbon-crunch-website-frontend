/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ember: {
          50: "#fff3e2",
          100: "#ffd8a9",
          200: "#f9a43b",
          300: "#f28f1f",
          400: "#e57915",
          500: "#ce5f12",
          600: "#9b450f",
        },
        bark: {
          900: "#22180f",
          800: "#2d2114",
          700: "#3a2a17",
        },
        fog: "#f2f2f2",
      },
      fontFamily: {
        display: ["Geist", "sans-serif"],
        body: ["Geist", "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 45px rgba(19, 16, 12, 0.12)",
      },
    },
  },
  plugins: [],
};
