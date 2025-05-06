module.exports = {
    env: {
        node: true,
        es2022: true,
    },
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'no-console': 'off',
        'no-debugger': 'warn',
        'indent': ['error', 2],
        'quotes': ['error', 'single', { avoidEscape: true }],
        'semi': ['error', 'always'],
    },
    overrides: [
        {
            files: ['tests/**/*.js'],
            env: {
                node: true,
                jest: true,
            },
        },
    ],
}; 