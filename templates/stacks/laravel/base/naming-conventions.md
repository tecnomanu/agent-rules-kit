---
description: Naming conventions for Laravel applications
globs: '<root>/app/**/*.php,<root>/bootstrap/**/*.php,<root>/routes/**/*.php,<root>/database/migrations/**/*.php,<root>/config/**/*.php,<root>/tests/**/*.php'
alwaysApply: false
---

# Naming Conventions in Laravel

This document defines standard naming conventions for Laravel projects, following the recommended practices from the Laravel community and the PHP ecosystem.

## General Principles

-   **Consistency**: Maintain the same style throughout the project.
-   **Clarity**: Names should be descriptive and reveal intent.
-   **Conciseness**: Avoid unnecessarily long names when possible.
-   **PSR-12 Standard**: Follow PSR-12 standards for PHP code.

## Naming Styles

| Style          | Description                                                         | Example          |
| -------------- | ------------------------------------------------------------------- | ---------------- |
| **PascalCase** | First letter of each word capitalized                               | `UserController` |
| **camelCase**  | First letter lowercase, rest of words with first letter capitalized | `getUserById`    |
| **snake_case** | Words in lowercase separated by underscores                         | `user_table`     |
| **kebab-case** | Words in lowercase separated by hyphens                             | `user-settings`  |

## Application by Element Type

### Classes

-   **PascalCase**
-   Singular, descriptive
-   Suffixes according to class type:

```php
// Controllers
class UserController extends Controller {}

// Models
class User extends Model {}

// Middleware
class AuthenticateUser {}

// Jobs
class SendWelcomeEmail implements ShouldQueue {}

// Events
class UserRegistered {}

// Listeners
class SendWelcomeNotification {}

// Policies
class UserPolicy {}

// Service Providers
class PaymentServiceProvider extends ServiceProvider {}
```

### Methods and Functions

-   **camelCase**
-   Verbs that describe the action

```php
// In controllers (CRUD actions)
public function index() {}
public function show($id) {}
public function create() {}
public function store(Request $request) {}
public function edit($id) {}
public function update(Request $request, $id) {}
public function destroy($id) {}

// In models (scopes)
public function scopeActive($query) {}
public function scopePopular($query) {}

// In any class (general methods)
public function calculateTotal() {}
public function getUserFullName() {}
```

### Variables and Properties

-   **camelCase**

```php
$userName = 'John';
$isAdmin = true;
$userCount = 42;

// Class properties
protected $connection;
private $items = [];
```

### Constants

-   **SCREAMING_SNAKE_CASE** (uppercase with underscores)

```php
const API_VERSION = 'v1';
const MAX_LOGIN_ATTEMPTS = 5;

// Enums (Laravel 8+)
enum UserStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    case BANNED = 'banned';
}
```

### Database

-   **snake_case** for table, column, and index names
-   Tables in plural
-   Foreign keys: `singular_table_id`

```
users
posts
post_categories
role_user (pivot table for many-to-many relationship)

// Columns
id
user_id (foreign key)
first_name
last_name
created_at
```

### Configuration Files and Environment Variables

-   **snake_case** for keys in configuration files
-   **SCREAMING_SNAKE_CASE** for environment variables (.env)

```php
// config/app.php
'debug' => env('APP_DEBUG', false),
'timezone' => 'UTC',

// .env
APP_NAME=Laravel
APP_ENV=local
DB_CONNECTION=mysql
```

### Routes and URLs

-   **kebab-case** for URLs
-   **snake_case.action** for route names

```php
// Routes
Route::get('/user-settings', 'UserSettingsController@index')->name('user_settings.index');
Route::get('/blog-posts/{slug}', 'BlogPostController@show')->name('blog_posts.show');

// Usage in Blade
<a href="{{ route('user_settings.index') }}">Settings</a>
```

### Views

-   **kebab-case** for directories and files
-   Use dot notation to indicate directory hierarchy

```php
// File structure
resources/views/
├── users/
│   ├── index.blade.php
│   ├── show.blade.php
│   └── settings/
│       ├── profile.blade.php
│       └── notifications.blade.php

// Reference in controllers
return view('users.index');
return view('users.settings.profile');
```

## Additional Practices

1. **Models**: Singular, PascalCase (e.g., `User`, `BlogPost`).
2. **Controllers**: Plural, PascalCase + Controller suffix (e.g., `UsersController`).
3. **Migrations**: Timestamp + action + table in snake_case (e.g., `2023_05_15_create_users_table.php`).
4. **Seeders**: Table name + Seeder in PascalCase (e.g., `UsersTableSeeder`).
5. **Factories**: Model name + Factory in PascalCase (e.g., `UserFactory`).

## Linting and Verification

Recommended tools:

-   **PHP CS Fixer**: To enforce code conventions
-   **PHP_CodeSniffer**: To check styles
-   **Larastan/PHPStan**: For static analysis

Configure these tools for automatic execution in your CI/CD pipeline.
