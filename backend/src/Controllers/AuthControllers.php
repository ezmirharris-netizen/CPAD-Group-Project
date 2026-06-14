<?php

namespace App\Controllers;

use App\Models\UserModel;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AuthController
{
    public function __construct(
        private UserModel $userModel,
        private string $secret
    ) {}
    
    //Part 2
    public function register(
        Request $request,
        Response $response
    ) {
        $data = $request->getParsedBody();

        $hashedPassword = password_hash(
            $data['password'],
            PASSWORD_DEFAULT
        );

        $this->userModel->createUser(
            $data['name'],
            $data['email'],
            $hashedPassword
        );

        $response->getBody()->write(
            json_encode([
                'message' => 'Registration successful'
            ])
        );

        return $response
            ->withHeader('Content-Type', 'application/json');
    }
    
    //Part 2
    public function login(
        Request $request,
        Response $response
    ) {
        $data = $request->getParsedBody();

        $user = $this->userModel->findByEmail(
            $data['email']
        );

        if (
            !$user ||
            !password_verify(
                $data['password'],
                $user['password_hash']
            )
        ) {
            $response->getBody()->write(
                json_encode([
                    'error' => 'Invalid credentials'
                ])
            );

            return $response->withStatus(401);
        }

        $payload = [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'iat' => time(),
            'exp' => time() + 3600
        ];

        $token = JWT::encode(
            $payload,
            $this->secret,
            'HS256'
        );

        $response->getBody()->write(
            json_encode([
                'token' => $token
            ])
        );

        return $response
            ->withHeader('Content-Type', 'application/json');
    }
}