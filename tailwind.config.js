/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sunlight mode palette (slate-50 base, slate-900 text, highly readable on bright platform)
        sunlight: {
          bg: "#f8fafc",     // slate-50
          text: "#0f172a",   // slate-900
          card: "#ffffff",
          border: "#cbd5e1", // slate-300
        },
      },
    },
  },
  plugins: [],
}
