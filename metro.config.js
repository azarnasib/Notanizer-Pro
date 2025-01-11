const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    resolver: {
        // Uncomment and adjust this section if you have symlinks in your project
        // watchFolders: [__dirname], // Add this to watch symlinks in your project if any.
        blockList: [
            // Make sure LogBox files or any others you may be having issues with are not blocked.
            /node_modules\/.*\/node_modules\/react-native\/.*/,
        ],
    },
    transformer: {
        // Optional: Add this to avoid issues related to minification or caching
        minifierConfig: {
            mangle: false, // Disable mangling if necessary for debugging
        },
    },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

