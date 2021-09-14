const colors = require('tailwindcss/colors');
const plugin = require('tailwindcss/plugin');

module.exports = {
    plugins: [],
    purge: ['./**/*.html', './**/*.js', './**/*.ts', './**/*.tsx', './**/*.jsx'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        screens: {
            sm: '400px',
            md: '661px',
            lg: '768px',
            xl: '1280px',
            '2xl': '1536px'
        },
        extend: {
            colors: {
                persian_blue: {
                    50: '#d8e7e8',
                    100: '#b6cfd4',
                    200: '#95b8c1',
                    300: '#76a0af',
                    400: '#57899e',
                    500: '#38728e',
                    600: '#165b7b',
                    700: '#004563',
                    800: '#002f4b',
                    900: '#001a34'
                },
                apple_green: {
                    50: '#e8e4d9',
                    100: '#d2cab9',
                    200: '#bdb09a',
                    300: '#a9977d',
                    400: '#967e60',
                    500: '#846646',
                    600: '#6f4f2f',
                    700: '#573a1c',
                    800: '#412606',
                    900: '#2d1200'
                },
                gray: {
                    50: '#f9fafb',
                    100: '#f0f1f3',
                    200: '#d9dbdf',
                    300: '#b7bbc2',
                    400: '#8f959f',
                    500: '#6e7582',
                    600: '#555e6e',
                    700: '#3e4859',
                    800: '#283242',
                    900: '#131f30'
                },
                green: {
                    50: '#f3faf7',
                    100: '#daf5eb',
                    200: '#b6e5d3',
                    300: '#85c8ac',
                    400: '#3ca773',
                    500: '#108835',
                    600: '#016d00',
                    700: '#005301',
                    800: '#003906',
                    900: '#072408'
                },
                royalblue: {
                    50: '#f4faff',
                    100: '#e2f0ff',
                    200: '#c4defe',
                    300: '#95bbee',
                    400: '#5e95e4',
                    500: '#2173e6',
                    600: '#1358cc',
                    700: '#1242a2',
                    800: '#1a2e6c',
                    900: '#161d38'
                }
            }
        },
        variants: {
            extend: {}
        }
    }
};
