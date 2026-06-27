import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Virtualenv-uri Python (pipeline PDF/PPTX) — NU sunt cod al aplicației.
    ".venv/**",
    ".venv-pptx/**",
  ]),
  {
    // Regulile React Compiler (eslint-plugin-react-hooks v6) sunt advisory:
    // aplicația nu folosește React Compiler, iar pattern-urile flag-uite
    // (setState la montare, next-themes `mounted`, închiderea drawer-ului la
    // navigare) sunt corecte funcțional. Le ținem ca avertismente, nu erori.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    },
  },
]);

export default eslintConfig;
