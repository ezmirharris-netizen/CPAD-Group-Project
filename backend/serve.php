<?php

/**
 * Production PHP Router
 *
 * Serves the built Vue.js frontend static files and proxies /api/* to Slim.
 *
 * Run with:
 *   php -S 0.0.0.0:5000 serve.php
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// API requests go to Slim
if (str_starts_with($uri, '/api/')) {
    require_once __DIR__ . '/index.php';
    return;
}

// Serve static files from built frontend dist
$distDir = __DIR__ . '/../Frontend/dist';
$file    = $distDir . $uri;

if ($uri !== '/' && file_exists($file) && !is_dir($file)) {
    return false; // Let PHP serve it directly
}

// All other routes serve index.html (SPA fallback)
$index = $distDir . '/index.html';
if (file_exists($index)) {
    header('Content-Type: text/html');
    readfile($index);
} else {
    http_response_code(503);
    echo 'Frontend not built. Run: cd Frontend && npm run build';
}
