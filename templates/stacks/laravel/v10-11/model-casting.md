---
description: Model casting features in Laravel 10-11
globs: <root>/app/Models/**/*.php
alwaysApply: false
---

# Model Casting – Laravel 10-11

Laravel 10 and 11 provide enhanced casting features that should be used for clean data handling:

## Custom Cast Classes

Use custom cast classes for complex data transformations:

```php
namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class Json implements CastsAttributes
{
    public function get($model, string $key, $value, array $attributes)
    {
        return json_decode($value, true);
    }

    public function set($model, string $key, $value, array $attributes)
    {
        return json_encode($value);
    }
}
```

Then in your model:

```php
protected $casts = [
    'options' => \App\Casts\Json::class,
];
```

## Enum Casting

Laravel 10-11 have full support for PHP 8.1+ enums in models:

```php
enum Status: string
{
    case PENDING = 'pending';
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
}
```

In your model:

```php
protected $casts = [
    'status' => Status::class,
];
```

## Array/Collection Casting

For JSON columns that represent arrays or collections:

```php
protected $casts = [
    'preferences' => 'array',
    'settings' => 'collection',
    'options' => AsArrayObject::class,
    'flags' => AsCollection::class,
];
```

Always prefer these built-in Laravel type castings over manual JSON handling.
