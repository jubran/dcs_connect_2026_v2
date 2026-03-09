import pluginImport from "eslint-plugin-import";

export default [
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],

    plugins: {
      import: pluginImport,
    },

    settings: {
      "import/resolver": {
        alias: {
          map: [["@", "./src"]],
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },

    rules: {
      "import/no-unresolved": "error",
      "import/no-unresolved": "warn",
    },
  },
];
