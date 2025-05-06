# Routes in Laravel 12

Laravel 12 introduces a new routing API with a cleaner and more expressive syntax:

## New Route Definitions

```php
// routes/web.php
use function Laravel\Http\{get, post, put, delete, middleware};

get('/', fn () => view('welcome'));

// Controller routes
get('/users', [\App\Http\Controllers\UserController::class, 'index']);

// Route groups
middleware('auth', function () {
    get('/dashboard', fn () => view('dashboard'));

    // Nested resource routes
    post('/projects/{project}/tasks', [\App\Http\Controllers\TaskController::class, 'store']);
});

// Named routes
get('/profile', fn () => view('profile'))
    ->name('profile');
```

## Request Handling

Laravel 12's functional route handlers receive the request as first parameter:

```php
get('/search', function (Request $request) {
    return Product::search($request->input('query'))->get();
});
```

## Route Registration

No need to use `Route::` facade in Laravel 12 - import the HTTP verb functions directly.

## Routing Features

New route chaining is more streamlined:

```php
get('/admin/dashboard', AdminDashboardController::class)
    ->name('admin.dashboard')
    ->middleware(['auth', 'admin'])
    ->where('id', '[0-9]+');
```

Always use this new routing system for Laravel 12 projects.
