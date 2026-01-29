import { babel } from "@rollup/plugin-babel";

const config = {
  input: "src/index.js",
  output: [
    {
      dir: "es",
      format: "es",
      preserveModules: true,
    },
    {
      dir: "lib",
      format: "cjs",
      preserveModules: true,
      exports: "auto",
    },
  ],
  external: [
    "react",
    "prop-types",
    /^@material-ui/,
    /^mirador/,
    /^lodash/,
  ],
  plugins: [babel({ babelHelpers: "bundled" })],
};

export default config;
