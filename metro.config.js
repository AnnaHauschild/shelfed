// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// --- Web support for expo-sqlite ---
// On web, expo-sqlite uses the `wa-sqlite` WebAssembly build, so Metro must
// treat `.wasm` files as resolvable assets (otherwise bundling fails with
// "Unable to resolve module ./wa-sqlite/wa-sqlite.wasm").
config.resolver.assetExts.push('wasm');

// wa-sqlite relies on SharedArrayBuffer, which browsers only expose to
// cross-origin-isolated pages. These headers enable that during local dev.
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    return middleware(req, res, next);
  };
};

module.exports = config;
