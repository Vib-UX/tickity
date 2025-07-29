// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Disable Reanimated strict mode
config.resolver.platforms = ["ios", "android", "native", "web"];
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
  "react-native",
  "browser",
  "require",
];
config.resolver.unstable_conditionNames = [
  "react-native",
  "browser",
  "require",
];

config.resolver.assetExts = [
  "db",
  "mp3",
  "ttf",
  "obj",
  "mtl",
  "glb",
  "gltf",
  "png",
  "jpg",
  "webp",
];

module.exports = config;
