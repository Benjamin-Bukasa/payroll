/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        poppins:["Poppins","sans-serif"],
        sans: ["Inter", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      screens:{
        "xs":"360px",
        "sm": "640px",
        "md": "768px",
        "lg": "1024px",
        "xlg": "1084px",
        "xl": "1280px",
        "2xl": "1536px",
      },
      backgroundImage: {
        "hero-pattern": "url('/images/loginImg.jpg')",
      },
      
    },
  },
  plugins: [],
}