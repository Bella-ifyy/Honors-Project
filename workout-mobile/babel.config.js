module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@assets': './assets',
            '@components': './src/components',
            '@views': './src/views',
            '@layouts': './src/layouts',
            '@hooks': './src/hooks',
            '@navigator': './src/navigator',
            '@utils': './src/utils',
            '@theme': './src/theme',
            '@modules': './src/modules',
            '@context': './src/context',
          },
        },
      ],
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          blocklist: null,
          allowlist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
