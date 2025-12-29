import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["src/app/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script", // Legacy globals-based code
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        crypto: "readonly",
        Blob: "readonly",
        FileReader: "readonly",
        Date: "readonly",
        Object: "readonly",
        Array: "readonly",
        Math: "readonly",
        Number: "readonly",
        String: "readonly",
        Infinity: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        addEventListener: "readonly",
        Event: "readonly",

        // Libraries loaded via script tags
        $: "readonly",
        jQuery: "readonly",
        Konva: "readonly",
        jspdf: "readonly",
        saveAs: "readonly",
        SunCalc: "readonly",

        // App globals (defined in other files, used across files)
        config: "writable",
        Controller: "writable",
        View: "writable",
        Model: "writable",
        Squadron: "writable",
        Cycle: "writable",
        Line: "writable",
        Sortie: "writable",
        Event: "writable",

        // Utility functions defined in utils.js
        uuidv4: "readonly",
        getCircularReplacer: "readonly",
        getCycle: "readonly",
        getSquadron: "readonly",
        assignEvents: "readonly",
        estimateLocation: "readonly",
        prefixPlus: "readonly",
        refresh: "writable",

        // Modal functions
        openModal: "readonly",
        closeModal: "readonly",

        // Global app instance
        app: "writable",
        airplan: "writable",
      },
    },
    rules: {
      // Relaxed rules for legacy code
      "no-unused-vars": ["warn", {
        "vars": "all",
        "args": "none",
        "ignoreRestSiblings": true,
        "varsIgnorePattern": "^_"
      }],
      "no-undef": "error",
      "no-redeclare": "warn",
      "no-prototype-builtins": "off", // Used intentionally
      "no-empty": "warn",
      "no-constant-condition": "warn",
      "no-useless-escape": "warn",

      // Style rules (warnings only for legacy code)
      "semi": ["warn", "never"],
      "quotes": "off",
      "indent": "off",
      "comma-dangle": "off",
      "no-trailing-spaces": "off",
    },
  },
  {
    // Ignore patterns
    ignores: [
      "dist/**",
      "node_modules/**",
      "src/libraries/**",
      "public/**",
      "scripts/**",
    ],
  },
];
