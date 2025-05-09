/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        space: {
          50: "#F5F6FF",
          100: "#E8EAFF",
          200: "#C0C6FF",
          300: "#939BFF",
          400: "#6670FF",
          500: "#3940DE",
          600: "#2A2FA8",
          700: "#1C1F72",
          800: "#0E103C",
          900: "#050619",
        },
        cosmos: {
          50: "#FCF7FF",
          100: "#F3E6FF",
          200: "#E5CCFF",
          300: "#D2A3FF",
          400: "#B366FF",
          500: "#9933FF",
          600: "#7A29CC",
          700: "#5B1F99",
          800: "#3D1466",
          900: "#1E0A33",
        },
        nebula: {
          50: "#FFF5FD",
          100: "#FFE6F9",
          200: "#FFB3ED",
          300: "#FF80E1",
          400: "#FF4DD5",
          500: "#FF1AC9",
          600: "#CC14A1",
          700: "#990F79",
          800: "#660A50",
          900: "#330528",
        },
      },
      backgroundImage: {
        "space-gradient": "linear-gradient(to bottom, #050619, #1E0A33)",
        "star-pattern":
          "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
