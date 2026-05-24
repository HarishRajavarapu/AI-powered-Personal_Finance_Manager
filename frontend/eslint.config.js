import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2024,
      globals: {
        document: "readonly",
        import: "readonly",
        Blob: "readonly",
        localStorage: "readonly",
        URL: "readonly",
        window: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: "module",
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/prop-types": "off",
      "react/jsx-no-target-blank": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-refresh/only-export-components": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
