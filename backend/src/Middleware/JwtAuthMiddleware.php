<?php

namespace App\Middleware;

use App\Auth\JwtHelper;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as Handler;
use Slim\Psr7\Factory\ResponseFactory;

class JwtAuthMiddleware implements MiddlewareInterface
{
    private string $secret;

    public function __construct(?string $secret = null)
    {
        $this->secret = $secret ?? ($_ENV['JWT_SECRET'] ?? 'skillswap_secret_key_change_in_production');
    }

    public function process(Request $request, Handler $handler): Response
    {
        $authHeader = $request->getHeaderLine('Authorization');

        if (!$authHeader) {
            return $this->unauthorized('Missing Authorization header');
        }

        $token = JwtHelper::extractBearer($authHeader);
        if (!$token) {
            return $this->unauthorized('Invalid Authorization format. Use: Bearer <token>');
        }

        try {
            $jwt    = new JwtHelper($this->secret);
            $payload = $jwt->decode($token);

            $request = $request->withAttribute('user', $payload);
            return $handler->handle($request);

        } catch (\Exception $e) {
            return $this->unauthorized('Invalid or expired token');
        }
    }

    private function unauthorized(string $message): Response
    {
        $factory  = new ResponseFactory();
        $response = $factory->createResponse(401);
        $response->getBody()->write(json_encode(['error' => $message]));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
