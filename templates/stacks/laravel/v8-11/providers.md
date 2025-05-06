# Service Provider Registration – Laravel 8-11

For Laravel versions 8 through 11, providers are registered in the `config/app.php`
configuration file in the `providers` array:

```php
// config/app.php
return [
    // ...

    'providers' => [
        // Laravel Framework Service Providers...
        Illuminate\Auth\AuthServiceProvider::class,
        Illuminate\Broadcasting\BroadcastServiceProvider::class,
        // ...

        // Application Service Providers...
        App\Providers\AppServiceProvider::class,
        App\Providers\AuthServiceProvider::class,
        App\Providers\EventServiceProvider::class,
        App\Providers\RouteServiceProvider::class,

        // Third-party Service Providers...
        // Your custom providers...
    ],

    // ...
];
```

When creating a new service provider, remember to register it in this array.
