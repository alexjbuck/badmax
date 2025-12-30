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
        alert: "readonly",
        confirm: "readonly",

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
        uuidv4: "writable",
        getCircularReplacer: "writable",
        getCycle: "writable",
        getSquadron: "writable",
        assignEvents: "writable",
        estimateLocation: "writable",
        prefixPlus: "writable",
        refresh: "writable",
        hours: "writable",

        // Modal functions
        openModal: "writable",
        closeModal: "writable",

        // Global app instance
        app: "writable",
        airplan: "writable",

        // Graphics/rendering globals
        g: "writable",
        sceneWidth: "writable",
        sceneHeight: "writable",
        fitWidthToChildren: "writable",
        fitHeightToChildren: "writable",
        fitSizeToChildren: "writable",
        fitStageIntoParentContainer: "writable",
        drawBoundingBox: "writable",
        time2pixels: "writable",
        HighlightBox: "writable",
        menu: "writable",
        tabular: "writable",
        highlightInvalidInput: "writable",
        blankAirplan: "writable",
        BlankAirplan: "writable",
        offset: "writable",
        id: "writable",

        // jQuery cached elements (used in tabular.js)
        $squadron: "writable",
        $start: "writable",
        $startCondition: "writable",
        $end: "writable",
        $endCondition: "writable",
        $note: "writable",
      },
    },
    rules: {
      // Relaxed rules for legacy code
      "no-unused-vars": ["warn", {
        "vars": "all",
        "args": "none",
        "ignoreRestSiblings": true,
        "varsIgnorePattern": "^_|^(Controller|View|Model|Squadron|Cycle|Line|Sortie|Event)$"
      }],
      "no-undef": "error",
      "no-redeclare": "off", // Legacy code redefines globals intentionally
      "no-prototype-builtins": "off",
      "no-empty": "warn",
      "no-constant-condition": "warn",
      "no-useless-escape": "warn",
      "getter-return": "off", // Legacy getters don't always return
      "no-setter-return": "off", // Legacy setters sometimes return
      "no-global-assign": "off", // Legacy code assigns to globals

      // Style rules - all off for legacy code
      "semi": "off",
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
