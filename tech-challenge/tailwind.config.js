const colors = require('./src/theme/colors');
const spacing = require('./src/theme/spacing');
const typography = require('./src/theme/typography');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      spacing,
      fontSize: typography.fontSize,
    },
  },
  plugins: [],
};
