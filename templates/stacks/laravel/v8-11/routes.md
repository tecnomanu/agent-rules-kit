---
description: Routing guidelines for Laravel 8-11
globs: '<root>/routes/**/*.php'
alwaysApply: false
---

# Routes in Laravel 8-11

Laravel 8-11 uses a consistent routing API with the Route facade:

## Route Definitions

```php
// routes/web.php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

// Basic route
Route::get('/', function () {
    return view('welcome');
});

// Controller routes (Laravel 8+ syntax)
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);

// Resource routes
Route::resource('posts', PostController::class);
Route::apiResource('api/comments', CommentController::class);

// Route groups
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', function () {
        return view('dashboard');
    });

    Route::prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'users']);
    });
});

// Named routes
Route::get('/profile', function () {
    return view('profile');
})->name('profile');
```

## Route Parameters

```php
Route::get('/posts/{post}', [PostController::class, 'show']);

// Optional parameters
Route::get('/users/{user?}', [UserController::class, 'show']);

// Parameter constraints
Route::get('/users/{id}', [UserController::class, 'show'])
    ->where('id', '[0-9]+');
```

## Route Caching

For production environments, always use route caching to improve performance:

```bash
php artisan route:cache
```

Note: Route closures cannot be cached, so prefer controller methods in production.
