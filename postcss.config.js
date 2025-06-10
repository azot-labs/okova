export default {
  purge: [
    './entrypoints/popup/index.html',
    './entrypoints/popup/**/*.{vue,js,ts,jsx,tsx}',
  ],
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
