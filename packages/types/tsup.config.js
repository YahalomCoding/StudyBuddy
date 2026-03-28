import config from "@studybuddy/tsup-config";
import { defineConfig } from "tsup";

export default defineConfig({
  ...config,
  dts: true,
  entry: ["src/index.ts"],
});
