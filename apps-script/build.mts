import { build } from "esbuild";
import { glob } from "glob";

const entryPoints = await glob("src/**/*.ts");

await build({
  entryPoints,
  bundle: true,
  outdir: "dist",
  format: "esm",
  globalName: "globalThis",
  target: "es6",
});