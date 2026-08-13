// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      'quotes': ['error', 'single'],
      'semi': [
        'error',
        'never'
      ],
      'linebreak-style': [
        'error',
        'unix'
      ],
      'indent': [
        'error',
        2
      ],
      'vue/html-indent': [
        'warn',
        2
      ],
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-components': 'warn',
      'vue/order-in-components': 'error',
      'curly': ['error', 'all'],
      'object-curly-spacing': [
        'error',
        'always'
      ],
      'eqeqeq': ['error', 'always'],
      'space-before-blocks': ['error', 'always'],
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'always',
          asyncArrow: 'always'
        }
      ],
      'camelcase': 'off',
      'no-debugger': 'off',
      'no-unused-vars': 'off',
      'no-prototype-builtins': 'off',
      'no-new': 'off',
      'vue/html-closing-bracket-spacing': [
        'error',
        {
          startTag: 'never',
          endTag: 'never',
          selfClosingTag: 'never'
        }
      ],
      'vue/singleline-html-element-content-newline': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-prop-types': 'off',
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: 1,
          multiline: 1
        }
      ],
      'vue/no-v-html': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'keyword-spacing': ['error', { after: true }],
      'brace-style': ['error', '1tbs'],
      'space-infix-ops': 'error'
    }
  }
)
