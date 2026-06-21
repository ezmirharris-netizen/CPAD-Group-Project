<?php

namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as Handler;
use Slim\Psr7\Response as SlimResponse;

class JwtAuthMiddleware
{
    private string $secret;

    public function __construct()
    {
        // Fallback to default key if environment variable is not defined
        $this->secret = $_ENV['JWT_SECRET'] ?? 'skillswap_secret_key';
    }

    public function __invoke(Request $request, Handler $handler): Response
    {
        $authHeader = $request->getHeaderLine('Authorization');

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $response = new SlimResponse();
            $response->getBody()->write(json_encode(['error' => 'Token not provided']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }

        $token = $matches[1];

        try {
            // Decode the token using HS256 algorithm matching your AuthController setup
            $decoded = JWT::decode($token, new Key($this->secret, 'HS256'));
            
            // Cast the decoded object to an associative array for easy access
            $userArray = (array) $decoded;

            // Forward the decoded user payload down to the next route context
            $request = $request->withAttribute('user', $userArray);
            
            return $handler->handle($request);
        } catch (\Exception $e) {
            $response = new SlimResponse();
            $response->getBody()->write(json_encode(['error' => 'Invalid or expired token']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }
    }
}