/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        text: {
          primary: "#2d3748",
          secondary: "#4a5568",
          light: "rgba(255,255,255,0.9)",
          muted: "rgba(255,255,255,0.6)",
        },
      },
      backgroundImage: {
        "gradient-body": "linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #667eea 100%)",
        "gradient-primary": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "gradient-accent": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        "gradient-danger": "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
        "gradient-success": "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.1)",
        md: "0 8px 30px rgba(0,0,0,0.12)",
        lg: "0 20px 60px rgba(0,0,0,0.15)",
        xl: "0 30px 80px rgba(0,0,0,0.2)",
      },
      borderRadius: {
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0) rotate(0)" },
          "33%": { transform: "translateY(-30px) rotate(120deg)" },
          "66%": { transform: "translateY(30px) rotate(240deg)" },
        },
        slideInUp: {
          from: { opacity: 0, transform: "translateY(60px) scale(0.95)" },
          to: { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        float: "float 20s ease-in-out infinite",
        slideInUp: "slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        spin: "spin 1s linear infinite",
      },
    },
  },
  plugins: [],
};