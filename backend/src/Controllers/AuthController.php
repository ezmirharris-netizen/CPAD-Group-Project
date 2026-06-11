<?php

namespace App\Controllers;

use App\Models\UserModel;
use Firebase\JWT\JWT;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AuthController
{
    private UserModel $userModel;
    private string $secret;

    public function __construct(
        UserModel $userModel,
        string $secret
    ){
        $this->userModel = $userModel;
        $this->secret = $secret;
    }

    public function register(
        Request $request,
        Response $response
    ){
        $data = $request->getParsedBody();

        $password = password_hash(
            $data['password'],
            PASSWORD_DEFAULT
        );

        $this->userModel->createUser(
            $data['name'],
            $data['email'],
            $password
        );

        $response->getBody()->write(
            json_encode([
                'message' => 'Registered'
            ])
        );

        return $response;
    }
}