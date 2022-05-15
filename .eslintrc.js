module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import-helpers'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': 'warn',
    '@typescript-eslint/consistent-type-definitions': [
      'warn',
      'interface'
    ],
    'padding-line-between-statements': [
      'warn',
      {
        'blankLine': 'always',
        'prev': '*',
        'next': 'return'
      },
      {
        'blankLine': 'always',
        'prev': '*',
        'next': 'throw'
      },
      {
        'blankLine': 'always',
        'prev': [
          'const',
          'let',
          'var'
        ],
        'next': '*'
      },
      {
        'blankLine': 'always',
        'prev': '*',
        'next': [
          'const',
          'let',
          'var'
        ]
      },
      {
        'blankLine': 'any',
        'prev': [
          'const',
          'let',
          'var'
        ],
        'next': [
          'const',
          'let',
          'var'
        ]
      }
    ],
    'lines-between-class-members': ['error', 'always'],
    "import-helpers/order-imports": [
      "warn",
      {
        "newlinesBetween": "always",
        "groups": [
          "/^@nestjs/",
          "/@/",
          "/!/",
          "module",
          [
            "parent",
            "sibling",
            "index"
          ]
        ],
        "alphabetize": {
          "order": "asc",
          "ignoreCase": true
        }
      }
    ],
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          ".*"
        ]
      }
    ],
  },
};
