---
description: Testing strategies for Node.js
globs: <root>/test/**/*.{js,ts},<root>/tests/**/*.{js,ts}
alwaysApply: false
---

# Node.js Testing

Use dedicated test folders such as `test/` or `tests/`. Node.js ships with a built-in test runner via `node:test`, but frameworks like **Jest** or **Mocha** offer additional features such as mocks and coverage reports.

## Example with node:test

```javascript
import test from 'node:test';
import assert from 'node:assert';

test('sum adds numbers', () => {
        assert.equal(1 + 2, 3);
});
```

Run tests with `node --test` and generate coverage with `--test --coverage`.
