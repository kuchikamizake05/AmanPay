import "@testing-library/jest-dom/vitest";

// Fix for JSDOM / Node.js Uint8Array prototype mismatch in noble-ed25519
const NodeUint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
globalThis.Uint8Array = NodeUint8Array;
