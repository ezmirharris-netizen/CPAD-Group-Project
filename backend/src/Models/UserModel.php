<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class UserModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function findByEmail($email)
    {
        $stmt = $this->pdo->prepare(
            "SELECT * FROM users WHERE email = ?"
        );

        $stmt->execute([$email]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createUser(
        $name,
        $email,
        $password
    ) {
        $stmt = $this->pdo->prepare(
            "INSERT INTO users(name,email,password)
             VALUES(?,?,?)"
        );

        return $stmt->execute([
            $name,
            $email,
            $password
        ]);
    }
}