<?php

require __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;
use Slim\Factory\AppFactory;

Dotenv::createImmutable(__DIR__)->load();

$app = AppFactory::create();

(require __DIR__ . '/src/routes.php')($app);

$app->run();