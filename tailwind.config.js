const colors = require('tailwindcss/colors');

module.exports = {
  purge: ['./src/**/*.tsx'],
  darkMode: 'class',
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: colors.white,
      gray: colors.gray,
      green: colors.emerald,
      red: colors.red,
      blue: colors.lightBlue,
      purple: colors.purple,
      pink: colors.pink,
      yellow: colors.amber,
    },
  },
  variants: {},
  plugins: [],
};
