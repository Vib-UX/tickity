const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add support for 3D model files
config.resolver.assetExts.push(
  "obj",
  "mtl",
  "dae",
  "scn",
  "gltf",
  "glb",
  "bin"
);

// Add support for additional texture formats if needed
config.resolver.assetExts.push("webp");

module.exports = config;
