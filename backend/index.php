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
$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
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
