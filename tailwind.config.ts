/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: {
                    100: '#feecd9',
                    200: '#fddab0',
                    300: '#fcbf80',
                    400: '#fa9e4d',
                    500: '#F77518', // Brand Color
                    600: '#cc5d10',
                    700: '#99430a',
                    800: '#662c05',
                    900: '#331502',
                },
                secondary: {
                    50: '#f8fafc',  // General background
                    100: '#f1f5f9', // Inputs/cards background
                    200: '#e2e8f0', // borders
                    300: '#cbd5e1', // inactive icons
                    400: '#94a3b8',
                    500: '#64748b', // secondary text
                    600: '#475569',
                    700: '#334155',
                    800: '#1E293B',
                    900: '#0f172a', // primary text
                }
            }
        },
    },
    plugins: [],
}