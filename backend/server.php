<?php

/**
 * PHP Built-in Server Router
 *
 * Run with:
 *   php -S localhost:8000 server.php
 *
 * This routes all requests through index.php (Slim framework entry point)
 * while still serving static files (JS, CSS, images) directly if they exist.
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// If the request maps to a real file on disk, serve it directly
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false;
}

// Otherwise hand everything to Slim
require_once __DIR__ . '/index.php';
