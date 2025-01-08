import globals from 'globals'
import js from '@eslint/js';
import pluginN from 'eslint-plugin-n';
import pluginImport from 'eslint-plugin-import';
import pluginPromise from 'eslint-plugin-promise';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: globals.node,
      sourceType: 'module',
    },
    plugins: {
      js,
      n: pluginN,
      import: pluginImport,
      promise: pluginPromise,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginN.configs['flat/recommended'].rules,
      ...pluginImport.flatConfigs.recommended.rules,
      ...pluginPromise.configs['flat/recommended'].rules,
    },
  },
];