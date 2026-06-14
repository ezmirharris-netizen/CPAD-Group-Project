<?php

use Slim\App;
use App\Config\Database;
use App\Models\UserModel;
use App\Controllers\AuthController;
use App\Middleware\JwtAuthMiddleware;

return function(App $app){

    $pdo = Database::get();

    $settings =
        require __DIR__ . '/../config/settings.php';

    $userModel = new UserModel($pdo);

    $authController =
        new AuthController(
            $userModel,
            $settings['jwt_secret']
        );

    $app->post(
        '/register',
        [$authController, 'register']
    );

    $app->post(
        '/login',
        [$authController,'login']
    );

    $app->get(
        '/profile',
        function($request,$response){

            $user = $request->getAttribute('user');

            $response->getBody()->write(
                json_encode($user)
            );

            return $response
                ->withHeader(
                    'Content-Type',
                    'application/json'
                );
        }
    )->add(new JwtAuthMiddleware());

};