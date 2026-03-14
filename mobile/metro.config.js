const { getDefaultConfig } = require('expo/metro-config');

// Since Expo SDK 52+, Metro is automatically configured for monorepos
// (npm/yarn/pnpm/bun workspaces). No manual watchFolders or
// nodeModulesPaths needed — getDefaultConfig handles it.
const config = getDefaultConfig(__dirname);

module.exports = config;
