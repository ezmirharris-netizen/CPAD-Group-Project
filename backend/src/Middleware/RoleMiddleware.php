<?php

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as Handler;
use Slim\Psr7\Response as SlimResponse;

class RoleMiddleware
{
    public function __construct(private string $requiredRole)
    {
    }

    public function __invoke(Request $request, Handler $handler): Response
    {
        $user = $request->getAttribute('user');

        // Check if user object exists and verify if the role payload matches requirements
        if (!$user || !isset($user['role']) || $user['role'] !== $this->requiredRole) {
            $response = new SlimResponse();
            $response->getBody()->write(json_encode([
                'error' => 'Forbidden: You do not have the required permissions'
            ]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(403);
        }

        return $handler->handle($request);
    }
}