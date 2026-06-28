// Babel configuration for the Shelfed Expo app.
// - `babel-preset-expo` handles JSX, TypeScript, expo-router and the `@/*` path alias.
// - `react-native-worklets/plugin` powers Reanimated 4 worklets and MUST be the
//   last plugin in the list.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  };
};
