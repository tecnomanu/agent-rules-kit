---
description: Service provider guidelines for Laravel 12
globs: <root>/bootstrap/app.php
alwaysApply: false
---

# Service Providers – Laravel 12

From **Laravel 12** onward, providers are registered in
`bootstrap/app.php` through `Application::configure()` instead of the
legacy `config/app.php` array.

```php
return Application::configure()
    ->withProviders([
        App\Providers\AuthServiceProvider::class,
        // …
    ])
    ->create();
```
