/** @type {import('tailwindcss').Config} */
module.exports = {
    theme: {
      extend: {
        colors: {
          brand: {
            50:  "#f2fbff",
            100: "#e6f6ff",
            500: "#0ea5e9",
            600: "#0284c7",
            900: "#0b3b56"
          },
          fg:   "rgb(24 24 27)",
          muted:"rgb(107 114 128)"
        },
        borderRadius: {
          xl: "14px"
        }
      }
    },
    plugins: []
  };
  