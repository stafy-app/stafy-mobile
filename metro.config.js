// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

// SVG support
config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo")
};

config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"]
};

// Uniwind support
module.exports = withUniwindConfig(config, {
    // relative path to your global.css file (from previous step)
    cssEntryFile: './global.css',
    // (optional) path where we gonna auto-generate typings
    // defaults to project's root
    dtsFile: './src/uniwind-types.d.ts'
});
