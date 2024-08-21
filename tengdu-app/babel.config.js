process.env.TAMAGUI_TARGET = "native"; // Don't forget to specify your TAMAGUI_TARGET here

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "@tamagui/babel-plugin",
        {
          components: ["tamagui"],
          config: "./tamagui.config.ts",
          logTimings: true
        }
      ],
      "react-native-reanimated/plugin",
      [
        "module-resolver",
        {
          alias: {
            components: "./components",
            providers: "./providers",
            hooks: "./hooks",
            db: "./db",
            models: "./models",
            pages: "./pages",
            storage: "./storage",
            utils: "./utils",
            __mocks__: "./__mocks__"
          }
        }
      ]
    ]
  };
};
