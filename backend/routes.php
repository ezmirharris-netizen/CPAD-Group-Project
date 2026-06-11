<?php

use Slim\App;
use App\Models\UserModel;
use App\Controllers\AuthController;

return function(App $app){

    $pdo = require __DIR__ . '/../config/database.php';

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
};