<?php

namespace App\Controllers;

use App\Models\UserModels;
use Firebase\JWT\JWT;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AuthController
{
    public function __construct(
        private UserModels $userModel,
        private string $secret
    ) {}

    public function register(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();

        // Basic validation
        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            $response->getBody()->write(json_encode(['error' => 'Name, email and password are required']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        // Check if email already exists
        $existing = $this->userModel->findByEmail($data['email']);
        if ($existing) {
            $response->getBody()->write(json_encode(['error' => 'Email already registered']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(409);
        }

        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

        $userId = $this->userModel->createUser(
            $data['name'],
            $data['email'],
            $hashedPassword,
            $data['faculty'] ?? '',
            $data['role']    ?? 'tutee',
            $data['bio']     ?? ''
        );

        $user = $this->userModel->find($userId);

        $payload = [
            'id'    => $user['id'],
            'email' => $user['email'],
            'role'  => $user['role'],
            'name'  => $user['name'],
            'iat'   => time(),
            'exp'   => time() + 86400
        ];

        $token = JWT::encode($payload, $this->secret, 'HS256');

        $response->getBody()->write(json_encode([
            'token' => $token,
            'user'  => [
                'id'      => $user['id'],
                'name'    => $user['name'],
                'email'   => $user['email'],
                'role'    => $user['role'],
                'faculty' => $user['faculty'],
                'bio'     => $user['bio'],
            ]
        ]));

        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }

    public function login(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();

        if (empty($data['email']) || empty($data['password'])) {
            $response->getBody()->write(json_encode(['error' => 'Email and password are required']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $user = $this->userModel->findByEmail($data['email']);

        if (!$user || !password_verify($data['password'], $user['password_hash'])) {
            $response->getBody()->write(json_encode(['error' => 'Invalid email or password']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }

        $payload = [
            'id'    => $user['id'],
            'email' => $user['email'],
            'role'  => $user['role'],
            'name'  => $user['name'],
            'iat'   => time(),
            'exp'   => time() + 86400
        ];

        $token = JWT::encode($payload, $this->secret, 'HS256');

        $response->getBody()->write(json_encode([
            'token' => $token,
            'user'  => [
                'id'      => $user['id'],
                'name'    => $user['name'],
                'email'   => $user['email'],
                'role'    => $user['role'],
                'faculty' => $user['faculty'],
                'bio'     => $user['bio'],
            ]
        ]));

        return $response->withHeader('Content-Type', 'application/json');
    }

    public function updateProfile(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();
        $user = $request->getAttribute('user');

        $allowed = ['name', 'faculty', 'bio'];
        $updates = [];
        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $updates[$field] = $data[$field];
            }
        }

        if ($updates) {
            $this->userModel->update((int)$user['id'], $updates);
        }

        $updated = $this->userModel->find((int)$user['id']);

        $response->getBody()->write(json_encode([
            'message' => 'Profile updated',
            'user'    => [
                'id'      => $updated['id'],
                'name'    => $updated['name'],
                'email'   => $updated['email'],
                'role'    => $updated['role'],
                'faculty' => $updated['faculty'],
                'bio'     => $updated['bio'],
            ]
        ]));

        return $response->withHeader('Content-Type', 'application/json');
    }
}
