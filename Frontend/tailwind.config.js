/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#2E7D32", // Green
                    light: "#A5D6A7",   // Light Green
                }
            }
        },
    },
    plugins: [],
}
