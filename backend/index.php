<?php

require __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;
use Slim\Factory\AppFactory;

// Load environment variables
if (file_exists(__DIR__ . '/.env')) {
    Dotenv::createImmutable(__DIR__)->load();
}

$app = AppFactory::create();

// Add CORS middleware - must be first
// CORS_ALLOWED_ORIGINS is a comma-separated whitelist (e.g. set in .env / host env vars).
// If it's not set at all, fall back to '*' so local dev keeps working out of the box.
$app->add(function ($request, $handler) use ($app) {
    $response = $handler->handle($request);

    $allowedOriginsEnv = $_ENV['CORS_ALLOWED_ORIGINS'] ?? getenv('CORS_ALLOWED_ORIGINS') ?? '';
    $allowedOrigins = array_filter(array_map('trim', explode(',', $allowedOriginsEnv)));

    $requestOrigin = $request->getHeaderLine('Origin');

    if (empty($allowedOrigins)) {
        // No whitelist configured - allow any origin (dev-friendly default)
        $allowOrigin = '*';
    } elseif ($requestOrigin !== '' && in_array($requestOrigin, $allowedOrigins, true)) {
        // Request's Origin is on the whitelist - reflect it back
        $allowOrigin = $requestOrigin;
    } else {
        // Origin not recognized - omit the header, which causes the browser to block the response
        $allowOrigin = null;
    }

    if ($allowOrigin !== null) {
        $response = $response->withHeader('Access-Control-Allow-Origin', $allowOrigin);
    }

    return $response
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
});

// Handle OPTIONS preflight requests
$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

// Add body parsing middleware
$app->addBodyParsingMiddleware();

// Load all routes from routes.php
(require __DIR__ . '/routes.php')($app);

$app->run();
