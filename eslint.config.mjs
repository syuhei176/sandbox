import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig([
  {
    ignores: [
      ".next/**",
      ".wrangler/**",
      "out/**",
      "build/**",
      "dist/**",
      "next-env.d.ts",
      "node_modules/**",
    ],
  },
]);

export default eslintConfig;
