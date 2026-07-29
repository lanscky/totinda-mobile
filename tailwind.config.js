/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#1B81CA",
          DEFAULT: "#044EB8",
          dark: "#033E91",
        },
        secondary: "#1D2633",
        surface: "#f9f9f9",
      },
      fontFamily: {
        "maven-reg": ["MavenPro-Regular"],
        "maven-med": ["MavenPro-Medium"],
        "maven-bold": ["MavenPro-Bold"],
        "maven-semi": ["MavenPro-SemiBold"],
        "noto-reg": ["NotoSans-Regular"],
        "noto-bold": ["NotoSans-Bold"],
      },
    },
  },
  plugins: [],
};