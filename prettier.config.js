/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
  plugins: ["prettier-plugin-tailwindcss"],
  tabWidth: 4,
  useTabs: false, // Ensure spaces are used for indentation (or true for actual tabs)
};
