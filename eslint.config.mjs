import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


/** @type {import('eslint').Linter.Config[]} */
export default [
    {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
    {languageOptions: { globals: globals.browser }},
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        rules: {
            eqeqeq: "off",
            "no-unused-vars": "off",
            "prefer-const": ["error", { ignoreReadBeforeAssign: true }],
        },
    },
    {
        ignores: [".node_modules/*", "dist/*", "scripts/*"]
    },
];