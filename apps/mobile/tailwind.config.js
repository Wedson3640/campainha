/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#2563EB",
        ink: "#0F172A",
        muted: "#64748B",
        surface: "#F8FAFC",
        success: "#16A34A",
        alert: "#F97316",
        danger: "#DC2626"
      }
    }
  },
  plugins: []
};
