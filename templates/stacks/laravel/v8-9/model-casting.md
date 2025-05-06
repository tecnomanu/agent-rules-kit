# Model Casting – Laravel 8-9

Laravel 8-9 introduced several casting features that should be used for clean data handling:

## Basic Type Casting

Use built-in casts for common data types:

```php
protected $casts = [
    'is_active' => 'boolean',
    'price' => 'float',
    'options' => 'array',
    'published_at' => 'datetime',
    'expires_at' => 'immutable_datetime',
];
```

## Custom Cast Classes

For complex data transformations, create custom casts:

```php
namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class Money implements CastsAttributes
{
    public function get($model, string $key, $value, array $attributes)
    {
        return round($value / 100, 2);
    }

    public function set($model, string $key, $value, array $attributes)
    {
        return round($value * 100);
    }
}
```

Then in your model:

```php
protected $casts = [
    'price' => \App\Casts\Money::class,
];
```

## Object Casting (Laravel 8.x+)

Laravel 8 introduced AsCollection and AsArrayObject casts:

```php
use Illuminate\Database\Eloquent\Casts\AsCollection;
use Illuminate\Database\Eloquent\Casts\AsArrayObject;

protected $casts = [
    'options' => AsArrayObject::class,
    'settings' => AsCollection::class,
];
```

## Enum Casting (Laravel 8.x with PHP 8.1+)

If using PHP 8.1+ with Laravel 8.x, you can implement custom casts for enums:

```php
// Custom Enum Cast class
namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use App\Enums\Status;

class StatusEnum implements CastsAttributes
{
    public function get($model, string $key, $value, array $attributes)
    {
        return Status::from($value);
    }

    public function set($model, string $key, $value, array $attributes)
    {
        return $value instanceof Status ? $value->value : $value;
    }
}
```

Note: Native enum support was improved in Laravel 9 but complete integration came in Laravel 10.
