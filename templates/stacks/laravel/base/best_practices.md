---
globs:
    [
        '<root>/app/**/*.php',
        '<root>/bootstrap/**/*.php',
        '<root>/routes/**/*.php',
        '<root>/database/migrations/**/*.php',
        '<root>/config/**/*.php',
        '<root>/tests/**/*.php',
    ]
---

# Laravel code conventions

<!-- This file contains base Laravel conventions that apply to all supported versions -->
<!-- Version-specific rules are in the respective version directories -->

## Architecture

-   Follow **SOLID** principles.
-   Adopt the **Repository + Service** pattern:
    -   `App\Repositories\*` encapsulate data access.
    -   `App\Services\*` hold business logic.
    -   Controllers remain thin (HTTP only).

## File placement (default structure)

app/
├── Domain/ # optional, but encouraged for DDD
├── Services/  
├── Repositories/
├── Http/  
│ ├── Controllers/
│ └── Requests/  
└── Providers/

```

## Models

-   One model per table, extend `Illuminate\Database\Eloquent\Model`.
-   Use **casts**, **accessors** and **mutators** instead of raw attribute logic.
-   Prefer `enum` casts (Laravel 9+) for status fields.

## Testing

-   Write all new tests with **Pest PHP** (fallback PHPUnit).
-   Place unit tests in `tests/Unit/`, feature tests in `tests/Feature/`.
-   Run `php artisan test --parallel` before finishing any task.

## Naming

-   Controllers end with `Controller`, Services with `Service`, Repositories with `Repository`.
-   Route names use `kebab-case`: `users.store`, `orders.cancel`.

## Static analysis / CI

-   Run **PHP‑Stan** level 8 (or Larastan) locally; fix violations before commit.
-   Commit must pass CI pipeline: `composer validate && php-cs-fixer fix --dry-run`.

---

> Note: This is the base Laravel convention file. Version-specific rules will be loaded automatically based on your Laravel version.
```
