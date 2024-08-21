import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

/**
 * Add here external dependencies that actually you use.
 */
const externals = [
  "firebase-functions",
  "firebase-admin",
  "stream-chat",
  /node_modules/,
];

export default {
  input: "src/index.ts",
  external: externals,
  plugins: [
    typescript(),
    nodeResolve(),
    commonjs({
      include: /node_modules/,
      requireReturnsDefault: "auto", // <---- this solves default issue
    }),
  ],
  onwarn: () => {
    return;
  },
  output: [
    {
      file: "lib/index.js",
      format: "es",
      sourcemap: false,
    },
  ],
};
