<?php

return [
    'jwt_secret' =>
        $_ENV['JWT_SECRET']
        ?? 'skillswap_secret_key'
];